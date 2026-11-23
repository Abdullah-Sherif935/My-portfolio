# تقرير تنفيذ ودمج بيانات السيرة الذاتية (المرحلة 01) — عبدالله شريف عبدالرؤوف

> **تاريخ التحديث:** 22 نوفمبر 2026  
> **النطاق:** دمج البيانات الموثّقة من السيرة الذاتية (`Abdullah_Sherif_Resume.pdf`) كمصدر بيانات مبدئي منظّم وقابل للتعديل بالكامل، مع تجهيز البنية للترحيل المستقبلي إلى **Supabase** دون تعديل كود الواجهة الأمامية.  
> **رابط المعاينة المحلية:** `http://localhost:5173/`

---

## 1. ملخص ما تم تنفيذه وإضافته

تم فصل طبقة البيانات بالكامل عن مكونات الواجهة عبر طبقة `src/data/` مع نماذج TypeScript مرنة (`src/types/portfolio.ts`) تدعم إضافة وتعديل وحذف السجلات مستقبلاً، مع التمييز الصريح بين:
- `cv-initial`: السجلات المهيأة من السيرة الذاتية الأولية (**قابلة للتعديل**).
- `placeholder`: السجلات التمهيدية القابلة للتعديل (مثل بطاقات الشركات والعملاء الصناعيين).
- `cms`: القيمة الجاهزة مستقبلاً للسجلات المُدارة عبر قاعدة بيانات Supabase.

---

## 2. البيانات الموثّقة التي تم دمجها (دون أي اختلاق أو إضافة غير واردة في السيرة)

### أ) الملف الشخصي والتعليم — `src/data/profile.ts`
- **الاسم الكامل:** Abdullah Sherif Abdulraouf (`عبدالله شريف عبدالرؤوف`).
- **المسمى المهني:** `Mechatronics Engineer — HVAC & Refrigeration Design`.
- **الموقع:** `10th of Ramadan City, Sharqia, Egypt`.
- **التعليم الأكاديمي:**
  - **الدرجة العلمية:** `Bachelor of Engineering in Mechatronics Engineering` (بكالوريوس هندسة الميكاترونكس).
  - **الجامعة:** `Ain Shams University, Faculty of Engineering` (كلية الهندسة — جامعة عين شمس).
  - **الفترة والتخرج:** `2021 – 2026` (دفعة 2026) | `GPA: 2.94 (Very Good)`.
  - **المقررات ذات الصلة:** Control Systems, Robotics, Embedded Systems, PLC Programming, CAD Design, Electrical Circuits, Fluid Mechanics.
- **اللغات:** العربية (اللغة الأم)، الإنجليزية (متوسط).
- **الكفاءات الأساسية (Core Competencies):** Problem Solving, Critical Thinking, Teamwork & Collaboration, Adaptability, Time Management, Effective Communication, Leadership.
- **قنوات التواصل الأولية (قابلة للتعديل):**
  - البريد الإلكتروني: `eng.abdullah.sheif@gmail.com`
  - لينكدإن: `linkedin.com/in/abdullah-sherif-abdulraouf` (مع `rel="noopener noreferrer"`).
  - جيت هاب: مهيأ كنموذج قابل للتعديل (لم يُختلق رابط غير موجود).

### ب) الخبرات المهنية والتدريب الصناعي — `src/data/experience.ts`
1. **HVAC & Refrigeration Design Engineer (Sheet Metal Design, CNC Operation & Classic Control)** — **Sccoder (HVAC & Refrigeration)** — *أبريل 2026 – حتى الآن*:
   - تصميم التشيلرات الصناعية (60 إلى 240 طن تبريد)، غرف التبريد، ووحدات التكييف المركزي حتى التصنيع الفعلي.
   - تصميم أجزاء وتجميعات الصاج باستخدام SolidWorks.
   - العمل على خط الإنتاج من القطع بليزر الفايبر CNC (وتوزيع الأجزاء Nesting) حتى الثني والتشكيل.
   - دعم تشخيص أعطال دوائر التبريد والتكييف أثناء الإنتاج والاختبار.
   - الصيانة الدورية للمعدات ودعم لوحات التحكم الكلاسيكي ومهام PLC لخطوط الإنتاج.
2. **Mechanical & Electrical Trainee** — **Ceramica Cleopatra** — *يوليو – أغسطس 2025*.
3. **Trainee** — **Farma Swede Masr** — *يوليو – أغسطس 2024*.

### ج) المشاريع الهندسية — `src/data/projects.ts`
تم إدراج المشاريع الـ 5 الواردة في السيرة الذاتية بمسمياتها وتفاصيلها الموثّقة:
1. **Flex Bot — Autonomous Hospital Mobile Manipulator** *(مشروع التخرج 2026 — `PRJ-GRAD-01`)*:
   - مبني على `ROS 2` مع ذراع `6-DOF` (`MoveIt 2`, `TF/TF2`)، وتحكم منخفض المستوى بـ `ESP32-S3` وإنكودر Odometry، ورؤية حاسوبية `YOLOv8` و `Roboflow` للتعرف على أزرار المصاعد ومقابض الأبواب.
2. **6-DOF Inspection Robot Arm** (`PRJ-ROB-02`).
3. **Water Turbine** (`PRJ-MEC-03`).
4. **Line-Following & Obstacle-Avoiding RC Car** (`PRJ-MCT-04`).
5. **DC Motor Parameter Estimation** (`PRJ-CTL-05`).

