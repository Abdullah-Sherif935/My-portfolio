# تقرير استكمال إدارة المعرض الهندسي — لوحة التحكم والموقع العام (Complete Portfolio Management Report)

**المشروع:** عبدالله شريف — المنصة والملف الهندسي المهني (`https://portfolio.eng-abdullah.work`)
**التاريخ:** 2026-11-24
**المسارات المشمولة:** `/admin/pages/portfolio` (لوحة التحكم) · `/portfolio` و `/portfolio/:slug` (الموقع العام)

---

## 1. ملخص التدقيق الأولي للبنية والبيانات القائمة
- **جدول `public.projects`:** كان يضم 30 عموداً و5 مشاريع موثّقة (`Flex Bot`, `6-DOF Inspection Robot Arm`, `Water Turbine`, `RC Car`, `DC Motor Parameter Estimation`) لكنه كان يفتقر إلى: تعدد الفئات لكل مشروع، وتصنيف المجموعات الثلاث (`Professional/Client`, `Academic`, `Personal`)، وتواريخ البداية والانتهاء، والمساهمات المنظّمة (بعنوان ووصف وترتيب)، والمرفقات الهندسية (PDF/DXF)، وإعدادات العارض ثلاثي الأبعاد، وبيانات SEO المخصصة.
- **صفحة تفاصيل المشروع (`ProjectDetailPage.tsx`):** كانت تعرض بطاقات فارغة (Placeholders) عند غياب التحدي أو الحل أو المواصفات أو المعرض، وهو ما تم إصلاحه بالكامل.
- **ملفات eDrawings HTML:** لم يُعثر على أي ملف eDrawings HTML مرفوع حالياً في مجلد `public/` أو مساحة العمل.

---

## 2. ترحيل قاعدة البيانات والتخزين السحابي (Supabase Migration & Storage)

