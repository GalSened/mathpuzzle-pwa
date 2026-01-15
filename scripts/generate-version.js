#!/usr/bin/env node

/**
 * Generate Build Version Script
 *
 * Creates a unique version identifier for each build to enable cache busting.
 * The version is written to public/version.json and can be used by:
 * - Service worker cache naming
 * - Client-side version checking
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Generate version components
const timestamp = Date.now();
let gitHash = 'local';

try {
  // Get short git hash (7 chars)
  gitHash = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
} catch (e) {
  // Not in a git repo or git not available
  console.log('Warning: Could not get git hash, using "local"');
}

// Create version string: git-hash-timestamp
const version = `${gitHash}-${timestamp}`;

// Version data object
const versionData = {
  version,
  gitHash,
  timestamp,
  buildDate: new Date().toISOString(),
};

// Write to public/version.json
const publicDir = path.join(__dirname, '..', 'public');
const versionPath = path.join(publicDir, 'version.json');

// Ensure public directory exists
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(versionPath, JSON.stringify(versionData, null, 2));

console.log(`Generated version: ${version}`);
console.log(`Written to: ${versionPath}`);

// Also update the service worker cache name placeholder
const swPath = path.join(publicDir, 'sw.js');
if (fs.existsSync(swPath)) {
  let swContent = fs.readFileSync(swPath, 'utf8');
  // Replace placeholder with actual version
  swContent = swContent.replace(/__BUILD_VERSION__/g, version);
  fs.writeFileSync(swPath, swContent);
  console.log(`Updated service worker with version: ${version}`);
}
