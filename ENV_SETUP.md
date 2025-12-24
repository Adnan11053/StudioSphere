# Environment Variables Setup

## Where to Add Your Supabase Keys

Create a file named `.env.local` in the **root directory** of your project (same level as `package.json`).

## Steps to Set Up

1. **Create the `.env.local` file** in the root directory:
   ```
   studio-inventory-manager/
   ├── .env.local          ← Create this file here
   ├── package.json
   ├── next.config.mjs
   └── ...
   ```

2. **Add your Supabase credentials** to `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```

3. **Get your Supabase keys**:
   - Go to [Supabase Dashboard](https://supabase.com/dashboard)
   - Select your project (or create a new one)
   - Go to **Settings** → **API**
   - Copy the following:
     - **Project URL** → Use for `NEXT_PUBLIC_SUPABASE_URL`
     - **anon/public key** → Use for `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Example `.env.local` File

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4eHh4eHh4eHh4eHh4eHh4eHgiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MTI2ODgwMCwiZXhwIjoxOTU2ODQ0ODAwfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Important Notes

- ✅ The `.env.local` file is **automatically ignored** by git (already in `.gitignore`)
- ✅ **Never commit** your `.env.local` file to version control
- ✅ Restart your dev server after creating/updating `.env.local`
- ✅ Use `.env.local` for local development
- ✅ For production, set these variables in your hosting platform (Vercel, Netlify, etc.)

## Quick Setup Command

On Windows (PowerShell):
```powershell
Copy-Item env.example .env.local
```

On Mac/Linux:
```bash
cp env.example .env.local
```

Then edit `.env.local` and replace the placeholder values with your actual Supabase keys.

## Verify Setup

After adding your keys, restart your dev server:
```bash
pnpm dev
```

If you see any errors about missing environment variables, double-check that:
1. The file is named exactly `.env.local` (with the dot at the beginning)
2. The file is in the root directory
3. The variable names are exactly as shown (case-sensitive)
4. There are no extra spaces or quotes around the values

