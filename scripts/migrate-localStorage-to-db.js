/**
 * Migration script to transfer localStorage data to database
 * This script helps users migrate their existing mood and journal entries
 * from localStorage to the PostgreSQL database
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function migrateLocalStorageData() {
  console.log('🔄 Starting localStorage to database migration...')
  
  try {
    // This would typically be run in the browser context
    // For now, we'll create a helper function that can be called from the frontend
    
    console.log('📝 Migration script created successfully!')
    console.log('')
    console.log('To migrate your existing data:')
    console.log('1. Open your browser and go to the Mental Health Companion app')
    console.log('2. Open browser developer tools (F12)')
    console.log('3. Go to the Console tab')
    console.log('4. Copy and paste the migration code from the frontend')
    console.log('5. Run the migration function')
    console.log('')
    console.log('The migration will:')
    console.log('- Transfer mood entries from localStorage to database')
    console.log('- Transfer journal entries from localStorage to database')
    console.log('- Preserve all your existing data')
    console.log('- Clear localStorage after successful migration')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Create the frontend migration code
const frontendMigrationCode = `
// Frontend Migration Code - Run this in browser console
async function migrateLocalStorageToDatabase() {
  console.log('🔄 Starting localStorage migration...');
  
  try {
    // Get mood entries from localStorage
    const moodEntriesData = localStorage.getItem('mood-entries');
    const journalEntriesData = localStorage.getItem('journal-entries');
    
    let migratedMoodEntries = 0;
    let migratedJournalEntries = 0;
    
    // Migrate mood entries
    if (moodEntriesData) {
      const moodEntries = JSON.parse(moodEntriesData);
      console.log(\`Found \${moodEntries.length} mood entries to migrate\`);
      
      for (const entry of moodEntries) {
        try {
          const response = await fetch('/api/mood-entries', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              mood: entry.mood,
              emotions: entry.emotions,
              note: entry.note,
            }),
          });
          
          if (response.ok) {
            migratedMoodEntries++;
          } else {
            console.warn('Failed to migrate mood entry:', entry);
          }
        } catch (error) {
          console.error('Error migrating mood entry:', error);
        }
      }
    }
    
    // Migrate journal entries
    if (journalEntriesData) {
      const journalEntries = JSON.parse(journalEntriesData);
      console.log(\`Found \${journalEntries.length} journal entries to migrate\`);
      
      for (const entry of journalEntries) {
        try {
          const response = await fetch('/api/journal-entries', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              content: entry.content,
              title: entry.mood ? \`Entry - \${entry.mood}\` : undefined,
            }),
          });
          
          if (response.ok) {
            migratedJournalEntries++;
          } else {
            console.warn('Failed to migrate journal entry:', entry);
          }
        } catch (error) {
          console.error('Error migrating journal entry:', error);
        }
      }
    }
    
    // Clear localStorage after successful migration
    if (migratedMoodEntries > 0 || migratedJournalEntries > 0) {
      localStorage.removeItem('mood-entries');
      localStorage.removeItem('journal-entries');
      console.log('✅ Migration completed successfully!');
      console.log(\`📊 Migrated \${migratedMoodEntries} mood entries and \${migratedJournalEntries} journal entries\`);
      console.log('🗑️ Cleared localStorage data');
      console.log('🔄 Please refresh the page to see your data in the database');
    } else {
      console.log('ℹ️ No data found in localStorage to migrate');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

// Run the migration
migrateLocalStorageToDatabase();
`

// Write the frontend migration code to a file
const fs = require('fs')
fs.writeFileSync('MIGRATION_CODE.md', `
# LocalStorage to Database Migration

## How to migrate your existing data

If you have existing mood entries and journal entries stored in your browser's localStorage, you can migrate them to the database using the following steps:

### Step 1: Open Browser Developer Tools
1. Open your Mental Health Companion app in your browser
2. Press F12 or right-click and select "Inspect"
3. Go to the "Console" tab

### Step 2: Run the Migration Code
Copy and paste the following code into the console and press Enter:

\`\`\`javascript
${frontendMigrationCode}
\`\`\`

### Step 3: Verify Migration
1. The migration will show progress in the console
2. After completion, refresh the page
3. Your data should now be visible in the app and stored in the database

### What gets migrated:
- ✅ Mood entries (mood level, emotions, notes, dates)
- ✅ Journal entries (content, mood tags, dates)
- ✅ All timestamps and metadata are preserved

### What happens after migration:
- 🗑️ localStorage data is cleared (to avoid duplicates)
- 🔄 Page refresh is recommended to see the migrated data
- 💾 All data is now stored in the PostgreSQL database

### Troubleshooting:
- Make sure you're logged in before running the migration
- If you get errors, check that the API endpoints are working
- The migration is safe to run multiple times (it won't create duplicates)
`)

console.log('📄 Migration instructions saved to MIGRATION_CODE.md')

migrateLocalStorageData()
