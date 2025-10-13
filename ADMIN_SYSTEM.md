# Admin System Documentation

## Overview

The Royal Bid Boutique admin system allows administrators to review and approve products before they become visible to users. This ensures quality control and prevents inappropriate content from appearing on the platform.

## Features

### 1. Admin Dashboard
- **Overview Tab**: Shows system statistics including total users, pending products, active auctions, and revenue
- **Product Review Tab**: Lists all products pending admin approval
- **User Management Tab**: Manage user accounts and permissions (coming soon)
- **Settings Tab**: System-wide configuration (coming soon)

### 2. Product Review Workflow
1. **Product Creation**: When users create products, they are automatically set to `pending_review` status
2. **Admin Review**: Admins can view pending products with full details including:
   - Product title, description, and price
   - Category and condition
   - Product images
   - Seller information
   - Submission date
3. **Approval/Rejection**: Admins can either:
   - **Approve**: Product becomes active and visible to users
   - **Reject**: Product is marked as rejected with a reason

### 3. Access Control
- Admin routes are protected and require admin role
- Non-admin users are redirected to dashboard if they try to access admin pages
- Admin users see an "Admin Dashboard" link in their user menu

## Setup

### 1. Create Admin User
Run the setup script to create an admin user:
```bash
cd backend
node setup-admin.js
```

This creates an admin user with:
- Email: `admin@royalbidboutique.com`
- Password: `admin123`
- Role: `admin`

### 2. Access Admin Dashboard
1. Login with the admin credentials
2. Click on your user avatar in the top navigation
3. Select "Admin Dashboard" from the dropdown menu
4. Or navigate directly to `/admin`

## API Endpoints

### Admin Dashboard Stats
```
GET /api/admin/dashboard
```
Returns system statistics including user counts, product counts, and revenue data.

### Product Management
```
GET /api/admin/products?status=pending_review
```
Get all products with optional status filtering.

```
PUT /api/admin/products/:id/approve
```
Approve a product for public viewing.

```
PUT /api/admin/products/:id/reject
```
Reject a product with a reason.

## Database Schema Changes

### Product Model Updates
The Product model now includes:
- `status`: Enum with values `['active', 'inactive', 'archived', 'pending_review', 'rejected']`
- `isActive`: Boolean (default: false, requires admin approval)
- `approvedAt`: Date when product was approved
- `approvedBy`: Reference to admin user who approved
- `rejectedAt`: Date when product was rejected
- `rejectedBy`: Reference to admin user who rejected
- `rejectionReason`: String explaining why product was rejected

## User Experience

### For Regular Users
1. Create products as usual through the product listing form
2. Products are submitted for admin review
3. Users receive notifications when products are approved or rejected
4. Only approved products appear in the marketplace

### For Admins
1. Access admin dashboard through user menu
2. Review pending products with full details
3. Approve or reject products with reasons
4. Monitor system statistics and activity

## Security

- All admin routes require authentication and admin role
- Admin actions are logged with timestamps and user references
- Rejection reasons are stored for transparency
- Non-admin users cannot access admin functionality

## Future Enhancements

- Email notifications for product approval/rejection
- Bulk approval/rejection actions
- Advanced filtering and search in admin dashboard
- User management and role assignment
- System settings and configuration
- Analytics and reporting tools
- Audit logs for admin actions

## Testing

To test the admin system:

1. **Create Admin User**: Run the setup script
2. **Login as Admin**: Use admin credentials
3. **Create Test Product**: Use regular user account to create a product
4. **Review Product**: Login as admin and approve/reject the product
5. **Verify Visibility**: Check that approved products appear in marketplace

## Troubleshooting

### Common Issues

1. **Cannot Access Admin Dashboard**
   - Ensure user has admin role
   - Check authentication status
   - Verify route protection is working

2. **Products Not Showing After Approval**
   - Check product status is 'active'
   - Verify isActive is true
   - Ensure product queries filter for active products

3. **Admin User Not Created**
   - Check MongoDB connection
   - Verify User model is properly imported
   - Check for duplicate email errors

### Debug Steps

1. Check user role in database
2. Verify admin routes are properly protected
3. Test API endpoints with proper authentication
4. Check product status and isActive fields
5. Review server logs for errors
