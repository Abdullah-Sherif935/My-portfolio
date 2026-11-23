# التقرير الفني — إعادة هيكلة لوحة التحكم (Page-Oriented Admin CMS)

**المشروع:** Abdullah Sherif — Engineering Portfolio & Professional Platform  
**النطاق الحي:** `https://portfolio.eng-abdullah.work`  
**التاريخ:** 2026-11-23  
**المبدأ الهندسي:** إعادة تنظيم معمارية لوحة التحكم بالكامل حول **صفحات الموقع العام** دون تعديل البيانات الإنتاجية أو إنشاء نسخ مكررة أو ترحيلات قاعدة بيانات غير ضرورية.

---

## 1. التدقيق المبدئي وخريطة ربط الصفحات بمصادر البيانات (Initial Audit & Page Mapping)

| الصفحة العامة (Public Page) | مصدر البيانات الفعلي (Supabase / Code) | الموقع السابق في لوحة التحكم | الموقع الجديد المعتمد (Page-Oriented CMS) |
| --- | --- | --- | --- |
| **Home (`/`)** | `profile` (الاسم، العنوان، الموقع، الملخص، الصورة)، `site_settings.show_graduation_portrait`، `projects.featured`، وملخصات الخبرات والشركات والمهارات والشهادات والتواصل | مبعثرة بين `/admin/profile` و `/admin/projects` و `/admin/settings` | **`/admin/pages/home`** (3 تبويبات فرعية: Hero & Introduction، Featured Projects، Homepage Sections Map + معاينة حية لـ `/`) |
| **About (`/about`)** | `profile` (الملخص، اللغات، الكفاءات، الصورة)، `education` (الدرجة العلمية والمقررات ومشروع التخرج)، `SPECIALIZATIONS` | مقسّمة بين `/admin/profile` و `/admin/education` | **`/admin/pages/about`** (4 تبويبات فرعية: Biography & Summary، Education، Languages & Competencies، Profile Media + معاينة حية لـ `/about`) |
| **Experience (`/experience`)** | `experience` (الخبرات المهنية والتدريب الصناعي والمسؤوليات والترتيب والوسوم) | `/admin/experience` | **`/admin/pages/experience`** (مع سياق الصفحة والمعاينة الحية لـ `/experience` وإعادة توجيه تلقائي من `/admin/experience`) |
| **Portfolio (`/portfolio`, `/portfolio/:slug`)** | `projects` (المشاريع، دراسات الحالة، التقنيات، المخرجات، المعرض، الروابط، الوسوم) | `/admin/projects` | **`/admin/pages/portfolio`** (مع سياق الصفحة والمعاينة الحية لـ `/portfolio` وإعادة توجيه تلقائي من `/admin/projects`) |
| **Clients / Companies (`/companies`, `/companies/:slug`)** | `companies` (الشركات والعملاء وجهات العمل والتدريب والشعارات والخدمات) | `/admin/companies` | **`/admin/pages/clients`** (مع سياق الصفحة والمعاينة الحية لـ `/companies` وإعادة توجيه تلقائي من `/admin/companies`) |
| **Skills (`/skills`)** | `skill_groups` (مجموعات المهارات، العناصر، الظهور، الترتيب، الوسوم) | `/admin/skills` | **`/admin/pages/skills`** (مع سياق الصفحة والمعاينة الحية لـ `/skills` وإعادة توجيه تلقائي من `/admin/skills`) |
| **Certifications (`/certifications`)** | `certifications` + `site_settings.show_courses_section` | مقسّمة بين `/admin/certifications` و `/admin/settings` | **`/admin/pages/certifications`** (إدارة الدورات + مفتاح ظهور القسم للعامة معاً + معاينة حية لـ `/certifications`) |
| **Contact (`/contact`)** | `profile.contact` (البريد، LinkedIn، GitHub، النطاق)، `profile.location`، `site_settings.show_contact_email`، `site_settings.show_linkedin_link` | مقسّمة بين `/admin/profile` و `/admin/settings` | **`/admin/pages/contact`** (القنوات والروابط + مفاتيح الظهور + حالة نموذج التواصل + معاينة حية لـ `/contact`) |
| **Recruiter Mode (`/recruiter`, `/recruiter/results`)** | `site_settings.recruiter_mode_enabled` + `matching_tags` و `cv_priority` عبر `projects`, `experience`, `skill_groups`, `certifications` | مفتاح في `/admin/settings` ووسوم متفرقة دون نظرة شاملة | **`/admin/features/recruiter`** (التحكم بالظهور + عرض الوظائف الـ 7 + مصفوفة تدقيق الوسوم والأولويات + معاينة حية لـ `/recruiter`) |
| **Smart CV Builder (`/career/cv-builder`)** | `site_settings.default_cv_template`، `site_settings.cv_section_order`، `cv_workspace_config` | مقسّمة بين `/admin/settings` و `/admin/cv` | **`/admin/features/cv-builder`** (تبويبان: Public Smart CV Defaults و Owner CV Workspace + معاينة حية لـ `/career/cv-builder`) |
| **Global System & Navigation** | `site_settings` (اسم الموقع، SEO)، `media_assets` + Storage `portfolio-media`، `private.admin_users` | `/admin/settings` و `/admin/media` | **`/admin/system/settings`**، **`/admin/system/navigation`**، **`/admin/system/media`** |

