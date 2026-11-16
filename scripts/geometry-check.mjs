/**
 * Geometry assertions from STYLE.md (Figma px / 2), tolerance +-0.5 CSS px.
 * Usage: node scripts/geometry-check.mjs
 */
import { chromium } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "http://localhost:3100";
const TOL = 0.5;

const results = [];
let failures = 0;

function near(actual, expected) {
  return typeof actual === "number" && Math.abs(actual - expected) <= TOL;
}

function check(label, actual, expected, unit = "px") {
  const ok = near(actual, expected);
  if (!ok) failures += 1;
  results.push({
    assertion: label,
    expected: `${expected}${unit}`,
    actual: actual === null || actual === undefined ? "n/a" : `${Math.round(actual * 1000) / 1000}${unit}`,
    result: ok ? "PASS" : "FAIL",
  });
}

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();

const box = async (locator) => {
  const b = await locator.boundingBox();
  if (!b) throw new Error(`no box for ${locator}`);
  return b;
};

const settle = async () => {
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(150);
};

/* ---------- Create Account ---------- */
await page.goto(`${BASE}/signup`);
await settle();

const card = await box(page.locator("main > div").first());
check("signup: left card x", card.x, 12);
check("signup: left card y", card.y, 12);
check("signup: left card width", card.width, 700);
check("signup: left card height", card.height, 876);

const panel = await box(page.locator("main > div").nth(1));
check("signup: form panel x", panel.x, 728);
check("signup: form panel y", panel.y, 20);
check("signup: form panel width", panel.width, 700);
check("signup: form panel height", panel.height, 860);

const first = await box(page.locator("#firstName"));
const email = await box(page.locator("#email"));
const password = await box(page.locator("#password"));
const createBtn = await box(page.locator('form button[type="submit"]'));
const google = await box(page.locator('form button[type="button"]').first());
const github = await box(page.locator('form button[type="button"]').nth(1));

check("signup: first name box width", first.width, 245);
check("signup: first name box height", first.height, 58.3335);
check("signup: email box width", email.width, 525);
check("signup: email box height", email.height, 58.3335);
check("signup: gap first-name row -> email", email.y - (first.y + first.height), 36);
check("signup: gap email -> password", password.y - (email.y + email.height), 36);
check("signup: primary button width", createBtn.width, 525);
check("signup: primary button height", createBtn.height, 58.3335);
check("signup: social box width", google.width, 245);
check("signup: gap between social boxes", github.x - (google.x + google.width), 35);

/* ---------- Login ---------- */
await page.goto(`${BASE}/login`);
await settle();

const loginCard = await box(page.locator("main > div").first());
check("login: left card x", loginCard.x, 12);
check("login: left card width", loginCard.width, 700);

const emailLabel = page.locator('label[for="email"]');
const emailInput = page.locator("#email");
const emailLabelBox = await box(emailLabel);
const emailInputBox = await box(emailInput);
check(
  "login: label -> box gap",
  emailInputBox.y - (emailLabelBox.y + emailLabelBox.height),
  11,
);

const pwLabelBox = await box(page.locator('label[for="password"]'));
check(
  "login: gap between input groups",
  pwLabelBox.y - (emailInputBox.y + emailInputBox.height),
  47.5,
);

const signIn = await box(page.locator('form button[type="submit"]'));
check("login: button left offset vs inputs", signIn.x - emailInputBox.x, 1);
check("login: button width", signIn.width, 525);

/* ---------- Dashboard ---------- */
await page.goto(`${BASE}/login`);
await settle();
await page.fill("#email", "andrewmartin@catcus.com");
await page.fill("#password", "Password@12");
await page.click('button[type="submit"]');
await page.waitForURL("**/dashboard");
await settle();

const sidebar = await box(page.locator("aside"));
check("dashboard: sidebar x", sidebar.x, 24);
check("dashboard: sidebar y", sidebar.y, 19);
check("dashboard: sidebar width", sidebar.width, 350);
check("dashboard: sidebar height", sidebar.height, 860);

