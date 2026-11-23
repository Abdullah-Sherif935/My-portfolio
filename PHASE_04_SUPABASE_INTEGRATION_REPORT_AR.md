# تقرير المرحلة الرابعة — ربط قاعدة البيانات والمصادقة والتخزين السحابي (Supabase Integration)
## منصة الملف الهندسي الشخصي — م. عبدالله شريف عبدالرؤوف

**تاريخ الإنجاز:** 23 نوفمبر 2026  
**الحالة العامة:** مكتمل على مستوى قاعدة البيانات والـ RLS والتخزين والواجهة الأمامية ولوحة التحكم (يتبقى فقط خطوتا إنشاء كلمة مرور حساب الأدمن الوحيد وإيقاف التسجيل العام من لوحة تحكم Supabase Dashboard — موضحتان بدقة أدناه).

---

## 1. ملخص ما تم تنفيذه

تم تحويل المشروع بالكامل من البيانات المحلية التجريبية (`Mock / In-Memory`) إلى بنية **Supabase PostgreSQL + Supabase Auth + Supabase Storage** حقيقية مع الحفاظ التام على الهوية البصرية، التوطين العربي/الإنجليزي (RTL/LTR)، والوضع الداكن والفاتح، ودون البدء في المرحلة الخامسة.

| المجال | الحالة | التفاصيل |
| --- | --- | --- |
| تثبيت `@supabase/supabase-js` | ✅ مكتمل | تم تثبيت الحزمة الرسمية (`0` ثغرات أمنية) وفصلها في حزمة مستقلة (`supabase-vendor`) داخل `vite.config.ts`. |
| تهيئة البيئة المحلية `.env.local` و `.env.example` | ✅ مكتمل | تم إعداد `.env.local` باستخدام `VITE_SUPABASE_URL` و `VITE_SUPABASE_PUBLISHABLE_KEY` فقط، والتأكد من تجاهل `.env.local` بالكامل في `.gitignore`. لم تُخزّن أو تُطبع أي مفاتيح سرية (`service_role`). |
| تصميم وتطبيق قاعدة البيانات (Migrations) | ✅ مكتمل ومنفّذ | تم إنشاء وتطبيق **5 ملفات SQL Migrations** على مشروع Supabase (`xgrhtukgudnbmtovghlw` — PostgreSQL 17، `eu-central-1`). |
| سياسات الأمان Row-Level Security (RLS) | ✅ مكتمل ومختبَر حيًّا | تفعيل RLS على **جميع الجداول الـ 12** (11 جدولًا في `public` + جدول `private.admin_users` في schema غير مكشوف). |
| ترحيل البيانات الأولية الموثّقة (Seed) | ✅ مكتمل بدون فقد أو تكرار | ترحيل جميع السجلات الحالية الموثّقة من السيرة الذاتية بأسلوب `ON CONFLICT (id) DO NOTHING`. |
| التخزين السحابي (Supabase Storage) | ✅ مكتمل ومنفّذ | إنشاء Bucket باسم `portfolio-media` (قراءة عامة، حد أقصى 5 ميجابايت، أنواع ملفات مسموحة محددة، رفع/تعديل/حذف للأدمن فقط) وربطه بصفحة `AdminMediaPage`. |
| المصادقة وحماية مسارات الإدارة | ✅ مكتمل بالكود | ربط `/admin/login` بـ `supabase.auth.signInWithPassword` مع التحقق الخادمي عبر RPC `public.is_current_user_admin()`، وحماية جميع مسارات `/admin/*` عبر `AdminProtectedRoute`، وإزالة أي خيار تسجيل عام (`Sign-up`). |
| ربط لوحة التحكم (Admin CRUD) | ✅ مكتمل | جميع عمليات القراءة والإضافة والتعديل والحذف والترتيب وإعدادات الموقع وسجل الأنشطة ورفع الوسائط تعمل مباشرة أمام Supabase PostgreSQL و Storage. |
| ربط صفحات الموقع العام | ✅ مكتمل | جميع صفحات وأقسام الموقع العام الـ 20 تقرأ البيانات المنشورة مباشرة من Supabase عبر `PortfolioDataProvider` مع التحديث الفوري عند أي تعديل من لوحة التحكم. |

