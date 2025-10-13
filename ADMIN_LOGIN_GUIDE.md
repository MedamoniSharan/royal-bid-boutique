# Admin Login & Navigation Guide

## ✅ Admin Account Ready!

Your admin account has been created and verified:

- **Email**: `admin@royalbidboutique.com`
- **Password**: `admin123`
- **Role**: Admin
- **Status**: Active & Verified

---

## 🚀 How to Login as Admin

### Step-by-Step Instructions:

1. **Open Your Browser**
   - Navigate to: `http://localhost:8080` or `http://localhost:8081`
   - (Check which port your frontend is running on)

2. **Go to Login Page**
   - Click the **"Sign In"** button in the top navigation bar
   - Or navigate directly to: `http://localhost:8080/login`

3. **Enter Admin Credentials**
   ```
   Email: admin@royalbidboutique.com
   Password: admin123
   ```

4. **Click "Sign In"**

5. **Automatic Redirect**
   - After successful login, you will be **automatically redirected** to the **Admin Dashboard** (`/admin`)
   - Regular users are redirected to `/dashboard`
   - Admins are redirected to `/admin`

---

## 🎯 Accessing Admin Dashboard

After logging in, you have **3 ways** to access the admin dashboard:

### Option 1: Automatic Redirect (Recommended)
- Simply login with admin credentials
- You'll be automatically taken to `/admin`

### Option 2: User Menu
- Click on your **user avatar** (top right corner)
- Select **"Admin Dashboard"** from the dropdown menu
- This option only appears for admin users

### Option 3: Direct URL
- Navigate to: `http://localhost:8080/admin`
- Must be logged in as admin first

---

## 📋 Admin Dashboard Features

Once you're in the admin dashboard, you can:

### **1. Overview Tab**
- View system statistics:
  - Total users
  - Pending products (awaiting review)
  - Active auctions
  - Monthly revenue
- Monitor recent system activity

### **2. Product Review Tab**
- See all products pending admin approval
- View full product details:
  - Title, description, price
  - Category and condition
  - Product images
  - Seller information
  - Submission date
- **Approve** products to make them visible to users
- **Reject** products with a reason

### **3. User Management Tab**
- Coming soon
- Will manage user accounts and permissions

### **4. Settings Tab**
- Coming soon
- System-wide configuration

---

## 🔐 Security Features

- ✅ Admin routes are protected and require admin role
- ✅ Non-admin users are redirected to regular dashboard
- ✅ All admin actions are logged with timestamps
- ✅ Admin users have special permissions

---

## 🧪 Testing the Admin Flow

### Test Scenario: Review a Product

1. **Create a test product** (as a regular user):
   - Login as a regular user
   - Create a product
   - Product will have status: `pending_review`

2. **Login as admin**:
   - Use admin credentials
   - Automatically redirected to admin dashboard

3. **Review the product**:
   - Go to "Product Review" tab
   - Find your pending product
   - Click **"Approve"** or **"Reject"**

4. **Verify approval**:
   - Logout from admin
   - Login as regular user
   - Check if product appears in marketplace (if approved)

---

## ❗ Troubleshooting

### Issue: "Cannot access admin dashboard"
**Solution**: 
- Ensure you're logged in with admin credentials
- Check that user has admin role
- Try logging out and logging in again

### Issue: "401 Unauthorized"
**Solution**: 
- Make sure you're logging in through the **frontend UI**, not accessing API directly
- Verify credentials are correct
- Check that both frontend and backend servers are running

### Issue: "Admin Dashboard link not showing"
**Solution**: 
- Confirm you're logged in as admin (check user.role)
- Look for the Shield icon in the dropdown menu
- Try refreshing the page after login

---

## 🔧 Maintenance Scripts

Located in `/backend/`:

- **`setup-admin.js`** - Creates admin user
- **`check-admin.js`** - Verify admin user exists
- **`verify-admin.js`** - Test admin password
- **`fix-admin-password.js`** - Reset admin password

To run any script:
```bash
cd backend
node <script-name>.js
```

---

## 📞 Need Help?

If you encounter any issues:

1. Check that both servers are running
2. Clear browser cache and cookies
3. Check browser console for errors (F12)
4. Verify admin user exists in database
5. Test API endpoint: `POST /api/auth/login`

---

**Last Updated**: October 13, 2025
**Admin System Version**: 1.0

