#!/bin/bash
# Railway Deployment Preparation Script

echo "🚀 Preparing ML Backend for Railway Deployment..."

# Check if we're in the right directory
if [ ! -f "app.py" ]; then
    echo "❌ Error: app.py not found. Please run this script from the ml_backend directory."
    exit 1
fi

echo "✅ Found app.py"

# Check required files
required_files=("requirements.txt" "Procfile" "railway.json" "nixpacks.toml" "runtime.txt")
for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ Found $file"
    else
        echo "❌ Missing $file"
        exit 1
    fi
done

# Check models directory
if [ -d "models" ]; then
    echo "✅ Found models directory"
    model_files=("mood_predictor.joblib" "scaler.joblib" "vectorizer.joblib")
    for model in "${model_files[@]}"; do
        if [ -f "models/$model" ]; then
            echo "✅ Found models/$model"
        else
            echo "⚠️  Warning: models/$model not found"
        fi
    done
else
    echo "❌ Models directory not found"
    exit 1
fi

# Test the application locally
echo "🧪 Testing application locally..."
python -c "
import sys
try:
    from app import app
    print('✅ Application imports successfully')
except Exception as e:
    print(f'❌ Application import failed: {e}')
    sys.exit(1)
"

# Check if all dependencies are available
echo "📦 Checking dependencies..."
python -c "
import sys
required_modules = ['flask', 'flask_cors', 'pandas', 'numpy', 'textblob', 'joblib', 'gunicorn']
missing_modules = []
for module in required_modules:
    try:
        __import__(module)
    except ImportError:
        missing_modules.append(module)

if missing_modules:
    print(f'❌ Missing modules: {missing_modules}')
    sys.exit(1)
else:
    print('✅ All required modules available')
"

echo ""
echo "🎉 ML Backend is ready for Railway deployment!"
echo ""
echo "📋 Next steps:"
echo "1. Push your code to a Git repository (GitHub, GitLab, etc.)"
echo "2. Go to https://railway.app and sign in"
echo "3. Create a new project and connect your repository"
echo "4. Set the root directory to 'ml_backend'"
echo "5. Deploy!"
echo ""
echo "📖 For detailed instructions, see RAILWAY_DEPLOYMENT_GUIDE.md"
echo ""
echo "🔗 Your API will be available at: https://your-app-name.railway.app/api"
