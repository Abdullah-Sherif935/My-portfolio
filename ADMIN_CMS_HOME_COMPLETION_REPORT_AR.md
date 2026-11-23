# تقرير استكمال إدارة الصفحة الرئيسية ومصفوفة اكتمال نظام إدارة المحتوى (Admin CMS Completion Report)

**المشروع:** عبدالله شريف — المنصة والملف الهندسي المهني (`https://portfolio.eng-abdullah.work`)
**التاريخ:** 2026-11-23
**النطاق:** استكمال الأقسام الناقصة القابلة للتعديل في صفحة إدارة الرئيسية (`/admin/pages/home`) + تدقيق شامل لاكتمال CMS عبر جميع صفحات الموقع العام.

---

## 1. ملخص الحقول والأقسام الناقصة التي تم اكتشافها أثناء التدقيق

قبل هذا التحديث، كان تبويب إدارة الصفحة الرئيسية (`/admin/pages/home`) يتيح تعديل **Hero & Introduction** و**المشاريع المختارة** و**خريطة الأقسام** فقط، بينما كان هناك قسمان مرئيان على الصفحة الرئيسية `/` لا يمكن تعديلهما من لوحة التحكم:

### أ) قسم «الملف الهندسي والأساس الأكاديمي» (`IntroSection.tsx`)
| العنصر الظاهر في الصفحة الرئيسية | المصدر السابق | الحالة بعد التحديث |
|---|---|---|
| رقم/وسم القسم (`01 // Engineering Profile`) | ملفات ترجمة ثابتة (`home.json`) | قابل للتعديل (EN/AR) عبر `site_settings.home_sections_config.intro.eyebrow` |
| العنوان الرئيسي (`Engineering Profile & Academic Foundation`) | ملفات ترجمة ثابتة (`home.json`) | قابل للتعديل (EN/AR) عبر `intro.title` |
| الوصف الهندسي التفصيلي | ملفات ترجمة ثابتة (`home.json`) | قابل للتعديل (EN/AR) عبر `intro.description` |
| نص زر الانتقال إلى `/about` | ملفات ترجمة ثابتة (`home.json`) | قابل للتعديل (EN/AR) عبر `intro.ctaLabel` |
| إظهار/إخفاء القسم بالكامل | غير متاح | متاح (`intro.visible`) |
| بطاقة التعليم الأكاديمي (عنوان البطاقة، بادئة رابط مشروع التخرج، إظهار البطاقة / إظهار المعدل GPA / إظهار رابط مشروع التخرج) | ثابتة + مقروءة فقط | قابلة للتعديل والتحكم بالظهور الفردي (`showEducationCard`, `showGpa`, `showGraduationProject`) |
| بيانات المؤهل الدراسي (الدرجة العلمية، الجامعة/الكلية، الفترة، سنة التخرج، المعدل والتقدير، ربط مشروع التخرج من المشاريع الفعلية) | قابلة للتعديل من `About → Education` فقط | قابلة للتعديل مباشرة من تبويب الرئيسية عبر **نفس سجل `education[0]` الموحّد** (بدون أي تكرار للبيانات) |
| عمود ركائز المنهج الهندسي (`SYS-01`..`SYS-03`: العنوان، الرمز، الاسم، الوصف، الترتيب، الإضافة/الحذف، الإظهار/الإخفاء) | ملفات ترجمة ثابتة (`home.json`) | قابل للتعديل الكامل وإعادة الترتيب والإضافة والحذف (`intro.pillars` و `intro.showPillars`) |

### ب) قسم «التخصصات الأساسية» (`SpecializationsSection.tsx` — مشترك مع `AboutPage.tsx`)
| العنصر الظاهر في الصفحة الرئيسية | المصدر السابق | الحالة بعد التحديث |
|---|---|---|
| ترويسة القسم (`eyebrow`، `title`، `subtitle`) وإظهار/إخفاء القسم | ملفات ترجمة ثابتة (`home.json`) | قابلة للتعديل (EN/AR) عبر `site_settings.home_sections_config.specializations` |
| بطاقات التخصصات الـ 6 (`DISC-01` حتى `DISC-06`): الرمز، الأيقونة، العنوان، الوصف، أبرز النقاط الفنية، فئة تصفية المعرض، الترتيب، حالة النشر | ثابتة برمجياً في `src/data/specializations.ts` | محفوظة في جدول Supabase مباشر (`public.specializations`) مع CRUD كامل (إضافة، تعديل، حذف بتأكيد، إعادة ترتيب لأعلى/لأسفل، نشر/إخفاء فردي) |

