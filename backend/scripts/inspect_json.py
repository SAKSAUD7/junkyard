import json

with open('backend/users_user.jsonl', 'r', encoding='utf-8') as f:
    line = f.readline()
    data = json.loads(line)
    print("Fields Keys:", list(data.get('fields', {}).keys()))
    if 'id' in data.get('fields', {}):
        print("ID in fields:", data['fields']['id'])
    if 'pk' in data:
        print("PK in root:", data['pk'])
