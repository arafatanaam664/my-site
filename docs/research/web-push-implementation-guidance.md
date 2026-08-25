# ضوابط تنفيذ إشعارات المتصفح

يعتمد Web Push على عامل خدمة نشط واشتراك ينشئه المتصفح بعد إذن المستخدم. يتضمن الاشتراك endpoint ومفاتيح تشفير ويجب أن تعامل هذه القيمة كبيانات حساسة لأن معرفة endpoint قد تكفي لمحاولة الإرسال. لا يُطلب الإذن إلا إثر ضغط المستخدم على زر واضح.

يعتمد خادم الإرسال مفاتيح VAPID ثابتة؛ يحمل المفتاح الخاص سرًا خادميًا فقط ويُتاح المفتاح العام للمتصفح عند الاشتراك. تستخدم الرسائل تشفيرًا من طرف إلى طرف بين خادم التطبيق والمتصفح عبر مفاتيح الاشتراك.

## المراجع

1. [MDN — Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
2. [web.dev — Push notifications overview](https://web.dev/articles/push-notifications-overview)
3. [IETF RFC 8292 — VAPID for Web Push](https://datatracker.ietf.org/doc/html/rfc8292)
