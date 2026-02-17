
import os
import sys
from azure.storage.blob import BlobServiceClient, ContentSettings
from concurrent.futures import ThreadPoolExecutor, as_completed
from dotenv import load_dotenv

# Load env vars
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(os.path.join(base_dir, '.env'))

CONNECTION_STRING = os.environ.get('AZURE_STORAGE_CONNECTION_STRING')
CONTAINER_NAME = "media"

# Source directory for PROCESSED vendor logos
VENDOR_LOGOS_DIR = os.path.join(base_dir, "media", "vendor_logos")

def upload_file(blob_service_client, local_file_path, blob_name):
    """Upload a single file to Azure Blob Storage"""
    try:
        blob_client = blob_service_client.get_blob_client(container=CONTAINER_NAME, blob=blob_name)
        
        with open(local_file_path, "rb") as data:
            # Determine content type based on file extension
            content_type = 'application/octet-stream'
            if local_file_path.lower().endswith('.png'):
                content_type = 'image/png'
            elif local_file_path.lower().endswith(('.jpg', '.jpeg')):
                content_type = 'image/jpeg'
            elif local_file_path.lower().endswith('.gif'):
                content_type = 'image/gif'
            
            blob_client.upload_blob(
                data, 
                overwrite=True, 
                content_settings=ContentSettings(content_type=content_type)
            )
            return (True, blob_name, None)
    except Exception as e:
        return (False, blob_name, str(e))

def main():
    print(f"[*] Starting MATCHED Vendor Logo Upload to Azure")
    print(f"   Source: {VENDOR_LOGOS_DIR}")
    print(f"   Container: {CONTAINER_NAME}/vendor_logos/")
    
    if not CONNECTION_STRING:
        print("[ERROR] Error: AZURE_STORAGE_CONNECTION_STRING environment variable is missing.")
        return 1

    if not os.path.exists(VENDOR_LOGOS_DIR):
        print(f"[ERROR] Error: Source directory does not exist: {VENDOR_LOGOS_DIR}")
        print("   Did match_vendor_logos.py run successfully?")
        return 1

    try:
        blob_service_client = BlobServiceClient.from_connection_string(CONNECTION_STRING)
        container_client = blob_service_client.get_container_client(CONTAINER_NAME)
        if not container_client.exists():
            container_client.create_container(public_access="blob")
    except Exception as e:
        print(f"[ERROR] Connection Error: {e}")
        return 1

    # Gather files
    files_to_upload = []
    for file in os.listdir(VENDOR_LOGOS_DIR):
        if file.lower().endswith(('.png', '.jpg', '.jpeg', '.gif')):
            local_path = os.path.join(VENDOR_LOGOS_DIR, file)
            # Upload to vendor_logos/ subdirectory to match local structure
            blob_name = f"vendor_logos/{file}"
            files_to_upload.append((local_path, blob_name))

    total_files = len(files_to_upload)
    print(f"\n   [INFO] Found {total_files} processed logo files to upload")
    
    if total_files == 0:
        print("   [WARNING] No files found to upload")
        return 0

    # Parallel upload
    print(f"\n   [*] Uploading files (20 concurrent threads)...")
    success_count = 0
    failure_count = 0
    
    with ThreadPoolExecutor(max_workers=20) as executor:
        futures = {
            executor.submit(upload_file, blob_service_client, fp, bn): (fp, bn)
            for fp, bn in files_to_upload
        }
        
        for i, future in enumerate(as_completed(futures), 1):
            success, blob_name, error = future.result()
            if success:
                success_count += 1
            else:
                failure_count += 1
                print(f"      [FAIL] {blob_name}: {error}")
            
            if i % 100 == 0:
                print(f"   Progress: {i}/{total_files} - OK: {success_count} | FAIL: {failure_count}")

    print(f"\n[SUCCESS] Upload Complete!")
    print(f"   [OK] Successfully uploaded: {success_count} files")
    print(f"   [FAIL] Failed: {failure_count} files")
    
    return 0 if failure_count == 0 else 1

if __name__ == "__main__":
    sys.exit(main())
