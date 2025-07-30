-- Add admin column to users table
ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;

-- Create first admin user (update email as needed)
-- UPDATE users SET is_admin = TRUE WHERE email = 'admin@example.com';