const headerBar = await box(page.locator("header"));
check("dashboard: header x", headerBar.x, 396.5);
check("dashboard: header y", headerBar.y, 24);
check("dashboard: header width", headerBar.width, 1020.5);
check("dashboard: header height", headerBar.height, 85);

const banner = await box(page.locator("section").first());
check("dashboard: banner x", banner.x, 399);
check("dashboard: banner y", banner.y, 132.5);
check("dashboard: banner width", banner.width, 1018);

const accountCard = await box(page.locator("section").nth(1));
check("dashboard: account card x", accountCard.x, 399);
check("dashboard: account card y", accountCard.y, 422);
check("dashboard: account card width", accountCard.width, 650);
check("dashboard: account card height", accountCard.height, 457);

const logout = await box(page.locator('form button[type="submit"]'));
check("dashboard: logout x", logout.x, 1200);
check("dashboard: logout y", logout.y, 804);
check("dashboard: logout width", logout.width, 217);
check("dashboard: logout height", logout.height, 75);

/* ---------- Computed styles ---------- */
await context.clearCookies();
await page.goto(`${BASE}/signup`);
await settle();

const h1 = await page.locator("h1").evaluate((el) => {
  const cs = getComputedStyle(el);
  return { size: parseFloat(cs.fontSize), weight: cs.fontWeight, family: cs.fontFamily };
});
check("style: H1 font-size", h1.size, 52.5);
results.push({
  assertion: "style: H1 font-weight",
  expected: "700",
  actual: h1.weight,
  result: h1.weight === "700" ? "PASS" : "FAIL",
});
if (h1.weight !== "700") failures += 1;
results.push({
  assertion: "style: H1 family is Manrope",
  expected: "Manrope",
  actual: h1.family,
  result: h1.family.toLowerCase().includes("manrope") ? "PASS" : "FAIL",
});
if (!h1.family.toLowerCase().includes("manrope")) failures += 1;

const btnWeight = await page
  .locator('form button[type="submit"]')
  .evaluate((el) => getComputedStyle(el).fontWeight);
results.push({
  assertion: "style: primary button weight (DM Sans 500)",
  expected: "500",
  actual: btnWeight,
  result: btnWeight === "500" ? "PASS" : "FAIL",
});
if (btnWeight !== "500") failures += 1;

const dmOpsz = await page
  .locator("#email")
  .evaluate((el) => getComputedStyle(el).fontVariationSettings);
results.push({
  assertion: "style: DM Sans opsz 14 axis",
  expected: 'opsz 14 in font-variation-settings',
  actual: dmOpsz,
  result: dmOpsz.includes("opsz") && dmOpsz.includes("14") ? "PASS" : "FAIL",
});
if (!(dmOpsz.includes("opsz") && dmOpsz.includes("14"))) failures += 1;

await page.goto(`${BASE}/login`);
await settle();
await page.fill("#email", "andrewmartin@catcus.com");
await page.fill("#password", "Password@12");
await page.click('button[type="submit"]');
await page.waitForURL("**/dashboard");
await settle();

const titleWeight = await page
  .locator("header h1")
  .evaluate((el) => getComputedStyle(el).fontWeight);
results.push({
  assertion: "style: header title weight (Manrope 600)",
  expected: "600",
  actual: titleWeight,
  result: titleWeight === "600" ? "PASS" : "FAIL",
});
if (titleWeight !== "600") failures += 1;

const valueWeight = await page
  .locator("section")
  .nth(1)
  .locator("p")
  .nth(1)
  .evaluate((el) => getComputedStyle(el).fontWeight);
results.push({
  assertion: "style: account value weight (DM Sans 500)",
  expected: "500",
  actual: valueWeight,
  result: valueWeight === "500" ? "PASS" : "FAIL",
});
if (valueWeight !== "500") failures += 1;

await browser.close();

console.table(results);
console.log(`\n${results.length - failures}/${results.length} assertions passed`);
process.exit(failures === 0 ? 0 : 1);
