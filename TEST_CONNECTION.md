# Testing Supabase Connection

## Your Supabase Project

Based on your URL, your Supabase project details are:
- **Project URL**: `https://zrveazuuvuxquzimpitx.supabase.co`
- **REST API Endpoint**: `https://zrveazuuvuxquzimpitx.supabase.co/rest/v1/`

## Setting Up .env.local

Create a `.env.local` file in the root directory with:

```env
NEXT_PUBLIC_SUPABASE_URL=https://zrveazuuvuxquzimpitx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

## Getting Your Anon Key

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project (zrveazuuvuxquzimpitx)
3. Go to **Settings** → **API**
4. Copy the **anon/public** key under "Project API keys"
5. Paste it as `NEXT_PUBLIC_SUPABASE_ANON_KEY` in your `.env.local`

## Testing the Connection

### Method 1: Using the App

1. Make sure `.env.local` is set up correctly
2. Restart your dev server: `pnpm dev`
3. Navigate to `http://localhost:3000`
4. The app should connect to Supabase

### Method 2: Direct REST API Test

You can test the REST API directly using curl or a tool like Postman:

```bash
curl 'https://zrveazuuvuxquzimpitx.supabase.co/rest/v1/studios?select=*' \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

**Note:** Replace `YOUR_ANON_KEY` with your actual anon key from Supabase.

### Method 3: Browser Console Test

Open browser console on your app and run:

```javascript
// This will test if the client is configured correctly
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
console.log('URL:', supabaseUrl);
console.log('Key exists:', !!supabaseKey);
```

## Common Issues

### 1. CORS Errors
If you see CORS errors when testing directly, it's normal. The app uses the Supabase client which handles this automatically.

### 2. 401 Unauthorized
- Check that your anon key is correct
- Verify RLS (Row Level Security) policies allow the operation
- Make sure you're using the **anon** key, not the service_role key

### 3. Table Not Found
- Run the SQL scripts in the `scripts/` folder to create tables
- Start with `001_create_tables.sql`

### 4. Empty Results
- This is normal if no data exists yet
- Use the admin page at `/admin` to create an owner account
- Or insert data directly in Supabase dashboard

## Next Steps

1. ✅ Set up `.env.local` with your Supabase URL and anon key
2. ✅ Restart the dev server
3. ✅ Run the database setup scripts (in `scripts/` folder)
4. ✅ Test by accessing the app at `http://localhost:3000`
5. ✅ Create an owner account via `/admin` page

