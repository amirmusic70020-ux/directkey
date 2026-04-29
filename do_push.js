const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const repoDir = 'C:\\Users\\Asus\\Documents\\GitHub\\directkey';
process.chdir(repoDir);

// Find git — check common locations including GitHub Desktop's bundled git
const gitPaths = [
  'git',
  'C:\\Program Files\\Git\\cmd\\git.exe',
  'C:\\Program Files (x86)\\Git\\cmd\\git.exe',
  process.env.LOCALAPPDATA + '\\Programs\\Git\\cmd\\git.exe',
  process.env.LOCALAPPDATA + '\\GitHubDesktop\\app-3.4.8\\resources\\app\\git\\cmd\\git.exe',
  process.env.LOCALAPPDATA + '\\GitHubDesktop\\app-3.4.9\\resources\\app\\git\\cmd\\git.exe',
  process.env.LOCALAPPDATA + '\\GitHubDesktop\\app-3.4.10\\resources\\app\\git\\cmd\\git.exe',
  process.env.LOCALAPPDATA + '\\GitHubDesktop\\app-3.4.11\\resources\\app\\git\\cmd\\git.exe',
  process.env.LOCALAPPDATA + '\\GitHubDesktop\\app-3.4.12\\resources\\app\\git\\cmd\\git.exe',
  process.env.LOCALAPPDATA + '\\GitHubDesktop\\app-3.4.13\\resources\\app\\git\\cmd\\git.exe',
  process.env.LOCALAPPDATA + '\\GitHubDesktop\\app-3.4.14\\resources\\app\\git\\cmd\\git.exe',
  process.env.LOCALAPPDATA + '\\GitHubDesktop\\app-3.4.15\\resources\\app\\git\\cmd\\git.exe',
  process.env.LOCALAPPDATA + '\\GitHubDesktop\\app-3.5.0\\resources\\app\\git\\cmd\\git.exe',
  process.env.LOCALAPPDATA + '\\GitHubDesktop\\app-3.5.1\\resources\\app\\git\\cmd\\git.exe',
];

// Also scan GitHubDesktop directory dynamically
try {
  const ghDir = process.env.LOCALAPPDATA + '\\GitHubDesktop';
  if (fs.existsSync(ghDir)) {
    const apps = fs.readdirSync(ghDir).filter(f => f.startsWith('app-'));
    for (const app of apps) {
      const p = path.join(ghDir, app, 'resources', 'app', 'git', 'cmd', 'git.exe');
      gitPaths.push(p);
      console.log('Found GH Desktop app:', p);
    }
  }
} catch(e) {}

let gitCmd = null;
for (const g of gitPaths) {
  try {
    const r = spawnSync(g, ['--version'], { encoding: 'utf8', timeout: 3000 });
    if (r.status === 0) {
      gitCmd = g;
      console.log('Using git:', g);
      break;
    }
  } catch(e) {}
}

if (!gitCmd) { console.error('git not found!'); process.exit(1); }

const r = spawnSync(gitCmd, ['push', 'origin', 'main'], { 
  encoding: 'utf8', 
  stdio: 'inherit',
  env: { ...process.env, GIT_TERMINAL_PROMPT: '0' }
});
console.log('Exit code:', r.status);
process.exit(r.status || 0);