> **مصدر بيانات واحد للمحتوى المشترك:** كل تعديل على `profile` أو `site_settings` يعرض تنبيهاً صريحاً بجميع الصفحات المتأثرة (مثل `Appears on: Home → Hero Section · Also used on: About, CV Builder`) قبل الحفظ، دون إنشاء أي نسخ مكررة من البيانات.

---

## 2. هيكل التنقل الجديد في القائمة الجانبية (New Admin Sidebar Structure)

1. **Main (`الرئيسية`)**
   - `Overview` (`/admin`) — ملخص حقيقي لسجلات قاعدة البيانات (`21` سجل منشور، `4` قيد التوثيق)، حالة الأمان (`Single-Admin RLS`)، بطاقات وصول سريع لكل صفحة من الصفحات الـ 8، وبطاقتا الميزات المتخصصة، وسجل الأنشطة الحديثة.
2. **Website Pages (`صفحات الموقع`)**
   - `Home` (`/admin/pages/home`)
   - `About` (`/admin/pages/about`)
   - `Experience` (`/admin/pages/experience`)
   - `Portfolio` (`/admin/pages/portfolio`)
   - `Clients` (`/admin/pages/clients`)
   - `Skills` (`/admin/pages/skills`)
   - `Certifications` (`/admin/pages/certifications`)
   - `Contact` (`/admin/pages/contact`)
3. **Specialized Features (`الميزات المتخصصة`)**
   - `Recruiter Mode` (`/admin/features/recruiter`)
   - `CV Builder` (`/admin/features/cv-builder`)
4. **System Management (`إدارة النظام`)**
   - `Global Settings` (`/admin/system/settings`) — إعدادات الواجهة (اللغة/الثيم)، الهوية العامة و SEO فقط، وبطاقة حالة نموذج «المسؤول الواحد» (`private.admin_users`). *(لم يتم إنشاء تبويب مزيف لإدارة عدة مستخدمين لأن معمارية التفويض الحالية تعتمد على مالك واحد فقط.)*
   - `Navigation` (`/admin/system/navigation`) — جرد كافة المسارات العامة في الشريط العلوي والتذييل مع مفاتيح الظهور المؤثرة على الروابط.
   - `Media Library` (`/admin/system/media`) — مكتبة وسائط Supabase Storage (`portfolio-media`).

---

## 3. الميزات الإدارية المُعاد تنظيمها وتحسينات تجربة التحرير

- **غلاف موحّد لإدارة الصفحات (`PageEditorShell.tsx`):**
  - شارة المسار العام (`/`، `/about`، إلخ) مع رابط فتح مباشر في نافذة جديدة.
  - مسار ربط واضح يوضح القسم المُحرَّر ومكانه على الموقع العام (`SectionMappingBadge.tsx`).
  - تنبيه المحتوى المشترك يوضح الصفحات الأخرى المتأثرة قبل الحفظ.
  - **معاينة حية حقيقية (`Live Preview`):** إطار `<iframe>` مدمج يعرض الصفحة العامة الفعلية بوضعي **سطح المكتب (Desktop)** و **الجوال (390px Mobile)** مع زر تحديث فوري بعد الحفظ (وليس محاكاة ثابتة).
  - تحذير التغييرات غير المحفوظة (`Unsaved Changes` + `beforeunload` guard) ومؤشر وقت آخر حفظ في Supabase.
