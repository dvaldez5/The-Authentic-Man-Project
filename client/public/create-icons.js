const fs = require('fs');

// Create a simple SVG icon and convert to base64 data URL
const svg192 = `<svg width="192" height="192" viewBox="0 0 192 192" xmlns="http://www.w3.org/2000/svg">
  <rect width="192" height="192" rx="24" fill="#7C4A32"/>
  <text x="96" y="105" font-family="Arial, sans-serif" font-size="64" font-weight="bold" fill="white" text-anchor="middle">AM</text>
  <text x="96" y="135" font-family="Arial, sans-serif" font-size="16" fill="white" text-anchor="middle">Project</text>
</svg>`;

const svg512 = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="64" fill="#7C4A32"/>
  <text x="256" y="280" font-family="Arial, sans-serif" font-size="172" font-weight="bold" fill="white" text-anchor="middle">AM</text>
  <text x="256" y="360" font-family="Arial, sans-serif" font-size="42" fill="white" text-anchor="middle">Project</text>
</svg>`;

// Write SVG files that can be referenced as icons
fs.writeFileSync('pwa-icon-192.svg', svg192);
fs.writeFileSync('pwa-icon-512.svg', svg512);

console.log('Icons created successfully');
