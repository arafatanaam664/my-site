export type ToolCatalogEntry = {
  id: string;
  href: string;
  title: string;
  description: string;
  category: string;
  mode: "client" | "server";
};

export const builtInToolCatalog: ToolCatalogEntry[] = [
  {
    id: "date-difference",
    href: "/tools/date-difference",
    title: "حاسبة فرق الأيام بين تاريخين",
    description: "تحسب الفرق العددي بين تاريخي البداية والنهاية داخل المتصفح، من دون إرسال تاريخي الإدخال إلى الخادم.",
    category: "التاريخ والحساب",
    mode: "client",
  },
  {
    id: "age-calculator",
    href: "/tools/age-calculator",
    title: "حاسبة العمر بالسنوات والأشهر والأيام",
    description: "تحسب عمرك بين تاريخ الميلاد وتاريخ مرجعي تختاره داخل المتصفح، من دون إرسال التاريخين إلى الخادم.",
    category: "التاريخ والحساب",
    mode: "client",
  },
  {
    id: "date-offset",
    href: "/tools/date-offset",
    title: "حاسبة تاريخ بعد عدد من الأيام",
    description: "تُظهر تاريخًا مستقبليًا أو سابقًا بعد عدد تختاره من الأيام داخل المتصفح، من دون إرسال تاريخ الإدخال إلى الخادم.",
    category: "التاريخ والحساب",
    mode: "client",
  },
];