### د) المهارات التقنية والدورات — `src/data/skills.ts` و `src/data/certifications.ts`
- **5 مجموعات مهارات مصنّفة** (بدون نسب مئوية شكلية): HVAC & Refrigeration، CAD & Simulation، Manufacturing & Control & Maintenance، Robotics & Vision & Embedded Systems، و Productivity & AI Tools.
- **الدورات التقنية الواردة في السيرة:** `SolidWorks Sheet Metal Design`، `Classic Control`، و `AI Tools & Applications` (مع إبقاء الجهة المانحة والتاريخ والرابط حقولاً قابلة للتعديل دون اختلاق).

### هـ) الشركات والعملاء الصناعيون — `src/data/companies.ts`
- الإبقاء على البطاقات النصية التمهيدية القابلة للتعديل لـ **Elsewedy**، **ARMA**، **Al Dar Engineering**، و **Abdel Maboud** بدون شعارات رسمية أو ادعاءات غير موثّقة، مع إزالة أي ربط غير حقيقي بمشاريع التخرج الأكاديمية وتجهيز البطاقة لعرض المشاريع الصناعية فور إضافتها لاحقاً.

---

## 3. الملفات المضافة والمحدّثة

| الملف | الوصف |
| :--- | :--- |
| `src/types/portfolio.ts` | تحديث نماذج البيانات لتشمل `EditableRecord`، `DataSource`، `ProfileData`، `EducationItem`، وتصنيفات المشاريع والخبرات |
| `src/data/profile.ts` | إنشاء مصدر مركزي لبيانات الملف الشخصي والتعليم واللغات والكفاءات وقنوات التواصل |
| `src/data/experience.ts` | تهيئة سجلات الخبرة والتدريب (Sccoder، Ceramica Cleopatra، Farma Swede Masr) |
| `src/data/projects.ts` | تهيئة مشروع التخرج Flex Bot والمشاريع الهندسية الـ 4 الأخرى |
| `src/data/skills.ts` | تهيئة المهارات التقنية المصنفة من السيرة الذاتية |
| `src/data/certifications.ts` | تهيئة الدورات التقنية من السيرة الذاتية مع حقول توثيق قابلة للتعديل |
| `src/data/companies.ts` | الحفاظ على نماذج الشركات الـ 4 القابلة للتعديل بدون روابط مشاريع مختلقة |
| `src/data/index.ts` | نقطة تصدير مركزية لطبقة البيانات لتسهيل الترحيل المستقبلي إلى Supabase |
| `src/i18n/locales/{en,ar}/*.json` | تحديث ومزامنة جميع النصوص الإنجليزية والعربية (تطابق مفاتيح 100%) |
| `src/features/home/sections/*` | ربط Hero و Intro و Experience و Certifications و Contact ديناميكياً بطبقة `src/data` |
| `src/features/about/AboutPage.tsx` | عرض التعليم والمقررات واللغات والكفاءات الأساسية ديناميكياً من `src/data/profile.ts` |
| `src/features/portfolio/*` & `companies/*` & `experience/*` & `contact/*` & `Footer.tsx` | دعم العرض الديناميكي لشارة `CV Initial · Editable` وحالة عدم وجود مشاريع مرتبطة |
| `public/favicon.svg` & `index.html` | إضافة أيقونة Favicon هندسية رسمية لإزالة خطأ `404` لـ `favicon.ico` |
| `src/styles/index.css` | إصلاح أولوية CSS لإزالة تباعد الأحرف والخط أحادي العرض عن العناوين العربية المصغّرة في وضع `RTL` |

---

## 4. نتائج الفحص والتحقق بعد التحديث

| الفحص | النتيجة | الملاحظات |
| :--- | :---: | :--- |
| فحص TypeScript الصارم (`npm run typecheck`) | **نجح (0 أخطاء)** | `exit code 0` |
| فحص ESLint (`npm run lint`) | **نجح (0 أخطاء)** | `exit code 0` |
| بناء الإنتاج (`npm run build`) | **نجح** | بناء كامل مع تقسيم الحزم بدون تحذيرات |
| تطابق ملفات الترجمة (`EN` / `AR`) | **نجح (100%)** | `0` مفاتيح ناقصة، `0` روابط مشاريع مكسورة |
| فحص Chrome المباشر (`/`، `/about`، `/portfolio/flex-bot-...`) | **نجح** | ظهور جميع بيانات السيرة الذاتية الموثّقة بـ `0` أخطاء JavaScript/React |
| إصلاحات ما بعد الفحص البصري | **تم تنفيذها** | إضافة `public/favicon.svg` + إصلاح CSS للعناوين العربية المصغّرة خارج `@layer base` |

---

## 5. الجاهزية للمراحل القادمة (Phase 02+)

- يمكن إضافة مشاريع ما بعد التخرج (التشيلرات، غرف التبريد، لوحات التحكم الكهربائية، أعمال الصيانة، ومشاريع العملاء الصناعيين) أو تعديل/حذف أي سجل بمجرد تحديث `src/data/*` الآن أو ربطه بجداول **Supabase PostgreSQL** لاحقاً دون تغيير مكونات الواجهة الأمامية.
- تبقى المرحلة 02 جاهزة لبناء مخطط قاعدة البيانات في `supabase/migrations/`، والمصادقة الآمنة مع سياسات **Row Level Security (RLS)**، ولوحة الإدارة `/admin/*`، ومنشئ السيرة الذاتية الذكي وتصدير PDF في `/career/cv-builder`.
