import json

with open('users_user.jsonl', 'r') as f_in, open('users_recovered.json', 'w') as f_out:
    lines = [json.loads(line) for line in f_in if line.strip()]
    json.dump(lines, f_out)
print(f"Successfully converted {len(lines)} users.")
