# Admin Guide - Creating Owner Accounts

## Overview

The admin page allows you (as an administrator) to create owner accounts for StudioSphere. When you create an owner account, you provide:
- Owner's full name
- Studio name
- Owner's email address
- Owner's password

## How to Access the Admin Page

⚠️ **This is a hidden route** - It is not linked from any public pages or navigation menus. You must access it directly via URL.

1. Start your development server:
   ```bash
   pnpm dev
   ```

2. Navigate directly to the admin page (hidden route):
   ```
   http://localhost:3000/admin
   ```

**Note**: The `/admin` route is intentionally hidden and not accessible through any links on the website. Only those who know the URL can access it.

## Creating an Owner Account

### Step 1: Fill in Owner Details

1. **Full Name**: Enter the owner's full name (e.g., "John Doe")
2. **Studio Name**: Enter the name of the studio (e.g., "My Creative Studio")
3. **Owner Email**: Enter the email address the owner will use to login
4. **Owner Password**: Enter a secure password (minimum 6 characters)

### Step 2: Create Account

Click the **"Create Owner Account"** button. The system will:
- Create a user account in Supabase Auth
- Create a studio record
- Create a profile with owner role
- Set up default equipment categories

### Step 3: Share Credentials

After successful creation, you'll see:
- ✓ Confirmation message
- The email address created
- The password you set

**Important**: Share these credentials securely with the owner. They will need these to login.

## Example Usage

**Scenario**: You need to create an owner account for "Adnan Rampurawala" with email "adnanrampurawala99@gmail.com"

1. Go to `/admin`
2. Fill in:
   - Full Name: `Adnan Rampurawala`
   - Studio Name: `Adnan's Studio`
   - Owner Email: `adnanrampurawala99@gmail.com`
   - Owner Password: `12345678` (or any secure password)
3. Click "Create Owner Account"
4. Copy the displayed credentials and share them with the owner
5. The owner can now login at `/auth/login` with these credentials

## What Gets Created

When you create an owner account, the system automatically:

1. ✅ Creates a user in Supabase Auth
2. ✅ Creates a studio record
3. ✅ Creates a profile with "owner" role
4. ✅ Links the profile to the studio
5. ✅ Creates default categories:
   - Cameras
   - Lenses
   - Lighting
   - Audio
   - Tripods & Supports
   - Accessories

## Owner Login

After account creation, the owner can:

1. Go to `/auth/login`
2. Enter the email and password you provided
3. Access the dashboard and start managing their studio

## Troubleshooting

### Error: "User already exists"
- The email address is already registered
- Use a different email or have the owner reset their password

### Error: "Failed to create user account"
- Check your Supabase credentials in `.env.local`
- Verify your Supabase project is active
- Check browser console for detailed error messages

### Error: "All fields are required"
- Make sure all fields are filled in
- Password must be at least 6 characters

## Security Notes

- 🔒 **Hidden Route**: The `/admin` page is not linked from any public pages or navigation
- ⚠️ **No Authentication**: The admin page is currently accessible without authentication (direct URL access only)
- 🔐 **For Production**: Consider adding authentication/authorization to the `/admin` route
- 🔐 Always share passwords securely (use encrypted channels)
- 🔑 Encourage owners to change their password after first login
- 🚫 **Keep URL Secret**: Do not share the `/admin` URL publicly

## Next Steps

After creating an owner account:
1. Owner logs in at `/auth/login`
2. Owner can start adding equipment
3. Owner can invite employees
4. Owner can manage their studio inventory

