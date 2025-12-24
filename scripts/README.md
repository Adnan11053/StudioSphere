# SQL Scripts - Setup Guide

All scripts are now **idempotent** - they can be run multiple times safely without errors.

## Script Execution Order

Run these scripts in order in your Supabase SQL Editor:

### 1. `001_create_tables.sql`
Creates all database tables and initial RLS policies.
- ✅ Safe to run multiple times
- Drops existing policies before creating new ones
- Uses `CREATE TABLE IF NOT EXISTS` for tables

### 2. `002_create_trigger.sql`
Sets up database triggers for automatic profile creation and timestamp updates.
- ✅ Safe to run multiple times
- Uses `CREATE OR REPLACE FUNCTION` for functions
- Drops existing triggers before creating new ones

### 3. `003_fix_rls_policies.sql`
Fixes RLS policies to prevent infinite recursion issues.
- ✅ Safe to run multiple times
- Drops all existing profile and studio policies before recreating
- Creates optimized policies without recursion

### 3b. `006_fix_studios_recursion.sql` (Quick Fix)
If you're getting "infinite recursion" errors, run this immediately.
- ✅ Fixes studios table recursion issues
- Can be run standalone or after other scripts

### 4. `004_manual_owner_setup.sql` (Optional)
Reference script for manual owner setup.
- Contains instructions and examples
- Can be used if automatic setup fails

### 5. `005_seed_test_data.sql` (Optional)
Creates test data for the current authenticated user.
- ✅ Safe to run multiple times
- Checks for existing data before inserting
- Uses `ON CONFLICT` to handle duplicates

## Quick Setup

```sql
-- Run in Supabase SQL Editor in this order:
-- 1. Copy and run 001_create_tables.sql
-- 2. Copy and run 002_create_trigger.sql
-- 3. Copy and run 003_fix_rls_policies.sql
```

## What Changed

All scripts now:
- ✅ Drop existing policies/triggers before creating new ones
- ✅ Use `IF NOT EXISTS` or `CREATE OR REPLACE` where applicable
- ✅ Handle duplicate data gracefully
- ✅ Can be run multiple times without errors

## Troubleshooting

### "Policy already exists" error
- **Fixed!** All scripts now drop existing policies first

### "Trigger already exists" error
- **Fixed!** Scripts now drop existing triggers first

### "Duplicate key" error
- **Fixed!** Seed script uses `ON CONFLICT` to handle duplicates

### Need to reset everything?
Run all scripts again - they'll clean up and recreate everything safely.

## Verification

After running the scripts, verify:
1. Tables exist: Check Supabase Dashboard → Table Editor
2. Policies exist: Check Supabase Dashboard → Authentication → Policies
3. Triggers exist: Check Supabase Dashboard → Database → Triggers