- **إعادة توجيه المسارات القديمة (`Navigate replace`):** جميع المسارات السابقة (`/admin/profile`, `/admin/education`, `/admin/projects`, `/admin/companies`, `/admin/experience`, `/admin/skills`, `/admin/certifications`, `/admin/cv`, `/admin/media`, `/admin/settings`) تُعيد التوجيه تلقائياً إلى مواقعها الجديدة دون كسر أي رابط.

---

## 4. تغييرات قاعدة البيانات (Database Changes)

- **صفر ترحيلات جديدة (No unnecessary migrations):** تم الحفاظ الكامل على الجداول الـ 11 القائمة في Supabase وجميع السجلات الإنتاجية وسياسات RLS ومخزن `portfolio-media` دون أي تعديل بنيوي غير لازم أو تكرار للبيانات.

---

## 5. نتائج الاختبارات الفعلية المنفّذة (Executed Tests & Results)

- **الفحوصات الآلية:**
  - `npm run typecheck`: **PASS (0 errors)**
  - `npm run lint`: **PASS (0 errors / 0 warnings)**
  - `npm run build`: **PASS (`4.65s`)**
  - تطابق ملفات الترجمة EN / AR: **PASS (`838 / 838` مفتاحاً بعد استعادة 3 مفاتيح اكتشفها اختبار Chrome الحي)**.
- **اختبار Chrome الحي بحساب المالك (`http://localhost:5173/admin/login`):**
  - **Console Errors / Warnings:** `0` أخطاء، `0` تحذيرات.
  - **Network Errors:** `0` أخطاء (`126/126` طلب Supabase عاد بـ `200 OK`).
  - **Overview & 4-Group Sidebar:** جميع المجموعات الـ 4 والبطاقات الـ 8 والإحصاءات الحية تعمل بدقة: **PASS**.
  - **Live Preview (`<iframe>`):** فُتحت المعاينة الحية على `/admin/pages/home` وعرضت الصفحة الرئيسية الحقيقية بنمطي Desktop و Mobile `390px`: **PASS**.
  - **جميع تبويبات الصفحات والـ Specialized Features و System Tabs:** اجتازت التحميل والانتقال بـ `0` أخطاء، كما عملت إعادة توجيه المسارات القديمة (`/admin/profile` → `/admin/pages/about`، `/admin/projects` → `/admin/pages/portfolio`): **PASS**.
  - **العربية (RTL)، الوضع النهاري (Light)، والجوال (`390×844`):** `dir="rtl"` و `scrollWidth <= innerWidth` (`390px` على الجوال) وفتح القائمة الجانبية للجوال بنجاح: **PASS**.
  - **إصلاح ملاحظة QA الحي:** كشف اختبار Chrome الحي 3 مفاتيح ترجمة ناقصة (`nav.groupSystem`, `dashboard.sessionTag`, `settings.cvSectionOrderLabel`)؛ تمت إضافتها فوراً إلى ملفي `en/admin.json` و `ar/admin.json` وإعادة التحقق بالبناء الكامل.
  - **تسجيل الخروج وحماية المسار:** تم تسجيل الخروج والتحقق من إعادة توجيه `/admin` إلى `/admin/login` وسلامة الموقع العام `/`: **PASS**.

---

## 6. القيود المعروفة المتبقية (Remaining Limitations)

1. **نموذج الحفظ المباشر (Live Save) بدون مسودة منفصلة في قاعدة البيانات:** التعديلات المحفوظة عبر زر `Save Changes` تُنشر مباشرة إلى Supabase (مع وجود حالة «تغييرات غير محفوظة» ومعاينة قبل الحفظ)، ولم تُضف أعمدة مسودة منفصلة لكل حقل حفاظاً على شرط عدم إجراء ترحيلات قاعدة بيانات غير ضرورية.
2. **التخصصات الهندسية الستة (`SPECIALIZATIONS`) ونصوص واجهة i18n الثابتة:** ما زالت النصوص الهيكلية للواجهة وقائمة التخصصات الستة الثابتة تُدار عبر الكود وملفات `i18n` وليست جداول CMS منفصلة، ويمكن نقلها إلى Supabase في مرحلة مستقبلية عند الحاجة.
