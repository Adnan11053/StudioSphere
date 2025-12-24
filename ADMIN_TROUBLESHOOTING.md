# Admin Page Troubleshooting

## Common Issues When Creating Owner Accounts

### 1. "relation 'profiles' does not exist" or "relation 'studios' does not exist"

**Problem:** Database tables haven't been created yet.

**Solution:**
1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Run these scripts in order:
   - `scripts/001_create_tables.sql` - Creates all tables
   - `scripts/002_create_trigger.sql` - Sets up triggers
   - `scripts/003_fix_rls_policies.sql` - Configures security policies

### 2. "new row violates row-level security policy"

**Problem:** RLS (Row Level Security) policies are blocking the insert.

**Solution:**
1. Run `scripts/003_fix_rls_policies.sql` in Supabase SQL Editor
2. Or temporarily disable RLS for testing (not recommended for production):
   ```sql
   ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
   ALTER TABLE studios DISABLE ROW LEVEL SECURITY;
   ```

### 3. "User already registered"

**Problem:** The email address is already in use.

**Solution:**
- Use a different email address
- Or delete the existing user from Supabase Auth dashboard

### 4. "Failed to create user account"

**Possible causes:**
- Supabase project is paused
- Invalid email format
- Password doesn't meet requirements
- Network connection issues

**Solution:**
- Check Supabase project status
- Verify email format is correct
- Ensure password is at least 6 characters
- Check browser console for detailed error

### 5. Profile not created automatically

**Problem:** The database trigger might not be set up.

**Solution:**
1. Run `scripts/002_create_trigger.sql` in Supabase SQL Editor
2. This creates a trigger that automatically creates a profile when a user signs up

### 6. "Missing Supabase environment variables"

**Problem:** `.env.local` file is missing or incorrect.

**Solution:**
1. Create `.env.local` in the root directory
2. Add:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
3. Restart the dev server

## Step-by-Step Setup Checklist

Before using the admin page, ensure:

- [ ] `.env.local` file exists with correct Supabase credentials
- [ ] Dev server has been restarted after creating `.env.local`
- [ ] Database tables are created (run `001_create_tables.sql`)
- [ ] Triggers are set up (run `002_create_trigger.sql`)
- [ ] RLS policies are configured (run `003_fix_rls_policies.sql`)
- [ ] Supabase project is active (not paused)

## Testing the Setup

1. **Test database connection:**
   - Open browser console (F12)
   - Go to `/admin` page
   - Check for any connection errors

2. **Test table existence:**
   - Go to Supabase Dashboard → Table Editor
   - Verify these tables exist:
     - `profiles`
     - `studios`
     - `categories`
     - `equipment`
     - `issues`

3. **Test RLS policies:**
   - Try creating an owner account
   - If it fails with RLS error, run the RLS fix script

## Getting Detailed Error Information

1. **Open browser console** (F12 → Console tab)
2. **Try creating an owner account**
3. **Look for error messages** - they will show:
   - Exact error code
   - Which table/operation failed
   - RLS policy violations
   - Missing tables

## Quick Fix Commands

If you need to reset everything:

```sql
-- In Supabase SQL Editor, run:
-- 1. Drop all tables (careful - this deletes data!)
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS equipment CASCADE;
DROP TABLE IF EXISTS issues CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS studios CASCADE;

-- 2. Recreate everything
-- Run scripts/001_create_tables.sql
-- Run scripts/002_create_trigger.sql
-- Run scripts/003_fix_rls_policies.sql
```

## Still Having Issues?

1. Check the browser console for the exact error message
2. Verify all SQL scripts have been run successfully
3. Check Supabase Dashboard → Logs for server-side errors
4. Ensure your Supabase project is not paused
5. Verify your `.env.local` file has the correct values

