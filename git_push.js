const { execSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const repoDir = 'C:\\Users\\Asus\\Documents\\GitHub\\directkey';
process.chdir(repoDir);
console.log('Working directory:', process.cwd());

// Find git executable
const gitPaths = [
  'git',
  'C:\\Program Files\\Git\\cmd\\git.exe',
  'C:\\Program Files (x86)\\Git\\cmd\\git.exe',
  (process.env.LOCALAPPDATA || '') + '\\Programs\\Git\\cmd\\git.exe',
  'C:\\Program Files\\Git\\bin\\git.exe',
  'C:\\Users\\Asus\\AppData\\Local\\Programs\\Git\\cmd\\git.exe',
];

let gitCmd = null;
for (const g of gitPaths) {
  try {
    const r = spawnSync(g, ['--version'], { encoding: 'utf8', timeout: 3000 });
    if (r.status === 0) {
      gitCmd = g;
      console.log('Found git:', g, '->', r.stdout.trim());
      break;
    }
  } catch(e) {}
}

if (!gitCmd) {
  console.error('ERROR: git not found in any location!');
  process.exit(1);
}

function run(cmd, args) {
  console.log('\n>', cmd, args.join(' '));
  const r = spawnSync(cmd, args, { encoding: 'utf8', stdio: 'inherit' });
  if (r.status !== 0) {
    console.error('Command failed with code', r.status);
    if (r.stderr) console.error(r.stderr);
  }
  return r.status;
}

run(gitCmd, ['add', 'package.json', 'app\\api\\whatsapp\\route.ts']);
run(gitCmd, ['commit', '-m', 'fix: use waitUntil to keep Vercel function alive for SARA async processing']);
run(gitCmd, ['push']);

console.log('\nAll done! Check Vercel dashboard for the new deployment.');
