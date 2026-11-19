/**
 * Functional checklist for the backend-backed auth flow.
 * Requires PostgreSQL and FastAPI: start everything with `npm run up`.
 * Usage: node scripts/functional-check.mjs
 */
import { chromium } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "http://localhost:3100";
const BACKEND = process.env.BACKEND_URL ?? "http://127.0.0.1:8000";
const results = [];

const record = (name, ok, detail = "") =>
  results.push({ check: name, result: ok ? "PASS" : "FAIL", detail });

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();
const settle = () => page.waitForLoadState("networkidle");

const signOut = async () => {
  await context.clearCookies();
};

/* 1. Sign up with new data -> dashboard with that identity. A unique email
   keeps repeated runs working now that accounts persist in PostgreSQL. */
const newEmail = `rosa.vega.${Date.now()}@catcus.com`;
await page.goto(`${BASE}/signup`);
await settle();
await page.fill("#firstName", "Rosa");
await page.fill("#lastName", "Vega");
await page.fill("#email", newEmail);
await page.fill("#password", "Passw0rd!23");
await page.check("#terms");
await page.click('button[type="submit"]');
await page.waitForURL("**/dashboard");
await settle();
const dashText = await page.locator("main").innerText();
const badges = await page.locator("header div").filter({ hasText: "RV" }).count();
record("signup creates a session and lands on /dashboard", page.url().endsWith("/dashboard"));
record("dashboard shows the new user's name", dashText.includes("Rosa Vega"));
record("dashboard shows the new user's email", dashText.includes(newEmail));
record("avatar initials are derived (RV)", badges > 0);

const signupCookie = (await context.cookies()).find((c) => c.name === "catcus_session");
const signupToken = signupCookie?.value ?? "";
record(
  "session cookie contains a backend JWT",
  signupToken.split(".").length === 3,
);

/* 2. Logout clears the session, revokes the token, and /dashboard is protected. */
await page.click('form button[type="submit"]');
await page.waitForURL("**/login");
record("logout redirects to /login", page.url().endsWith("/login"));
const revokedMe = await fetch(`${BACKEND}/auth/me`, {
  headers: { authorization: `Bearer ${signupToken}` },
});
record(
  "logout revokes the backend token",
  revokedMe.status === 401,
  `status ${revokedMe.status}`,
);
await page.goto(`${BASE}/dashboard`);
await page.waitForURL("**/login");
record("signed-out /dashboard redirects to /login", page.url().endsWith("/login"));

/* 3. The account created above is in PostgreSQL: duplicate signup is rejected
   and a fresh login works after logout. */
await page.goto(`${BASE}/signup`);
await settle();
await page.fill("#firstName", "Rosa");
await page.fill("#lastName", "Vega");
await page.fill("#email", newEmail);
await page.fill("#password", "Passw0rd!23");
await page.check("#terms");
await page.click('button[type="submit"]');
const duplicateError = page.locator("#form-error");
await duplicateError.waitFor({ state: "visible" });
record(
  "duplicate signup is rejected by PostgreSQL",
  (await duplicateError.innerText()).trim() ===
    "An account with this email already exists.",
);

await page.goto(`${BASE}/login`);
await settle();
await page.fill("#email", newEmail);
await page.fill("#password", "Passw0rd!23");
await page.click('button[type="submit"]');
await page.waitForURL("**/dashboard");
record("new account signs in again from the database", page.url().endsWith("/dashboard"));
await page.click('form button[type="submit"]');
await page.waitForURL("**/login");

/* 4. Seeded login works; wrong password shows the error state. */
await page.fill("#email", "andrewmartin@catcus.com");
await page.fill("#password", "nope");
await page.click('button[type="submit"]');
const error = page.locator("#form-error");
await error.waitFor({ state: "visible" });
record(
  "wrong password shows the designed message",
  (await error.innerText()).trim() === "Email and/or Password is wrong",
);
record("failed attempt keeps the typed email", (await page.inputValue("#email")) === "andrewmartin@catcus.com");
const redBorder = await page
  .locator("#password")
  .evaluate((el) => getComputedStyle(el).borderColor);
