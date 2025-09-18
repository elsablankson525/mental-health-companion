const { PrismaClient } = require('@prisma/client')

async function testConnection() {
  const prisma = new PrismaClient()
  
  try {
    console.log('🔍 Testing Neon Database Connection...')
    
    // Test basic connection
    await prisma.$connect()
    console.log('✅ Database connection successful!')
    
    // Test query
    const result = await prisma.$queryRaw`SELECT version()`
    console.log('✅ Database query successful!')
    console.log(`   PostgreSQL version: ${result[0].version}`)
    
    // Check if tables exist
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `
    
    console.log(`✅ Found ${tables.length} tables in database:`)
    tables.forEach(table => {
      console.log(`   - ${table.table_name}`)
    })
    
    console.log('\n🎉 Neon database setup complete!')
    console.log('Your Mental Health Companion app is ready to use!')
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()
