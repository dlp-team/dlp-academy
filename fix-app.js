// fix-app.js
/* global require */
const fs = require('fs');

let file = fs.readFileSync('src/App.tsx', 'utf8');
file = file.replace('let unsubscribeUserDoc = null;', 'let unsubscribeUserDoc: any = null;');
file = file.replace(/catch\s*\(\s*(err|\w+)\s*\)/g, 'catch ($1: any)');
fs.writeFileSync('src/App.tsx', file);
console.log('Fixed App.tsx');
