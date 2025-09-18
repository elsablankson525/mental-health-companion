#!/bin/bash

echo "========================================"
echo "Mental Health Companion - PostgreSQL Setup"
echo "========================================"
echo

echo "Step 1: Installing PostgreSQL dependencies..."
npm install
echo

echo "Step 2: Setting up database schema..."
npx prisma generate
npx prisma db push
echo

echo "Step 3: Installing ML backend dependencies..."
cd ml_backend
pip install -r requirements.txt
cd ..
echo

echo "Step 4: Creating environment files..."
if [ ! -f .env.local ]; then
    cp env.example .env.local
    echo "Created .env.local file. Please update with your PostgreSQL credentials."
fi

if [ ! -f ml_backend/.env ]; then
    cp ml_backend/.env.example ml_backend/.env 2>/dev/null || echo "DATABASE_URL=postgresql://postgres:password@localhost:5432/mental_health_companion" > ml_backend/.env
    echo "Created ML backend .env file."
fi
echo

echo "========================================"
echo "Setup Complete!"
echo "========================================"
echo
echo "Next steps:"
echo "1. Update .env.local with your PostgreSQL password"
echo "2. Update ml_backend/.env with your PostgreSQL password"
echo "3. Make sure PostgreSQL 17 is running"
echo "4. Run: npm run dev"
echo
echo "For detailed setup instructions, see DATABASE_SETUP.md"
echo
