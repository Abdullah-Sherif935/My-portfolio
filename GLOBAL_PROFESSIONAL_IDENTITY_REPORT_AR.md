# تقرير توحيد الهوية المهنية الشاملة للموقع (Global Professional Identity Consistency Report)

**المشروع:** عبدالله شريف — المنصة والملف الهندسي المهني (`https://portfolio.eng-abdullah.work`)
**التاريخ:** 2026-11-24
**النطاق:** مراجعة وتوحيد الهوية المهنية عبر كافة صفحات الموقع، والترجمة العربية والإنجليزية، ووضع مسؤول التوظيف، ومنشئ السيرة الذاتية الذكي، وبيانات SEO، وقاعدة بيانات Supabase الحية — دون إعادة تصميم الموقع أو استبدال هوية **مهندس ميكاترونكس**.

---

## 1. الهوية المهنية المعتمدة (ثنائية متكاملة)

1. **الهوية الأكاديمية والأساسية (مُحافظ عليها بالكامل):**
   - **EN:** `Mechatronics Engineer`
   - **AR:** `مهندس ميكاترونكس`
2. **التخصص الوظيفي الحالي:**
   - **EN:** `HVAC Equipment & Sheet Metal Design Engineer`
   - **AR:** `مهندس تصميم معدات التبريد والتكييف وتصميم الصاج`
3. **الوصف المهني المعتمد لنطاق العمل الحالي:**
   - **EN:** *"Mechanical design of industrial HVAC and refrigeration equipment, specializing in sheet metal enclosures, structural assemblies, electrical control panel design, and manufacturing preparation. Experienced in SolidWorks, DXF generation, CNC fiber laser cutting, bending, and production follow-up."*
   - **AR:** *"التصميم الميكانيكي لمعدات التبريد والتكييف الصناعية، مع التركيز على تصميم الهياكل الخارجية وأغلفة الصاج والتجميعات الميكانيكية، وتصميم لوحات التحكم الكهربائية وتجهيز ملفات التصنيع. خبرة في استخدام SolidWorks وإعداد ملفات DXF وتجهيز أعمال القطع بالليزر CNC ومتابعة عمليات الثني والتصنيع والتجميع."*

---

## 2. نتائج التدقيق الأولي (ما تم اكتشافه قبل التعديل)
كشف الفحص الشامل لقاعدة الكود (`src/`, `index.html`) وقاعدة بيانات Supabase الحية عن المواضع التالية التي احتاجت إلى توحيد وتصحيح:
- استخدام مسمى عام أو ملتبس (`HVAC & Refrigeration Design` / `تصميم التكييف والتبريد`) بدلاً من التخصص الدقيق (`HVAC Equipment & Sheet Metal Design Engineer`).
- وجود عبارات غير موثّقة في تخصص `DISC-01` (`public.specializations` و `src/data/specializations.ts`) مثل: `Thermal load evaluation`، `chilled water and DX systems`، `refrigeration circuits`، `airflow distribution`، `equipment commissioning`، `Ducting & Hydronic Piping` / `تقييم الأحمال الحرارية`، `المياه المثلجة`، `مجاري الهواء وشبكات المواسير`.
- وجود عبارة `Refrigeration Circuits` / `دوائر التبريد` في مجموعة المهارات `SKL-01` وفي إحدى نقاط خبرة `Sccoder` وفي ملخص `hvac-design` في السيرة الذاتية.
- خلط عنوان قسم التخصصات بعبارة `thermal systems` / `الأنظمة الحرارية`.

---

## 3. جميع المواضع التي تم تحديثها

