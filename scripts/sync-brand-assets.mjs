/**
 * Sync all brand/PWA icon variants from the centered master logo.png
 */
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";

const require = createRequire(import.meta.url);
const sharp = require("sharp");

const ROOT = process.cwd();
const masterPath = path.join(ROOT, "public/brand/logo.png");

async function writeSafe(filePath, buf) {
  const abs = path.isAbsolute(filePath) ? filePath : path.join(ROOT, filePath);
  const tmp = `${abs}.__tmp__`;
  fs.writeFileSync(tmp, buf);
  try {
    fs.renameSync(tmp, abs);
  } catch {
    fs.copyFileSync(tmp, abs);
    fs.unlinkSync(tmp);
  }
}

async function main() {
  const master = fs.readFileSync(masterPath);

  await writeSafe(
    "public/brand/logo.webp",
    await sharp(master)
      .webp({ quality: 90, alphaQuality: 95, effort: 6 })
      .toBuffer(),
  );

  const l256 = await sharp(master)
    .resize(256, 256)
    .png({ compressionLevel: 9, effort: 10 })
    .toBuffer();
  await writeSafe("public/brand/logo-256.png", l256);
  await writeSafe(
    "public/brand/logo-256.webp",
    await sharp(l256)
      .webp({ quality: 90, alphaQuality: 95, effort: 6 })
      .toBuffer(),
  );

  for (const [s, p] of [
    [16, "public/icons/favicon-16.png"],
    [32, "public/icons/favicon-32.png"],
    [180, "public/icons/apple-touch-icon.png"],
    [192, "public/icons/icon-192.png"],
    [512, "public/icons/icon-512.png"],
    [512, "public/icon.png"],
    [512, "src/app/icon.png"],
    [180, "src/app/apple-icon.png"],
    [1536, "public/brand/icon-source.png"],
  ]) {
    try {
      await writeSafe(
        p,
        await sharp(master)
          .resize(s, s)
          .png({ compressionLevel: 9, effort: 10 })
          .toBuffer(),
      );
      console.log("ok", p);
    } catch (e) {
      console.log("skip", p, e.message);
    }
  }

  for (const s of [192, 512]) {
    const content = Math.round(s * 0.8);
    const logo = await sharp(master).resize(content, content).png().toBuffer();
    const out = await sharp({
      create: {
        width: s,
        height: s,
        channels: 4,
        background: { r: 18, g: 16, b: 14, alpha: 1 },
      },
    })
      .composite([{ input: logo, gravity: "centre" }])
      .png({ compressionLevel: 9, effort: 10 })
      .toBuffer();
    await writeSafe(`public/icons/icon-${s}-maskable.png`, out);
  }

  // OG with centered logo
  const ogW = 1200;
  const ogH = 630;
  const logoForOg = await sharp(master)
    .resize(Math.round(ogH * 0.86), Math.round(ogH * 0.86))
    .png()
    .toBuffer();
  const glow = Buffer.from(
    `<svg width="${ogW}" height="${ogH}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#12100e"/>
      <defs>
        <radialGradient id="g" cx="50%" cy="42%" r="58%">
          <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.32"/>
          <stop offset="100%" stop-color="#12100e" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#g)"/>
    </svg>`,
  );
  const og = await sharp(glow)
    .composite([{ input: logoForOg, gravity: "centre" }])
    .png({ compressionLevel: 9, effort: 10 })
    .toBuffer();
  await writeSafe("public/og.png", og);
  await writeSafe(
    "public/og.webp",
    await sharp(og).webp({ quality: 82, effort: 6 }).toBuffer(),
  );
  await writeSafe("src/app/opengraph-image.png", og);
  await writeSafe("src/app/twitter-image.png", og);

  console.log("done");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
