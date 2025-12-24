# Quick Start - Your Supabase Setup

## Your Supabase Project

Based on your URL, your Supabase project is:
- **Project URL**: `https://zrveazuuvuxquzimpitx.supabase.co`

## Step 1: Get Your Anon Key

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project (zrveazuuvuxquzimpitx)
3. Click **Settings** (gear icon) → **API**
4. Under **Project API keys**, copy the **anon/public** key (not the service_role key)

## Step 2: Create .env.local File

Create a file named `.env.local` in the root directory with this content:

```env
NEXT_PUBLIC_SUPABASE_URL=https://zrveazuuvuxquzimpitx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=paste_your_anon_key_here
```

**Important:** Replace `paste_your_anon_key_here` with the actual anon key you copied from Supabase.

## Step 3: Restart Dev Server

After creating `.env.local`, restart your development server:

```bash
# Stop the server (Ctrl+C if running)
# Then start it again:
pnpm dev
```

## Step 4: Set Up Database

Run these SQL scripts in your Supabase SQL Editor (in order):

1. `scripts/001_create_tables.sql` - Creates all tables
2. `scripts/002_create_trigger.sql` - Sets up triggers
3. `scripts/003_fix_rls_policies.sql` - Configures security

## Step 5: Test the Connection

1. Open `http://localhost:3000` in your browser
2. If you see the home page, the connection is working!
3. Go to `http://localhost:3000/admin` to create an owner account

## Troubleshooting

### Still getting 500 error?

1. **Check .env.local exists** - File must be in root directory
2. **Check file name** - Must be exactly `.env.local` (with the dot)
3. **Check values** - No quotes, no extra spaces
4. **Restart server** - Must restart after creating/updating .env.local
5. **Check browser console** - Look for specific error messages

### Connection test

You can test the REST API directly. The URL you showed:
```
https://zrveazuuvuxquzimpitx.supabase.co/rest/v1/studios?select=*
```

This requires authentication headers. The app handles this automatically when configured correctly.

## Next Steps

Once connected:
1. ✅ Create owner account at `/admin`
2. ✅ Login at `/auth/login`
3. ✅ Start managing your studio inventory!

