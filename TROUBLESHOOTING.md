# Troubleshooting Guide

## Common Errors and Solutions

### 500 Internal Server Error

#### Missing Environment Variables

**Error Message:**
```
Missing Supabase environment variables
```

**Solution:**
1. Create a `.env.local` file in the root directory (same level as `package.json`)
2. Add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```
3. **Restart your development server** after creating/updating `.env.local`
4. Get your keys from [Supabase Dashboard](https://supabase.com/dashboard) → Your Project → Settings → API

**Verify:**
- File is named exactly `.env.local` (with the dot at the beginning)
- File is in the root directory, not in a subfolder
- No quotes around the values
- No extra spaces
- Server was restarted after changes

#### Database Connection Issues

**Error:** Cannot connect to Supabase

**Solutions:**
1. Check your Supabase project is active (not paused)
2. Verify your Supabase URL and key are correct
3. Check your internet connection
4. Verify RLS (Row Level Security) policies are set up correctly
5. Run the SQL scripts in the `scripts/` folder to set up your database

#### Missing Database Tables

**Error:** Table does not exist

**Solution:**
Run the SQL scripts in order:
1. `scripts/001_create_tables.sql` - Creates all tables
2. `scripts/002_create_trigger.sql` - Sets up triggers
3. `scripts/003_fix_rls_policies.sql` - Configures security policies
4. `scripts/004_manual_owner_setup.sql` - Optional manual setup

### Build Errors

#### TypeScript Errors

**Error:** Type errors during build

**Solution:**
- The project has `ignoreBuildErrors: true` in `next.config.mjs` for development
- Fix TypeScript errors before deploying to production
- Run `pnpm lint` to check for issues

### Runtime Errors

#### "Cannot read property of undefined"

**Common causes:**
- Missing data in database
- RLS policies blocking access
- Incorrect user permissions

**Solution:**
1. Check browser console for detailed error
2. Verify user has correct role (owner/admin/employee)
3. Check RLS policies allow the operation
4. Ensure data exists in the database

### Authentication Errors

#### "User not found" or Login fails

**Solutions:**
1. Verify user exists in Supabase Auth
2. Check email/password are correct
3. Ensure user has a profile in the `profiles` table
4. Verify user's profile has a `studio_id` (run setup if needed)

#### Redirect loops

**Solution:**
- Clear browser cookies
- Check middleware/proxy configuration
- Verify authentication state

## Getting Help

1. **Check the browser console** - Most errors show detailed messages
2. **Check the terminal** - Server-side errors appear in the dev server output
3. **Verify environment variables** - Use `console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)` to check
4. **Check Supabase logs** - Go to Supabase Dashboard → Logs

## Quick Diagnostic Checklist

- [ ] `.env.local` file exists in root directory
- [ ] `NEXT_PUBLIC_SUPABASE_URL` is set correctly
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set correctly
- [ ] Development server was restarted after adding env vars
- [ ] Database tables are created (run SQL scripts)
- [ ] RLS policies are configured
- [ ] Supabase project is active (not paused)
- [ ] Browser console shows no errors
- [ ] Terminal shows no server errors

## Still Having Issues?

1. Check the error message carefully - it often contains the solution
2. Review the relevant documentation:
   - `ENV_SETUP.md` - Environment setup
   - `ADMIN_GUIDE.md` - Admin page usage
   - `DEV_SETUP.md` - Development setup
3. Verify all SQL scripts have been run
4. Check Supabase project status and logs

