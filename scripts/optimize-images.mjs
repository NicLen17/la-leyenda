/**
 * Optimize game assets under /public.
 *
 * - Resizes oversized rasters by folder usage
 * - Re-encodes PNG / JPEG / WebP with better compression
 * - Converts large PNG/JPEG to WebP when that wins (rewrites source refs)
 *
 * Usage: node scripts/optimize-images.mjs [--dry-run]
 */
import { createRequire } from "node:module";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const sharp = require("sharp");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PUBLIC = path.join(ROOT, "public");
const DRY = process.argv.includes("--dry-run");

const RASTER = new Set([".png", ".jpg", ".jpeg", ".webp"]);
const SKIP_DIRS = new Set(["node_modules", ".next", "sounds"]);

/** @type {{ original: string, next: string }[]} */
const renames = [];

/**
 * Max display width per asset tree (2x retina room).
 * @param {string} relPosix
 */
function maxWidthFor(relPosix) {
  if (relPosix.startsWith("teams/real-logo/")) return 256;
  if (relPosix.startsWith("maps/preview/")) return 720;
  if (relPosix.startsWith("maps/") && !relPosix.includes("/preview/")) return 512;
  if (relPosix.includes("hero-left")) return 1200;
  if (relPosix.includes("hero-right")) return 520;
  if (relPosix.includes("silueta")) return 400;
  if (relPosix.includes("headset") || relPosix.includes("monitor")) return 640;
  if (relPosix.includes("igl") || relPosix.includes("lurker") || relPosix.includes("entry"))
    return 600;
  if (relPosix.startsWith("ui/")) return 800;
  return 1280;
}

/**
 * Prefer WebP convert for photos / large assets (not tiny crisp logos).
 * @param {string} relPosix
 * @param {number} bytes
 * @param {string} ext
 */
function shouldConvertToWebp(relPosix, bytes, ext) {
  if (ext === ".webp") return false;
  if (relPosix.startsWith("teams/real-logo/")) {
    // Logos: only convert huge ones; small PNGs often already packed
    return bytes > 20_000;
  }
  return bytes > 12_000 || ext === ".jpg" || ext === ".jpeg";
}

/**
 * @param {string} dir
 * @param {string[]} acc
 */
async function walk(dir, acc = []) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(full, acc);
      continue;
    }
    const ext = path.extname(entry.name).toLowerCase();
    if (RASTER.has(ext)) acc.push(full);
  }
  return acc;
}

/**
 * @param {import("sharp").Sharp} pipeline
 * @param {string} ext
 * @param {boolean} hasAlpha
 */
function encode(pipeline, ext, hasAlpha) {
  if (ext === ".webp") {
    return pipeline.webp({
      quality: 78,
      alphaQuality: 85,
      effort: 6,
      smartSubsample: true,
    });
  }
  if (ext === ".jpg" || ext === ".jpeg") {
    return pipeline.jpeg({ quality: 80, mozjpeg: true, chromaSubsampling: "4:2:0" });
  }
  // PNG: prefer palette when flat; higher effort otherwise
  return pipeline.png({
    compressionLevel: 9,
    effort: 10,
    quality: 80,
    palette: !hasAlpha ? true : undefined,
  });
}

/**
 * @param {string} filePath
 */
async function optimizeOne(filePath) {
  const rel = path.relative(PUBLIC, filePath).split(path.sep).join("/");
  const ext = path.extname(filePath).toLowerCase();
  const input = await fs.readFile(filePath);
  const originalBytes = input.byteLength;

  // Read via buffer — sharp's path open can fail on Windows (OneDrive / locks)
  const meta = await sharp(input, { failOn: "none" }).metadata();
  if (!meta.width || !meta.height) {
    return { rel, status: "skip", reason: "no-dimensions", originalBytes };
  }

  const maxW = maxWidthFor(rel);
  const needsResize = meta.width > maxW;
  const convert = shouldConvertToWebp(rel, originalBytes, ext);
  const outExt = convert ? ".webp" : ext;
  const outPath = convert
    ? filePath.slice(0, filePath.length - ext.length) + outExt
    : filePath;

  let pipeline = sharp(input, { failOn: "none" }).rotate();
  if (needsResize) {
    pipeline = pipeline.resize({
      width: maxW,
      withoutEnlargement: true,
      fit: "inside",
    });
  }

  const hasAlpha = Boolean(meta.hasAlpha);
  const outBuf = await encode(pipeline, outExt, hasAlpha).toBuffer();

  // Keep original if optimized is larger (allow growth only when resizing down)
  if (outBuf.byteLength >= originalBytes && !needsResize) {
    return {
      rel,
      status: "kept",
      originalBytes,
      newBytes: originalBytes,
      saved: 0,
    };
  }

  if (DRY) {
    return {
      rel,
      status: convert ? "would-convert" : "would-write",
      originalBytes,
      newBytes: outBuf.byteLength,
      saved: originalBytes - outBuf.byteLength,
      outRel: path.relative(PUBLIC, outPath).split(path.sep).join("/"),
    };
  }

  await fs.writeFile(outPath, outBuf);
  if (outPath !== filePath) {
    await fs.unlink(filePath).catch(() => {});
    renames.push({
      original: `/${rel}`,
      next: `/${path.relative(PUBLIC, outPath).split(path.sep).join("/")}`,
    });
  }

  return {
    rel,
    status: convert ? "converted" : "optimized",
    originalBytes,
    newBytes: outBuf.byteLength,
    saved: originalBytes - outBuf.byteLength,
    outRel: path.relative(PUBLIC, outPath).split(path.sep).join("/"),
  };
}

