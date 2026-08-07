/**
 * Generate optimized brand / PWA / OG assets from public/icon.png
 * Usage: node scripts/generate-brand-assets.mjs
 *
 * Crops the circular emblem to its true geometric center (the art is not
 * centered in the source canvas) and masks square plate corners.
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
/** Matches dark background oklch(~0.12) */
const BG = { r: 18, g: 16, b: 14, alpha: 1 };

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

/**
 * Find actual circular emblem bounds (ignores dark square plate).
 * @param {Buffer} input
 */
async function detectEmblemCenter(input) {
  // Downscale for detection speed
  const probe = await sharp(input, { failOn: "none" })
    .ensureAlpha()
    .resize(512, 512, { fit: "inside" })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { data, info } = probe;
  const w = info.width;
  const h = info.height;
  const scaleX = (await sharp(input).metadata()).width / w;
  const scaleY = (await sharp(input).metadata()).height / h;

  function isContent(x, y) {
    const i = (y * w + x) * 4;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    if (a < 24) return false;
    // Orange ring of the badge
    if (r > 140 && g > 60 && g < 200 && b < 120 && r > g && r - b > 40) {
      return true;
    }
    // Bright illustration vs dark plate (~32,42,52)
    const lum = 0.3 * r + 0.59 * g + 0.11 * b;
    if (lum <= 38) return false;
    const dr = r - 32;
    const dg = g - 42;
    const db = b - 52;
    return dr * dr + dg * dg + db * db > 900;
  }

  let minX = w;
  let minY = h;
  let maxX = 0;
  let maxY = 0;
  let n = 0;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (!isContent(x, y)) continue;
      n += 1;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }

  if (n < 100) {
    // Fallback: full frame center
    const meta = await sharp(input).metadata();
    const side = Math.min(meta.width ?? 1, meta.height ?? 1);
    return {
      cx: (meta.width ?? side) / 2,
      cy: (meta.height ?? side) / 2,
      radius: side / 2,
    };
  }

  const cx = ((minX + maxX) / 2) * scaleX;
  const cy = ((minY + maxY) / 2) * scaleY;
  const halfW = Math.max(cx / scaleX - minX, maxX - cx / scaleX) * scaleX;
  const halfH = Math.max(cy / scaleY - minY, maxY - cy / scaleY) * scaleY;
  // Small breathing room so distressed ring edge is not clipped
  const radius = Math.ceil(Math.max(halfW, halfH) * 1.015);

  return { cx, cy, radius };
}

/**
 * Extract a square crop around the emblem's true center.
 * @param {Buffer} input
 * @param {number} outSize
 */
async function extractCenteredBadge(input, outSize = 1536) {
  const meta = await sharp(input, { failOn: "none" }).metadata();
  const w = meta.width ?? 1;
  const h = meta.height ?? 1;
  const { cx, cy, radius } = await detectEmblemCenter(input);

  console.log(
    `  Emblem center (${cx.toFixed(1)}, ${cy.toFixed(1)}) ` +
      `δ=(${(cx - w / 2).toFixed(1)}, ${(cy - h / 2).toFixed(1)}) r=${radius}`,
  );

  const left0 = Math.round(cx - radius);
  const top0 = Math.round(cy - radius);
  const size0 = Math.round(radius * 2);

  const extractLeft = Math.max(0, left0);
  const extractTop = Math.max(0, top0);
  const extractRight = Math.min(w, left0 + size0);
  const extractBottom = Math.min(h, top0 + size0);
  const extractW = extractRight - extractLeft;
  const extractH = extractBottom - extractTop;

  let badge = await sharp(input, { failOn: "none" })
    .extract({
      left: extractLeft,
      top: extractTop,
      width: extractW,
      height: extractH,
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

  // Force exact square + circular transparent mask + pixel rebalance
  const squarePng = await sharp(badge)
    .resize(outSize, outSize, { fit: "fill" })
    .png()
    .toBuffer();

  const masked = await applyCircularMask(squarePng);
  return rebalanceToCenter(masked);
}

/**
 * After crop+mask, recentre opaque pixels perfectly in the square canvas.
 * @param {Buffer} png
 */
async function rebalanceToCenter(png) {
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
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (data[(y * w + x) * 4 + 3] <= 20) continue;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  if (minX > maxX || minY > maxY) return png;

  const contentCx = (minX + maxX) / 2;
  const contentCy = (minY + maxY) / 2;
  const shiftX = Math.round(w / 2 - contentCx);
  const shiftY = Math.round(h / 2 - contentCy);
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

  return sharp(placed)
    .extract({ left: extractLeft, top: extractTop, width: w, height: h })
    .png()
    .toBuffer();
}

/**
 * @param {Buffer} trimmed
 * @param {number} size
 * @param {{ maskable?: boolean; bg?: { r: number; g: number; b: number; alpha: number } | null; fill?: number }} opts
 */
async function square(trimmed, size, opts = {}) {
  const { maskable = false, bg = null, fill = 1 } = opts;
  const padRatio = maskable ? 0.2 : Math.max(0, 1 - fill);
  const content = Math.round(size * (1 - padRatio));
  const logo = await sharp(trimmed)
    .resize(content, content, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .ensureAlpha()
    .png()
    .toBuffer();

  let masked = await applyCircularMask(logo);
  masked = await rebalanceToCenter(masked);

  const background = bg
    ? { r: bg.r, g: bg.g, b: bg.b, alpha: bg.alpha ?? 1 }
    : { r: 0, g: 0, b: 0, alpha: 0 };

  const out = await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background,
    },
  })
    .composite([{ input: masked, gravity: "centre" }])
    .png({ compressionLevel: 9, effort: 10 })
    .toBuffer();

  // When canvas === content size already, still rebalance full frame
  return rebalanceToCenter(out);
}

