/**
 * Visual check: screenshots the four views at the Figma frame size
 * (1440x900 CSS px at deviceScaleFactor 2 = 2880x1800) and, when a Figma
 * reference PNG is present, diffs against it with pixelmatch.
 *
 * Usage: node scripts/visual-check.mjs
 *   BASE_URL   default http://localhost:3100
 *   references live in visual-checks/reference/<name>.png
 */
import { mkdir, writeFile, access } from "node:fs/promises";
import { createReadStream } from "node:fs";
import { chromium } from "@playwright/test";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";

const BASE = process.env.BASE_URL ?? "http://localhost:3100";
const OUT = "visual-checks";

const PAGES = [
  { name: "signup", path: "/signup" },
  { name: "login", path: "/login" },
  { name: "login-error", path: "/login?state=error" },
  { name: "dashboard", path: "/dashboard", signIn: true },
];

const exists = async (file) => {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
};

const readPng = async (file) =>
  new Promise((resolve, reject) => {
    const png = new PNG();
    createReadStream(file)
      .pipe(png)
      .on("parsed", () => resolve(png))
      .on("error", reject);
  });

await mkdir(`${OUT}/mine`, { recursive: true });
await mkdir(`${OUT}/diff`, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
});
const page = await context.newPage();

const settle = async () => {
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() =>
    Promise.all(
      Array.from(document.images)
        .filter((img) => !img.complete)
        .map((img) => new Promise((res) => img.addEventListener("load", res, { once: true }))),
    ),
  );
  await page.waitForTimeout(250);
};

const rows = [];

for (const view of PAGES) {
  if (view.signIn) {
    await page.goto(`${BASE}/login`);
    await settle();
    await page.fill("#email", "andrewmartin@catcus.com");
    await page.fill("#password", "Password@12");
    await page.click('button[type="submit"]');
    await page.waitForURL("**/dashboard");
  }

  await page.goto(`${BASE}${view.path}`);
  await settle();

  const file = `${OUT}/mine/${view.name}.png`;
  await page.screenshot({ path: file });

  const reference = `${OUT}/reference/${view.name}.png`;
  if (!(await exists(reference))) {
    rows.push({ view: view.name, status: "no Figma reference (API rate-limited)" });
    continue;
  }

  const mine = await readPng(file);
  const ref = await readPng(reference);
  if (mine.width !== ref.width || mine.height !== ref.height) {
    rows.push({
      view: view.name,
      status: `size mismatch: mine ${mine.width}x${mine.height} vs ref ${ref.width}x${ref.height}`,
    });
    continue;
  }

  const diff = new PNG({ width: ref.width, height: ref.height });
  const differing = pixelmatch(ref.data, mine.data, diff.data, ref.width, ref.height, {
    threshold: 0.1,
  });
  await writeFile(`${OUT}/diff/${view.name}.png`, PNG.sync.write(diff));
  const percent = (differing / (ref.width * ref.height)) * 100;
  rows.push({ view: view.name, status: `${percent.toFixed(2)}% differing pixels` });
}

await browser.close();

console.log("\nVisual check (1440x900 @2x => 2880x1800)");
console.table(rows);
