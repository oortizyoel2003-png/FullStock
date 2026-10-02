const fs = require('fs');
const zlib = require('zlib');

// Minimal pure-JS PNG generator for solid/styled icon
function createPNG(width, height, r, g, b) {
  // PNG signature
  const signature = Buffer.from([137, 80, 78, 72, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // Bit depth: 8
  ihdr[9] = 2; // Color type: Truecolor (RGB)
  ihdr[10] = 0; // Compression method: Deflate
  ihdr[11] = 0; // Filter method: Standard
  ihdr[12] = 0; // Interlace method: None

  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const chunkType = Buffer.from(type);
    const crcVal = crc32(Buffer.concat([chunkType, data]));
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crcVal >>> 0, 0);
    return Buffer.concat([len, chunkType, data, crcBuf]);
  }

  // Generate image data (raw uncompressed scanlines with filter byte 0)
  const rawData = Buffer.alloc(height * (1 + width * 3));
  let pos = 0;
  for (let y = 0; y < height; y++) {
    rawData[pos++] = 0; // filter type 0
    for (let x = 0; x < width; x++) {
      // Draw border in gold (#d4af37 -> 212, 175, 55), center dark (#0b0c10 -> 11, 12, 16)
      const isBorder = (x < 12 || x >= width - 12 || y < 12 || y >= height - 12);
      const isInnerGold = (x >= width * 0.4 && x <= width * 0.6 && y >= height * 0.38 && y <= height * 0.62);
      if (isBorder || isInnerGold) {
        rawData[pos++] = 212; // R
        rawData[pos++] = 175; // G
        rawData[pos++] = 55;  // B
      } else {
        rawData[pos++] = r;
        rawData[pos++] = g;
        rawData[pos++] = b;
      }
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', compressedData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// CRC32 implementation
function crc32(buf) {
  let table = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) c = 0xedb88320 ^ (c >>> 1);
      else c = c >>> 1;
    }
    table[n] = c;
  }
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ (-1)) >>> 0;
}

const pwa192 = createPNG(192, 192, 11, 12, 16);
const pwa512 = createPNG(512, 512, 11, 12, 16);
const appleIcon = createPNG(180, 180, 11, 12, 16);

fs.writeFileSync('public/pwa-192x192.png', pwa192);
fs.writeFileSync('public/pwa-512x512.png', pwa512);
fs.writeFileSync('public/pwa-maskable-512x512.png', pwa512);
fs.writeFileSync('public/apple-touch-icon.png', appleIcon);
console.log('PNG Icons successfully generated in public/');
