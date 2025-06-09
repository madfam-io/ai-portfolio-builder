# Google OAuth Setup Guide

This guide will help you set up Google OAuth for the MADFAM AI Portfolio Builder.

## Prerequisites

- Google Cloud Console account
- Supabase project (local or cloud)

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Create Project" or select an existing project
3. Give your project a name (e.g., "MADFAM Portfolio Builder")

## Step 2: Enable Google+ API

1. In your Google Cloud project, go to "APIs & Services" > "Library"
2. Search for "Google+ API"
3. Click on it and press "Enable"

## Step 3: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. If prompted, configure the OAuth consent screen first:
   - Choose "External" user type
   - Fill in the required fields:
     - App name: MADFAM Portfolio Builder
     - User support email: your email
     - Developer contact: your email
   - Add scopes: `email` and `profile`
   - Add test users if in development

4. Back in "Create OAuth client ID":
   - Application type: Web application
   - Name: MADFAM Portfolio Builder
   - Authorized JavaScript origins:
     - `http://localhost:3000` (development)
     - `https://your-domain.com` (production)
   - Authorized redirect URIs:
     - `http://localhost:3000/auth/callback` (development)
     - `http://localhost:54321/auth/v1/callback` (Supabase local)
     - `https://your-project.supabase.co/auth/v1/callback` (Supabase cloud)
     - `https://your-domain.com/auth/callback` (production)

5. Click "Create" and save your credentials:
   - Client ID: `SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID`
   - Client Secret: `SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET`

## Step 4: Configure Supabase

### For Local Development

1. Update your `.env.local` file:
```env
SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID=your_google_client_id
SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET=your_google_client_secret
```

2. The `supabase/config.toml` is already configured with:
```toml
[auth.external.google]
enabled = true
client_id = "env(SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID)"
secret = "env(SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET)"
```

### For Supabase Cloud

1. Go to your Supabase project dashboard
2. Navigate to "Authentication" > "Providers"
3. Find Google and click "Enable"
4. Enter your Client ID and Client Secret
5. Copy the callback URL and add it to Google Cloud Console

## Step 5: Test the Integration

1. Start your development environment:
```bash
./scripts/docker-dev.sh
```

2. Navigate to `http://localhost:3000/auth/signin`
3. Click "Continue with Google"
4. You should be redirected to Google's OAuth consent screen
5. After authorization, you'll be redirected back to your app

## Troubleshooting

### Common Issues

1. **Redirect URI mismatch**
   - Ensure the redirect URI in Google Console exactly matches Supabase's callback URL
   - Check for trailing slashes and protocol (http vs https)

2. **Invalid client**
   - Double-check your Client ID and Secret
   - Ensure environment variables are loaded correctly

3. **Scope errors**
   - Make sure you've enabled the Google+ API
   - Check that email and profile scopes are configured

### Testing Tips

- Use Chrome DevTools Network tab to inspect OAuth redirects
- Check Supabase logs for authentication errors
- Test with different Google accounts
- Clear cookies/cache between tests

## Security Notes

- Never commit OAuth secrets to version control
- Use environment variables for all sensitive data
- Regularly rotate your OAuth credentials
- Monitor usage in Google Cloud Console
- Implement rate limiting on your authentication endpoints

## Production Checklist

- [ ] Update redirect URIs for production domain
- [ ] Remove localhost from authorized origins
- [ ] Verify OAuth consent screen is properly configured
- [ ] Test with real users (not just test accounts)
- [ ] Set up monitoring for failed authentications
- [ ] Configure proper CORS settings
- [ ] Enable HTTPS for all OAuth flows