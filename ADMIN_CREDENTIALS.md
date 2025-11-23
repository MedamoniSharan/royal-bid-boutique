# 🔐 Admin Credentials

## Admin Account Details

### Login Credentials:
```
Email:    admin@royalbidboutique.com
Password: admin123
```

### Account Information:
- **Role**: Admin
- **Status**: Active & Verified
- **First Name**: Admin
- **Last Name**: User
- **Email**: admin@royalbidboutique.com

---

## 🚀 Quick Login Instructions

1. Navigate to your frontend: `http://localhost:8080` or `http://localhost:8081`
2. Click **"Sign In"** or go to `/login`
3. Enter the credentials above
4. Click **"Sign In"**
5. You'll be automatically redirected to the Admin Dashboard (`/admin`)

---

## 📋 Admin Account Status

✅ **Account is Active** - Can login  
✅ **Email is Verified** - No email verification needed  
✅ **Admin Role** - Full admin privileges  
✅ **Password Set** - Ready to use

---

## 🔧 Setup & Verification Scripts

If you need to verify or reset the admin account, use these scripts in the `backend/` directory:

### Check Admin Account:
```bash
cd backend
node check-admin.js
```

### Verify Password:
```bash
cd backend
node verify-admin.js
```

### Reset Password:
```bash
cd backend
node fix-admin-password.js
```

### Create Admin (if doesn't exist):
```bash
cd backend
node setup-admin.js
```

---

## 🎯 Admin Dashboard Access

After logging in, you can access the admin dashboard via:

1. **Automatic Redirect** - After login, you're taken to `/admin`
2. **User Menu** - Click your avatar → "Admin Dashboard"
3. **Direct URL** - Navigate to `http://localhost:8080/admin` (must be logged in)

---

## ⚠️ Security Notes

- Change the default password in production
- Keep these credentials secure
- Admin accounts have full system access
- All admin actions are logged

---

## 📞 Troubleshooting

### If login fails with 401:
1. Verify the admin account exists: `node check-admin.js`
2. Reset the password: `node fix-admin-password.js`
3. Check that `isActive: true` and `isVerified: true`
4. Ensure both frontend and backend servers are running

### If admin dashboard doesn't load:
1. Verify you're logged in as admin (check user role)
2. Clear browser cache and cookies
3. Check browser console for errors (F12)
4. Verify admin routes are accessible

---

**Last Updated**: Current Date  
**Credentials Status**: ✅ Active & Ready

