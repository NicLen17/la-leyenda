/**
 * Generate optimized brand / PWA / OG assets.
 * Crops/masks by the ORANGE ring of the emblem (true visual center).
 * Usage: node scripts/generate-brand-assets.mjs
 */
import { createRequire } from "node:module";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const sharp = require("sharp");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const SRC = path.join(ROOT, "public", "icon.png");
const BACKUP = path.join(ROOT, "public", "brand", "icon-source.png");
const BG = { r: 18, g: 16, b: 14, alpha: 1 };

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

/**
 * Whether a pixel is part of the gold/orange emblem ring.
 */
function isOrange(r, g, b, a) {
  if (a < 140) return false;
  return r > 120 && g > 45 && g < 220 && b < 140 && r > g + 12 && r - b > 30;
}

/**
 * Find orange-ring center + radius that tightly bounds the visual badge.
 * @param {Buffer} input
 */
async function detectOrangeEmblem(input) {
  const meta = await sharp(input, { failOn: "none" }).metadata();
  const fullW = meta.width ?? 1;
  const fullH = meta.height ?? 1;

  const probe = await sharp(input, { failOn: "none" })
    .ensureAlpha()
    .resize(640, 640, { fit: "inside" })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { data, info } = probe;
  const w = info.width;
  const h = info.height;
  const scaleX = fullW / w;
  const scaleY = fullH / h;

  let minX = w;
  let minY = h;
  let maxX = 0;
  let maxY = 0;
  let n = 0;
  let sumX = 0;
  let sumY = 0;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      if (!isOrange(data[i], data[i + 1], data[i + 2], data[i + 3])) continue;
      n += 1;
      sumX += x;
      sumY += y;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }

  if (n < 80) {
    // Fallback: alpha content
    minX = w;
    minY = h;
    maxX = 0;
    maxY = 0;
    n = 0;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (data[(y * w + x) * 4 + 3] <= 30) continue;
        n += 1;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
    const cx = ((minX + maxX) / 2) * scaleX;
    const cy = ((minY + maxY) / 2) * scaleY;
    const radius =
      Math.max(
        (maxX - minX) * scaleX,
        (maxY - minY) * scaleY,
      ) / 2;
    return { cx, cy, radius: Math.ceil(radius * 1.02), n };
  }

  // Prefer bbox midpoint of outer ring (more stable than mass for thick ring + paint)
  const cx = ((minX + maxX) / 2) * scaleX;
  const cy = ((minY + maxY) / 2) * scaleY;

  // Max radius to any orange pixel from center (covers outer ring fully)
  let maxR2 = 0;
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const i = (y * w + x) * 4;
      if (!isOrange(data[i], data[i + 1], data[i + 2], data[i + 3])) continue;
      const dx = x - (minX + maxX) / 2;
      const dy = y - (minY + maxY) / 2;
      const r2 = dx * dx + dy * dy;
      if (r2 > maxR2) maxR2 = r2;
    }
  }
  const radius = Math.ceil(Math.sqrt(maxR2) * Math.max(scaleX, scaleY) * 1.02);

  return { cx, cy, radius, n, massCx: (sumX / n) * scaleX, massCy: (sumY / n) * scaleY };
}

/**
 * Extract a square plate tightly around the orange ring, mask to circle, re-center.
 * @param {Buffer} input
 * @param {number} outSize
 */