/**
 * Keep only the circular badge; drop opaque square plate outside the ring.
 * @param {Buffer} png
 */
async function applyCircularMask(png) {
  const meta = await sharp(png).metadata();
  const w = meta.width ?? 1;
  const h = meta.height ?? 1;
  const r = Math.min(w, h) / 2;
  const cx = w / 2;
  const cy = h / 2;

  const soft = Math.max(1, Math.round(Math.min(w, h) * 0.003));
  const svg = Buffer.from(
    `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="m" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#fff"/>
          <stop offset="${((r - soft) / r) * 100}%" stop-color="#fff"/>
          <stop offset="100%" stop-color="#000"/>
        </radialGradient>
      </defs>
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#m)"/>
    </svg>`,
  );

  return sharp(png)
    .ensureAlpha()
    .composite([{ input: svg, blend: "dest-in" }])
    .png()
    .toBuffer();
}

/**
 * PNG-in-ICO container (supported by modern browsers).
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
  // Prefer largest available full-quality source
  const candidates = [BACKUP, SRC];
  /** @type {{ path: string; buf: Buffer; bytes: number }[]} */
  const found = [];
  for (const p of candidates) {
    try {
      const buf = await fs.readFile(p);
      found.push({ path: p, buf, bytes: buf.byteLength });
    } catch {
      /* missing */
    }
  }
  if (found.length === 0) {
    throw new Error("No brand source found (public/icon.png)");
  }
  // Prefer BACKUP if it is a full plate; otherwise largest
  found.sort((a, b) => b.bytes - a.bytes);
  return found[0];
}

async function main() {
  const source = await loadBestSource();
  const meta = await sharp(source.buf, { failOn: "none" }).metadata();
  console.log(
    `Source: ${meta.width}×${meta.height} (${kb(source.bytes)}) from ${path.relative(ROOT, source.path)}`,
  );

  await ensureDir(path.join(ROOT, "public", "brand"));

  console.log("Centering badge…");
  const trimmed = await extractCenteredBadge(source.buf, 1536);

  // Always refresh master with the correctly centered plate
  await write(
    "public/brand/icon-source.png",
    await sharp(trimmed)
      .png({ compressionLevel: 9, effort: 10 })
      .toBuffer(),
  );

  console.log("\nBrand");
  const logo1024 = await square(trimmed, 1024);
  await write("public/brand/logo.png", logo1024);
  await write(
    "public/brand/logo.webp",
    await sharp(logo1024)
      .webp({ quality: 88, alphaQuality: 92, effort: 6 })
      .toBuffer(),
  );
  const logo256 = await square(trimmed, 256);
  await write("public/brand/logo-256.png", logo256);
  await write(
    "public/brand/logo-256.webp",
    await sharp(logo256)
      .webp({ quality: 88, alphaQuality: 92, effort: 6 })
      .toBuffer(),
  );

  console.log("\nPWA / favicons");
  await write("public/icons/icon-192.png", await square(trimmed, 192));
  await write("public/icons/icon-512.png", await square(trimmed, 512));
  await write(
    "public/icons/icon-192-maskable.png",
    await square(trimmed, 192, { maskable: true, bg: BG }),
  );
  await write(
    "public/icons/icon-512-maskable.png",
    await square(trimmed, 512, { maskable: true, bg: BG }),
  );

  const fav16 = await square(trimmed, 16);
  const fav32 = await square(trimmed, 32);
  await write("public/icons/favicon-16.png", fav16);
  await write("public/icons/favicon-32.png", fav32);

  const apple = await square(trimmed, 180, { bg: BG });
  await write("public/icons/apple-touch-icon.png", apple);

  const ico = buildIco([
    { size: 16, png: fav16 },
    { size: 32, png: fav32 },
  ]);
  await write("public/favicon.ico", ico);

  console.log("\nApp Router metadata files");
  await write("src/app/icon.png", await square(trimmed, 512, { bg: BG }));
  await write("src/app/apple-icon.png", apple);
  await write("src/app/favicon.ico", ico);
  await write("public/icon.png", await square(trimmed, 512));

  console.log("\nOpen Graph");
  const ogW = 1200;
  const ogH = 630;
  const logoForOg = await sharp(trimmed)
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

  // Verify content is centered
  const check = await sharp(logo1024).ensureAlpha().raw().toBuffer({
    resolveWithObject: true,
  });
  let minX = check.info.width;
  let minY = check.info.height;
  let maxX = 0;
  let maxY = 0;
  for (let y = 0; y < check.info.height; y++) {
    for (let x = 0; x < check.info.width; x++) {
      if (check.data[(y * check.info.width + x) * 4 + 3] > 20) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  const dx = (minX + maxX) / 2 - check.info.width / 2;
  const dy = (minY + maxY) / 2 - check.info.height / 2;
  console.log(
    `\nVerify logo.webp center delta: (${dx.toFixed(1)}, ${dy.toFixed(1)}) pad L/R/T/B ${minX}/${check.info.width - 1 - maxX}/${minY}/${check.info.height - 1 - maxY}`,
  );
  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