---

## 2. تفاصيل الترحيل وقاعدة البيانات (Supabase Migration)

- **ملف الترحيل:** [`supabase/migrations/20261123000600_home_specializations_and_sections.sql`](file:///e:/Eng%20Abdullah/Antigravity/poject%201/supabase/migrations/20261123000600_home_specializations_and_sections.sql)
- **الحالة:** مُطبّق بنجاح على قاعدة بيانات الإنتاج (`xgrhtukgudnbmtovghlw`).
- **ما تم إنشاؤه وترحيله:**
  1. إنشاء جدول `public.specializations` بالأعمدة: `id`, `code`, `icon`, `title (jsonb)`, `description (jsonb)`, `highlights (jsonb)`, `filter_category`, `display_order`, `is_published`, `created_at`, `updated_at`.
  2. تفعيل **Row-Level Security (RLS)** بنفس نمط الأمان المعتمد في الإنتاج عبر `private.is_admin()`:
     - `specializations_anon_select_published` (`SELECT` للزوار للسجلات المنشورة فقط `is_published = true`)
     - `specializations_auth_select` (`SELECT` للمصادق عليه)
     - `specializations_admin_insert` / `specializations_admin_update` / `specializations_admin_delete` (للمسؤول المعتمد فقط عبر `private.is_admin()`)
  3. ترحيل جميع التخصصات الـ 6 الحالية **حرفياً دون إعادة صياغة** (`ON CONFLICT (id) DO NOTHING`):
     - `DISC-01` — HVAC & Refrigeration (`hvac-refrigeration`)
     - `DISC-02` — PLC & Industrial Automation (`plc-automation`)
     - `DISC-03` — Maintenance & Troubleshooting (`industrial-maintenance`)
     - `DISC-04` — Mechanical Design (`mechanical-design`)
     - `DISC-05` — Sheet Metal Design (`sheet-metal-design`)
     - `DISC-06` — Robotics & Mechatronics (`robotics-mechatronics`)
  4. إضافة العمود `home_sections_config jsonb NOT NULL` إلى جدول `public.site_settings` وتهيئته بالنصوص الإنجليزية والعربية الحالية حرفياً لقسميْ `intro` و `specializations`.

---

## 3. تفاصيل التنفيذ البرمجي

- **النماذج والمحوّلات والخدمات:**
  - [`src/types/portfolio.ts`](file:///e:/Eng%20Abdullah/Antigravity/poject%201/src/types/portfolio.ts) و [`src/types/admin.ts`](file:///e:/Eng%20Abdullah/Antigravity/poject%201/src/types/admin.ts): تعريف `SpecializationIcon` و `HomeIntroPillar` و `HomeIntroSectionConfig` و `HomeSpecializationsSectionConfig` و `HomeSectionsConfig`.
  - [`src/services/mappers.ts`](file:///e:/Eng%20Abdullah/Antigravity/poject%201/src/services/mappers.ts) و [`src/services/portfolioService.ts`](file:///e:/Eng%20Abdullah/Antigravity/poject%201/src/services/portfolioService.ts): ربط الجلب والحفظ والحذف والترتيب مع Supabase (`specializations` + `site_settings.home_sections_config`).
  - [`src/context/PortfolioDataContext.tsx`](file:///e:/Eng%20Abdullah/Antigravity/poject%201/src/context/PortfolioDataContext.tsx) و [`src/features/admin/context/AdminDataContext.tsx`](file:///e:/Eng%20Abdullah/Antigravity/poject%201/src/features/admin/context/AdminDataContext.tsx): توفير `specializations` ودوال `saveSpecialization` / `deleteSpecialization` / `reorderSpecialization` / `toggleSpecializationPublished`.
- **تحديث الصفحات العامة (مصدر بيانات موحّد):**
  - [`src/features/home/sections/IntroSection.tsx`](file:///e:/Eng%20Abdullah/Antigravity/poject%201/src/features/home/sections/IntroSection.tsx): قراءة مباشرة من `siteSettings.homeSections.intro` + `education[0]` + `projects` مع احترام جميع مفاتيح الإظهار/الإخفاء.
  - [`src/features/home/sections/SpecializationsSection.tsx`](file:///e:/Eng%20Abdullah/Antigravity/poject%201/src/features/home/sections/SpecializationsSection.tsx): قراءة مباشرة من `siteSettings.homeSections.specializations` + جدول `specializations` المنشورة ومرتبة حسب `displayOrder`.
  - [`src/features/about/AboutPage.tsx`](file:///e:/Eng%20Abdullah/Antigravity/poject%201/src/features/about/AboutPage.tsx): ربط قسم `Engineering Disciplines` بنفس جدول `specializations` المباشر لمنع أي ازدواجية.
- **تبويبات لوحة التحكم الجديدة داخل `/admin/pages/home`:**
  - [`src/features/admin/pages/AdminHomePageManager.tsx`](file:///e:/Eng%20Abdullah/Antigravity/poject%201/src/features/admin/pages/AdminHomePageManager.tsx): توسيع التبويبات الداخلية إلى 5 تبويبات واضحة مع دعم `?tab=` وحماية التغييرات غير المحفوظة وتحديث المعاينة الحية (`Live Preview`).
  - [`src/features/admin/pages/HomeIntroAcademicTab.tsx`](file:///e:/Eng%20Abdullah/Antigravity/poject%201/src/features/admin/pages/HomeIntroAcademicTab.tsx): إدارة ترويسة القسم والوصف وبطاقة التعليم الموحّدة وركائز المنهج الهندسي.
  - [`src/features/admin/pages/HomeSpecializationsTab.tsx`](file:///e:/Eng%20Abdullah/Antigravity/poject%201/src/features/admin/pages/HomeSpecializationsTab.tsx): إدارة ترويسة القسم + واجهة CRUD كاملة للتخصصات مع تأكيد الحذف (`ConfirmDeleteModal`).
  - [`src/i18n/locales/en/admin.json`](file:///e:/Eng%20Abdullah/Antigravity/poject%201/src/i18n/locales/en/admin.json) و [`src/i18n/locales/ar/admin.json`](file:///e:/Eng%20Abdullah/Antigravity/poject%201/src/i18n/locales/ar/admin.json): تطابق 100% (523 مفتاحاً في كل لغة).

---

## 4. لقطات الشاشة الموثّقة (قبل وبعد الاختبار الحي)

1. **الصفحة الرئيسية `/` قبل التعديل (Baseline):** [qa_home_before.png](file:///C:/Users/X%20IT/.gemini/antigravity/brain/43f7ca94-671e-4682-8066-c0c109970609/qa_home_before.png)
2. **تبويب «الملف الهندسي والأساس الأكاديمي» داخل `/admin/pages/home`:** [qa_admin_home_profile_academic.png](file:///C:/Users/X%20IT/.gemini/antigravity/brain/43f7ca94-671e-4682-8066-c0c109970609/qa_admin_home_profile_academic.png)
3. **الصفحة الرئيسية `/` بعد تعديل العنوان حياً وحفظه في Supabase (قبل إرجاعه لأصله):** [qa_home_after_edit.png](file:///C:/Users/X%20IT/.gemini/antigravity/brain/43f7ca94-671e-4682-8066-c0c109970609/qa_home_after_edit.png)
4. **تبويب «التخصصات الأساسية» داخل `/admin/pages/home` (يعرض التخصصات الـ 6 `DISC-01`..`DISC-06` مع كامل أزرار الإدارة):** [qa_admin_home_specializations.png](file:///C:/Users/X%20IT/.gemini/antigravity/brain/43f7ca94-671e-4682-8066-c0c109970609/qa_admin_home_specializations.png)
5. **واجهة إدارة الرئيسية بالعربية (RTL) بدون أي انكسار أو تجاوز عرضي:** [qa_admin_home_ar_rtl.png](file:///C:/Users/X%20IT/.gemini/antigravity/brain/43f7ca94-671e-4682-8066-c0c109970609/qa_admin_home_ar_rtl.png)

---

## 5. إثبات قابلية تعديل التخصصات الـ 6 ونتائج الاختبارات الفعلية

| الفحص | النتيجة | التفاصيل الفعلية |
|---|---|---|
| `npm run typecheck` (`tsc -b --noEmit`) | **PASS** | 0 أخطاء TypeScript |
| `npm run lint` (`eslint .`) | **PASS** | 0 أخطاء و 0 تحذيرات |
| `npm run build` (`vite build`) | **PASS** | بناء إنتاجي ناجح خلال 4.89 ثانية |
| تطابق ترجمة الإدارة (`en/admin.json` ↔ `ar/admin.json`) | **PASS** | `523` مفتاحاً في EN و `523` في AR (`0` مفاتيح ناقصة) |
| فحص RLS الحي على `public.specializations` (بمفتاح `anon`) | **PASS** | `SELECT`: `200` (6 صفوف منشورة) · `INSERT`: `401` (ممنوع) · `DELETE`: `0` صفوف متأثرة (ممنوع) |
| اختبار Chrome QA الحي — تعديل `Engineering Profile & Academic Foundation` | **PASS** | تعديل العنوان ← حفظ في Supabase ← التحقق من ظهوره على `/` ← إرجاع القيمة الأصلية والتحقق |
| اختبار Chrome QA الحي — CRUD التخصصات الأساسية | **PASS** | التحقق من ظهور التخصصات الـ 6 (`DISC-01`..`DISC-06`) ← إضافة `DISC-07` ← التحقق من ظهوره على `/` (7 عناصر) ← إخفاؤه (`Hidden`) ← حذفه عبر نافذة التأكيد (`204`) وبقاء الـ 6 الأصلية |
| اختبار العربية (RTL) وتسجيل الخروج | **PASS** | `dir="rtl"` و `scrollWidth: 1425 <= innerWidth: 1440` · `0` أخطاء Console · `0` طلبات شبكة فاشلة (من أصل 166 طلباً) |

---

## 6. مصفوفة اكتمال نظام إدارة المحتوى لجميع صفحات الموقع العام (CMS Completeness Matrix)

تم تدقيق جميع صفحات الموقع العام دون تعديل هيكلها خارج نطاق هذه المهمة:

| الصفحة العامة | المحتوى الظاهر حالياً | قابل للتعديل من لوحة التحكم؟ | عناصر ما زالت غير قابلة للتعديل (Missing Controls) |
|---|---|---|---|
| **Home (`/`)** | Hero، الملف الهندسي والأساس الأكاديمي، التخصصات الأساسية، المشاريع المختارة، ملخص الخبرات، شريط الشركات، المهارات، الشهادات، دعوة التواصل | **نعم (مكتمل للأقسام الأساسية)** | نصوص ترويسة وعناوين الأقسام الثانوية في الرئيسية (ملخص الخبرات، الشركات، المهارات، الشهادات، Contact CTA) ما زالت تقرأ من `home.json`، وترتيب أقسام الصفحة الرئيسية ثابت برمجياً. |
| **About (`/about`)** | السيرة والملخص، التعليم والمقررات ومشروع التخرج، اللغات، الكفاءات الأساسية، التخصصات الهندسية (`specializations` المباشرة) | **نعم (معظم المحتوى)** | ترويسة الصفحة (`eyebrow`، `title`، `subtitle`) وعناوين البطاقات الفرعية (`bioHeading`، `educationHeading`) تقرأ من `pages.json`. |
| **Experience (`/experience`)** | الخط الزمني للخبرات المهنية والتدريب الصناعي والمسؤوليات والربط بالشركات والمشاريع | **نعم (كامل السجلات)** | ترويسة الصفحة (`eyebrow`، `title`، `subtitle`) تقرأ من `pages.json`. |
| **Portfolio (`/portfolio` و `/portfolio/:slug`)** | جميع المشاريع، دراسات الحالة، المواصفات، المخرجات، المعرض، الوسوم، الروابط | **نعم (كامل السجلات)** | شريط فلاتر التخصصات في `PortfolioPage.tsx` ما زال يقرأ القائمة الثابتة `SPECIALIZATIONS` بدلاً من `specializations` من Supabase؛ وترويسة الصفحة من `pages.json`. |
| **Clients / Companies (`/companies` و `/companies/:slug`)** | دليل الشركات والعملاء، الشعارات، نوع العلاقة، نطاق الخدمات، الروابط | **نعم (كامل السجلات)** | ترويسة الصفحة ولافتة الملاحظة التوضيحية (`placeholderBanner`) تقرأ من `pages.json`. |
| **Skills (`/skills`)** | مجموعات المهارات التقنية وترتيبها وظهورها | **نعم (كامل السجلات)** | ترويسة الصفحة من `pages.json`. |
| **Certifications (`/certifications`)** | الدورات والشهادات وروابط التحقق والظهور العام | **نعم (كامل السجلات)** | ترويسة الصفحة من `pages.json`. |
| **Contact (`/contact`)** | البريد، لينكدإن، جيت هاب، الموقع، إعدادات الظهور، نموذج التواصل | **نعم (القنوات والظهور)** | نموذج التواصل محلي (تحقق أمامي فقط بدون إرسال بريد خلفي أو حفظ رسائل في Supabase)؛ وترويسة الصفحة من `pages.json`. |
| **Recruiter Mode (`/recruiter`, `/recruiter/results`)** | تفعيل/إيقاف الميزة، مصفوفة وسوم المطابقة والأولوية عبر السجلات، الوظائف الـ 7 الحتمية | **جزئياً (الظهور + الوسوم والأولويات)** | تعريفات الوظائف الـ 7 نفسها وقواعد المطابقة الحتمية معرّفة في `recruiterMatcher.ts` (للقراءة فقط في لوحة التحكم حفاظاً على الدقة وعدم التضليل). |
| **Smart CV Builder (`/career/cv-builder`)** | القالب الافتراضي (ATS / Modern)، ترتيب وظهور الأقسام، مساحة تنظيم السيرة للمالك | **نعم (الإعدادات والهيكل والمحتوى)** | نصوص واجهة المنشئ وإرشادات الطباعة تقرأ من ملفات الترجمة (`recruiter.json`). |

### الخطوات التالية المقترحة (أولويات مستقبلية)
1. **أولوية 1 (سريعة):** ربط شريط فلاتر التخصصات في `PortfolioPage.tsx` بمصدر `specializations` الحي من Supabase بدلاً من `SPECIALIZATIONS` الثابت.
2. **أولوية 2:** إضافة جدول أو إعداد `page_headers_config` اختياري في `site_settings` إذا رغبت في تعديل عناوين وترويسات الصفحات (`PageHeader`) مباشرة من لوحة التحكم.
3. **أولوية 3:** ربط نموذج صفحة التواصل (`/contact`) بجدول `contact_messages` في Supabase أو Edge Function لإرسال إشعار بريدي فعلي للرسائل الواردة.

---

## 7. القيود المتبقية بشفافية
- شريط الفلاتر العلوي في صفحة `/portfolio` لم يُعدّل في هذه المهمة لأنه خارج نطاق صفحة الرئيسية (تم توثيقه في المصفوفة أعلاه).
- أزرار إعادة ترتيب أقسام الصفحة الرئيسية الكاملة (نقل قسم كامل قبل قسم آخر) غير مطبقة حالياً؛ الترتيب الديناميكي مطبّق لبطاقات **التخصصات الأساسية** و**ركائز المنهج الهندسي**.
