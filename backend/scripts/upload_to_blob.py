import os
import argparse
from azure.storage.blob import BlobServiceClient, ContentSettings
from concurrent.futures import ThreadPoolExecutor
from dotenv import load_dotenv

# Load env vars
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(os.path.join(base_dir, '.env'))

CONNECTION_STRING = os.environ.get('AZURE_STORAGE_CONNECTION_STRING')
CONTAINER_NAME = "media"

# Local path to images
# project_root/frontend/public/images/vendors -> Azure container/vendors
PROJECT_ROOT = os.path.dirname(base_dir)
LOCAL_IMAGES_DIR = os.path.join(PROJECT_ROOT, 'frontend', 'public', 'images', 'vendors')

def upload_file(blob_service_client, local_file_path, blob_name):
    try:
        blob_client = blob_service_client.get_blob_client(container=CONTAINER_NAME, blob=blob_name)
        
        # Check if exists? (Optional speedup: skip existing)
        # For now, overwrite or skip based on user pref. Let's overwrite to be safe.
        
        with open(local_file_path, "rb") as data:
            # Guess content type
            content_type = 'application/octet-stream'
            if local_file_path.endswith('.png'): content_type = 'image/png'
            elif local_file_path.endswith('.jpg') or local_file_path.endswith('.jpeg'): content_type = 'image/jpeg'
            
            blob_client.upload_blob(data, overwrite=True, content_settings=ContentSettings(content_type=content_type))
            print(f"✅ Uploaded: {blob_name}")
            return True
    except Exception as e:
        print(f"❌ Failed {blob_name}: {e}")
        return False

def main():
    print(f"🚀 Starting Azure Blob Upload")
    print(f"   Source: {LOCAL_IMAGES_DIR}")
    
    if not CONNECTION_STRING:
        print("❌ Error: AZURE_STORAGE_CONNECTION_STRING environment variable is missing.")
        print("   Please add it to backend/.env")
        return

    try:
        blob_service_client = BlobServiceClient.from_connection_string(CONNECTION_STRING)
        
        # Ensure container exists
        container_client = blob_service_client.get_container_client(CONTAINER_NAME)
        if not container_client.exists():
            container_client.create_container(public_access="blob")
            print(f"   Created container: {CONTAINER_NAME}")
    
    except Exception as e:
        print(f"❌ Connection Error: {e}")
        return

    # Gather files
    files_to_upload = []
    for root, dirs, files in os.walk(LOCAL_IMAGES_DIR):
        for file in files:
            local_path = os.path.join(root, file)
            # Rel path for blob name: e.g. vendors/logo.png
            # We want them under 'vendors/' in the container? 
            # If MEDIA_URL is /media/, and image in DB is 'vendors/logo.png', it expects 'media/vendors/logo.png'.
            # So if container is 'media', we put 'vendors/logo.png' in it.
            
            rel_path = os.path.relpath(local_path, os.path.join(PROJECT_ROOT, 'frontend', 'public', 'images'))
            # rel_path should be 'vendors\logo.png'. Normalize slashes.
            blob_name = rel_path.replace(os.sep, '/')
            
            files_to_upload.append((local_path, blob_name))

    print(f"   Found {len(files_to_upload)} files to upload.")
    
    # Parallel Upload
    with ThreadPoolExecutor(max_workers=20) as executor:
        futures = [
            executor.submit(upload_file, blob_service_client, fp, bn)
            for fp, bn in files_to_upload
        ]
        
    print("\n✨ Upload Complete.")

if __name__ == "__main__":
    main()