---

## 2. هيكل قاعدة البيانات وملفات الـ SQL Migrations

تم حفظ جميع ملفات الترحيل في `supabase/migrations/` وتطبيقها بنجاح على قاعدة بيانات المشروع:

1. **`20261123000100_init_schema.sql`** — إنشاء الـ schema الخاص `private`، جدول `private.admin_users`، دالة التحقق `private.is_admin()` (`SECURITY DEFINER` مع `SET search_path = ''`)، دالة `public.is_current_user_admin()` (`SECURITY INVOKER`)، محفزات التحديث التلقائي `updated_at`، الفهارس، القيود (`CHECK` / `UNIQUE` / Foreign Keys `ON DELETE SET NULL`)، وصلاحيات الأدوار الدنيا (`GRANT` / `REVOKE`).
2. **`20261123000200_rls_policies.sql`** — تفعيل RLS وبناء سياسات منفصلة ودقيقة لكل من `anon` و `authenticated` بدون استخدام `auth.role()` المتوقف أو `user_metadata` وبدون سياسات متداخلة.
3. **`20261123000250_harden_private_admin_users.sql`** — طبقة حماية إضافية (`Defense-in-Depth`): تفعيل RLS على `private.admin_users` مع إلغاء كل صلاحيات الوصول المباشر لـ `anon` و `authenticated`.
4. **`20261123000300_storage_bucket.sql`** — إنشاء Bucket `portfolio-media` وسياسات التخزين (`SELECT` عام، و`INSERT`/`UPDATE`/`DELETE` للأدمن المعتمد فقط).
5. **`20261123000400_seed_initial_data.sql`** — ترحيل آمن وغير متكرر لجميع السجلات الموثّقة:
   - `public.profiles` (1 سجل: `owner-profile`)
   - `public.education` (1 سجل: بكالوريوس هندسة الميكاترونكس — جامعة عين شمس)
   - `public.companies` (4 سجلات قيد التوثيق كما هي بدون اختلاق)
   - `public.projects` (5 مشاريع هندسية موثّقة من السيرة الذاتية)
   - `public.experience` (3 سجلات: Sccoder + Ceramica Cleopatra + Farma Swede Masr)
   - `public.skill_groups` (5 مجموعات مهارات)
   - `public.certifications` (3 دورات تقنية)
   - `public.site_settings` (1 سجل إعدادات الموقع والظهور)
   - `public.media_assets` (2 سجل للأصول المحلية الموجودة)
   - `public.cv_workspace_config` (1 سجل هيكل السيرة الذاتية)
   - `public.admin_activity_log` (1 سجل ترحيل فعلي)

---

## 3. معمارية طبقة الخدمات والربط في الواجهة الأمامية

### ملفات Supabase والخدمات الجديدة
- `src/lib/env.ts` & `src/vite-env.d.ts`: قراءة `VITE_SUPABASE_URL` و `VITE_SUPABASE_PUBLISHABLE_KEY` بأمان.
- `src/lib/supabase.ts`: عميل Supabase الموحّد للمتصفح (`persistSession`، `autoRefreshToken`).
- `src/services/mappers.ts`: محوّلات صارمة (`snake_case` ↔ `camelCase`) لجميع الجداول الـ 11.
- `src/services/authService.ts`: تسجيل الدخول والخروج والتحقق المزدوج (`getUser()` + `is_current_user_admin()`).
- `src/services/portfolioService.ts`: استعلامات القراءة العامة المتوازية، استعلامات لوحة التحكم، وكامل عمليات الـ CRUD والترتيب وسجل الأنشطة.
- `src/services/storageService.ts`: رفع الملفات إلى Bucket `portfolio-media` مع التحقق من النوع والحجم (5 MB كحد أقصى)، وحذف الملفات من التخزين وقاعدة البيانات معًا.

