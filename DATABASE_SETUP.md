# PostgreSQL Database Setup Guide

This guide will help you set up PostgreSQL 17 for the Mental Health Companion application.

## Prerequisites

1. **PostgreSQL 17** installed locally on your PC
2. **Node.js** and **npm** installed
3. The application dependencies installed (`npm install`)

## Step 1: Install PostgreSQL 17

### Windows
1. Download PostgreSQL 17 from [postgresql.org](https://www.postgresql.org/download/windows/)
2. Run the installer and follow the setup wizard
3. Remember the password you set for the `postgres` user
4. Make sure PostgreSQL service is running

### Verify Installation
```bash
psql --version
```

## Step 2: Create Database

1. Open Command Prompt or PowerShell as Administrator
2. Connect to PostgreSQL:
```bash
psql -U postgres
```

3. Create the database:
```sql
CREATE DATABASE mental_health_companion;
```

4. Exit psql:
```sql
\q
```

## Step 3: Configure Environment Variables

1. Copy the environment file:
```bash
cp env.example .env.local
```

2. Update `.env.local` with your PostgreSQL credentials:
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/mental_health_companion"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-change-in-production"
```

Replace `YOUR_PASSWORD` with the password you set during PostgreSQL installation.

## Step 4: Initialize Database Schema

1. Generate Prisma client:
```bash
npx prisma generate
```

2. Push the schema to your database:
```bash
npx prisma db push
```

3. (Optional) View your database in Prisma Studio:
```bash
npx prisma studio
```

## Step 5: Test the Setup

1. Start the development server:
```bash
npm run dev
```

2. Open your browser to `http://localhost:3000`
3. You should be redirected to the sign-in page
4. Create a new account to test the authentication

## Database Schema

The application uses the following main tables:

- **User**: User accounts and authentication
- **MoodEntry**: Daily mood tracking data
- **JournalEntry**: Personal journal entries
- **ChatMessage**: Chat history with AI companion
- **Account/Session**: NextAuth.js authentication tables

## Troubleshooting

### Connection Issues
- Ensure PostgreSQL service is running
- Check that the port 5432 is not blocked
- Verify your password in the DATABASE_URL

### Permission Issues
- Make sure the `postgres` user has proper permissions
- Check that the database exists and is accessible

### Migration Issues
- Run `npx prisma db push --force-reset` to reset the database (⚠️ This will delete all data)
- Check the Prisma schema file for syntax errors

## Production Considerations

For production deployment:

1. Use a strong `NEXTAUTH_SECRET`
2. Use environment-specific database URLs
3. Set up proper database backups
4. Configure SSL connections
5. Use connection pooling for better performance

## Useful Commands

```bash
# View database in browser
npx prisma studio

# Reset database (⚠️ Deletes all data)
npx prisma db push --force-reset

# Generate new migration
npx prisma migrate dev --name your_migration_name

# Deploy migrations to production
npx prisma migrate deploy
```