record("error state paints red input borders", redBorder === "rgb(171, 0, 0)", redBorder);

await page.fill("#password", "Password@12");
await page.click('button[type="submit"]');
await page.waitForURL("**/dashboard");
record("seeded account signs in", page.url().endsWith("/dashboard"));

/* 5. Signed-in users are bounced away from the auth routes. */
await page.goto(`${BASE}/login`);
await page.waitForURL("**/dashboard");
record("signed-in /login redirects to /dashboard", page.url().endsWith("/dashboard"));
await page.goto(`${BASE}/signup`);
await page.waitForURL("**/dashboard");
record("signed-in /signup redirects to /dashboard", page.url().endsWith("/dashboard"));

/* 6. Cookie lifetime: 1 hour by default, 30 days with Remember Me. */
const hourCookie = (await context.cookies()).find((c) => c.name === "catcus_session");
const hourDays = (hourCookie.expires * 1000 - Date.now()) / 86_400_000;
record("default session cookie lasts ~1 hour", hourDays > 0.035 && hourDays < 0.05, `${(hourDays * 24).toFixed(1)} hours`);
record("session cookie is httpOnly", hourCookie.httpOnly === true);

await signOut();
await page.goto(`${BASE}/login`);
await settle();
await page.fill("#email", "andrewmartin@catcus.com");
await page.fill("#password", "Password@12");
await page.check("#remember");
await page.click('button[type="submit"]');
await page.waitForURL("**/dashboard");
const monthCookie = (await context.cookies()).find((c) => c.name === "catcus_session");
const monthDays = (monthCookie.expires * 1000 - Date.now()) / 86_400_000;
record("Remember Me extends the cookie to ~30 days", monthDays > 29 && monthDays < 31, `${monthDays.toFixed(1)} days`);

/* 7. Revoking the token behind a still-present cookie closes the dashboard. */
const monthToken = monthCookie.value;
const directRevoke = await fetch(`${BACKEND}/auth/logout`, {
  method: "POST",
  headers: { authorization: `Bearer ${monthToken}` },
});
record(
  "backend logout revokes the token directly",
  directRevoke.status === 204,
  `status ${directRevoke.status}`,
);
await page.goto(`${BASE}/dashboard`);
await page.waitForURL("**/login");
record("revoked token cannot keep the dashboard open", page.url().endsWith("/login"));

/* 8. A tampered cookie is treated as signed out. */
await context.addCookies([
  { name: "catcus_session", value: "tampered.token.value", domain: "localhost", path: "/" },
]);
await page.goto(`${BASE}/dashboard`);
await page.waitForURL("**/login");
record("tampered cookie is rejected", page.url().endsWith("/login"));

/* 9. Keyboard: checkbox toggles with Space, Enter submits. */
await page.goto(`${BASE}/login`);
await settle();
await page.check("#remember");
record("checkbox toggles", await page.isChecked("#remember"));
await page.fill("#email", "andrewmartin@catcus.com");
await page.fill("#password", "Password@12");
await page.focus("#email");
await page.keyboard.press("Enter");
await page.waitForURL("**/dashboard");
record("Enter in a field submits the form", page.url().endsWith("/dashboard"));

/* 10. Empty / invalid signup is rejected with a message, not a crash. */
await signOut();
await page.goto(`${BASE}/signup`);
await settle();
await page.click('button[type="submit"]');
await page.locator("#form-error").waitFor({ state: "visible" });
record("empty signup shows a validation message", page.url().endsWith("/signup"));

await browser.close();

console.table(results);
const failed = results.filter((r) => r.result === "FAIL").length;
console.log(`\n${results.length - failed}/${results.length} functional checks passed`);
process.exit(failed === 0 ? 0 : 1);
