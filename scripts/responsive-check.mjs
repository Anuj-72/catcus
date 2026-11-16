/**
 * Responsive / overflow check: every view must fit the window at common laptop
 * and desktop sizes, with no horizontal or vertical scrollbar.
 * Usage: node scripts/responsive-check.mjs
 */
import { chromium } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "http://localhost:3100";
const VIEWPORTS = [
  { width: 1920, height: 1080 },
  { width: 1600, height: 900 },
  { width: 1440, height: 900 },
  { width: 1366, height: 768 },
  { width: 1280, height: 800 },
  { width: 1024, height: 768 },
];

const rows = [];
let failures = 0;

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();

const measure = async () => {
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => document.fonts.ready);
  return page.evaluate(() => {
    const doc = document.documentElement;
    const stage = document.querySelector("main");
    const rect = stage?.getBoundingClientRect();
    return {
      clientWidth: doc.clientWidth,
      clientHeight: doc.clientHeight,
      scrollWidth: doc.scrollWidth,
      scrollHeight: doc.scrollHeight,
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      stage: rect
        ? {
            left: Math.round(rect.left * 100) / 100,
            top: Math.round(rect.top * 100) / 100,
            width: Math.round(rect.width * 100) / 100,
            height: Math.round(rect.height * 100) / 100,
          }
        : null,
    };
  });
};

const audit = async (label, viewport, path) => {
  await page.setViewportSize(viewport);
  await page.goto(`${BASE}${path}`);
  const m = await measure();

  // A scrollbar exists when the scroll size exceeds the client area.
  const overflowX = m.scrollWidth > m.clientWidth;
  const overflowY = m.scrollHeight > m.clientHeight;
  // 100vw must not exceed the client width either, or the unit itself would
  // feed a horizontal overflow on the next paint.
  const unitFits = m.innerWidth - m.clientWidth <= 0;
  const stageFits =
    m.stage !== null &&
    m.stage.left >= -0.5 &&
    m.stage.top >= -0.5 &&
    m.stage.left + m.stage.width <= m.clientWidth + 0.5 &&
    m.stage.top + m.stage.height <= m.clientHeight + 0.5;

  if (overflowX || overflowY || !stageFits) failures += 1;
  rows.push({
    view: `${viewport.width}x${viewport.height}`,
    page: label,
    scroll: `${m.scrollWidth}x${m.scrollHeight} / ${m.clientWidth}x${m.clientHeight}`,
    scrollbar: overflowX || overflowY ? `yes (x:${overflowX} y:${overflowY})` : "none",
    "100vw vs client": `${m.innerWidth} / ${m.clientWidth}${unitFits ? "" : " <-- mismatch"}`,
    stage: m.stage ? `${m.stage.width}x${m.stage.height} @ ${m.stage.left},${m.stage.top}` : "n/a",
    result: overflowX || overflowY || !stageFits ? "FAIL" : "PASS",
  });
};

/* Signed-out views. */
for (const viewport of VIEWPORTS) {
  await audit("signup", viewport, "/signup");
  await audit("login", viewport, "/login");
  await audit("login-error", viewport, "/login?state=error");
}

/* Signed-in view: log in once, then resize. */
await page.setViewportSize({ width: 1440, height: 900 });
await page.goto(`${BASE}/login`);
await page.waitForLoadState("networkidle");
await page.fill("#email", "andrewmartin@catcus.com");
await page.fill("#password", "Password@12");
await page.click('button[type="submit"]');
await page.waitForURL("**/dashboard");
for (const viewport of VIEWPORTS) {
  await audit("dashboard", viewport, "/dashboard");
}

await browser.close();

console.table(rows);
console.log(`\n${rows.length - failures}/${rows.length} viewport checks passed`);
process.exit(failures === 0 ? 0 : 1);
