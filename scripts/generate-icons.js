const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Helper to create a valid uncompressed/deflated raw RGBA PNG
function createPng(width, height, getPixel) {
  // Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // 8-bit depth
  ihdr.writeUInt8(6, 9); // RGBA color type
  ihdr.writeUInt8(0, 10); // compression
  ihdr.writeUInt8(0, 11); // filter
  ihdr.writeUInt8(0, 12); // interlace

  const ihdrChunk = makeChunk('IHDR', ihdr);

  // Raw image scanlines: filter byte (0) + width * 4 bytes RGBA
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(height * rowSize);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixel(x, y, width, height);
      const pixelOffset = rowOffset + 1 + x * 4;
      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// CRC32 implementation
function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(12 + len);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const typeAndData = chunk.subarray(4, 8 + len);
  chunk.writeUInt32BE(crc32(typeAndData), 8 + len);
  return chunk;
}

// Finanza Icon Generator: Dark sleek zinc background with rounded corners and glowing emerald/cyan gradient
function finanzaPixel(x, y, w, h) {
  const cx = w / 2;
  const cy = h / 2;
  const radius = w * 0.22;

  // Rounded rectangle bounds for app icon
  const margin = w * 0.05;
  const boxW = w - margin * 2;
  const boxH = h - margin * 2;
  const cornerR = w * 0.2;

  // Check distance to rounded box
  const dx = Math.max(0, Math.abs(x - cx) - (boxW / 2 - cornerR));
  const dy = Math.max(0, Math.abs(y - cy) - (boxH / 2 - cornerR));
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist > cornerR) {
    // Outside icon bounds: transparent
    return [0, 0, 0, 0];
  }

  // Border highlight
  const isBorder = dist > cornerR - 2 || (dx > 0 && dx > boxW / 2 - cornerR - 2) || (dy > 0 && dy > boxH / 2 - cornerR - 2);

  // Inner icon: Wallet / Diamond shape
  const iconW = w * 0.48;
  const iconH = h * 0.36;
  const iconLeft = cx - iconW / 2;
  const iconTop = cy - iconH / 2 + h * 0.02;

  const inWallet = x >= iconLeft && x <= iconLeft + iconW && y >= iconTop && y <= iconTop + iconH;
  const inCard = x >= iconLeft + iconW * 0.15 && x <= iconLeft + iconW * 0.85 && y >= iconTop - h * 0.08 && y < iconTop;
  const inClasp = x >= iconLeft + iconW * 0.65 && x <= iconLeft + iconW && y >= iconTop + iconH * 0.3 && y <= iconTop + iconH * 0.7;

  if (inClasp) {
    // Dark clasp with emerald dot
    const claspDot = Math.hypot(x - (iconLeft + iconW * 0.75), y - (iconTop + iconH * 0.5));
    if (claspDot < w * 0.025) {
      return [16, 185, 129, 255]; // emerald dot
    }
    return [9, 9, 11, 255]; // dark body
  }

  if (inCard) {
    return [244, 244, 245, 230]; // silver card top
  }

  if (inWallet) {
    // Emerald to Cyan gradient
    const t = (x - iconLeft) / iconW;
    const r = Math.round(16 * (1 - t) + 6 * t);
    const g = Math.round(185 * (1 - t) + 182 * t);
    const b = Math.round(129 * (1 - t) + 212 * t);
    return [r, g, b, 255];
  }

  // Background: dark zinc gradient
  const bgT = y / h;
  const bgR = Math.round(24 * (1 - bgT) + 9 * bgT);
  const bgG = Math.round(24 * (1 - bgT) + 9 * bgT);
  const bgB = Math.round(27 * (1 - bgT) + 11 * bgT);

  if (isBorder) {
    return [39, 39, 42, 255];
  }

  return [bgR, bgG, bgB, 255];
}

const outDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Generate 192x192
console.log('Generating icon-192.png...');
const icon192 = createPng(192, 192, finanzaPixel);
fs.writeFileSync(path.join(outDir, 'icon-192.png'), icon192);

// Generate 512x512
console.log('Generating icon-512.png...');
const icon512 = createPng(512, 512, finanzaPixel);
fs.writeFileSync(path.join(outDir, 'icon-512.png'), icon512);

// Generate apple-touch-icon.png (180x180)
console.log('Generating apple-touch-icon.png...');
const appleIcon = createPng(180, 180, finanzaPixel);
fs.writeFileSync(path.join(outDir, 'apple-touch-icon.png'), appleIcon);

console.log('Icons generated successfully in public/icons/');
