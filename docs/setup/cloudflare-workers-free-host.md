# استضافة تجريبية مجانية على Cloudflare Workers

هذا الدليل ينشر المنصة على رابط مجاني مثل `https://alshafra.<حسابك>.workers.dev` حتى يعمل الاتصال بـ Supabase من الإنترنت. **GitHub Pages لا يصلح** لأن الموقع خادم وليس ملفات ثابتة.

لا تضع المفاتيح في Git. الصور (R2) ليست مطلوبة لهذه التجربة.

## 1. حساب Cloudflare

1. افتح [https://dash.cloudflare.com/sign-up](https://dash.cloudflare.com/sign-up).
2. سجّل ببريدك وأكّد الرسالة.
3. إذا طلب اختيار خطة، اختر **Free**.
4. يمكنك تخطي إضافة نطاق خاص الآن.

## 2. ربط GitHub

1. من لوحة Cloudflare افتح **Compute** أو **Workers & Pages**.
2. اضغط **Create** / **Create application**.
3. اختر **Import a repository** / **Connect to Git**.
4. اسمح لـ Cloudflare بالوصول إلى GitHub، ثم اختر المستودع `arafatanaam664/my-site`.
5. أثناء الإنشاء قد لا يظهر حقل الفرع؛ Cloudflare يختار `main` تلقائيًا. أكمل الربط ثم غيّر الفرع من إعدادات البناء كما في الخطوة 3ب.

## 3. أوامر البناء

إذا ظهرت حقول البناء، استخدم:

| الحقل | القيمة |
|---|---|
| Build command | `pnpm install && pnpm build` |
| Deploy command | `npx wrangler deploy --config dist/server/wrangler.json` |
| Root directory | اتركه فارغًا (جذر المستودع) |

إذا ظهر **Save and Deploy** قبل المفاتيح، أكمل النشر ثم أضف المفاتيح في الخطوة التالية وأعد النشر.

### 3ب. اختيار الفرع بعد الإنشاء

حقل «فرع الإنتاج» غالبًا لا يظهر في شاشة الربط الأولى. Cloudflare يختار `main` تلقائيًا.

1. افتح الـ Worker الذي أُنشئ.
2. اذهب إلى **Settings → Builds** (أو **Settings → Build**).
3. ابحث عن **Git branch** أو **Branch**.
4. غيّره إلى `arena/01a04971-my-site`.
5. احفظ، ثم شغّل بناء جديد (**Retry deployment** أو **Save and Deploy**).

بدون هذه الخطوة يُنشر الكود القديم من `main`.

## 4. مفاتيح Supabase في Cloudflare

من صفحة الـ Worker: **Settings → Variables and Secrets**. هذه متغيرات **التشغيل** (Runtime)، وليست Build variables. لوحة الإدارة تقرأ المفاتيح عند فتح `/admin` عبر `/api/public/config`؛ إذا وضعتها فقط في إعدادات البناء فستظهر رسالة «إعداد الدخول غير متاح».

أضف ثلاثة متغيرات لبيئة الإنتاج:

| الاسم | القيمة | النوع |
|---|---|---|
| `SUPABASE_URL` | Project URL من Supabase | نص |
| `SUPABASE_PUBLISHABLE_KEY` | Publishable key | نص |
| `SUPABASE_SECRET_KEY` | Secret key | **Secret** / مشفّر |

لا تضف `DEV_ADMIN_ACCESS_CODE` هنا؛ الرابط سيكون عامًا.

احفظ ثم **Deploy** / **Retry deployment** إن لزم.

## 5. رابط الدخول في Supabase

بعد نجاح النشر انسخ رابط الموقع الظاهر (ينتهي غالبًا بـ `.workers.dev`).

1. في Supabase: **Authentication → URL Configuration**.
2. في **Redirect URLs** أضف:

```text
https://رابط-موقعك.workers.dev/admin
```

3. تأكد أن مزوّد **Email** مفعّل في **Authentication → Providers**.
4. احفظ.

## 6. التجربة

1. افتح رابط `.workers.dev`.
2. افتح `/admin`.
3. اطلب رابط دخول إلى `arafat.anaam1@gmail.com` (الموجود في قائمة السماح).
4. افتح الرسالة ثم عد إلى لوحة الإدارة.

المحتوى العام يُقرأ من القاعدة. رفع الصور ينتظر إعداد R2 لاحقًا.

## إن فشل البناء

- تأكد أن الفرع `arena/01a04971-my-site` ثم شغّل **بناءً جديدًا** (Build now أو دفع جديد). زر Retry على نشر قديم من `main` يعيد بناء ذلك الالتزام نفسه.
- إذا بقيت `/admin` على «إعداد الدخول غير متاح»، افتح `https://رابطك.workers.dev/api/public/config`. يجب أن يظهر JSON فيه `url` و`publishableKey`. إن كان 503 فالمفاتيح غير محفوظة كمتغيرات تشغيل أو لم يُعد النشر بعد حفظها.
- إذا ظهر `packages field missing or empty` فقد أُصلح في الفرع؛ انتظر البناء التلقائي بعد الدفع أو أعد بناءً جديدًا لا Retry للقديم.
- تأكد أن أوامر البناء هي الواردة في الجدول أعلاه.
- إذا ظهر خطأ عن حاوية R2، أعد المحاولة بعد إزالة ربط R2 من `wrangler.jsonc` (هذا الإعداد الحالي للتجربة).
- إذا ظهر خطأ KV باسم `SESSION`، أنشئ KV في Cloudflare باسم مناسب واربطه لاحقًا؛ أخبرني بنص الخطأ كاملًا.