/**
 * Patch source strings after renames (exact path matches).
 */
async function patchSourceRefs() {
  if (renames.length === 0) return 0;

  const srcRoots = [path.join(ROOT, "src")];
  /** @type {string[]} */
  const files = [];
  for (const root of srcRoots) {
    await walkAllText(root, files);
  }

  let patched = 0;
  for (const file of files) {
    let text = await fs.readFile(file, "utf8");
    let next = text;
    for (const { original, next: n } of renames) {
      if (next.includes(original)) {
        next = next.split(original).join(n);
      }
    }
    if (next !== text) {
      if (!DRY) await fs.writeFile(file, next, "utf8");
      patched += 1;
    }
  }
  return patched;
}

/**
 * @param {string} dir
 * @param {string[]} acc
 */
async function walkAllText(dir, acc) {
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return acc;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".next") continue;
      await walkAllText(full, acc);
      continue;
    }
    if (/\.(ts|tsx|js|jsx|mjs|cjs|css|md|json)$/.test(entry.name)) {
      acc.push(full);
    }
  }
  return acc;
}

function fmt(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

async function main() {
  console.log(DRY ? "Dry run — no writes\n" : "Optimizing public assets…\n");
  const files = await walk(PUBLIC);
  files.sort();

  const results = [];
  for (const file of files) {
    try {
      results.push(await optimizeOne(file));
    } catch (err) {
      results.push({
        rel: path.relative(PUBLIC, file).split(path.sep).join("/"),
        status: "error",
        reason: err instanceof Error ? err.message : String(err),
        originalBytes: 0,
        newBytes: 0,
        saved: 0,
      });
    }
  }

  const patched = await patchSourceRefs();

  let totalBefore = 0;
  let totalAfter = 0;
  let totalSaved = 0;

  const changed = results
    .filter((r) => r.status !== "kept" && r.status !== "skip")
    .sort((a, b) => (b.saved ?? 0) - (a.saved ?? 0));

  for (const r of results) {
    totalBefore += r.originalBytes ?? 0;
    totalAfter += r.newBytes ?? r.originalBytes ?? 0;
    totalSaved += r.saved ?? 0;
  }

  console.log("Top savings:");
  for (const r of changed.slice(0, 25)) {
    const mark =
      r.status === "converted" || r.status === "would-convert"
        ? "→ webp"
        : r.status;
    const out = r.outRel && r.outRel !== r.rel ? ` → ${r.outRel}` : "";
    console.log(
      `  ${fmt(r.saved ?? 0).padStart(10)}  ${r.rel}${out}  (${mark})`,
    );
  }

  if (renames.length) {
    console.log("\nRenames (path updates in src/):");
    for (const { original, next } of renames) {
      console.log(`  ${original} → ${next}`);
    }
  }

  console.log(`\nFiles scanned: ${results.length}`);
  console.log(`Files changed: ${changed.length}`);
  console.log(`Source files patched: ${patched}`);
  console.log(`Before: ${fmt(totalBefore)}`);
  console.log(`After:  ${fmt(totalAfter)}`);
  console.log(`Saved:  ${fmt(totalSaved)} (${((totalSaved / totalBefore) * 100 || 0).toFixed(1)}%)`);

  const errors = results.filter((r) => r.status === "error");
  if (errors.length) {
    console.log("\nErrors:");
    for (const e of errors) console.log(`  ${e.rel}: ${e.reason}`);
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
