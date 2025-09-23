## Wolfmed

Edukacja medyczna może być jeszcze łatwiejsza.

# Local Development

## Setup Steps

1. Start the development server:
```bash
pnpm run dev
```

2. Start Ngrok tunnel on port 3000:
```bash
ngrok http 3000
```

3. Update Clerk webhook endpoints:
   - Go to Clerk Dashboard/Development > Configure > Webhooks
   - Update the webhook URL with your new Ngrok URL
   - Format: `https://[your-ngrok-url]/api/webhooks/clerk`
   - Remember: With free Ngrok plan, URL changes each time you restart Ngrok
   - Don't forget update CLERK_WEBHOOK_SECRET each time yo add new endpoint
   
## Database Management

### Working with Neon Database Branches

1. Create a new branch:
```bash
neonctl branches create --name [branch-name]
```

2. Get connection string for the branch:
```bash
neonctl connection-string --branch [branch-name]
```

3. Update your `.env.local`:
```env
NEON_DATABASE_URL="your-new-branch-connection-string"
```

## Important Notes

- Always update Clerk webhook URL when starting new Ngrok session
- Keep your `.env.local` up to date with the correct database branch
- Test webhooks functionality after updating Clerk endpoints

## Troubleshooting

- If webhooks aren't working, verify:
  1. Ngrok is running
  2. Clerk webhook URL is updated
  3. Your app is running on port 3000