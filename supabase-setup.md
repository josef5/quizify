# Supabase Setup Documentation

## Overview

This setup creates a React + TypeScript authentication system with Supabase, featuring a profiles table that stores both plain text and encrypted data using Supabase Vault.

## Prerequisites

- Supabase project created
- Vault extension enabled (should be enabled by default in Supabase)

## Database Setup

### Step 1: Create Tables and Policies

Run this SQL in your Supabase SQL Editor:

```sql
-- Create profiles table
create table profiles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  prompts text[],
  openai_api_key_id uuid, -- References vault.secrets(id)
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id)
);

-- Enable Row Level Security (RLS)
alter table profiles enable row level security;

-- Create policies for profiles table
create policy "Users can view own profile"
  on profiles for select
  using ((select auth.uid() as uid) = user_id)

create policy "Users can insert own profile"
  on profiles for insert
  with check (select auth.uid() as uid) = user_id

create policy "Users can update own profile"
  on profiles for update
  using (select auth.uid() as uid) = user_id

create policy "Users can delete own profile"
  on profiles for delete
  using (select auth.uid() as uid) = user_id

-- Grant basic permissions
grant usage on schema public to authenticated;
grant all on profiles to authenticated;
```

### Step 2: Create Vault Functions

Run this SQL to create functions for handling encrypted secrets:

TODO: Rename openai_api_key to api_key

```sql
-- Function to create or update a user's OpenAI API key in Vault
create or replace function upsert_user_api_key(new_api_key text)
returns uuid
language plpgsql
security definer
set search_path = public
as $function$
declare
  current_profile record;
  secret_id uuid;
  secret_name text;
begin
  -- Generate consistent secret name for the user
  secret_name := 'user_api_key_' || auth.uid()::text;

  -- Try to get current profile, but don't fail if table doesn't exist
  begin
    select * into current_profile
    from public.profiles
    where user_id = auth.uid();
  exception
    when undefined_table then
      -- Table doesn't exist yet, treat as no existing profile
      current_profile := null;
  end;

  if current_profile.api_key_id is not null then
    -- Update existing secret in vault
    perform vault.update_secret(
      current_profile.api_key_id,
      new_api_key,
      secret_name,
      'OpenAI API key for user ' || auth.uid()::text
    );
    return current_profile.api_key_id;
  else
    -- Check if secret with this name already exists (edge case)
    select id into secret_id
    from vault.secrets
    where name = secret_name;

    if secret_id is not null then
      -- Update existing orphaned secret
      perform vault.update_secret(
        secret_id,
        new_api_key,
        secret_name,
        'OpenAI API key for user ' || auth.uid()::text
      );
    else
      -- Create new secret in vault
      select vault.create_secret(
        new_api_key,
        secret_name,
        'OpenAI API key for user ' || auth.uid()::text
      ) into secret_id;
    end if;

    return secret_id;
  end if;
exception
  when others then
    -- If vault functions fail, raise a helpful error
    raise exception 'Vault operations failed. Make sure Vault is enabled in your Supabase project. Error: %', SQLERRM;
end;
$function$;

-- Function to get a user's decrypted OpenAI API key
create or replace function get_user_api_key()
returns text
language plpgsql
security definer
set search_path = public
as $function$
declare
  current_profile record;
  secret_value text;
begin
  -- Get current profile
  select * into current_profile
  from public.profiles
  where user_id = auth.uid();

  if current_profile.api_key_id is null then
    return null;
  end if;

  -- Get decrypted secret from vault
  select decrypted_secret into secret_value
  from vault.decrypted_secrets
  where id = current_profile.api_key_id;

  return secret_value;
exception
  when others then
    -- If vault access fails, return a helpful message
    return '[Vault access error: ' || SQLERRM || ']';
end;
$function$;

-- Grant function permissions
grant execute on function upsert_user_api_key(text) to authenticated;
grant execute on function get_user_api_key() to authenticated;

-- Add these if needed
grant usage on schema vault to authenticated;
grant select on vault.decrypted_secrets to authenticated;
```

### Step 3: Optional Cleanup Function

This creates automatic cleanup of vault secrets when profiles are deleted (will show "destructive operation" warning):

```sql
-- Function to handle profile cleanup (delete associated vault secret)
create or replace function cleanup_profile_secrets()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
begin
  -- Delete the associated vault secret when profile is deleted
  if OLD.openai_api_key_id is not null then
    begin
      delete from vault.secrets where id = OLD.openai_api_key_id;
    exception
      when others then
        -- Log the error but don't fail the profile deletion
        raise warning 'Could not delete vault secret: %', SQLERRM;
    end;
  end if;

  return OLD;
end;
$function$;

-- Create trigger for cleanup
create trigger cleanup_profile_secrets_trigger
  before delete on profiles
  for each row
  execute function cleanup_profile_secrets();
```

## How It Works

### Data Storage

- **Text array data** (`prompts`): Stored directly in the `profiles` table
- **Encrypted data** (`openai_api_key`): Stored in `vault.secrets` table (encrypted)
- **Reference**: `profiles.openai_api_key_id` contains UUID pointing to the vault secret

### Security Features

- **Authenticated Encryption**: Uses AEAD (Authenticated Encryption with Associated Data)
- **Key Management**: Encryption keys managed securely by Supabase (never stored in database)
- **Row Level Security**: Users can only access their own profiles
- **Vault Access Control**: Users can only access secrets they create

### Functions

- `upsert_user_openai_api_key(text)`: Creates or updates encrypted secret, returns UUID
- `get_user_openai_api_key()`: Retrieves and decrypts user's api key
- `cleanup_profile_secrets()`: Trigger function that cleans up vault secrets on profile deletion

## Frontend Integration

### Environment Variables

Create `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Usage in React

```typescript
// Update profile with both plain and encrypted data
const { error } = await supabase.rpc("upsert_user_openai_api_key", {
  new_openai_api_key: "abc123...",
});

// Get decrypted secret
const { data: apiKey } = await supabase.rpc("get_user_openai_api_key");
```

## Verification

### Test Vault Setup

```sql
-- Should return a UUID if vault is working
select vault.create_secret('test_secret', 'test_name', 'test description');

-- Should show the test secret
select * from vault.decrypted_secrets where name = 'test_name';

-- Should return null initially (no user secrets yet)
select get_user_openai_api_key();
```

### Check Extensions

1. Go to Supabase Dashboard → Database → Extensions
2. Verify "vault" extension is enabled
3. If not enabled, enable it manually

## Troubleshooting

### Common Issues

- **"relation 'profiles' does not exist"**: Run Step 1 first
- **"vault schema does not exist"**: Enable vault extension in dashboard
- **"permission denied for schema vault"**: Run the grant permissions in Step 2
- **Functions return null**: Expected behavior when no secrets are stored yet

### Additional Permissions (if needed)

```sql
grant usage on schema vault to authenticated;
grant select on vault.decrypted_secrets to authenticated;
```

## Production Considerations

- Vault encryption keys are managed by Supabase automatically
- Encrypted data remains encrypted in backups and replication
- Consider implementing audit logging for sensitive operations
- Test backup/restore procedures to ensure encrypted data integrity
