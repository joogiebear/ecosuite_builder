import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const version = pkg.version;

const src = path.join('release', 'latest', 'win-unpacked');
const versionDir = path.join('release', `v${version}`);
const zipName = `EcoSuite-Builder-v${version}-win64.zip`;
const zipPath = path.join('release', zipName);

if (!fs.existsSync(src)) {
  console.error(`Build output not found at ${src}`);
  process.exit(1);
}

if (fs.existsSync(versionDir)) {
  fs.rmSync(versionDir, { recursive: true });
}
if (fs.existsSync(zipPath)) {
  fs.unlinkSync(zipPath);
}

console.log(`Packaging v${version}...`);

// Zip directly from the build output, then rename to versioned folder
const psCmd = `Compress-Archive -Path '${src.replace(/\//g, '\\')}\\*' -DestinationPath '${zipPath.replace(/\//g, '\\')}' -CompressionLevel Optimal`;
execSync(`powershell -NoProfile -Command "${psCmd}"`, { stdio: 'inherit' });

fs.renameSync(src, versionDir);
fs.rmSync(path.join('release', 'latest'), { recursive: true, force: true });

const sizeMB = (fs.statSync(zipPath).size / 1024 / 1024).toFixed(1);

console.log(`\nDone!`);
console.log(`  Version : ${version}`);
console.log(`  Folder  : ${versionDir}`);
console.log(`  Zip     : ${zipPath} (${sizeMB} MB)`);
