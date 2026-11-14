import type {
  AppState,
  AttendanceEntry,
  Commission,
  DomainRecord,
  Employee,
  HistoryEvent,
  Leave,
  Payroll,
  RecordKind,
  Status,
} from "./types";
export const DEPARTMENTS = [
  "المبيعات",
  "التسويق",
  "المالية",
  "الموارد البشرية",
  "تقنية المعلومات",
  "العمليات",
];
const monthLabels = [
  "يناير",
  "فبراير",
  "مارس",
  "أبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
];
export const MONTHS = Array.from({ length: 12 }, (_, i) => {
  const d = new Date(Date.UTC(2026, 10 - i, 1));
  return {
    value: `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`,
    label: `${monthLabels[d.getUTCMonth()]} ${d.getUTCFullYear()}`,
  };
});
export function money(value: number, currency = "ر.س") {
  return `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(Number.isFinite(value) ? value : 0)} ${currency}`;
}
export function dateLabel(value: string) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.valueOf())) return value;
  return `${d.getUTCDate()} ${monthLabels[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}
const names = [
  "أحمد خالد العتيبي",
  "سارة عبدالله القحطاني",
  "محمد فهد الدوسري",
  "نورة عبدالرحمن الزهراني",
  "خالد إبراهيم الحربي",
  "ريم عادل المطيري",
  "عبدالله سعد الغامدي",
  "لينا محمد الشهري",
  "عمر ناصر السالم",
  "هند خالد العبدالله",
  "فيصل أحمد العنزي",
  "دانة يوسف الفارس",
  "سعود علي الشمري",
  "جود عبدالله الراشد",
  "مريم فهد الناصر",
  "ماجد عمر الحربي",
  "هالة أحمد السبيعي",
  "وليد خالد الشرفي",
  "ندى عبدالرحمن المالكي",
  "بدر صالح القحطاني",
  "أمل حسن العتيبي",
  "طلال محمد الزهراني",
  "شهد علي الدوسري",
  "يوسف ناصر البقمي",
  "فاطمة خالد السالم",
  "راكان عبدالله الحربي",
  "غادة سعيد الشهري",
  "تركي صالح الغامدي",
  "أروى فهد الفارس",
  "إبراهيم وليد الراشد",
  "لطيفة أحمد المطيري",
  "زياد ناصر العبدالله",
  "بيان محمد الشمري",
  "عبدالعزيز خالد الناصر",
  "نوف عادل السبيعي",
  "حسن عبدالله المالكي",
  "جواهر يوسف العنزي",
  "فهد سعيد القحطاني",
  "روان ناصر الحربي",
  "سلمان علي الزهراني",
  "منى عبدالله الدوسري",
  "مشعل إبراهيم الشمري",
  "نجلاء سعد الغامدي",
  "حسام فهد العتيبي",
  "عبير محمد الشهري",
  "صالح عمر السالم",
  "رغد ناصر الفارس",
  "ناصر حسن المطيري",
];
const departmentFor = (i: number) =>
  i < 14 ? 0 : i < 20 ? 1 : i < 26 ? 2 : i < 31 ? 3 : i < 38 ? 4 : 5;
const jobs = [
  ["أخصائي مبيعات أول", "مدير حسابات رئيسية", "تنفيذي مبيعات"],
  ["أخصائي تسويق", "مصمم هوية بصرية", "مدير الحملات"],
  ["محاسب أول", "محلل مالي", "أخصائي حسابات"],
  ["أخصائي موارد بشرية", "أخصائي شؤون موظفين", "مسؤول استقطاب"],
  ["مهندس برمجيات", "أخصائي دعم تقني", "محلل نظم"],
  ["منسق عمليات", "أخصائي إمداد", "مشرف مستودع"],
];
const history = (text: string, date = "2026-11-10"): HistoryEvent[] => [
  { date, text },
];
export function createInitialState(): AppState {
  const employees: Employee[] = names.map((name, i) => {
    const d = i === 3 ? 3 : departmentFor(i);
    const joined =
      i === 0
        ? "2021-07-01"
        : i >= 45
          ? `2026-11-${String(1 + (i % 12)).padStart(2, "0")}`
          : i < 34
            ? `${2021 + (i % 5)}-${String(1 + (i % 10)).padStart(2, "0")}-${String(1 + (i % 20)).padStart(2, "0")}`
            : `2026-${String(6 + Math.floor((i - 34) / 3)).padStart(2, "0")}-${String(2 + (i % 12)).padStart(2, "0")}`;
    return {
      id: `EMP-${1001 + i}`,
      name,
      job: i === 3 ? "مديرة الموارد البشرية" : jobs[d][i % 3],
      department: DEPARTMENTS[d],
      branch:
        i % 5 === 2 ? "جدة" : i % 5 === 4 ? "الدمام" : "الرياض — المقر الرئيسي",
      email:
        i === 0
          ? "ahmad.alotaibi@ofuq.example"
          : `employee.${1001 + i}@ofuq.example`,
      phone: `+966 55 ${String(1000000 + i * 917).padStart(7, "0")}`,
      joined,
      status: "على رأس العمل",
      base: i === 0 ? 12000 : 8000 + (i % 9) * 1000,
      housing: 1500,
      transport: 1000,
      deductions: i === 0 ? 500 : 300 + (i % 5) * 50,
      leaveBase: 30,
      rating: i === 0 ? 4.7 : Math.round((4.2 + (i % 6) * 0.1) * 10) / 10,
      avatar: i % 12,
      manager: d === 0 ? "سعود علي الشمري" : "نورة عبدالرحمن الزهراني",
      grade: `الدرجة ${["السابعة", "السادسة", "الخامسة"][i % 3]}`,
    };
  });
  const leaves: Leave[] = [
    {
      id: "LV-1001",
      employeeId: "EMP-1001",
      type: "إجازة سنوية",
      start: "2026-10-01",
      end: "2026-10-10",
      days: 10,
      reason: "إجازة عائلية سنوية",
      status: "معتمد",
      history: [
        { date: "2026-09-20", text: "تم تقديم طلب الإجازة" },
        { date: "2026-09-21", text: "اعتمد المدير الطلب وتم تحديث الرصيد" },
      ],
    },
    {
      id: "LV-1002",
      employeeId: "EMP-1001",
      type: "إجازة سنوية",
      start: "2026-11-03",
      end: "2026-11-05",
      days: 3,
      reason: "استراحة قصيرة بعد تسليم المشروع",
      status: "معتمد",
      history: [
        { date: "2026-10-28", text: "تم تقديم الطلب" },
        { date: "2026-10-29", text: "تم اعتماد الإجازة" },
      ],
    },
  ];
  for (let i = 0; i < 18; i++) {
    const emp = employees[i + 1];
    const pending = i < 6;
    const start = pending
      ? `2026-11-${18 + i}`
      : i < 10
        ? "2026-11-12"
        : `2026-10-${String(1 + i).padStart(2, "0")}`;
    const days = 2 + (i % 3);
    const end = new Date(Date.parse(start) + (days - 1) * 86400000)
      .toISOString()
      .slice(0, 10);
    const status: Status = pending
      ? "بانتظار الموافقة"
      : i === 11 || i === 15
        ? "مرفوض"
        : "معتمد";
    leaves.push({
      id: `LV-${1010 + i}`,
      employeeId: emp.id,
      type: i % 4 === 1 ? "إجازة شخصية" : "إجازة سنوية",
      start,
      end,
      days,
      reason: pending
        ? "إجازة عائلية مع ترتيب تسليم المهام"
        : "طلب إجازة مخطّط مسبقًا",
      status,
      history: [
        { date: "2026-11-09", text: "تم تقديم الطلب" },
        ...(pending
          ? []
          : [
              {
                date: "2026-11-10",
                text:
                  status === "معتمد"
                    ? "تم اعتماد الطلب وتحديث الرصيد"
                    : "تم رفض الطلب بعد المراجعة",
              },
            ]),
      ],
    });
  }
  employees.forEach((e) => {
    if (
      leaves.some(
        (l) =>
          l.employeeId === e.id &&
          l.status === "معتمد" &&
          l.start <= "2026-11-14" &&
          l.end >= "2026-11-14",
      )
    )
      e.status = "في إجازة";
  });
  const commissions: Commission[] = MONTHS.flatMap((m, mi) =>
    Array.from({ length: 4 }, (_, i) => ({
      id: `COM-${m.value.replace("-", "")}-${String(i + 1).padStart(2, "0")}`,
      employeeId: employees[i].id,
      deal: [
        "توريد قطاع التجزئة — المنطقة الوسطى",
        "تجديد اتفاقية توزيع — المنطقة الغربية",
        "توسّع شبكة نقاط البيع",
        "عقد توريد مؤسسي — المنطقة الشرقية",
      ][i],
      eligible:
        i === 0 && mi === 0
          ? 150000
          : 80000 + ((mi * 17000 + i * 35000) % 180000),
      rate: i === 0 ? 1 : 1.5 + i * 0.25,
      month: m.value,
      status: (mi > 0 || i === 1
        ? "مصروف"
        : i === 0
          ? "معتمد"
          : "بانتظار الموافقة") as Status,
      date: m.value + "-10",
    })),
  );
  const records: DomainRecord[] = [];
  const add = (
    kind: RecordKind,
    employeeId: string,
    title: string,
    status: Status,
    date: string,
    amount: number,
    description: string,
    meta: DomainRecord["meta"],
    end?: string,
  ) => {
    const r: DomainRecord = {
      id: `${kind.toUpperCase().slice(0, 3)}-${String(records.length + 1).padStart(4, "0")}`,
      kind,
      employeeId,
      title,
      status,
      date,
      amount,
      description,
      meta,
      history: history("إنشاء السجل في النموذج", date),
      ...(end ? { end } : {}),
    };
    records.push(r);
    return r;
  };
  employees.forEach((e, i) => {
    const soon = i === 2 || i === 7 || i === 11;
    add(
      "contracts",
      e.id,
      i % 3 === 0 ? "عقد عمل غير محدد المدة" : "عقد عمل محدد المدة",
      soon ? "ينتهي قريبًا" : "نشط",
      e.joined,
      e.base,
      "عقد وظيفي افتراضي يوضّح تفاصيل الارتباط الوظيفي ومواعيد المراجعة والتجديد.",
      {
        "نوع العقد": i % 3 === 0 ? "غير محدد المدة" : "محدد المدة",
        التجديد: "سنوي",
        "مهلة التنبيه": "30 يومًا",
        المسمى: e.job,
        الفرع: e.branch,
        "حالة المرفقات": "نسخة تجريبية متاحة",
      },
      soon ? "2026-11-30" : i % 3 === 0 ? undefined : "2027-12-31",
    );
    add(
      "allowances",
      e.id,
      "بدل السكن",
      "معتمد",
      "2026-11-01",
      e.housing,
      "بدل سكن شهري ضمن مكونات الراتب.",
      {
        "نوع البدل": "سكن",
        التكرار: "شهري",
        "شهر الاستحقاق": "2026-11",
        "طريقة الصرف": "ضمن مسير الرواتب",
      },
    );
    add(
      "allowances",
      e.id,
      "بدل النقل",
      "معتمد",
      "2026-11-01",
      e.transport,
      "بدل نقل شهري ضمن مكونات الراتب.",
      {
        "نوع البدل": "نقل",
        التكرار: "شهري",
        "شهر الاستحقاق": "2026-11",
        "طريقة الصرف": "ضمن مسير الرواتب",
      },
    );
  });
  MONTHS.forEach((m, mi) => {
    add(
      "bonuses",
      "EMP-1001",
      mi % 3 === 0 ? "مكافأة أداء فصلية" : "مكافأة إنجاز",
      "معتمد",
      m.value + "-10",
      mi === 0 ? 2000 : 1000 + (mi % 3) * 250,
      "تقديرًا لتحقيق مؤشرات الأداء وجودة خدمة العملاء.",
      {
        "نوع المكافأة": mi % 3 === 0 ? "أداء" : "استثنائية",
        "سبب الاستحقاق": "تحقيق الأهداف",
        "شهر الاستحقاق": m.value,
      },
    );
  });
  for (let i = 1; i < 9; i++)
    add(
      "bonuses",
      employees[i].id,
      i % 2 ? "مكافأة التميز" : "مكافأة أداء",
      "معتمد",
      "2026-11-10",
      500 + i * 200,
      "تقدير الأداء الاستثنائي والمساهمة في نجاح الفريق.",
      {
        "نوع المكافأة": i % 2 ? "استثنائية" : "دورية",
        "شهر الاستحقاق": "2026-11",
        "سبب الاستحقاق": "تجاوز المستهدف",
      },
    );
  for (let i = 0; i < 7; i++) {
    const amount = i === 0 ? 5000 : 3000 + i * 1000;
    const paid = i === 0 ? 2000 : i < 3 ? 1000 : 0;
    add(
      "advances",
      employees[i].id,
      "سلفة شخصية",
      i < 3 ? "قيد السداد" : i === 3 ? "معتمد" : "بانتظار الموافقة",
      "2026-11-02",
      amount,
      "طلب سلفة شخصية لتغطية التزامات عائلية، مع اقتراح السداد على أقساط شهرية.",
      {
        "عدد الأقساط": 5,
        "القسط الشهري": amount / 5,
        المسدد: paid,
        المتبقي: amount - paid,
        "بداية السداد": "2026-12",
        "سبب الطلب": "التزامات شخصية",
      },
    );
  }
  for (let i = 0; i < 9; i++) {
    const empId = i < 2 ? "EMP-1001" : employees[i + 1].id;
    add(
      "assets",
      empId,
      i % 3 === 0 ? "حاسب محمول" : i % 3 === 1 ? "هاتف عمل" : "شاشة مكتبية",
      i === 7 ? "مُعادة" : "مسلّمة",
      "2026-03-10",
      i % 3 === 0 ? 4500 : i % 3 === 1 ? 2500 : 1200,
      "عهدة تقنية مخصصة للعمل، مع سجل استلام وإرجاع تجريبي.",
      {
        الفئة: i % 3 === 0 ? "حاسب محمول" : i % 3 === 1 ? "هاتف" : "شاشة",
        "الرقم التسلسلي": `OFQ-DEV-${2100 + i}`,
        "حالة الجهاز": "جيدة جدًا",
        الموقع: "المقر الرئيسي",
        الملحقات: "ملحقات الجهاز كاملة",
      },
    );
  }
  for (let i = 0; i < 12; i++) {
    const e = employees[i];
    add(
      "evaluations",
      e.id,
      "تقييم الأداء — الربع الثالث",
      "مكتمل",
      "2026-09-30",
      0,
      "أداء متميز في التعاون وخدمة العملاء وتحقيق الأهداف، مع فرصة لتعزيز مهارات التخطيط.",
      {
        التقييم: e.rating,
        الدورة: "الربع الثالث 2026",
        "إنجاز الأهداف": 88,
        التعاون: 4.8,
        "جودة العمل": 4.6,
        الالتزام: 4.7,
        "ملاحظات المدير":
          "مساهمة إيجابية ومبادرة مستمرة. نوصي بتطوير مهارات القيادة.",
      },
    );
  }
  for (let i = 0; i < 6; i++) {
    const e = employees[i];
    add(
      "promotions",
      e.id,
      i === 0 ? "ترقية إلى أخصائي مبيعات أول" : "تطوير المسار الوظيفي",
      i < 4 ? "معتمد" : "بانتظار الموافقة",
      i === 0 ? "2025-07-01" : "2026-11-05",
      1500,
      "ترقية مقترحة تقديرًا للأداء وتحقيق الأهداف وتعزيز المسؤوليات.",
      {
        "المسمى السابق": i === 0 ? "أخصائي مبيعات" : "أخصائي",
        "المسمى الجديد": e.job,
        "الدرجة السابقة": "السادسة",
        "الدرجة الجديدة": e.grade,
        "الراتب السابق": e.base - 1500,
        "الراتب الجديد": e.base,
        "تاريخ القرار": i === 0 ? "2025-07-01" : "2026-11-05",
      },
    );
  }
  const subjects = [
    "ملاحظة حول تجهيزات مساحة العمل",
    "اقتراح تحسين تسليم المهام",
    "استفسار عن تحديث السجل الوظيفي",
    "ملاحظة تنظيمية على جدول المناوبات",
    "طلب مراجعة توزيع الأهداف",
    "اقتراح تطوير قنوات التواصل",
  ];
  subjects.forEach((title, i) => {
    const r = add(
      "complaints",
      employees[i].id,
      title,
      i === 0 ? "قيد المعالجة" : i === 2 ? "مكتمل" : "بانتظار الموافقة",
      "2026-11-08",
      0,
      "أرغب في مراجعة الموضوع مع الجهة المختصة والوصول إلى حل مناسب يحسّن تجربة العمل.",
      {
        الأولوية: i === 0 ? "مرتفعة" : "متوسطة",
        "جهة المعالجة": i % 2 ? "الموارد البشرية" : "الدعم الإداري",
        الخصوصية: "خاص بالموظف والجهة المعنية",
      },
    );
    r.comments = [
      {
        by: employees[i].name,
        text: "شكرًا لتعاونكم. أرجو النظر في الملاحظة المرفقة.",
        date: "2026-11-08",
      },
      ...(i === 0
        ? [
            {
              by: "الموارد البشرية",
              text: "وصلتنا ملاحظتك، ونعمل مع الدعم الإداري على معالجتها. سنطلعك على التحديثات هنا.",
              date: "2026-11-10",
            },
          ]
        : []),
    ];
    r.history.push({
      date: "2026-11-10",
      text: i === 0 ? "تحويل الشكوى إلى جهة المعالجة" : "تم تسجيل الشكوى بسرية",
    });
  });
  for (let i = 0; i < 4; i++) {
    const e = employees[40 + i];
    add(
      "offboarding",
      e.id,
      i % 2 ? "انتهاء عقد" : "طلب استقالة",
      i === 3 ? "مكتمل" : "قيد المعالجة",
      "2026-11-04",
      8500 + i * 1200,
      "متابعة تجربة مغادرة منظمة وإخلاء طرف الموظف، مع عرض توضيحي للمستحقات.",
      {
        "سبب المغادرة": i % 2 ? "انتهاء العقد" : "استقالة",
        "آخر يوم عمل": "2026-12-01",
        "تسليم المهام": true,
        "إرجاع العهد": i > 0,
        "المراجعة المالية": i > 1,
        "إخلاء الطرف": i > 2,
        "مستحقات افتراضية": 8500 + i * 1200,
      },
    );
  }
  const attendance: AttendanceEntry[] = employees.flatMap((e, index) => {
    const logs: AttendanceEntry[] = [];
    for (let n = 0; n < 26; n++) {
      const d = new Date(Date.UTC(2026, 9, 18 + n));
      if ([5, 6].includes(d.getUTCDay())) continue;
      const date = d.toISOString().slice(0, 10);
      const late = logs.length === 19;
      logs.push({
        id: `ATT-${e.id}-${date}`,
        employeeId: e.id,
        date,
        checkIn: late ? "08:18" : "07:56",
        checkOut: "16:05",
        status: late ? "متأخر" : "حاضر",
        lateMinutes: late ? 18 : 0,
        overtime: logs.length % 5 === 0 ? 1 : 0,
      });
    }
    const onLeave = leaves.some(
      (l) =>
        l.employeeId === e.id &&
        l.status === "معتمد" &&
        l.start <= "2026-11-14" &&
        l.end >= "2026-11-14",
    );
    logs.push({
      id: `ATT-${e.id}-2026-11-14`,
      employeeId: e.id,
      date: "2026-11-14",
      checkIn: index % 13 === 5 || onLeave ? "—" : "07:58",
      checkOut: "—",
      status: onLeave ? "في إجازة" : index % 13 === 5 ? "غائب" : "حاضر",
      lateMinutes: 0,
      overtime: 0,
    });
    return logs;
  });
  return {
    version: 1,
    attendance,
    employees,
    leaves,
    commissions,
    records,
    activities: [
      {
        id: "ACT-1",
        text: "اعتماد مسودة مسير رواتب نوفمبر للمراجعة",
        date: "2026-11-14",
      },
      {
        id: "ACT-2",
        text: "انضمام ناصر حسن المطيري إلى فريق العمليات",
        date: "2026-11-13",
      },
      {
        id: "ACT-3",
        text: "تحديث دورة تقييم الأداء للربع الثالث",
        date: "2026-11-12",
      },
      {
        id: "ACT-4",
        text: "تجهيز العقود التي تحتاج إلى تجديد",
        date: "2026-11-11",
      },
    ],
    settings: { company: "شركة الأفق التجارية", currency: "ر.س" },
    role: "hr",
    currentEmployeeId: "EMP-1001",
    notificationsRead: false,
  };
}
export function getLeaveBalance(state: AppState, id: string) {
  const e = state.employees.find((e) => e.id === id);
  return (
    (e?.leaveBase || 0) -
    state.leaves
      .filter((l) => l.employeeId === id && l.status === "معتمد")
      .reduce((sum, l) => sum + l.days, 0)
  );
}
export function getPayroll(
  state: AppState,
  id: string,
  month = "2026-11",
): Payroll {
  const e = state.employees.find((e) => e.id === id);
  if (!e || e.joined.slice(0, 7) > month)
    return {
      otherAllowances: 0,
      base: 0,
      housing: 0,
      transport: 0,
      commission: 0,
      bonus: 0,
      deductions: 0,
      gross: 0,
      net: 0,
    };
  const commission = state.commissions
    .filter(
      (c) =>
        c.employeeId === id &&
        c.month === month &&
        ["معتمد", "مصروف"].includes(c.status),
    )
    .reduce((sum, c) => sum + Math.round((c.eligible * c.rate) / 100), 0);
  const bonus = state.records
    .filter(
      (r) =>
        r.kind === "bonuses" &&
        r.employeeId === id &&
        r.date.startsWith(month) &&
        ["معتمد", "مصروف"].includes(r.status),
    )
    .reduce((sum, r) => sum + r.amount, 0);
  const allowances = state.records.filter(
    (r) =>
      r.kind === "allowances" &&
      r.employeeId === id &&
      r.date.slice(0, 7) <= month &&
      ["معتمد", "مصروف"].includes(r.status),
  );
  const housingRows = allowances.filter((r) => r.title.includes("سكن"));
  const transportRows = allowances.filter((r) => r.title.includes("نقل"));
  const housing = housingRows.length
    ? housingRows.reduce((sum, r) => sum + r.amount, 0)
    : e.housing;
  const transport = transportRows.length
    ? transportRows.reduce((sum, r) => sum + r.amount, 0)
    : e.transport;
  const otherAllowances = allowances
    .filter((r) => !r.title.includes("سكن") && !r.title.includes("نقل"))
    .reduce((sum, r) => sum + r.amount, 0);
  const gross =
    e.base + housing + transport + otherAllowances + commission + bonus;
  return {
    otherAllowances,
    base: e.base,
    housing,
    transport,
    commission,
    bonus,
    deductions: e.deductions,
    gross,
    net: gross - e.deductions,
  };
}

export function getAttendanceSummary(state: AppState, employeeId: string) {
  const logs = state.attendance.filter(
    (a) => a.employeeId === employeeId && a.date < "2026-11-14",
  );
  const attended = logs.filter((a) =>
    ["حاضر", "متأخر"].includes(a.status),
  ).length;
  const late = logs.filter((a) => a.status === "متأخر").length;
  const absent = logs.filter((a) => a.status === "غائب").length;
  return {
    logs,
    attended,
    late,
    absent,
    days: logs.length,
    commitment: logs.length
      ? Math.round(((attended - late) / logs.length) * 100)
      : 0,
  };
}
