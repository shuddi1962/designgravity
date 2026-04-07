import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const checks = [
  { pattern: /(?<![a-zA-Z0-9_])any(?![a-zA-Z0-9_])(?:\s|>|,|\[|$)/, message: 'TypeScript any detected — remove it' },
  { pattern: /console\.log\((?!.*(debug|info))/i, message: 'console.log detected in production code' },
  { pattern: /sk-[a-zA-Z0-9]{20,}/, message: 'Hardcoded API key detected' },
  { pattern: /supabase|firebase|planetscale/i, message: 'Forbidden backend detected' },
];

const srcDir = path.join(process.cwd(), 'src');

function getAllTsFiles(dir: string): string[] {
  const files: string[] = [];
  
  if (!fs.existsSync(dir)) {
    return files;
  }
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
      files.push(...getAllTsFiles(fullPath));
    } else if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) {
      files.push(fullPath);
    }
  }
  
  return files;
}

const srcFiles = getAllTsFiles(srcDir);
let errors = 0;

console.log('Running validation checks...\n');

for (const file of srcFiles) {
  const content = fs.readFileSync(file, 'utf-8');
  
  for (const check of checks) {
    const matches = content.match(new RegExp(check.pattern, 'g'));
    if (matches) {
      const relativePath = path.relative(process.cwd(), file);
      for (const match of matches) {
        console.error(`[FAIL] ${relativePath}: ${check.message} (found: "${match}")`);
        errors++;
      }
    }
  }
}

console.log('');

if (errors > 0) {
  console.error(`${errors} validation error(s) found.`);
  process.exit(1);
} else {
  console.log('All validation checks passed.');
  console.log(`Checked ${srcFiles.length} TypeScript files.`);
}
