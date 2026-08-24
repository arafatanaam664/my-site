export type ToolId = "percentage" | "age" | "date-difference" | "date-converter";

export type ToolSummary = {
  id: ToolId;
  slug: string;
  title: string;
  summary: string;
  category: string;
  relatedGuideSlug: string;
};

export type EditorialItem = {
  slug: string;
  type: "guide" | "article";
  title: string;
  excerpt: string;
  readingTime: string;
  updatedAt: string;
  topic: string;
  body: Array<{ heading?: string; paragraphs: string[] }>;
  sourceLabel?: string;
  sourceUrl?: string;
  relatedTools: ToolId[];
};

export const tools: ToolSummary[] = [
  {
    id: "date-converter",
    slug: "date-converter",
    title: "محول التاريخ الهجري والميلادي",
    summary: "حوّل التاريخ في اتجاهين باستخدام تقويم أم القرى المتاح في متصفحك.",
    category: "أدوات التاريخ",
    relatedGuideSlug: "understanding-hijri-gregorian-dates",
  },
  {
    id: "age",
    slug: "age-calculator",
    title: "حاسبة العمر",
    summary: "احسب العمر بالسنوات والأشهر والأيام انطلاقًا من تاريخ الميلاد.",
    category: "أدوات التاريخ",
    relatedGuideSlug: "calculate-age-correctly",
  },
  {
    id: "date-difference",
    slug: "date-difference",
    title: "حاسبة الفرق بين تاريخين",
    summary: "اعرف عدد الأيام والفترة الزمنية بين تاريخين بوضوح.",
    category: "أدوات التاريخ",
    relatedGuideSlug: "understanding-hijri-gregorian-dates",
  },
  {
    id: "percentage",
    slug: "percentage-calculator",
    title: "حاسبة النسبة المئوية",
    summary: "احسب نسبة رقم من إجمالي أو الزيادة والنقصان بصورة مباشرة.",
    category: "أدوات الحساب اليومي",
    relatedGuideSlug: "percentage-basics",
  },
];

