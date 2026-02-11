# Vendor Portal Login Troubleshooting Guide

## ✅ Backend Verification Complete

The backend authentication is working correctly:
- User exists: `vendor@test.com`
- Password: `vendor123`
- User type: `vendor`
- Vendor profile linked to: Auto Recycling Mall
- Login endpoint tested: ✅ Working

## 🔍 Troubleshooting Steps

### Step 1: Verify Backend is Running
```bash
curl http://localhost:8000/api/health/
# Should return: {"status":"ok"}
```

### Step 2: Test Login API Directly
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"vendor@test.com","password":"vendor123"}'
```

Expected response: JWT tokens and user data

### Step 3: Check Frontend Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Try logging in
4. Check for any errors

### Step 4: Check Network Tab
1. Open DevTools → Network tab
2. Try logging in
3. Look for `/api/auth/login/` request
4. Check:
   - Request payload
   - Response status
   - Response data

## 🐛 Common Issues

### Issue 1: CORS Error
**Symptoms:** Network error, CORS policy blocking request

**Solution:** Check `core/settings.py`:
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
```

### Issue 2: Wrong API URL
**Symptoms:** 404 Not Found

**Check:** Frontend `.env` file should have:
```
VITE_API_URL=http://localhost:8000/api
```

### Issue 3: Invalid Credentials
**Symptoms:** "Invalid credentials" error

**Solutions:**
- Make sure you're using: `vendor@test.com` / `vendor123`
- Check caps lock is off
- Try copying and pasting credentials

### Issue 4: User Not Vendor Type
**Symptoms:** "Access denied. Vendor account required."

**Solution:** Verify user type:
```bash
cd backend
python3 manage.py shell -c "from apps.users.models import User; u=User.objects.get(email='vendor@test.com'); print(u.user_type)"
```

Should output: `vendor`

## 🔧 Quick Fixes

### Reset Test User Password
```bash
cd backend
python3 manage.py shell
```
```python
from apps.users.models import User
user = User.objects.get(email='vendor@test.com')
user.set_password('vendor123')
user.save()
print("Password reset successfully!")
exit()
```

### Recreate Test User
```bash
cd backend
python3 create_test_vendor_user.py
```

## 📝 Manual Login Test

1. **Navigate to:** http://localhost:3000/vendor/login

2. **Enter credentials:**
   - Email: `vendor@test.com`
   - Password: `vendor123`

3. **Click "Sign In"**

4. **Expected result:** Redirect to `/vendor/dashboard`

## 🔍 Debug Mode

Add console logging to see what's happening:

**Edit:** `frontend/src/contexts/VendorAuthContext.jsx`

Add this in the `login` function:
```javascript
console.log('Login attempt:', email);
console.log('API Response:', result);
```

## ✅ Verification Checklist

- [ ] Backend server running on port 8000
- [ ] Frontend server running on port 3000
- [ ] Test user exists in database
- [ ] User type is 'vendor'
- [ ] Vendor profile linked
- [ ] CORS configured correctly
- [ ] API URL configured in frontend
- [ ] No console errors
- [ ] Network request succeeds

## 🆘 Still Having Issues?

1. Check browser console for errors
2. Check backend terminal for errors
3. Verify both servers are running
4. Try clearing browser cache/localStorage
5. Try incognito/private browsing mode

---

**Need more help?** Share the error message from browser console or network tab.
