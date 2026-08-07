/**
 * Generate optimized brand / PWA / OG assets from public/icon.png
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
/** Matches dark background oklch(~0.12) */
const BG = { r: 18, g: 16, b: 14, alpha: 1 };

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

/**
 * @param {Buffer} trimmed
 * @param {number} size
 * @param {{ maskable?: boolean; bg?: { r: number; g: number; b: number; alpha: number } | null }} opts
 */
async function square(trimmed, size, opts = {}) {
  const { maskable = false, bg = null } = opts;
  const padRatio = maskable ? 0.2 : 0.06;
  const content = Math.round(size * (1 - padRatio));
  const logo = await sharp(trimmed)
    .resize(content, content, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

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
    .composite([{ input: logo, gravity: "centre" }])
    .png({ compressionLevel: 9, effort: 10 })
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

async function main() {
  const input = await fs.readFile(SRC);
  const meta = await sharp(input, { failOn: "none" }).metadata();
  console.log(
    `Source: ${meta.width}×${meta.height} (${kb(input.length)})`,
  );

  // Backup full-res source once (only when still the original upload)
  await ensureDir(path.join(ROOT, "public", "brand"));
  const backupPath = path.join(ROOT, "public", "brand", "icon-source.png");
  let backupExists = false;
  try {
    await fs.access(backupPath);
    backupExists = true;
  } catch {
    /* empty */
  }
  if (!backupExists && input.length > 500_000) {
    // Persist a clean square master (not the 6MB full canvas)
    const pre = await sharp(input, { failOn: "none" })
      .trim({ threshold: 8 })
      .png()
      .toBuffer({ resolveWithObject: true });
    const side = Math.min(pre.info.width, pre.info.height);
    const left = Math.floor((pre.info.width - side) / 2);
    const top = Math.floor((pre.info.height - side) / 2);
    const master = await sharp(pre.data)
      .extract({ left, top, width: side, height: side })
      .resize(1536, 1536)
      .png({ compressionLevel: 9, effort: 10 })
      .toBuffer();
    await fs.writeFile(backupPath, master);
    console.log("  backup → public/brand/icon-source.png");
  }

  const trimSource =
    backupExists && input.length < 500_000
      ? await fs.readFile(backupPath)
      : input;

  const trimmedRect = await sharp(trimSource, { failOn: "none" })
    .trim({ threshold: 8 })
    .png()
    .toBuffer();
  const tMeta = await sharp(trimmedRect).metadata();
  // Emblem is circular: center-crop to square using the smaller side
  const side = Math.min(tMeta.width ?? 0, tMeta.height ?? 0);
  const left = Math.floor(((tMeta.width ?? side) - side) / 2);
  const top = Math.floor(((tMeta.height ?? side) - side) / 2);
  const trimmed = await sharp(trimmedRect)
    .extract({ left, top, width: side, height: side })
    .png()
    .toBuffer();
  console.log(`Badge square: ${side}×${side}\n`);

  console.log("Brand");
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

  // Next.js metadata file conventions
  console.log("\nApp Router metadata files");
  await write("src/app/icon.png", await square(trimmed, 512, { bg: BG }));
  await write("src/app/apple-icon.png", apple);
  await write("src/app/favicon.ico", ico);

  // Optimized public root icon (replaces 6MB source)
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

  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
