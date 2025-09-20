import esbuild from 'esbuild';
import fs from 'fs';

// Read package.json to get dev dependencies
const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));

// List all dev dependencies that should never be bundled in production
const devDependencies = Object.keys(packageJson.devDependencies || {});

console.log('Building server without dev dependencies...');

// Build the server with vite and other dev tools excluded
try {
  await esbuild.build({
    entryPoints: ['server/index.ts'],
    bundle: true,
    platform: 'node',
    format: 'esm',
    outdir: 'dist',
    external: [
      ...devDependencies,  // Exclude all dev dependencies
      'vite',               // Explicitly exclude vite
      '@vitejs/*',          // Exclude all vite plugins
      './vite',             // Exclude local vite imports
      './vite.ts',
      '../vite.config'
    ],
    packages: 'external',   // Also treat all node_modules as external
  });
  console.log('Server build complete!');
} catch (err) {
  console.error('Build failed:', err);
  process.exit(1);
}