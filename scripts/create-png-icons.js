// Create simple PNG icons using Canvas API (for browser environments)
// This creates base64 encoded PNG icons that can be used for PWA

const createPNGIcon = (size, color = '#3b82f6') => {
  // Create a simple canvas-based icon
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  
  // Background
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, size, size);
  
  // Simple kanban board representation
  const columnWidth = size * 0.15;
  const columnHeight = size * 0.6;
  const startX = size * 0.15;
  const startY = size * 0.2;
  
  // Draw 4 columns
  for (let i = 0; i < 4; i++) {
    const x = startX + (i * (columnWidth + size * 0.05));
    
    // Column background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillRect(x, startY, columnWidth, columnHeight);
    
    // Add some task cards
    ctx.fillStyle = i === 0 ? '#3b82f6' : i === 1 ? '#10b981' : i === 2 ? '#f59e0b' : '#ef4444';
    ctx.fillRect(x + 2, startY + 2, columnWidth - 4, size * 0.08);
    
    ctx.fillStyle = '#e5e7eb';
    ctx.fillRect(x + 2, startY + size * 0.12, columnWidth - 4, size * 0.06);
    if (i < 3) {
      ctx.fillRect(x + 2, startY + size * 0.22, columnWidth - 4, size * 0.05);
    }
  }
  
  // Add text
  ctx.fillStyle = 'white';
  ctx.font = `bold ${size * 0.08}px Arial`;
  ctx.textAlign = 'center';
  ctx.fillText('VIDEC', size / 2, size * 0.9);
  
  return canvas.toDataURL('image/png');
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { createPNGIcon };
}

console.log('PNG icon creator ready. Use createPNGIcon(size) to generate icons.');
