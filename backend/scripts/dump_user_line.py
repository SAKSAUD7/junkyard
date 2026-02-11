with open('backend/users_user.jsonl', 'rb') as f:
    line = f.readline()
    with open('backend/debug_user_line.txt', 'wb') as out:
        out.write(line)
