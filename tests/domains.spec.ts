import { test, expect } from "@playwright/test";
const storageKey = "ofuq-hrms-v1";
test("شكوى شخصية ثم معالجة الإدارة وسجل المحادثة والحالة", async ({ page }) => {
  await page.goto("/admin");
  await page.getByLabel("تبديل دور العرض").selectOption("employee");
  await page.goto("/portal/complaints");
  await page.getByRole("button", { name: "تقديم شكوى", exact: true }).click();
  await page
    .getByLabel("موضوع الشكوى")
    .fill("مراجعة تجهيزات مساحة العمل للاختبار");
  await page
    .getByLabel("تفاصيل الشكوى أو الملاحظة")
    .fill("نحتاج إلى مراجعة تجهيزات مساحة العمل قبل اجتماع الفريق القادم.");
  await page.getByRole("button", { name: "حفظ وإرسال الطلب" }).click();
  await expect(page.getByRole("dialog")).toContainText("بانتظار الموافقة");
  const recordId = await page.evaluate(
    (k) =>
      JSON.parse(localStorage.getItem(k)!).records.find(
        (r: any) => r.title === "مراجعة تجهيزات مساحة العمل للاختبار",
      ).id,
    storageKey,
  );
  await page.getByRole("button", { name: "إغلاق", exact: true }).click();
  const ownRecords = await page.evaluate((k) => {
    const s = JSON.parse(localStorage.getItem(k)!);
    return s.records.filter(
      (r: any) =>
        r.kind === "complaints" && r.employeeId === s.currentEmployeeId,
    ).length;
  }, storageKey);
  await expect(page.locator(".module-complaint-row")).toHaveCount(ownRecords);
  await page.getByLabel("تبديل دور العرض").selectOption("hr");
  await page.goto("/admin/complaints");
  await page
    .locator(".module-complaint-row")
    .filter({ hasText: recordId })
    .click();
  await page.getByRole("button", { name: "بدء المعالجة", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText("قيد المعالجة");
  await page.getByRole("tab", { name: "المحادثة", exact: true }).click();
  await page
    .getByLabel("نص الرد")
    .fill("تمت مراجعة التجهيزات وتحديث مساحة العمل.");
  await page.getByRole("button", { name: "إرسال الرد", exact: true }).click();
  await expect(page.locator(".module-message").last()).toContainText(
    "تمت مراجعة التجهيزات",
  );
  await page.getByRole("tab", { name: "نظرة عامة", exact: true }).click();
  await page
    .getByRole("button", { name: "إغلاق الطلب بعد المعالجة", exact: true })
    .click();
  await page.getByRole("button", { name: "إغلاق", exact: true }).click();
  await page.getByLabel("تبديل دور العرض").selectOption("employee");
  await page.goto("/portal/complaints");
  await page
    .locator(".module-complaint-row")
    .filter({ hasText: recordId })
    .click();
  await expect(page.getByRole("dialog")).toContainText("مكتمل");
  await page.getByRole("tab", { name: "سجل الإجراءات", exact: true }).click();
  await expect(page.locator(".module-history")).toContainText(
    "تم تغيير الحالة إلى مكتمل",
  );
});
test("سلفة من الموظف إلى اعتماد الإدارة وتخزين الحالة", async ({ page }) => {
  await page.goto("/admin");
  await page.getByLabel("تبديل دور العرض").selectOption("employee");
  await page.goto("/portal/advances");
  await page.getByRole("button", { name: "طلب سلفة", exact: true }).click();
  await page
    .getByLabel("نوع الطلب / العنوان")
    .fill("سلفة ترتيبات شخصية للاختبار");
  await page.getByLabel("المبلغ", { exact: true }).fill("3600");
  await page.getByLabel("عدد الأقساط").selectOption("6");
  await page
    .getByLabel("التفاصيل وسبب الطلب")
    .fill("طلب سلفة على ستة أقساط لتجربة الموافقات.");
  await page.getByRole("button", { name: "حفظ وإرسال الطلب" }).click();
  await expect(page.getByRole("dialog")).toContainText("3,600");
  const id = await page.evaluate(
    (k) =>
      JSON.parse(localStorage.getItem(k)!).records.find(
        (r: any) => r.title === "سلفة ترتيبات شخصية للاختبار",
      ).id,
    storageKey,
  );
  await page.getByRole("button", { name: "إغلاق", exact: true }).click();
  await page.getByLabel("تبديل دور العرض").selectOption("hr");
  await page.goto("/admin/advances");
  await page
    .locator("tbody tr")
    .first()
    .getByRole("button", { name: "تفاصيل السلفة" })
    .click();
  await expect(page.getByRole("dialog")).toContainText(id);
  await page.getByRole("button", { name: "اعتماد الطلب", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText("معتمد");
  await page.getByRole("button", { name: "إغلاق", exact: true }).click();
  await page.getByLabel("تبديل دور العرض").selectOption("employee");
  await page.goto("/portal/advances");
  await page.reload();
  await expect(page.locator("tbody tr").first()).toContainText("معتمد");
});
test("تفاصيل الأقسام المتخصصة تعمل دون أخطاء على جميع الأحجام", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const sections = [
    "contracts",
    "allowances",
    "bonuses",
    "attendance",
    "advances",
    "assets",
    "evaluations",
    "promotions",
    "complaints",
    "offboarding",
  ];
  for (const width of [1440, 1024, 390]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
    for (const section of sections) {
      await page.goto("/admin/" + section);
      await expect(page.locator("main h1")).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
        `${section} at ${width}`,
      ).toBe(true);
    }
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/admin/contracts");
  await page.locator("tbody .icon-btn").first().click();
  await page.getByRole("tab", { name: "المرفقات", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText("نسخة العقد");
  await page.getByRole("tab", { name: "التنبيهات", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText("متابعة العقد");
  await page.getByRole("button", { name: "إغلاق", exact: true }).click();
  await page.goto("/admin/offboarding");
  await page
    .getByRole("button", { name: "متابعة إخلاء الطرف", exact: false })
    .first()
    .click();
  const check = page.getByLabel("إرجاع العهد", { exact: false });
  const wasChecked = await check.isChecked();
  await check.click();
  expect(await check.isChecked()).toBe(!wasChecked);
  expect(errors).toEqual([]);
});

test("تجديد عقد ينتهي قريبًا يحدث الحالة وتاريخ الانتهاء والسجل", async ({
  page,
}) => {
  await page.goto("/admin/contracts");
  await page.getByLabel("تصفية حسب الحالة").selectOption("ينتهي قريبًا");
  await page.locator("tbody .icon-btn").first().click();
  await expect(page.getByRole("dialog")).toContainText("ينتهي قريبًا");
  await page
    .getByRole("button", { name: "تجديد العقد لعام", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toContainText("نشط");
  await expect(page.getByRole("dialog")).toContainText("30 نوفمبر 2027");
  await page.getByRole("tab", { name: "سجل الإجراءات", exact: true }).click();
  await expect(page.locator(".module-history")).toContainText(
    "تم تجديد العقد لمدة عام",
  );
});
