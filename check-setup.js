#!/usr/bin/env node

/**
 * Setup Verification Script
 * Run this to check if your environment is properly configured
 * 
 * Usage: node check-setup.js
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔍 Ecomate - Setup Verification\n');
console.log('=' .repeat(50));

let hasErrors = false;
let hasWarnings = false;

// Check 1: .env.local file exists
console.log('\n📁 Checking for .env.local file...');
const envPath = path.join(__dirname, '.env.local');
if (!fs.existsSync(envPath)) {
  console.log('❌ FAIL: .env.local file not found');
  console.log('   Create it in the project root with your environment variables');
  console.log('   See ENVIRONMENT_SETUP.md for details');
  hasErrors = true;
} else {
  console.log('✅ PASS: .env.local file exists');
  
  // Check 2: Read and parse environment variables
  console.log('\n📋 Checking environment variables...');
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envLines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));
  
  const envVars = {};
  envLines.forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join('=').trim();
    }
  });
  
  // Check for required variables
  const requiredVars = {
    'NEXT_PUBLIC_SUPABASE_URL': 'Supabase project URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY': 'Supabase anonymous key',
    'GOOGLE_API_KEY': 'Google AI API key'
  };
  
  Object.entries(requiredVars).forEach(([varName, description]) => {
    if (!envVars[varName]) {
      console.log(`❌ FAIL: ${varName} is missing`);
      console.log(`   This is required for: ${description}`);
      hasErrors = true;
    } else if (envVars[varName].includes('your-') || envVars[varName].includes('your_')) {
      console.log(`  WARN: ${varName} has placeholder value`);
      console.log(`   Replace with your actual ${description}`);
      hasWarnings = true;
    } else {
      console.log(`✅ PASS: ${varName} is set`);
      
      // Additional validation
      if (varName === 'NEXT_PUBLIC_SUPABASE_URL') {
        if (!envVars[varName].startsWith('https://')) {
          console.log('     WARN: URL should start with https://');
          hasWarnings = true;
        }
        if (!envVars[varName].includes('supabase.co')) {
          console.log('     WARN: URL should contain supabase.co');
          hasWarnings = true;
        }
      }
      
      if (varName === 'NEXT_PUBLIC_SUPABASE_ANON_KEY' && envVars[varName].length < 100) {
        console.log('     WARN: Key seems too short (should be ~200+ characters)');
        hasWarnings = true;
      }
      
      if (varName === 'GOOGLE_API_KEY' && envVars[varName].length < 30) {
        console.log('     WARN: Key seems too short');
        hasWarnings = true;
      }
    }
  });
  
  // Check for old Streamlit variable names
  console.log('\n🔄 Checking for old Streamlit variable names...');
  const oldVars = ['SUPABASE_URL', 'SUPABASE_KEY'];
  let foundOldVars = false;
  oldVars.forEach(oldVar => {
    if (envVars[oldVar]) {
      console.log(`  WARN: Found old variable: ${oldVar}`);
      foundOldVars = true;
      hasWarnings = true;
    }
  });
  
  if (foundOldVars) {
    console.log('\n   Migration needed! Update your variable names:');
    console.log('   • SUPABASE_URL → NEXT_PUBLIC_SUPABASE_URL');
    console.log('   • SUPABASE_KEY → NEXT_PUBLIC_SUPABASE_ANON_KEY');
  } else {
    console.log('✅ PASS: No old variable names found');
  }
}

// Check 3: package.json and node_modules
console.log('\n📦 Checking dependencies...');
const packageJsonPath = path.join(__dirname, 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  console.log('❌ FAIL: package.json not found');
  hasErrors = true;
} else {
  console.log('✅ PASS: package.json exists');
  
  const nodeModulesPath = path.join(__dirname, 'node_modules');
  if (!fs.existsSync(nodeModulesPath)) {
    console.log('  WARN: node_modules not found');
    console.log('   Run: pnpm install (or npm install)');
    hasWarnings = true;
  } else {
    console.log('✅ PASS: node_modules exists');
  }
}

// Check 4: Supabase schema file
console.log('\n🗄️  Checking database schema files...');
const schemaPath = path.join(__dirname, 'supabase', 'schema.sql');
if (!fs.existsSync(schemaPath)) {
  console.log('  WARN: supabase/schema.sql not found');
  hasWarnings = true;
} else {
  console.log('✅ PASS: supabase/schema.sql exists');
  console.log('   Make sure to run this in your Supabase SQL Editor!');
}

// Check 5: Next.js config
console.log('\n⚙️  Checking Next.js configuration...');
const nextConfigPath = path.join(__dirname, 'next.config.ts');
if (!fs.existsSync(nextConfigPath)) {
  console.log('  WARN: next.config.ts not found');
  hasWarnings = true;
} else {
  console.log('✅ PASS: next.config.ts exists');
}

// Final summary
console.log('\n' + '='.repeat(50));
console.log('\n SUMMARY\n');

if (!hasErrors && !hasWarnings) {
  console.log('🎉 All checks passed! Your environment is properly configured.');
  console.log('\nNext steps:');
  console.log('1. Make sure you\'ve run supabase/schema.sql in Supabase SQL Editor');
  console.log('2. Run: pnpm dev');
  console.log('3. Open: http://localhost:3000');
} else {
  if (hasErrors) {
    console.log('❌ Found critical errors that need to be fixed');
  }
  if (hasWarnings) {
    console.log('  Found warnings that should be reviewed');
  }
  console.log('\nNext steps:');
  console.log('1. Fix the issues listed above');
  console.log('2. See ENVIRONMENT_SETUP.md for detailed instructions');
  console.log('3. See TROUBLESHOOTING.md if you need help');
  console.log('4. Run this script again to verify fixes');
}

console.log('\n' + '='.repeat(50) + '\n');

// Exit with appropriate code
process.exit(hasErrors ? 1 : 0);