### أ) الكود والترجمة و SEO
- [`src/features/home/sections/HeroSection.tsx`](file:///e:/Eng%20Abdullah/Antigravity/poject%201/src/features/home/sections/HeroSection.tsx): عرض الهوية الأساسية (`Mechatronics Engineer` / `مهندس ميكاترونكس`) كعنوان بارز ويليها مباشرة سطر التخصص الوظيفي (`HVAC Equipment & Sheet Metal Design Engineer` / `مهندس تصميم معدات التبريد والتكييف وتصميم الصاج`) من نفس حقل `profile.headline` الموحّد دون أي ازدواجية في البيانات.
- [`src/data/profile.ts`](file:///e:/Eng%20Abdullah/Antigravity/poject%201/src/data/profile.ts) و [`src/data/adminMock.ts`](file:///e:/Eng%20Abdullah/Antigravity/poject%201/src/data/adminMock.ts): تحديث `headline`, `summary`, `seoTitle`, `seoDescription`, `INITIAL_CV_CONFIG.targetRole`, و `DEFAULT_HOME_SECTIONS_CONFIG`.
- [`src/data/specializations.ts`](file:///e:/Eng%20Abdullah/Antigravity/poject%201/src/data/specializations.ts): تحديث `DISC-01` بالوصف المعتمد والنقاط الفنية الدقيقة وإزالة جميع ادعاءات الأحمال الحرارية والمواسير ودوائر التبريد.
- [`src/data/experience.ts`](file:///e:/Eng%20Abdullah/Antigravity/poject%201/src/data/experience.ts): تحديث `exp-sccoder` بالمسمى المعتمد والملخص ونطاق المسؤوليات الميكانيكية والتصنيعية والكهربائية الدقيقة.
- [`src/data/skills.ts`](file:///e:/Eng%20Abdullah/Antigravity/poject%201/src/data/skills.ts): تحديث `SKL-01` إلى `HVAC Equipment & Sheet Metal Design` بـ 4 مهارات موثّقة في التصميم الهيكلي والصاج و DXF ولوحات التحكم الكهربائية.
- [`index.html`](file:///e:/Eng%20Abdullah/Antigravity/poject%201/index.html)، [`en/home.json`](file:///e:/Eng%20Abdullah/Antigravity/poject%201/src/i18n/locales/en/home.json)، [`ar/home.json`](file:///e:/Eng%20Abdullah/Antigravity/poject%201/src/i18n/locales/ar/home.json)، [`en/pages.json`](file:///e:/Eng%20Abdullah/Antigravity/poject%201/src/i18n/locales/en/pages.json)، [`ar/pages.json`](file:///e:/Eng%20Abdullah/Antigravity/poject%201/src/i18n/locales/ar/pages.json): توحيد النصوص التمهيدية و SEO باللغتين.

### ب) وضع مسؤول التوظيف ومنشئ السيرة الذاتية
- [`src/services/recruiterMatcher.ts`](file:///e:/Eng%20Abdullah/Antigravity/poject%201/src/services/recruiterMatcher.ts): تحديث بطاقة الوظيفة `hvac-design` إلى `HVAC Equipment & Sheet Metal Design Engineer` / `مهندس تصميم معدات التبريد والتكييف وتصميم الصاج` مع وصف يعكس التصميم الميكانيكي الهيكلي والصاج و SolidWorks و DXF والليزر CNC ولوحات التحكم الكهربائية، وتحديث `filenameSlug` إلى `HVAC_Equipment_and_Sheet_Metal_Design_Engineer`.
- [`src/services/cvPresentation.ts`](file:///e:/Eng%20Abdullah/Antigravity/poject%201/src/services/cvPresentation.ts): تحديث الملخص المولّد لوظيفة `hvac-design` بالعربية والإنجليزية ليعكس التأسيس الأكاديمي في الميكاترونكس + النطاق الميكانيكي والتصنيعي المعتمد دون أي ادعاء لحسابات التبريد أو دوائر التبريد، مع التحقق من أن ملخصات الوظائف الأخرى (`robotics-mechatronics`, `mechanical-design`, `automation-control`, `manufacturing`) تركز على تخصصها الفعلي.

### ج) تحديثات Supabase الحية (بدون ترحيل هيكلي زائد)
تم تحديث السجلات القائمة مباشرة في مشروع الإنتاج (`xgrhtukgudnbmtovghlw`) مع الحفاظ على كافة سياسات RLS والبيانات الأخرى:
- `public.profiles` (`owner-profile`): تحديث `headline` و `summary`.
- `public.site_settings` (`default`): تحديث `seo_title`, `seo_description`, و `home_sections_config.intro.description` + `specializations.subtitle` باستخدام `jsonb_set` مع **الحفاظ التام** على ركائز المستخدم المخصصة بما فيها `SYS-04`.
- `public.specializations` (`hvac-refrigeration`): تحديث `description` و `highlights`.
- `public.experience` (`exp-sccoder`): تحديث `role`, `summary`, `responsibilities`.
- `public.skill_groups` (`hvac-refrigeration`): تحديث `title`, `description`, `skills`.
- `public.cv_workspace_config` (`default`): تحديث `target_role`.

---

## 4. المواضع التي تم الحفاظ عليها عمداً
- **هوية `Mechatronics Engineer` / `مهندس ميكاترونكس`** في Hero و About و Education و Recruiter Mode وقوالب السيرة الذاتية (ATS و Modern).
- **السجل الأكاديمي (`edu-ain-shams-mechatronics`)** بالكامل دون تغيير (جامعة عين شمس، 2021–2026، GPA 2.94، المقررات، ومشروع التخرج `Flex Bot`).
- **جهة العمل وتواريخها (`Sccoder — HVAC & Refrigeration`, `April 2026 – Present`)** وسجلات التدريب الصناعي (`Ceramica Cleopatra`, `Farma Swede Masr`).
- **جميع المشاريع الـ 5 القائمة** (`Flex Bot`, `6-DOF Inspection Robot Arm`, `Water Turbine`, `RC Car`, `DC Motor Parameter Estimation`) دون أي تعديل على أوصافها.
- **جميع التخصصات `DISC-02`..`DISC-06`** ومجموعات المهارات **`SKL-02`..`SKL-05`** (بما فيها الروبوتات والأتمتة و PLC و CAD).
- **ركيزة `SYS-04`** التي أضافها المالك بنفسه في إعدادات الرئيسية.

---

## 5. لقطات الشاشة الموثّقة
1. **الصفحة الرئيسية (EN) — الهوية المزدوجة في Hero:** [qa_identity_home_en.png](file:///C:/Users/X%20IT/.gemini/antigravity/brain/43f7ca94-671e-4682-8066-c0c109970609/qa_identity_home_en.png)
2. **صفحة الخبرات (EN) — `Sccoder` بالمسمى والمسؤوليات المحدّثة:** [qa_identity_experience_en.png](file:///C:/Users/X%20IT/.gemini/antigravity/brain/43f7ca94-671e-4682-8066-c0c109970609/qa_identity_experience_en.png)
3. **السيرة الذاتية — قالب ATS (EN) لوظيفة `HVAC Equipment & Sheet Metal Design Engineer`:** [qa_identity_cv_ats_hvac_en.png](file:///C:/Users/X%20IT/.gemini/antigravity/brain/43f7ca94-671e-4682-8066-c0c109970609/qa_identity_cv_ats_hvac_en.png)
4. **السيرة الذاتية — قالب Modern Engineering (العربية RTL):** [qa_identity_cv_modern_ar.png](file:///C:/Users/X%20IT/.gemini/antigravity/brain/43f7ca94-671e-4682-8066-c0c109970609/qa_identity_cv_modern_ar.png)
5. **الصفحة الرئيسية (العربية RTL) — الهوية المزدوجة في Hero:** [qa_identity_home_ar.png](file:///C:/Users/X%20IT/.gemini/antigravity/brain/43f7ca94-671e-4682-8066-c0c109970609/qa_identity_home_ar.png)

---

## 6. نتائج الاختبارات الفعلية
| الاختبار | النتيجة | التفاصيل |
|---|---|---|
| فحص النص الشامل (`src/` و `index.html`) | **PASS** | `0` مطابقات لعبارات غير موثّقة أو مسميات ملتبسة |
| صحة جميع ملفات الترجمة JSON (`en` و `ar`) | **PASS** | 6/6 ملفات JSON صالحة (`JSON.parse`) |
| `npm run typecheck` (`tsc -b --noEmit`) | **PASS** | 0 أخطاء |
| `npm run lint` (`eslint .`) | **PASS** | 0 أخطاء و 0 تحذيرات |
| `npm run build` (`vite build`) | **PASS** | بناء إنتاجي ناجح في 4.75 ثانية |
| اختبار Chrome QA الحي (5/5 خطوات) | **PASS** | Home (EN/AR) · About · Experience · Skills · Recruiter Mode · ATS & Modern CVs (بما فيها تكييف ملخص Robotics) · `0` أخطاء Console · `0` طلبات شبكة فاشلة |

---

## 7. ملاحظات متبقية بشفافية
- الركيزة `SYS-02` في `site_settings.home_sections_config` (القابلة للتعديل مباشرة من `/admin/pages/home?tab=profile-academic`) ما زالت تحتوي على عبارة `refrigeration troubleshooting` / `تشخيص أعطال التبريد` ضمن وصف الصيانة الدورية للمعدات — وهي غير متعلقة بحسابات الأحمال أو تصميم دورة التبريد، ويمكنك تعديلها في أي لحظة مباشرة من لوحة التحكم إذا أردت صياغة أخرى.
- أسماء الفئات الثابتة للمعرض (`HVAC & Refrigeration`) وجهة العمل (`Sccoder — HVAC & Refrigeration`) أُبقيت كتصنيف قطاع صناعي كما هو مصرّح به تماماً في المتطلبات.
