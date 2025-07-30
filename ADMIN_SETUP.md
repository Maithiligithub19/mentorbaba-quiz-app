# Admin Module Setup

## Database Migration

1. Run the admin migration to add the admin column:
```sql
-- Connect to your MySQL database and run:
ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;
```

2. Create your first admin user:
```sql
-- Replace 'admin@example.com' with your desired admin email
UPDATE users SET is_admin = TRUE WHERE email = 'admin@example.com';
```

Or if you need to create a new admin user:
```sql
-- Replace with your admin credentials
INSERT INTO users (email, password, is_admin) VALUES 
('admin@example.com', 'hashed_password_here', TRUE);
```

## Features Added

- **Admin-only upload**: Only users with `is_admin = TRUE` can upload questions
- **Admin badge**: Admin users see an "ADMIN" badge on the dashboard
- **Access control**: Upload page redirects non-admin users to dashboard
- **UI updates**: Upload button only visible to admin users

## Usage

1. Login with an admin account
2. You'll see the "ADMIN" badge and "Upload Questions" button
3. Regular users will not see the upload option
4. Only admins can access `/upload.html` and `/api/upload`

## Error Handling

- Non-admin users get "Admin access required" (403) error
- Upload page automatically redirects non-admin users
- Clear error messages for unauthorized access attempts