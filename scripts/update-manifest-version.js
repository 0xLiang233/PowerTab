import { readFile, writeFile } from 'node:fs/promises';

const packageJsonPath = new URL('../package.json', import.meta.url);
const manifestJsonPath = new URL('../public/manifest.json', import.meta.url);

const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'));
const manifestJson = JSON.parse(await readFile(manifestJsonPath, 'utf8'));

if (typeof packageJson.version !== 'string' || !packageJson.version) {
  throw new Error('package.json version is missing');
}

manifestJson.version = packageJson.version;

await writeFile(manifestJsonPath, `${JSON.stringify(manifestJson, null, 2)}\n`);
