-- Public section titles and descriptions as search phrases, not CMS labels.
update public.site_sections
set
  title = 'التقويم والمواعيد',
  description = 'تاريخ اليوم الهجري وفق أم القرى، وتحويل التاريخ الهجري والميلادي، وحساب العمر وفرق الأيام.'
where id = 'a1c4e000-0000-4000-8000-000000000001';

update public.site_sections
set
  title = 'أخبار التقويم والمواعيد',
  description = 'أخبار التاريخ الهجري والميلادي والمواعيد بعد المراجعة.'
where id = 'a1c4e000-0000-4000-8000-000000000101';

update public.site_sections
set
  title = 'أدلة تحويل التاريخ',
  description = 'كيف تحوّل التاريخ الهجري وتحسب المواعيد خطوة بخطوة.'
where id = 'a1c4e000-0000-4000-8000-000000000102';

update public.site_sections
set
  title = 'أدوات الحساب والتقويم',
  description = 'تحويل التاريخ الهجري، حاسبة العمر، النسبة المئوية، الخصم، وفرق الأيام.'
where id = 'a1c4e000-0000-4000-8000-000000000103';

update public.site_sections
set
  title = 'حلول مسائل التاريخ والحساب',
  description = 'حلول لتحويل التاريخ وحساب النسبة والعمر والخصم.'
where id = 'a1c4e000-0000-4000-8000-000000000104';

update public.site_sections
set
  title = 'مقالات التقويم والتاريخ الهجري',
  description = 'مقالات تشرح التقويم الهجري والتاريخ والحساب اليومي.'
where id = 'a1c4e000-0000-4000-8000-000000000105';

update public.site_sections
set
  title = 'أسئلة التاريخ والأدوات',
  description = 'أسئلة عن تحويل التاريخ والحساب بعد المراجعة.'
where id = 'a1c4e000-0000-4000-8000-000000000002';