async function extractCenteredBadge(input, outSize = 1536) {
  const meta = await sharp(input, { failOn: "none" }).metadata();
  const w = meta.width ?? 1;
  const h = meta.height ?? 1;
  const { cx, cy, radius, n } = await detectOrangeEmblem(input);

  console.log(
    `  Orange emblem n≈${n} center (${cx.toFixed(1)}, ${cy.toFixed(1)}) ` +
      `δ=(${(cx - w / 2).toFixed(1)}, ${(cy - h / 2).toFixed(1)}) r=${radius}`,
  );

  const left0 = Math.round(cx - radius);
  const top0 = Math.round(cy - radius);
  const size0 = Math.round(radius * 2);

  const extractLeft = Math.max(0, left0);
  const extractTop = Math.max(0, top0);
  const extractRight = Math.min(w, left0 + size0);
  const extractBottom = Math.min(h, top0 + size0);

  let badge = await sharp(input, { failOn: "none" })
    .extract({
      left: extractLeft,
      top: extractTop,
      width: extractRight - extractLeft,
      height: extractBottom - extractTop,
    })
    .ensureAlpha()
    .png()
    .toBuffer();

  const padLeft = Math.max(0, extractLeft - left0);
  const padTop = Math.max(0, extractTop - top0);
  const padRight = Math.max(0, left0 + size0 - extractRight);
  const padBottom = Math.max(0, top0 + size0 - extractBottom);

  if (padLeft || padTop || padRight || padBottom) {
    badge = await sharp(badge)
      .extend({
        top: padTop,
        bottom: padBottom,
        left: padLeft,
        right: padRight,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toBuffer();
  }

  const squarePng = await sharp(badge)
    .resize(outSize, outSize, { fit: "fill" })
    .png()
    .toBuffer();

  const masked = await applyCircularMask(squarePng);
  // Second pass: fix residual orange offset after mask
  return rebalanceOrangeToCenter(masked);
}

/**
 * Shift so orange-ring bbox center lands on canvas center.
 * @param {Buffer} png
 */
async function rebalanceOrangeToCenter(png) {
  const { data, info } = await sharp(png)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const w = info.width;
  const h = info.height;

  let minX = w;
  let minY = h;
  let maxX = 0;
  let maxY = 0;
  let n = 0;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      if (!isOrange(data[i], data[i + 1], data[i + 2], data[i + 3])) continue;
      n += 1;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }

  if (n < 40) {
    // fallback to alpha
    minX = w;
    minY = h;
    maxX = 0;
    maxY = 0;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (data[(y * w + x) * 4 + 3] <= 20) continue;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  const contentCx = (minX + maxX) / 2;
  const contentCy = (minY + maxY) / 2;
  const shiftX = Math.round(w / 2 - contentCx);
  const shiftY = Math.round(h / 2 - contentCy);

  console.log(
    `  Rebalance shift (${shiftX}, ${shiftY}) orange pad L/R was ${minX}/${w - 1 - maxX}`,
  );

  if (shiftX === 0 && shiftY === 0) return png;

  const expandedW = w + Math.abs(shiftX);
  const expandedH = h + Math.abs(shiftY);
  const placeX = Math.max(0, shiftX);
  const placeY = Math.max(0, shiftY);
  const extractLeft = Math.max(0, -shiftX);
  const extractTop = Math.max(0, -shiftY);

  const placed = await sharp({
    create: {
      width: expandedW,
      height: expandedH,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: png, left: placeX, top: placeY }])
    .png()
    .toBuffer();

  const shifted = await sharp(placed)
    .extract({ left: extractLeft, top: extractTop, width: w, height: h })
    .png()
    .toBuffer();

  // Remask clean circle after shift so glow edge is round
  return applyCircularMask(shifted);
}

/**
 * @param {Buffer} badge
 * @param {number} size
 * @param {{ maskable?: boolean; bg?: { r: number; g: number; b: number; alpha: number } | null; fill?: number }} opts
 */
async function square(badge, size, opts = {}) {
  const { maskable = false, bg = null, fill = 1 } = opts;
  const padRatio = maskable ? 0.18 : Math.max(0, 1 - fill);
  const content = Math.round(size * (1 - padRatio));

  const logo = await sharp(badge)
    .resize(content, content, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .ensureAlpha()
    .png()
    .toBuffer();

  let out = await applyCircularMask(logo);
  out = await rebalanceOrangeToCenter(out);

  if (content === size && !bg) return out;

  const background = bg
    ? { r: bg.r, g: bg.g, b: bg.b, alpha: bg.alpha ?? 1 }
    : { r: 0, g: 0, b: 0, alpha: 0 };

  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background,
    },
  })
    .composite([{ input: out, gravity: "centre" }])
    .png({ compressionLevel: 9, effort: 10 })
    .toBuffer();
}

/**
 * @param {Buffer} png
 */
async function applyCircularMask(png) {
  const meta = await sharp(png).metadata();
  const w = meta.width ?? 1;
  const h = meta.height ?? 1;
  const r = Math.min(w, h) / 2;
  const soft = Math.max(1, Math.round(Math.min(w, h) * 0.0025));
  const svg = Buffer.from(
    `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="m" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#fff"/>
          <stop offset="${((r - soft) / r) * 100}%" stop-color="#fff"/>
          <stop offset="100%" stop-color="#000"/>
        </radialGradient>
      </defs>
      <circle cx="${w / 2}" cy="${h / 2}" r="${r}" fill="url(#m)"/>
    </svg>`,
  );

  return sharp(png)
    .ensureAlpha()
    .composite([{ input: svg, blend: "dest-in" }])
    .png()
    .toBuffer();
}

/**
 * @param {{ size: number; png: Buffer }[]} entries
 */
function buildIco(entries) {
  const count = entries.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(count, 4);

  let offset = 6 + 16 * count;
  const dirs = [];
  const bodies = [];

  for (const { size, png } of entries) {
    const dir = Buffer.alloc(16);
    dir.writeUInt8(size >= 256 ? 0 : size, 0);
    dir.writeUInt8(size >= 256 ? 0 : size, 1);
    dir.writeUInt8(0, 2);
    dir.writeUInt8(0, 3);
    dir.writeUInt16LE(1, 4);
    dir.writeUInt16LE(32, 6);
    dir.writeUInt32LE(png.length, 8);
    dir.writeUInt32LE(offset, 12);
    offset += png.length;
    dirs.push(dir);
    bodies.push(png);
  }

  return Buffer.concat([header, ...dirs, ...bodies]);
}

function kb(n) {
  return `${(n / 1024).toFixed(1)} KB`;
}

