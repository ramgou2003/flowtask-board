// Simple icon generator for PWA
// This creates basic colored squares as placeholders
// In production, you'd use proper icon generation tools

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a simple SVG icon template
const createSVGIcon = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" rx="${size * 0.125}" fill="#3b82f6"/>
  <g transform="translate(${size * 0.1875}, ${size * 0.1875})">
    <rect x="0" y="0" width="${size * 0.125}" height="${size * 0.5}" rx="${size * 0.015625}" fill="white" fill-opacity="0.9"/>
    <rect x="${size * 0.015625}" y="${size * 0.015625}" width="${size * 0.09375}" height="${size * 0.0625}" rx="${size * 0.0078125}" fill="#3b82f6"/>
    <rect x="${size * 0.015625}" y="${size * 0.0875}" width="${size * 0.09375}" height="${size * 0.05}" rx="${size * 0.0078125}" fill="#e5e7eb"/>
    
    <rect x="${size * 0.15}" y="0" width="${size * 0.125}" height="${size * 0.5}" rx="${size * 0.015625}" fill="white" fill-opacity="0.9"/>
    <rect x="${size * 0.165625}" y="${size * 0.015625}" width="${size * 0.09375}" height="${size * 0.05}" rx="${size * 0.0078125}" fill="#10b981"/>
    <rect x="${size * 0.165625}" y="${size * 0.075}" width="${size * 0.09375}" height="${size * 0.0625}" rx="${size * 0.0078125}" fill="#e5e7eb"/>
    
    <rect x="${size * 0.3}" y="0" width="${size * 0.125}" height="${size * 0.5}" rx="${size * 0.015625}" fill="white" fill-opacity="0.9"/>
    <rect x="${size * 0.315625}" y="${size * 0.015625}" width="${size * 0.09375}" height="${size * 0.0375}" rx="${size * 0.0078125}" fill="#f59e0b"/>
    <rect x="${size * 0.315625}" y="${size * 0.0625}" width="${size * 0.09375}" height="${size * 0.05}" rx="${size * 0.0078125}" fill="#e5e7eb"/>
    
    <rect x="${size * 0.45}" y="0" width="${size * 0.125}" height="${size * 0.5}" rx="${size * 0.015625}" fill="white" fill-opacity="0.9"/>
    <rect x="${size * 0.465625}" y="${size * 0.015625}" width="${size * 0.09375}" height="${size * 0.05}" rx="${size * 0.0078125}" fill="#ef4444"/>
  </g>
  <text x="${size * 0.5}" y="${size * 0.875}" font-family="Arial, sans-serif" font-size="${size * 0.09375}" font-weight="bold" text-anchor="middle" fill="white">VIDEC</text>
</svg>`;

// Icon sizes needed for PWA
const iconSizes = [16, 32, 72, 96, 128, 144, 152, 167, 180, 192, 384, 512];

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate SVG icons for each size
iconSizes.forEach(size => {
  const svgContent = createSVGIcon(size);
  const filename = `icon-${size}x${size}.svg`;
  const filepath = path.join(iconsDir, filename);
  
  fs.writeFileSync(filepath, svgContent.trim());
  console.log(`Generated ${filename}`);
});

// Create a favicon.ico placeholder
const faviconSVG = createSVGIcon(32);
fs.writeFileSync(path.join(iconsDir, 'favicon.svg'), faviconSVG.trim());

console.log('Icon generation complete!');
console.log('Note: For production, convert SVG icons to PNG using a tool like:');
console.log('- ImageMagick: convert icon.svg icon.png');
console.log('- Online converters');
console.log('- Design tools like Figma, Sketch, or Canva');
