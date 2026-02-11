import os
import json
import gzip
import multiprocessing
import time

SOURCE_FILE = os.path.join('backend', 'full_database_dump.json.gz.bak')
OUTPUT_DIR = 'backend'
WORKERS = 4

TARGETS = {
    'hollander.hollanderindex': 'hollander_index.jsonl',
    'hollander.profilevisit': 'profile_visit.jsonl',
    'hollander.zipcode': 'zipcode.jsonl',
    'hollander.vehicleimage': 'vehicle_image.jsonl',
    'hollander.hollanderinterchange': 'interchange.jsonl',
    'hollander.interchange': 'interchange.jsonl',
    'hollander.legacyaccount': 'legacy_account.jsonl',
    'hollander.legacyuser': 'legacy_user.jsonl',
    'users.user': 'users_user.jsonl',
    'hollander.yardmake': 'yard_make.jsonl',
    'hollander.yardparts': 'yard_part.jsonl'
}

def process_chunk(start_byte, end_byte, worker_id):
    """Process a specific byte range of the GZIP file (approximate)"""
    print(f"Worker {worker_id}: Started range {start_byte}-{end_byte}")
    
    # We can't easily seek in GZIP. 
    # STRATEGY CHANGE: We must read linearly but fast.
    # Actually, parallel processing a single GZIP stream is hard.
    # BETTER TURBO STRATEGY:
    # Read the GZIP in the main process, and dispatch LINES/CHUNKS to worker pools for parsing.
    # JSON parsing is the bottleneck, not IO.
    return

def turbo_worker(queue, file_handles):
    """Worker to parse JSON strings and write to files"""
    local_counts = {k: 0 for k in file_handles.keys()}
    
    while True:
        chunk = queue.get()
        if chunk is None: break # Sentinel
        
        try:
            obj = json.loads(chunk)
            model = obj.get('model')
            if model in TARGETS:
                fname = TARGETS[model]
                # Write to file (thread safe? No, we need separate files or locks)
                # To be fast, workers write to worker-specific files, then we merge.
                # e.g. backend/hollander_index_worker1.jsonl
                
                with open(os.path.join(OUTPUT_DIR, f"{fname}.part{os.getpid()}"), 'a', encoding='utf-8') as f:
                    f.write(json.dumps(obj) + "\n")
                    
        except:
            pass
            
    return

# REVISED TURBO: Just optimize the single reader to be raw and fast.
# The previous one was using chunks and raw_decode which is good but maybe the chunk size was bad.
# Let's try a pure line-based approach if the file is line-formatted? It's not. It's a JSON list.
# 
# FASTEST APPROACH FOR BIG JSON LIST:
# ijson (iterative json) is best, but we might not have it.
# 
# Let's try scanning for "model": "hollander..." strings directly in the binary/text stream?
# No, risky.
#
# Let's stick to the V2 but optimize the JSON parsing.
# Or, simply skip data faster.

def fast_stream():
    """
    Super fast scanner that skips non-target data without full parsing?
    """
    print(f"🚀 TURBO EXTRACTOR STARTING")
    
    # Open files once
    files = {
        name: open(os.path.join(OUTPUT_DIR, name), 'a', encoding='utf-8') 
        for name in set(TARGETS.values())
    }
    
    with gzip.open(SOURCE_FILE, 'rt', encoding='utf-8') as f:
        # Identify structure: [ {obj}, {obj} ]
        # We can read char by char? Too slow.
        # We rely on the fact that `}, {` separates objects.
        
        buffer = ""
        chunk_size = 1024 * 1024 * 10 # 10MB
        
        decoder = json.JSONDecoder()
        
        idx = 0
        while True:
            chunk = f.read(chunk_size)
            if not chunk: break
            buffer += chunk
            
            # Parsing loop
            while True:
                # Find start of object (heuristic: look for "model")
                # This is a bit hacky but if standard json list...
                # Let's stick to valid decoding to be safe, just optimized.
                
                try:
                    buffer = buffer.lstrip()
                    if not buffer: break
                    if buffer.startswith(','): buffer = buffer[1:]
                    if buffer.startswith('['): buffer = buffer[1:]
                    if buffer.startswith(']'): break # End
                    
                    obj, end = decoder.raw_decode(buffer)
                    
                    # Fast check
                    model = obj.get('model')
                    if model in TARGETS:
                        fname = TARGETS[model]
                        files[fname].write(json.dumps(obj) + "\n")
                        # flush occasionally?
                    
                    buffer = buffer[end:]
                    
                except json.JSONDecodeError:
                    # Need more data
                    break
                    
    print("✅ Done")
    for f in files.values(): f.close()

if __name__ == "__main__":
    fast_stream()
