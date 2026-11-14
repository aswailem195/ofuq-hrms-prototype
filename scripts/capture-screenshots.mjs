import { chromium } from "@playwright/test";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
mkdirSync("screenshots", { recursive: true });
mkdirSync("output/pdf", { recursive: true });
const browser = await chromium.launch({
  executablePath: existsSync("/usr/bin/chromium")
    ? "/usr/bin/chromium"
    : undefined,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  locale: "ar-SA",
});
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => {
  if (m.type() === "error") errors.push(m.text());
});
page.on("response", (r) => {
  if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`);
});
async function ready() {
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(
      [...document.images].map((i) => i.decode().catch(() => {})),
    );
  });
  await page.waitForTimeout(160);
}
await page.goto("http://127.0.0.1:5173/admin");
await ready();
await page.screenshot({ path: "screenshots/admin-dashboard.png" });
await page.screenshot({
  path: "screenshots/admin-dashboard-full.png",
  fullPage: true,
});
await page.goto("http://127.0.0.1:5173/admin/commissions");
await ready();
await page.screenshot({ path: "screenshots/commissions.png", fullPage: true });
await page.getByLabel("تبديل دور العرض").selectOption("employee");
await page.waitForTimeout(4100);
await ready();
await page.screenshot({ path: "screenshots/employee-portal.png" });
await page.screenshot({
  path: "screenshots/employee-portal-full.png",
  fullPage: true,
});
await page.goto("http://127.0.0.1:5173/portal/payroll");
await ready();
await page.getByRole("button", { name: "عرض الكشف", exact: false }).click();
await ready();
await page.screenshot({ path: "screenshots/payslip.png" });
await page.pdf({
  path: "output/pdf/payslip-sample.pdf",
  format: "A4",
  printBackground: true,
});
await page.getByLabel("إغلاق", { exact: true }).click();
await page.setViewportSize({ width: 1024, height: 768 });
await page.goto("http://127.0.0.1:5173/portal");
await ready();
await page.screenshot({ path: "screenshots/tablet-portal.png" });
await page.setViewportSize({ width: 390, height: 844 });
await ready();
await page.screenshot({ path: "screenshots/mobile-portal.png" });
await page.screenshot({
  path: "screenshots/mobile-portal-full.png",
  fullPage: true,
});
const viewport = await page.evaluate(() => ({
  width: innerWidth,
  documentWidth: document.documentElement.scrollWidth,
}));
const broken = await page
  .locator("img")
  .evaluateAll((imgs) =>
    imgs.filter((i) => !i.complete || i.naturalWidth === 0).map((i) => i.src),
  );
writeFileSync(
  "screenshots/capture-report.json",
  JSON.stringify({ errors, brokenImages: broken, mobile: viewport }, null, 2),
);
console.log(JSON.stringify({ errors, brokenImages: broken, mobile: viewport }));
await browser.close();
if (errors.length || broken.length || viewport.width !== viewport.documentWidth)
  process.exitCode = 1;