### إدارة الحالة والحماية
- `src/context/PortfolioDataContext.tsx` & `src/hooks/usePortfolioData.ts`: مزوّد البيانات الحية للموقع العام مع احترام إعدادات الظهور (`showGraduationPortrait`, `showContactEmail`, `showLinkedinLink`, `showCoursesSection`, `skillGroup.isVisible`).
- `src/features/admin/auth/AdminAuthContext.tsx`, `useAdminAuth.ts`, `AdminProtectedRoute.tsx`: حماية شاملة لجميع مسارات `/admin/*` وإعادة توجيه أي زائر غير موثّق إلى `/admin/login`.
- `src/features/admin/context/AdminDataContext.tsx`: ربط جميع صفحات الإدارة بـ Supabase مع تحديث تلقائي للموقع العام عند كل عملية حفظ أو حذف.

---

## 4. نتائج الاختبارات والتحقق الأمني والبرمجي

### أ. اختبارات RLS والأمان المباشرة على قاعدة البيانات الحية
- **فحص Supabase Security Advisors:** `0` أخطاء، `0` تحذيرات أمنية حرجة (إشعار `INFO` واحد مقصود لتفعيل RLS بدون سياسات عامة على `private.admin_users`).
- **فحص تسريب المفاتيح السرية:** `0` مفاتيح `service_role` أو `sb_secret_` في `src/` أو `dist/` أو Git.
- **قراءة الزوار (`anon`) للجداول العامة المنشورة:** ناجحة بالكامل (`profiles=1`, `companies=4`, `projects=5`, `experience=3`, `education=1`, `skill_groups=5`, `certifications=3`, `site_settings=1`).
- **منع الزوار (`anon`) من قراءة الجداول الإدارية الخاصة:** تم الرفض بكود PostgreSQL `42501` لكلٍ من `media_assets`، `cv_workspace_config`، و`admin_activity_log`.
- **منع الزوار (`anon`) من الإضافة/التعديل/الحذف:** تم الرفض بكود `42501` على الجداول، وتم رفض رفع صورة PNG صالحة على Storage Bucket `portfolio-media` بسياسة RLS.
- **منع استدعاء `is_current_user_admin` للزوار (`anon`):** تم الرفض بكود `42501`.

### ب. فحوصات الكود والبناء والتوطين
- `npm run typecheck` (`tsc -b --noEmit`): **ناجح — 0 أخطاء**
- `npm run lint` (`eslint .`): **ناجح — 0 أخطاء / 0 تحذيرات**
- `npm run build` (`tsc -b && vite build`): **ناجح — 0 أخطاء**
- تدقيق تطابق الترجمة EN/AR: **تطابق 100%** (`common.json` 71/71، `home.json` 62/62، `pages.json` 107/107، `admin.json` 342/342).

---

## 5. الخطوات اليدوية المطلوبة منك لإتمام تفعيل حساب الأدمن والنشر (دقيقتان فقط)

لأسباب أمنية (عدم تخزين كلمات مرور أو تعديل إعدادات Auth العامة تلقائيًا دون موافقتك)، تبقى 3 خطوات سريعة في لوحة التحكم:

### 1. تعطيل التسجيل العام (Disable Public Sign-Up) في Supabase
1. افتح لوحة تحكم مشروعك في Supabase → **Authentication → Sign In / Providers** (أو **Providers → Email**).
2. أوقف خيار **Allow new users to sign up** واضغط **Save**.

### 2. إنشاء حساب الأدمن الوحيد وربطه بقائمة الإدارة
1. افتح **Authentication → Users → Add user → Create new user**.
2. أدخل بريدك الإلكتروني المعتمد (مثل `eng.abdullah.sheif@gmail.com`) وكلمة مرور قوية، وفعّل خيار **Auto Confirm User** ثم اضغط **Create user**.
3. بعد إنشاء المستخدم، أخبرني في المحادثة لأضيفه فورًا إلى `private.admin_users` تلقائيًا، **أو** نفّذ هذا السطر مرة واحدة في **SQL Editor**:
```sql
INSERT INTO private.admin_users (user_id, email)
SELECT id, email FROM auth.users WHERE email = 'eng.abdullah.sheif@gmail.com'
ON CONFLICT (user_id) DO NOTHING;
```

### 3. إضافة متغيرات البيئة في Vercel (عند النشر)
في **Vercel → Project Settings → Environment Variables** أضف المتغيرين التاليين (بنفس قيمهما في `.env.local` المحلي):
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

*(لا تُضِف أبدًا `service_role` أو أي مفتاح سري في متغيرات `VITE_*`).*