- **ملف الترحيل المُطبّق على الإنتاج (`xgrhtukgudnbmtovghlw`):**
  [`supabase/migrations/20261124000800_portfolio_complete_cms.sql`](file:///e:/Eng%20Abdullah/Antigravity/poject%201/supabase/migrations/20261124000800_portfolio_complete_cms.sql)
- **التعديلات الهيكلية الآمنة (بدون حذف أو تعديل أي مشروع قائم):**
  1. توسيع `public.projects` بأعمدة: `project_group ('professional' | 'academic' | 'personal')`، `start_date`، `completion_date`، `viewer_config jsonb`، `seo_meta jsonb`.
  2. إنشاء 3 جداول علائقية منظّمة بمفاتيح أجنبية (`ON DELETE CASCADE`) وفهارس وسياسات **Row-Level Security (RLS)** صارمة عبر `private.is_admin()` (تمنع كشف أي سجل تابع لمشروع غير منشور للزوار `anon`):
     - `public.project_categories (project_id, category_id, display_order)` — لربط كل مشروع بعدة فئات من `public.specializations` (وتم ترحيل الفئة الأساسية للمشاريع الـ 5 تلقائياً).
     - `public.project_contributions (id, project_id, title, description, display_order)` — لمساهمات المشروع المنظّمة باللغتين.
     - `public.project_attachments (id, project_id, title, file_type, file_url, storage_path, file_size_label, downloadable, display_order)` — للمرفقات والوثائق الهندسية.
  3. **حاويات التخزين وسياسات الأمان:**
     - **صور المعرض والغلاف:** إعادة استخدام الحاوية الإنتاجية `portfolio-media` (`public: true`، `5 MB`، مسار `projects/<projectId>/...`) مع سياسات `private.is_admin()` للكتابة والحذف.
     - **المرفقات الهندسية:** إنشاء الحاوية المخصصة `portfolio-attachments` (`public: true`، حد `25 MB`، تدعم `PDF, DXF, DWG, STEP/STP, IGES, ZIP, DOCX, XLSX, TXT`) مع سياسات `SELECT` للزوار و`INSERT/UPDATE/DELETE` محصورة على المسؤول المعتمد فقط عبر `private.is_admin()`.

---

## 3. الميزات المنفّذة في لوحة التحكم (`/admin/pages/portfolio`)

- **الملفات المُحدَّثة والمضافة:**
  - [`src/features/admin/projects/AdminProjectsPage.tsx`](file:///e:/Eng%20Abdullah/Antigravity/poject%201/src/features/admin/projects/AdminProjectsPage.tsx)
  - [`src/features/admin/projects/ProjectEditorForm.tsx`](file:///e:/Eng%20Abdullah/Antigravity/poject%201/src/features/admin/projects/ProjectEditorForm.tsx)
  - [`src/features/admin/projects/ProjectMediaAndFilesTabs.tsx`](file:///e:/Eng%20Abdullah/Antigravity/poject%201/src/features/admin/projects/ProjectMediaAndFilesTabs.tsx)
  - [`src/features/admin/pages/AdminSectionPageWrappers.tsx`](file:///e:/Eng%20Abdullah/Antigravity/poject%201/src/features/admin/pages/AdminSectionPageWrappers.tsx)
  - [`src/services/mappers.ts`](file:///e:/Eng%20Abdullah/Antigravity/poject%201/src/services/mappers.ts)، [`src/services/portfolioService.ts`](file:///e:/Eng%20Abdullah/Antigravity/poject%201/src/services/portfolioService.ts)، [`src/features/admin/context/AdminDataContext.tsx`](file:///e:/Eng%20Abdullah/Antigravity/poject%201/src/features/admin/context/AdminDataContext.tsx)، [`src/features/admin/context/useAdminData.ts`](file:///e:/Eng%20Abdullah/Antigravity/poject%201/src/features/admin/context/useAdminData.ts)، [`src/types/portfolio.ts`](file:///e:/Eng%20Abdullah/Antigravity/poject%201/src/types/portfolio.ts)، [`src/utils/specializationHelpers.ts`](file:///e:/Eng%20Abdullah/Antigravity/poject%201/src/utils/specializationHelpers.ts).
- **قائمة المشاريع الكاملة:** بحث، تصفية ديناميكية بالفئات (من قاعدة البيانات)، تصفية بالمجموعة (`Professional / Academic / Personal`)، تصفية بالحالة (`Visible / Draft`)، ترتيب، **إعادة ترتيب لأعلى/لأسفل**، **نشر/إخفاء (مسودة)**، **نسخ المشروع كمسودة (Duplicate)**، **تعديل**، **فتح الصفحة العامة**، و**حذف مع نافذة تأكيد**.
- **محرر المشروع المنظّم في 8 تبويبات واضحة** (مع تحذير التغييرات غير المحفوظة وتحديث المعاينة الحية `Live Preview` وشارات تحديد مكان ظهور كل حقل):
  1. **Basic Info:** العنوان والوصف المختصر والنظرة العامة (EN/AR)، المعرّف `slug`، الرمز، مجموعة المشروع، ربط العميل (`companies`)، تواريخ البداية والانتهاء، الحالة، مميز/منشور، الترتيب.
  2. **Categories:** اختيار متعدد من الفئات الحية بأسمائها المقروءة باللغتين + إمكانية **إنشاء فئة حية جديدة** مباشرة من المحرر دون أي قوائم ثابتة.
  3. **My Contributions:** إضافة وتعديل وحذف وإعادة ترتيب عدد غير محدود من المساهمات (عنوان ووصف EN/AR) + حقول المنهجية الهندسية الاختيارية (التحدي والحل).
  4. **Tools & Tech:** اختيار سريع بضغطة زر من المهارات المسجّلة (`skills`) + إضافة أدوات وتقنيات جديدة.
  5. **Media Gallery:** رفع عدة صور دفعة واحدة إلى `portfolio-media`، معاينة فورية، تعيين أو تغيير صورة الغلاف (`Set as Cover`)، استبدال أو حذف أو إعادة ترتيب الصور، وإضافة `alt` و`caption` باللغتين.
  6. **Attachments:** رفع مرفقات هندسية (PDF, DXF, DWG, STEP, ZIP, DOCX, XLSX, TXT) إلى `portfolio-attachments`، عناوين باللغتين، التحكم بإتاحة التحميل، إعادة الترتيب، والحذف.
  7. **3D Viewer (eDrawings):** تفعيل/تعطيل لكل مشروع بشكل مستقل، رابط HTTPS معزول مع تحقق صارم وتنبيه أمني واضح، عنوان ورسالة بديلة باللغتين، ارتفاع مخصص، ومعاينة حية داخل `iframe` معزول (`sandbox="allow-scripts allow-same-origin"` و `referrerPolicy="no-referrer"`).
  8. **SEO & Publishing:** عنوان ووصف Meta مخصصان (EN/AR)، اختيار المشاريع ذات الصلة يدوياً، وبيانات مطابقة التوظيف والسيرة الذاتية (`MatchingMetadataFields`).

---

## 4. الميزات المنفّذة في الموقع العام (`/portfolio` و `/portfolio/:slug`)

- **[`PortfolioPage.tsx`](file:///e:/Eng%20Abdullah/Antigravity/poject%201/src/features/portfolio/PortfolioPage.tsx):**
  - عرض المشاريع المنشورة فقط، مقسّمة إلى 3 مجموعات واضحة (تُخفى أي مجموعة فارغة تلقائياً):
    1. **Professional & Client Projects**
    2. **Academic Projects**
    3. **Personal Projects**
  - شريط فلاتر فئات ديناميكي يعرض فقط الفئات المرتبطة بمشاريع منشورة فعلياً (بما يدعم تعدد الفئات لكل مشروع)، مع البحث وتصفية نوع المشروع وزر **المميزة (Featured)**.
- **[`ProjectDetailPage.tsx`](file:///e:/Eng%20Abdullah/Antigravity/poject%201/src/features/portfolio/ProjectDetailPage.tsx):**
  - **إخفاء تام لأي قسم فارغ** (لا بطاقات Placeholder فارغة).
  - عرض جميع الفئات المرتبطة كروابط تصفية، والتواريخ، ومعلومات العميل (عند الارتباط)، والمساهمات المنظّمة (أو المخرجات القديمة)، والمنهجية الهندسية (إن وُجدت)، ومعرض الصور بتحميل كسول (`loading="lazy"`) مع نافذة تكبير (Lightbox)، والعارض ثلاثي الأبعاد المعزول (عند التفعيل)، والمرفقات القابلة للتحميل، والمشاريع ذات الصلة (اليدوية أو حسب الفئات المشتركة).

---

## 5. نتائج الاختبارات الفعلية واللقطات الموثّقة

| الاختبار | النتيجة | التفاصيل الفعلية |
|---|---|---|
| تطابق الترجمة (`admin.json` و `pages.json`) | **PASS** | `admin`: 639/639 · `pages`: 122/122 (`0` مفاتيح ناقصة) |
| `npm run typecheck` (`tsc -b --noEmit`) | **PASS** | 0 أخطاء |
| `npm run lint` (`eslint .`) | **PASS** | 0 أخطاء و 0 تحذيرات |
| `npm run build` (`vite build`) | **PASS** | بناء إنتاجي ناجح في 4.82 ثانية |
| اختبار RLS الحي (`anon`) على الجداول الـ 3 الجديدة | **PASS** | `project_categories`, `project_contributions`, `project_attachments`: `SELECT: 200` · `INSERT: 401` (مرفوض) |
| اختبار Chrome QA الحي الكامل (5/5 خطوات) | **PASS** | إنشاء مشروع جديد بفئتين + مساهمتين مع إعادة الترتيب + أدوات + رفع صورتين وتعيين الغلاف + رفع PDF إلى `portfolio-attachments` + فحص تحقق HTTPS في العارض 3D + التحقق من ظهوره في `/portfolio` و `/portfolio/:slug` بدون أقسام فارغة + إخفاؤه (`Draft`) والتحقق من اختفائه عاماً + حذفه وبقاء المشاريع الـ 5 الأصلية سليمة + اختبار العربية RTL والجوال (`390×844`، `0` تجاوز عرضي) · **`0` أخطاء Console · `0` طلبات شبكة فاشلة** |

### لقطات الشاشة الموثّقة
1. **قائمة المشاريع في لوحة التحكم (`/admin/pages/portfolio`):** [qa_portfolio_admin_list.png](file:///C:/Users/X%20IT/.gemini/antigravity/brain/43f7ca94-671e-4682-8066-c0c109970609/qa_portfolio_admin_list.png)
2. **محرر المشروع (تبويب معرض الصور وتعيين الغلاف):** [qa_portfolio_admin_editor.png](file:///C:/Users/X%20IT/.gemini/antigravity/brain/43f7ca94-671e-4682-8066-c0c109970609/qa_portfolio_admin_editor.png)
3. **صفحة المعرض العامة بالمجموعات والفئات الديناميكية:** [qa_portfolio_public_grouped.png](file:///C:/Users/X%20IT/.gemini/antigravity/brain/43f7ca94-671e-4682-8066-c0c109970609/qa_portfolio_public_grouped.png)
4. **صفحة تفاصيل المشروع (فئتان، مساهمات مرتّبة، معرض، ومرفق PDF للتحميل):** [qa_portfolio_detail_public.png](file:///C:/Users/X%20IT/.gemini/antigravity/brain/43f7ca94-671e-4682-8066-c0c109970609/qa_portfolio_detail_public.png)
5. **المعرض بالعربية (RTL) على الجوال (`390×844`):** [qa_portfolio_public_ar_mobile.png](file:///C:/Users/X%20IT/.gemini/antigravity/brain/43f7ca94-671e-4682-8066-c0c109970609/qa_portfolio_public_ar_mobile.png)

---

## 6. القيود والملاحظات الأمنية (العارض ثلاثي الأبعاد eDrawings)
- **لماذا لا يتم رفع ملفات eDrawings HTML مباشرة إلى Supabase Storage وتشغيلها؟** لأن Supabase Storage يفرض ترويسات أمان تمنع تنفيذ سكربتات WebGL داخل ملفات `text/html` المرفوعة، كما أن تنفيذ ملفات HTML عشوائية على نفس النطاق الرئيسي (`portfolio.eng-abdullah.work`) يُعد مخاطرة XSS.
- **الحل الآمن المُعتمد:** يدعم المحرر ربط أي تصدير eDrawings HTML مستضاف على نطاق ثابت معزول عبر HTTPS (مثل `viewer.eng-abdullah.work` على Cloudflare Pages أو GitHub Pages) ويُعرض تلقائياً داخل `iframe` معزول (`sandbox="allow-scripts allow-same-origin"` و`referrerPolicy="no-referrer"`) مع رسالة بديلة وزر فتح خارجي.
