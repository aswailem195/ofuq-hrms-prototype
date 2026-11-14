import { test, expect } from "@playwright/test";
const stateKey = "ofuq-hrms-v1";
const sectionNames = [
  "employees",
  "contracts",
  "payroll",
  "allowances",
  "commissions",
  "bonuses",
  "attendance",
  "leaves",
  "advances",
  "assets",
  "evaluations",
  "promotions",
  "complaints",
  "offboarding",
];
test("تعمل جميع الأقسام الإدارية ومسارات التحديث", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/admin");
  await expect(
    page.getByRole("heading", { name: "صباح الخير، نورة" }),
  ).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  for (const section of sectionNames) {
    await page.goto("/admin/" + section);
    await expect(page.locator("main h1")).toBeVisible();
    expect(await page.locator("main").innerText()).not.toContain(
      "الصفحة غير موجودة",
    );
  }
  await page.reload();
  await expect(page.locator("main h1")).toBeVisible();
  expect(errors).toEqual([]);
});
test("رحلة الإجازة: 17 يومًا ثم 14 بعد موافقة المدير مع الاستمرار بعد التحديث", async ({
  page,
}) => {
  await page.goto("/admin");
  await page.getByLabel("تبديل دور العرض").selectOption("employee");
  await page.goto("/portal/leaves");
  await expect(page.locator(".leave-donut strong")).toContainText("17");
  await page.getByRole("button", { name: "طلب إجازة", exact: true }).click();
  await page.getByLabel("من تاريخ").fill("2026-11-22");
  await page.getByLabel("إلى تاريخ").fill("2026-11-24");
  await page.getByLabel("سبب الطلب").fill("إجازة عائلية لاختبار دورة الموافقة");
  await page.getByRole("button", { name: "إرسال الطلب" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.locator(".leave-donut strong")).toContainText("17");
  const id = await page.evaluate(
    (k) =>
      JSON.parse(localStorage.getItem(k)!).leaves.find((l: any) =>
        l.reason.includes("لاختبار دورة"),
      ).id,
    stateKey,
  );
  await page.getByLabel("تبديل دور العرض").selectOption("manager");
  await page.goto("/admin/leaves");
  await page
    .getByRole("row")
    .filter({ hasText: id })
    .getByRole("button", { name: "مراجعة الطلب" })
    .click();
  await page.getByRole("button", { name: "اعتماد الإجازة" }).click();
  await expect(page.getByRole("dialog")).toContainText("معتمد");
  await page.getByRole("button", { name: "إغلاق", exact: true }).click();
  await page.getByLabel("تبديل دور العرض").selectOption("employee");
  await page.goto("/portal/leaves");
  await expect(page.locator(".leave-donut strong")).toContainText("14");
  await page.reload();
  await expect(page.locator(".leave-donut strong")).toContainText("14");
  await expect(page.getByRole("row").filter({ hasText: id })).toContainText(
    "معتمد",
  );
});
test("إضافة موظف ثم البحث عنه وفتح ملفه المحفوظ", async ({ page }) => {
  await page.goto("/admin/employees");
  await page.getByRole("button", { name: "إضافة موظف", exact: true }).click();
  await page.getByLabel("الاسم الكامل").fill("فيصل أحمد السالم");
  await page.getByLabel("المسمى الوظيفي").fill("أخصائي حسابات رئيسية");
  await page.getByLabel("البريد الإلكتروني").fill("faisal@ofuq.example");
  await page.getByLabel("رقم الجوال").fill("+966 55 123 4567");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "إضافة الموظف", exact: true })
    .click();
  const row = page.getByRole("row").filter({ hasText: "فيصل أحمد السالم" });
  await expect(row).toBeVisible();
  await row.getByRole("link").click();
  await expect(page.locator(".employee-summary")).toContainText(
    "فيصل أحمد السالم",
  );
  await page.getByRole("tab", { name: "البيانات الوظيفية" }).click();
  await expect(page.locator(".profile-details")).toContainText(
    "أخصائي حسابات رئيسية",
  );
  await page.reload();
  await expect(page.locator(".employee-summary")).toContainText(
    "فيصل أحمد السالم",
  );
  const count = await page.evaluate(
    (k) => JSON.parse(localStorage.getItem(k)!).employees.length,
    stateKey,
  );
  expect(count).toBe(49);
});
test("كشف راتب متوافق، تبديل الشهر، ووظيفة الطباعة", async ({ page }) => {
  await page.goto("/admin");
  await page.getByLabel("تبديل دور العرض").selectOption("employee");
  await page.goto("/portal/payroll");
  await page.getByLabel("شهر الراتب").selectOption("2026-10");
  await page.getByRole("button", { name: "عرض الكشف", exact: false }).click();
  await expect(page.getByRole("dialog")).toContainText("أكتوبر 2026");
  await expect(page.locator(".payslip-net")).toContainText(
    "صافي الراتب المستحق",
  );
  await page.evaluate(() => {
    (window as any).__printed = false;
    window.print = () => {
      (window as any).__printed = true;
    };
  });
  await page.getByRole("button", { name: "طباعة / حفظ PDF" }).click();
  expect(await page.evaluate(() => (window as any).__printed)).toBe(true);
  await page.emulateMedia({ media: "print" });
  await expect(page.locator(".sidebar")).toBeHidden();
  await expect(page.locator(".payslip")).toBeVisible();
});
test("تصفية عمولة وصرفها وظهور الحالة نفسها لدى الموظف", async ({ page }) => {
  await page.goto("/admin/commissions");
  await page.getByLabel("موظف العمولات").selectOption("EMP-1001");
  const row = page.locator("tbody tr").first();
  await expect(row).toContainText("أحمد خالد العتيبي");
  const id = await row.locator("td").nth(1).locator("small").innerText();
  await row.click();
  const payButton = page.getByRole("button", { name: "تأكيد الصرف التجريبي" });
  if (await payButton.count()) await payButton.click();
  await expect(page.getByRole("dialog")).toContainText("مصروف");
  await page.getByRole("button", { name: "إغلاق", exact: true }).click();
  await page.getByLabel("تبديل دور العرض").selectOption("employee");
  await page.goto("/portal/commissions");
  await expect(page.getByRole("row").filter({ hasText: id })).toContainText(
    "مصروف",
  );
});
test("الاستجابة: سطح المكتب والجهاز اللوحي والهاتف دون تجاوز عرض الصفحة", async ({
  page,
}) => {
  for (const size of [
    { width: 1440, height: 900 },
    { width: 1024, height: 768 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(size);
    for (const route of [
      "/admin",
      "/admin/commissions",
      "/admin/payroll",
      "/admin/employees",
    ]) {
      await page.goto(route);
      await expect(page.locator("main h1")).toBeVisible();
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth,
      );
      expect(overflow, `${route} @ ${size.width}`).toBe(false);
    }
  }
  await page.getByRole("button", { name: "فتح القائمة" }).click();
  await expect(page.locator(".sidebar")).toHaveClass(/mobile-open/);
  await page.getByRole("link", { name: "العقود", exact: true }).click();
  await expect(page).toHaveURL(/contracts/);
  await expect(page.locator(".sidebar")).not.toHaveClass(/mobile-open/);
});

test("منع اعتماد إجازات تتجاوز الرصيد المتاح", async ({ page }) => {
  await page.goto("/admin");
  await page.getByLabel("تبديل دور العرض").selectOption("employee");
  await page.goto("/portal/leaves");
  for (const [start, end, reason] of [
    ["2026-11-22", "2026-12-01", "طلب أول لفحص حماية الرصيد"],
    ["2026-12-05", "2026-12-14", "طلب ثان لفحص حماية الرصيد"],
  ]) {
    await page.getByRole("button", { name: "طلب إجازة", exact: true }).click();
    await page.getByLabel("من تاريخ").fill(start);
    await page.getByLabel("إلى تاريخ").fill(end);
    await page.getByLabel("سبب الطلب").fill(reason);
    await page.getByRole("button", { name: "إرسال الطلب" }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
  }
  const ids = await page.evaluate((k) => {
    const s = JSON.parse(localStorage.getItem(k)!);
    return ["طلب أول", "طلب ثان"].map(
      (reason) => s.leaves.find((l: any) => l.reason.startsWith(reason)).id,
    );
  }, stateKey);
  await page.getByLabel("تبديل دور العرض").selectOption("manager");
  await page.goto("/admin/leaves");
  for (const id of ids) {
    await page
      .getByRole("row")
      .filter({ hasText: id })
      .getByRole("button", { name: "مراجعة الطلب" })
      .click();
    await page.getByRole("button", { name: "اعتماد الإجازة" }).click();
    if (id === ids[1])
      await expect(page.getByRole("status")).toContainText(
        "الرصيد الحالي لا يكفي",
      );
    await page.getByRole("button", { name: "إغلاق", exact: true }).click();
  }
  await page.getByLabel("تبديل دور العرض").selectOption("employee");
  await page.goto("/portal/leaves");
  await expect(page.locator(".leave-donut strong")).toContainText("7");
  await expect(page.getByRole("row").filter({ hasText: ids[1] })).toContainText(
    "بانتظار الموافقة",
  );
});

test("البدل المعتمد ينعكس على كشف الراتب والملخص", async ({ page }) => {
  await page.goto("/admin/allowances");
  await page.getByRole("button", { name: "إضافة بدل", exact: true }).click();
  await page.getByLabel("نوع الطلب / العنوان").selectOption("بدل سكن");
  await page.getByLabel("المبلغ", { exact: true }).fill("500");
  await page
    .getByLabel("التفاصيل وسبب الطلب")
    .fill("بدل سكن إضافي افتراضي للتحقق من اتساق المسير");
  await page.getByRole("button", { name: "حفظ وإرسال الطلب" }).click();
  await page.getByRole("button", { name: "اعتماد الطلب", exact: true }).click();
  await page.getByRole("button", { name: "إغلاق", exact: true }).click();
  await page.getByLabel("تبديل دور العرض").selectOption("employee");
  await expect(page.locator(".stat-grid .stat-card").first()).toContainText(
    "18,000",
  );
  await page.goto("/portal/payroll");
  await page.getByRole("button", { name: "عرض الكشف", exact: false }).click();
  await expect(page.locator(".payslip-net")).toContainText("18,000");
  await expect(
    page.locator(".payslip-row").filter({ hasText: "بدل السكن" }),
  ).toContainText("2,000");
});

test("تخصيص اسم الشركة والعملة ثم إعادة ضبط العرض", async ({ page }) => {
  await page.goto("/admin/settings");
  await page.getByLabel("اسم الشركة").fill("شركة التجربة التجارية");
  await page.getByLabel("العملة الافتراضية").fill("د.إ");
  await page.getByRole("button", { name: "حفظ التغييرات" }).click();
  await page.getByLabel("تبديل دور العرض").selectOption("employee");
  await page.goto("/portal/payroll");
  await page.getByRole("button", { name: "عرض الكشف", exact: false }).click();
  await expect(page.getByRole("dialog")).toContainText("شركة التجربة التجارية");
  await expect(page.locator(".payslip-net")).toContainText("د.إ");
  await page.getByLabel("إغلاق", { exact: true }).click();
  await page.goto("/portal/settings");
  await page
    .getByRole("button", { name: "إعادة ضبط البيانات التجريبية" })
    .click();
  await page.getByRole("button", { name: "تأكيد إعادة الضبط" }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.locator(".workspace")).toContainText("شركة الأفق التجارية");
  await expect(page.locator(".stat-grid .stat-card").first()).toContainText(
    "48",
  );
});
