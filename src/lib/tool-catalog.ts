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
];
