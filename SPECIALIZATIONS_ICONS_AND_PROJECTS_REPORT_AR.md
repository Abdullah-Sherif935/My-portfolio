# تقرير تطوير التخصصات الأساسية — الأيقونات الديناميكية وربط مشاريع المعرض

**المشروع:** عبدالله شريف — المنصة والملف الهندسي المهني (`https://portfolio.eng-abdullah.work`)
**التاريخ:** 2026-11-23
**النطاق:** تطوير محرر التخصصات الأساسية (`/admin/pages/home?tab=specializations`) والواجهة العامة لدعم الأيقونات الديناميكية (مكتبة موسّعة + رفع SVG/PNG/WebP إلى Supabase Storage)، والربط الفعلي بمشاريع المعرض (يدوي وتلقائي حسب الفئة)، وتكامل فئات المعرض الديناميكية دون تكرار.

---

## 1. ملخص التغييرات المنفّذة

### أ) نظام الأيقونات الديناميكية وأولوية العرض
- إنشاء مكتبة أيقونات هندسية منظّمة في 3 مجموعات (18 أيقونة) داخل [`src/utils/specializationHelpers.ts`](file:///e:/Eng%20Abdullah/Antigravity/poject%201/src/utils/specializationHelpers.ts):
  1. **الحرارية والميكانيكية:** `wind`, `thermometer`, `flame`, `cog`, `wrench`, `layers`
  2. **الأتمتة والكهرباء:** `cpu`, `circuit-board`, `zap`, `sliders`, `gauge`, `activity`
  3. **الروبوتات والصناعة:** `bot`, `factory`, `settings`, `shield`, `box`, `compass`
- إضافة دعم **رفع الأيقونات المخصصة (SVG / PNG / WebP بحد أقصى 2 ميجابايت)** إلى Supabase Storage (`portfolio-media/specializations/...`) مع:
  - معاينة فورية قبل الحفظ.
  - استبدال الأيقونة المخصصة مع حذف الملف القديم تلقائياً من التخزين.
  - إزالة الأيقونة المخصصة والعودة بسلاسة إلى أيقونة المكتبة الاحتياطية.
  - التحقق الصارم من نوع الملف وحجمه دون كشف أي مفاتيح `service_role`.
- إنشاء المكوّن الموحّد [`SpecializationIconBadge.tsx`](file:///e:/Eng%20Abdullah/Antigravity/poject%201/src/components/common/SpecializationIconBadge.tsx) بأولوية عرض دقيقة (`object-contain` دون تمطيط):
  1. الصورة المخصصة المرفوعة (إن وُجدت وحُمّلت بنجاح).
  2. أيقونة المكتبة المختارة.
  3. أيقونة `Cog` الافتراضية.

### ب) ربط مشاريع المعرض (Related Portfolio Projects) وتكامل الفئات الديناميكية
- دعم وضعيْ الربط في كل تخصص:
  - **الوضع التلقائي (`category`):** جلب جميع المشاريع المنشورة المطابقة لفئة المعرض المختارة تلقائياً، مع معاينة مباشرة داخل لوحة التحكم.
  - **الوضع اليدوي (`manual`):** اختيار متعدد مع بحث فوري وعرض المصغّرات (`thumbnails`) والرموز، وإعادة ترتيب المشاريع المختارة لأعلى/لأسفل، وإزالة أي مشروع، مع الحفظ في جدول الربط العلائقي `public.specialization_projects` بدون تكرار أي سجل مشروع.
- **تكامل فئات المعرض الديناميكية:** استبدال القائمة الثابتة في كل من لوحة التحكم و [`PortfolioPage.tsx`](file:///e:/Eng%20Abdullah/Antigravity/poject%201/src/features/portfolio/PortfolioPage.tsx) بالدالة الموحّدة `resolvePortfolioCategories(specializations, projects)` التي تعرض الأسماء المقروءة باللغتين وعدد المشاريع المنشورة مع الحفاظ على المعرّفات (`slugs`) الثابتة.
- **سلوك الموقع العام ([`SpecializationsSection.tsx`](file:///e:/Eng%20Abdullah/Antigravity/poject%201/src/features/home/sections/SpecializationsSection.tsx) و [`PortfolioPage.tsx`](file:///e:/Eng%20Abdullah/Antigravity/poject%201/src/features/portfolio/PortfolioPage.tsx)):**
  - عند عدم وجود أي مشروع منشور مطابق للتخصص (سواءً في الوضع التلقائي أو اليدوي)، **يُخفى رابط «المشاريع ذات الصلة» تلقائياً** لمنع أي روابط فارغة أو معطّلة.
  - في الوضع التلقائي، يوجّه الرابط إلى `/portfolio?category=<slug>`.
  - في الوضع اليدوي، يوجّه الرابط إلى `/portfolio?specialization=<id>` حيث تعرض صفحة `/portfolio` شريط تصفية نشط باسم التخصص وتعرض **فقط** المشاريع المنشورة المختارة بالترتيب المحدد.

### ج) تنظيم محرر التخصصات في 6 أقسام واضحة داخل [`HomeSpecializationsTab.tsx`](file:///e:/Eng%20Abdullah/Antigravity/poject%201/src/features/admin/pages/HomeSpecializationsTab.tsx)
1. **Basic Information** (الرمز المرجعي، العنوان والوصف باللغتين).
2. **Icon & Appearance** (معاينة حية + مكتبة الأيقونات + رفع/استبدال/إزالة صورة مخصصة).
3. **Portfolio Category** (قائمة ديناميكية بأسماء مقروءة + عدد المشاريع المنشورة).
4. **Related Portfolio Projects** (اختيار الوضع التلقائي أو اليدوي + بحث + ترتيب + معاينة).
5. **Key Technical Highlights** (النقاط الفنية باللغتين).
6. **Publication & Display Settings** (حالة النشر والحفظ).

---

## 2. ترحيل قاعدة البيانات (Supabase Migration)

- **الملف:** [`supabase/migrations/20261123000700_specialization_icons_and_project_links.sql`](file:///e:/Eng%20Abdullah/Antigravity/poject%201/supabase/migrations/20261123000700_specialization_icons_and_project_links.sql)
- **الحالة:** مُطبّق بنجاح على الإنتاج (`xgrhtukgudnbmtovghlw`).
- **التعديلات:**
  1. توسيع قيد `icon` على `public.specializations` ليشمل 18 أيقونة، وإضافة الأعمدة:
     - `icon_type text NOT NULL DEFAULT 'library' CHECK (icon_type IN ('library', 'image'))`
     - `custom_icon_url text NULL`
     - `custom_icon_path text NULL`
     - `project_relation_mode text NOT NULL DEFAULT 'category' CHECK (project_relation_mode IN ('category', 'manual'))`
  2. إنشاء جدول الربط العلائقي `public.specialization_projects (specialization_id, project_id, display_order)` بمفاتيح أجنبية (`ON DELETE CASCADE`) وفهارس للأداء، وسياسات RLS صارمة تمنع كشف أي مشروع أو تخصص غير منشور للزوار (`anon`).
  3. **الحفاظ الكامل على التخصصات الـ 6 الحالية** بجميع نصوصها الإنجليزية والعربية وأوصافها ونقاطها وترتيبها دون أي تعديل.

---

## 3. التخزين السحابي وسياسات الأمان (Supabase Storage)

- **الحاوية المستخدمة:** الحاوية الإنتاجية القائمة `portfolio-media` (دون إنشاء حاويات زائدة):
  - `public: true` · الحد الأقصى للحاوية `5 MB` (وحد الأيقونات المخصصة `2 MB`).
  - الصيغ المسموحة في الحاوية تشمل `image/svg+xml`, `image/png`, `image/webp`.
  - مسار حفظ أيقونات التخصصات: `specializations/<spec-id>-<timestamp>.<ext>`.
- **سياسات RLS الفعالة على `storage.objects`:**
  - `SELECT` عام للزوار (`anon` و `authenticated`) على `bucket_id = 'portfolio-media'`.
  - `INSERT` / `UPDATE` / `DELETE` محصورة على المسؤول المعتمد فقط عبر `private.is_admin()`.

---

## 4. لقطات الشاشة الموثّقة وإثبات التنقل والتصفية

1. **محرر التخصصات المطوّر بـ 6 أقسام واضحة داخل `/admin/pages/home?tab=specializations`:**
   [qa_specs_admin_editor_6sections.png](file:///C:/Users/X%20IT/.gemini/antigravity/brain/43f7ca94-671e-4682-8066-c0c109970609/qa_specs_admin_editor_6sections.png)
2. **بطاقات التخصصات في الرئيسية مع الأيقونة المخصصة SVG المرفوعة ورابط المشاريع ذات الصلة على `DISC-01`:**
   [qa_specs_public_custom_svg.png](file:///C:/Users/X%20IT/.gemini/antigravity/brain/43f7ca94-671e-4682-8066-c0c109970609/qa_specs_public_custom_svg.png)
3. **إثبات التنقل والتصفية الفعلية (`/portfolio?specialization=hvac-refrigeration`) مع شريط التخصص النشط وعرض المشروعين المختارين بالترتيب المحدد:**
   [qa_specs_portfolio_filtered_manual.png](file:///C:/Users/X%20IT/.gemini/antigravity/brain/43f7ca94-671e-4682-8066-c0c109970609/qa_specs_portfolio_filtered_manual.png)
4. **بطاقات التخصصات بالعربية (RTL) على سطح المكتب:**
   [qa_specs_public_ar_desktop.png](file:///C:/Users/X%20IT/.gemini/antigravity/brain/43f7ca94-671e-4682-8066-c0c109970609/qa_specs_public_ar_desktop.png)
5. **بطاقات التخصصات بالعربية (RTL) على الجوال (`390×844`) بدون أي تجاوز عرضي:**
   [qa_specs_public_ar_mobile.png](file:///C:/Users/X%20IT/.gemini/antigravity/brain/43f7ca94-671e-4682-8066-c0c109970609/qa_specs_public_ar_mobile.png)

---

## 5. نتائج الاختبارات الفعلية

| الاختبار | النتيجة | الملاحظات والتفاصيل الفعلية |
|---|---|---|
| `npm run typecheck` (`tsc -b --noEmit`) | **PASS** | 0 أخطاء |
| `npm run lint` (`eslint .`) | **PASS** | 0 أخطاء و 0 تحذيرات |
| `npm run build` (`vite build`) | **PASS** | بناء إنتاجي ناجح خلال 4.75 ثانية |
| تطابق الترجمة (`admin.json` و `pages.json`) | **PASS** | `admin`: 566/566 · `pages`: 108/108 (`0` مفاتيح ناقصة) |
| فحص RLS الحي على `specialization_projects` (`anon`) | **PASS** | `SELECT`: `200` · `INSERT`: `401` (مرفوض) |
| اختيار أيقونة من المكتبة + المعاينة الحية | **PASS** | اختيار `thermometer` ← تحديث فوري للمعاينة |
| رفع أيقونة SVG + استبدال بـ PNG + إزالة الصورة | **PASS** | رفع SVG إلى `portfolio-media` (`200`) وظهورها على `/` ← استبدال بـ PNG مع حذف SVG القديم (`200`) ← إزالة PNG والعودة إلى `wind` (`200`) |
| اختيار مشاريع متعددة يدوياً + إعادة الترتيب + إزالة | **PASS** | اختيار `Water Turbine` و `Flex Bot`، تحريك `Flex Bot` لأعلى ← ظهور المشروعين بالترتيب في `/portfolio?specialization=hvac-refrigeration` ثم الإزالة وإعادة الوضع التلقائي |
| المطابقة التلقائية وإخفاء الروابط الفارغة | **PASS** | `DISC-02` (1 مشروع)، `DISC-04` (1 مشروع)، `DISC-06` (3 مشاريع → `/portfolio?category=robotics-mechatronics`) تعرض الرابط؛ بينما `DISC-01` و `DISC-03` و `DISC-05` (0 مشاريع) تُخفي الرابط تلقائياً |
| العربية (RTL) + الإنجليزية (LTR) + الجوال (`390×844`) وسطح المكتب | **PASS** | `scrollWidth === innerWidth` (0 تجاوز عرضي) · `0` أخطاء Console · `0` طلبات شبكة فاشلة |
| سلامة المحتوى الأصلي للتخصصات الـ 6 | **PASS** | جميع النصوص والأوصاف والنقاط والترتيب محفوظة بالكامل |

---

## 6. القيود المتبقية بشفافية
- حقل `category` في جدول `public.projects` ما زال يقبل قيماً نصية مرتبطة بمعرّفات التخصصات (`SpecializationId`)، وقد تم توحيد عرضها ديناميكياً في لوحة التحكم وفي صفحة `/portfolio` عبر `resolvePortfolioCategories()`. في حال إضافة تخصص جديد مستقبلاً بفئة جديدة تماماً، يُنصح بتوسيع قائمة الفئات في محرر المشروع (`ProjectEditorForm.tsx`) لقراءة `specializations` من `useAdminData()` بدلاً من الثابت `SPECIALIZATIONS` (مهمة مستقبلية صغيرة ومستقلة).
- جميع المشاريع الـ 5 الحالية في قاعدة البيانات منشورة (`is_published = true`)، وقد تم التحقق من سياسة RLS ومنطق التصفية (`project.isPublished !== false` + شرط `p.is_published = true` في سياسة `specialization_projects_anon_select_published`) لضمان عدم كشف أي مشروع غير منشور للزوار.
