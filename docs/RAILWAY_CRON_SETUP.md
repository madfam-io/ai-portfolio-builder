# Railway Cron Jobs Setup Guide

## Overview
This guide explains how to configure and deploy cron jobs on Railway for the Portfolio Builder application.

## What Was Done

### 1. Created Cron Job API Endpoints
- **`/api/cron/cleanup`** - Daily cleanup tasks (2 AM UTC)
  - Removes expired sessions (30+ days old)
  - Cleans orphaned portfolio drafts (90+ days)
  - Purges old analytics events (180+ days)
  - Deletes failed payment attempts (60+ days)

- **`/api/cron/analytics`** - Analytics aggregation (every 6 hours)
  - Aggregates portfolio views
  - Calculates user engagement metrics
  - Generates revenue analytics
  - Tracks conversion funnel metrics

### 2. Added Security
All cron endpoints are protected with API key authentication using the `X-API-Key` header.

### 3. Created Railway Configuration
Added `railway.toml` with cron job definitions that will run on Railway's infrastructure.

## Setup Instructions

### Step 1: Generate Production API Key
```bash
# Generate a secure 32-byte hex key
openssl rand -hex 32
```

### Step 2: Configure Environment Variables

#### In Railway Dashboard:
1. Go to your project settings
2. Add the following environment variable:
   ```
   CRON_API_KEY=<your-generated-key>
   ```

#### In Vercel Dashboard:
1. Go to Project Settings → Environment Variables
2. Add the same `CRON_API_KEY` variable for Production environment

### Step 3: Deploy to Railway
```bash
# Push changes to your repository
git add .
git commit -m "feat: add Railway cron jobs configuration"
git push

# Railway will automatically deploy with the new configuration
```

### Step 4: Verify Cron Jobs
After deployment, Railway will show the configured cron jobs in the dashboard:
- Navigate to your service
- Check the "Cron" tab to see scheduled jobs
- Monitor execution logs

## Testing Locally

You can test the cron endpoints locally:

```bash
# Test cleanup endpoint
curl -X POST http://localhost:3000/api/cron/cleanup \
  -H "X-API-Key: aa89e00f74c2a5c137858859c0d88f3c06c8b69428e82a8e5b8db52bdd7dbb05"

# Test analytics endpoint  
curl -X POST http://localhost:3000/api/cron/analytics \
  -H "X-API-Key: aa89e00f74c2a5c137858859c0d88f3c06c8b69428e82a8e5b8db52bdd7dbb05"
```

## Monitoring

### Railway Dashboard
- View cron execution history
- Check logs for each run
- Set up alerts for failures

### Application Logs
The cron jobs use the application's logger to record:
- Start/completion of each job
- Number of records processed
- Any errors encountered

## Troubleshooting

### Common Issues

1. **401 Unauthorized**
   - Verify `CRON_API_KEY` is set in both Railway and Vercel
   - Ensure the API key matches in requests

2. **Database Connection Issues**
   - Check `DATABASE_URL` is correctly set
   - Verify Railway PostgreSQL is running

3. **Cron Not Running**
   - Verify `railway.toml` is in the repository root
   - Check Railway dashboard for deployment errors

## Security Considerations

1. **Never commit the API key** to version control
2. **Rotate keys regularly** (recommended: every 90 days)
3. **Monitor for unauthorized access** attempts in logs
4. **Use different keys** for staging/production environments

## Adding New Cron Jobs

To add a new cron job:

1. Create the API endpoint in `/app/api/cron/[job-name]/route.ts`
2. Add API key authentication
3. Add the cron definition to `railway.toml`:
   ```toml
   [[crons]]
   name = "Your Job Name"
   schedule = "0 0 * * *"  # Cron expression
   command = '''
   curl -X POST \
     -H "X-API-Key: $CRON_API_KEY" \
     https://portfolio-builder.madfam.io/api/cron/your-job
   '''
   ```
4. Deploy to Railway

## Cron Expression Reference

- `0 2 * * *` - Daily at 2 AM
- `0 */6 * * *` - Every 6 hours
- `0 0 * * 1` - Weekly on Monday
- `0 0 1 * *` - Monthly on the 1st
- `*/5 * * * *` - Every 5 minutes

## Support

For issues or questions:
- Check Railway documentation: https://docs.railway.app/reference/cron-jobs
- Review application logs in Railway dashboard
- Contact the development team