export const editorialItems: EditorialItem[] = [
  {
    slug: "understanding-hijri-gregorian-dates",
    type: "guide",
    title: "فهم تحويل التاريخ الهجري والميلادي: متى تحتاجه وكيف تتحقق منه؟",
    excerpt: "دليل عملي يوضح الفرق بين التحويل الحسابي والتاريخ المعتمد في المستندات والمواعيد الرسمية.",
    readingTime: "4 دقائق",
    updatedAt: "24 أغسطس 2026",
    topic: "التاريخ والتقويم",
    body: [
      {
        paragraphs: [
          "يُستخدم تحويل التاريخ في النماذج والمواعيد والسجلات الشخصية. لكنه ليس مجرد معادلة تقريبية عندما يتعلق الأمر بموعد رسمي أو مستند قانوني أو إجراء حكومي.",
          "ابدأ بالأداة للحصول على التحويل، ثم راجع الجهة المختصة عندما يترتب على التاريخ حق أو التزام أو موعد نهائي. توضح المنصة دائمًا أن الأداة مساعدة عملية وليست بديلًا عن المصدر الرسمي في الحالات الحساسة.",
        ],
      },
      {
        heading: "كيف تستخدم النتيجة بصورة صحيحة؟",
        paragraphs: [
          "احتفظ بنوع التقويم مع التاريخ؛ فكتابة اليوم والشهر والسنة وحدها قد لا تكفي. وإذا كانت النتيجة مرتبطة بموعد منشور، تحقق من تاريخ تحديث المصدر وحالته قبل اتخاذ قرار.",
          "للمقارنة أو التخطيط الشخصي، تكفي النتيجة المستخرجة من الأداة. أما للمستندات والمعاملات، فالأولوية لما تعلنه الجهة التي تدير الإجراء.",
        ],
      },
    ],
    sourceLabel: "وزارة المالية السعودية — أسئلة شائعة عن تقويم أم القرى",
    sourceUrl: "https://www.mof.gov.sa/en/help/faq/Pages/faq_009.aspx",
    relatedTools: ["date-converter", "date-difference", "age"],
  },
  {
    slug: "calculate-age-correctly",
    type: "guide",
    title: "كيف تحسب العمر بدقة من تاريخ الميلاد؟",
    excerpt: "طريقة واضحة لفهم فرق السنوات والأشهر والأيام، وما الذي يجب الانتباه إليه في السنوات الكبيسة.",
    readingTime: "3 دقائق",
    updatedAt: "24 أغسطس 2026",
    topic: "أدوات الحياة اليومية",
    body: [
      {
        paragraphs: [
          "حساب العمر لا يساوي طرح سنة الميلاد من السنة الحالية فقط. يجب مقارنة الشهر واليوم أيضًا، لأن عيد الميلاد قد لا يكون قد حل بعد.",
          "تعرض الحاسبة الفترة بالسنوات والأشهر والأيام لتساعدك على قراءة النتيجة بوضوح. وتبقى النتيجة الحسابية مرجعًا شخصيًا؛ أما متطلبات العمر في جهة ما فتعود إلى سياستها المعلنة.",
        ],
      },
      {
        heading: "متى تظهر فروق في النتيجة؟",
        paragraphs: [
          "قد يظهر فرق يوم في المناطق الزمنية أو عند إدخال تاريخ غير صحيح. لذلك تستخدم الأداة تاريخًا صريحًا بصيغة سنة وشهر ويوم، ولا تطلب أي معلومات شخصية إضافية.",
        ],
      },
    ],
    relatedTools: ["age", "date-difference", "date-converter"],
  },
  {
    slug: "percentage-basics",
    type: "article",
    title: "النسبة المئوية ببساطة: كيف تقرأ النتيجة قبل أن تستخدمها؟",
    excerpt: "شرح مبسط للنسبة من الإجمالي، والزيادة والنقصان، مع متى تكون النتيجة مضللة إن غاب السياق.",
    readingTime: "4 دقائق",
    updatedAt: "24 أغسطس 2026",
    topic: "حسابات يومية",
    body: [
      {
        paragraphs: [
          "النسبة المئوية طريقة للمقارنة بين جزء وإجمالي. عندما نقول إن رقمًا يمثل 25%، فالمعنى أنه ربع الكل، لا أنه قيمة مستقلة عن السياق.",
          "تساعدك الحاسبة على إجراء العملية بسرعة، لكن فهم المقام مهم دائمًا: نسبة صغيرة من إجمالي كبير قد تكون رقمًا أكبر من نسبة كبيرة من إجمالي صغير.",
        ],
      },
      {
        heading: "الزيادة والنقصان ليسا عملية واحدة",
        paragraphs: [
          "عند الانتقال من قيمة إلى أخرى، تقاس التغيرات من القيمة الأصلية. لا تفترض أن زيادة 20% ثم نقصان 20% يعيدك إلى القيمة نفسها؛ لأن النسبتين تتعاملان مع أساسين مختلفين.",
        ],
      },
    ],
    relatedTools: ["percentage"],
  },
  {
    slug: "official-dates-and-information",
    type: "article",
    title: "كيف تميّز بين الموعد الرسمي والموعد الإرشادي؟",
    excerpt: "قاعدة تحريرية بسيطة تساعد على قراءة المواعيد المنشورة: المصدر، والحالة، وتاريخ المراجعة.",
    readingTime: "5 دقائق",
    updatedAt: "24 أغسطس 2026",
    topic: "معلومات عملية",
    body: [
      {
        paragraphs: [
          "ليست كل التواريخ من النوع نفسه. فهناك موعد معلن من جهة مسؤولة، وهناك تاريخ متوقع مبني على قاعدة، وهناك مناسبة تقويمية لا تعني بالضرورة إجازة أو إجراءًا رسميًا.",
          "تتبنى Alshafra ثلاث إشارات ظاهرة: رسمي، إرشادي، ومحسوب. ولا تنشر موعدًا زمنيًا دون مصدر أو دون بيان حالته للقارئ.",
        ],
      },
      {
        heading: "ثلاثة أسئلة قبل الاعتماد على أي موعد",
        paragraphs: [
          "اسأل: من الجهة المالكة للمعلومة؟ متى راجعنا الصفحة؟ وهل التاريخ معلن أم مستنتج؟ هذه الأسئلة أهم من شكل العد التنازلي أو سرعة انتشار المعلومة.",
        ],
      },
    ],
    sourceLabel: "وزارة التعليم السعودية — صفحة التقويم الدراسي",
    sourceUrl: "https://www.moe.gov.sa/en/education/generaleducation/pages/academiccalendar.aspx",
    relatedTools: ["date-converter", "date-difference"],
  },
];

export const findTool = (slug: string) => tools.find((tool) => tool.slug === slug);
export const findEditorialItem = (slug: string) => editorialItems.find((item) => item.slug === slug);
export const findToolById = (id: ToolId) => tools.find((tool) => tool.id === id);

export const publicRoutes = [
  "/",
  "/tools",
  "/calendar",
  "/guides",
  "/articles",
  "/search",
  "/about",
  "/privacy",
  "/terms",
  "/contact",
] as const;
