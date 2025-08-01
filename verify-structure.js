#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Repository Structure for Render Deployment...\n');

const checks = [
  {
    path: 'backend/package.json',
    description: 'Backend package.json',
    critical: true
  },
  {
    path: 'backend/server.js',
    description: 'Backend server.js',
    critical: true
  },
  {
    path: 'frontend/package.json',
    description: 'Frontend package.json',
    critical: true
  },
  {
    path: 'frontend/src',
    description: 'Frontend src directory',
    critical: true
  },
  {
    path: 'frontend/public',
    description: 'Frontend public directory',
    critical: true
  },
  {
    path: 'backend/.env.example',
    description: 'Backend environment template',
    critical: false
  },
  {
    path: 'frontend/.env.example',
    description: 'Frontend environment template',
    critical: false
  },
  {
    path: 'render.yaml',
    description: 'Render configuration',
    critical: false
  }
];

let allGood = true;
let criticalIssues = 0;

checks.forEach(check => {
  const fullPath = path.join(__dirname, check.path);
  const exists = fs.existsSync(fullPath);
  
  if (exists) {
    console.log(`✅ ${check.description}`);
  } else {
    const icon = check.critical ? '❌' : '⚠️';
    console.log(`${icon} ${check.description} - MISSING`);
    
    if (check.critical) {
      criticalIssues++;
      allGood = false;
    }
  }
});

console.log('\n' + '='.repeat(50));

if (allGood) {
  console.log('🎉 Repository structure looks good for Render deployment!');
  console.log('\n📋 Next steps:');
  console.log('1. Push to GitHub if you haven\'t already');
  console.log('2. Create Render services with correct Root Directory settings');
  console.log('3. Backend Root Directory: "backend"');
  console.log('4. Frontend Root Directory: "frontend"');
} else {
  console.log(`❌ Found ${criticalIssues} critical issues that need to be fixed.`);
  console.log('\n🔧 To fix:');
  console.log('1. Make sure your repository has both "backend" and "frontend" folders');
  console.log('2. Each folder should contain its respective package.json');
  console.log('3. Check that you\'re in the correct directory when running this script');
}

console.log('\n📖 For detailed deployment instructions, see:');
console.log('- RENDER_FIX.md (quick fixes)');
console.log('- deploy.md (complete guide)');