async function write(rel, buf) {
  const full = path.join(ROOT, rel);
  await ensureDir(path.dirname(full));
  await fs.writeFile(full, buf);
  console.log(`  ${kb(buf.length).padStart(10)}  ${rel}`);
}

async function loadBestSource() {
  const candidates = [BACKUP, SRC];
  /** @type {{ path: string; buf: Buffer; bytes: number }[]} */
  const found = [];
  for (const p of candidates) {
    try {
      const buf = await fs.readFile(p);
      found.push({ path: p, buf, bytes: buf.byteLength });
    } catch {
      /* */
    }
  }
  if (!found.length) throw new Error("No brand source found");
  found.sort((a, b) => b.bytes - a.bytes);
  return found[0];
}

async function verifyOrangeCenter(buf, label) {
  const { data, info } = await sharp(buf)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const w = info.width;
  const h = info.height;
  let minX = w;
  let minY = h;
  let maxX = 0;
  let maxY = 0;
  let n = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      if (!isOrange(data[i], data[i + 1], data[i + 2], data[i + 3])) continue;
      n += 1;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  const dx = (minX + maxX) / 2 - w / 2;
  const dy = (minY + maxY) / 2 - h / 2;
  console.log(
    `  VERIFY ${label}: orange δ=(${dx.toFixed(1)}, ${dy.toFixed(1)}) pad L/R ${minX}/${w - 1 - maxX} n=${n}`,
  );
}

async function main() {
  const source = await loadBestSource();
  const meta = await sharp(source.buf, { failOn: "none" }).metadata();
  console.log(
    `Source: ${meta.width}×${meta.height} (${kb(source.bytes)}) from ${path.relative(ROOT, source.path)}`,
  );

  await ensureDir(path.join(ROOT, "public", "brand"));

  console.log("Centering on orange ring…");
  const badge = await extractCenteredBadge(source.buf, 1536);
  await write(
    "public/brand/icon-source.png",
    await sharp(badge).png({ compressionLevel: 9, effort: 10 }).toBuffer(),
  );
  await verifyOrangeCenter(badge, "master");

  console.log("\nBrand");
  const logo1024 = await square(badge, 1024);
  await verifyOrangeCenter(logo1024, "logo-1024");
  await write("public/brand/logo.png", logo1024);
  await write(
    "public/brand/logo.webp",
    await sharp(logo1024)
      .webp({ quality: 88, alphaQuality: 92, effort: 6 })
      .toBuffer(),
  );
  const logo256 = await square(badge, 256);
  await verifyOrangeCenter(logo256, "logo-256");
  await write("public/brand/logo-256.png", logo256);
  await write(
    "public/brand/logo-256.webp",
    await sharp(logo256)
      .webp({ quality: 88, alphaQuality: 92, effort: 6 })
      .toBuffer(),
  );

  console.log("\nPWA / favicons");
  await write("public/icons/icon-192.png", await square(badge, 192));
  await write("public/icons/icon-512.png", await square(badge, 512));
  await write(
    "public/icons/icon-192-maskable.png",
    await square(badge, 192, { maskable: true, bg: BG }),
  );
  await write(
    "public/icons/icon-512-maskable.png",
    await square(badge, 512, { maskable: true, bg: BG }),
  );

  const fav16 = await square(badge, 16);
  const fav32 = await square(badge, 32);
  await write("public/icons/favicon-16.png", fav16);
  await write("public/icons/favicon-32.png", fav32);
  const apple = await square(badge, 180, { bg: BG });
  await write("public/icons/apple-touch-icon.png", apple);
  const ico = buildIco([
    { size: 16, png: fav16 },
    { size: 32, png: fav32 },
  ]);
  await write("public/favicon.ico", ico);

  console.log("\nApp Router metadata files");
  await write("src/app/icon.png", await square(badge, 512, { bg: BG }));
  await write("src/app/apple-icon.png", apple);
  await write("src/app/favicon.ico", ico);
  await write("public/icon.png", await square(badge, 512));

  console.log("\nOpen Graph");
  const ogW = 1200;
  const ogH = 630;
  const logoForOg = await sharp(badge)
    .resize(Math.round(ogH * 0.86), Math.round(ogH * 0.86), {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  const glow = Buffer.from(
    `<svg width="${ogW}" height="${ogH}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="g" cx="50%" cy="42%" r="58%">
          <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.32"/>
          <stop offset="50%" stop-color="#1e293b" stop-opacity="0.18"/>
          <stop offset="100%" stop-color="#12100e" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="#12100e"/>
      <rect width="100%" height="100%" fill="url(#g)"/>
    </svg>`,
  );

  const og = await sharp(glow)
    .composite([{ input: logoForOg, gravity: "centre" }])
    .png({ compressionLevel: 9, effort: 10 })
    .toBuffer();

  await write("public/og.png", og);
  await write(
    "public/og.webp",
    await sharp(og).webp({ quality: 82, effort: 6 }).toBuffer(),
  );
  await write("src/app/opengraph-image.png", og);
  await write("src/app/twitter-image.png", og);

  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
