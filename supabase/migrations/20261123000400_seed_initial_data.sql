-- ============================================================================
-- Phase 04 Migration 04: Idempotent Seed of Verified CV & Portfolio Records
-- Preserves all existing records without loss, duplication, or fabrication.
-- Uses ON CONFLICT (id) DO NOTHING for safe re-execution.
-- ============================================================================

-- 1. Profile
INSERT INTO public.profiles (
  id, full_name, short_name, headline, summary, location,
  avatar_url, avatar_alt, contact, languages, core_competencies,
  data_source, is_editable, is_published
) VALUES (
  'owner-profile',
  '{"en":"Abdullah Sherif Abdulraouf","ar":"عبدالله شريف عبدالرؤوف"}'::jsonb,
  '{"en":"Abdullah Sherif","ar":"عبدالله شريف"}'::jsonb,
  '{"en":"Mechatronics Engineer | HVAC & Refrigeration Design","ar":"مهندس ميكاترونكس | تصميم التكييف والتبريد"}'::jsonb,
  '{"en":"Mechatronics Engineering graduate (2026) from Ain Shams University with hands-on experience in HVAC & refrigeration design and manufacturing — including industrial chillers, cold rooms, and central air-conditioning units — combined with a foundation in mechanical design, sheet metal production, classic/PLC control systems, and robotics.","ar":"خريج هندسة الميكاترونكس (2026) من جامعة عين شمس، بخبرة عملية في تصميم وتصنيع أنظمة التكييف والتبريد — بما في ذلك التشيلرات الصناعية وغرف التبريد ووحدات التكييف المركزي — إلى جانب أساس قوي في التصميم الميكانيكي وإنتاج الصاج وأنظمة التحكم الكلاسيكي و PLC والروبوتات."}'::jsonb,
  '{"en":"10th of Ramadan City, Sharqia, Egypt","ar":"مدينة العاشر من رمضان، الشرقية، مصر"}'::jsonb,
  '/images/abdullah-portrait.jpg',
  '{"en":"Portrait of Abdullah Sherif Abdulraouf, Mechatronics Engineer","ar":"الصورة الشخصية للمهندس عبدالله شريف عبدالرؤوف — مهندس ميكاترونكس"}'::jsonb,
  '{"email":"eng.abdullah.sheif@gmail.com","linkedinUrl":"https://www.linkedin.com/in/abdullah-sherif-abdulraouf","linkedinDisplay":"linkedin.com/in/abdullah-sherif-abdulraouf","websiteDisplay":"eng-abdullah.work","githubUrl":null,"githubDisplay":{"en":"GitHub profile — To be added","ar":"حساب GitHub — يُضاف لاحقاً"}}'::jsonb,
  '[{"name":{"en":"Arabic","ar":"العربية"},"proficiency":{"en":"Native","ar":"اللغة الأم"}},{"name":{"en":"English","ar":"الإنجليزية"},"proficiency":{"en":"Intermediate","ar":"متوسط"}}]'::jsonb,
  '[{"en":"Problem Solving","ar":"حل المشكلات"},{"en":"Critical Thinking","ar":"التفكير النقدي"},{"en":"Teamwork & Collaboration","ar":"العمل الجماعي والتعاون"},{"en":"Adaptability","ar":"المرونة والتكيف"},{"en":"Time Management","ar":"إدارة الوقت"},{"en":"Effective Communication","ar":"التواصل الفعال"},{"en":"Leadership","ar":"القيادة"}]'::jsonb,
  'cv-initial',
  true,
  true
) ON CONFLICT (id) DO NOTHING;

-- 2. Education
INSERT INTO public.education (
  id, degree, institution, period, start_year, graduation_year, grade,
  graduation_project_slug, coursework, data_source, is_editable, display_order, is_published
) VALUES (
  'edu-ain-shams-mechatronics',
  '{"en":"Bachelor of Engineering in Mechatronics Engineering","ar":"بكالوريوس الهندسة — هندسة الميكاترونكس"}'::jsonb,
  '{"en":"Ain Shams University, Faculty of Engineering","ar":"كلية الهندسة — جامعة عين شمس"}'::jsonb,
  '{"en":"2021 – 2026","ar":"2021 – 2026"}'::jsonb,
  '2021',
  '2026',
  '{"en":"GPA: 2.94 (Very Good)","ar":"المعدل التراكمي: 2.94 (جيد جداً)"}'::jsonb,
  'flex-bot-autonomous-hospital-mobile-manipulator',
  '[{"en":"Control Systems","ar":"أنظمة التحكم"},{"en":"Robotics","ar":"الروبوتات"},{"en":"Embedded Systems","ar":"الأنظمة المدمجة"},{"en":"PLC Programming","ar":"برمجة PLC"},{"en":"CAD Design","ar":"التصميم بمساعدة الحاسوب CAD"},{"en":"Electrical Circuits","ar":"الدوائر الكهربائية"},{"en":"Fluid Mechanics","ar":"ميكانيكا الموائع"}]'::jsonb,
  'cv-initial',
  true,
  1,
  true
) ON CONFLICT (id) DO NOTHING;

-- 3. Companies (placeholder industrial records preserved honestly)
INSERT INTO public.companies (
  id, slug, name, monogram, logo_url, industry,
  relationship_category, relationship_type, services_provided,
  related_project_slugs, data_source, is_editable, display_order, is_published
) VALUES
(
  'elsewedy',
  'elsewedy',
  '{"en":"Elsewedy","ar":"السويدي"}'::jsonb,
  'ES',
  NULL,
  '{"en":"Industrial Sector — Pending Confirmation","ar":"القطاع الصناعي — قيد التأكيد"}'::jsonb,
  'unconfirmed',
  '{"en":"Engagement Type — Pending Confirmation","ar":"طبيعة التعامل — قيد التأكيد"}'::jsonb,
  '[{"en":"Verified services scope will be published once documented.","ar":"سيتم نشر نطاق الخدمات الموثّق فور استكمال التوثيق."}]'::jsonb,
  '{}',
  'placeholder',
  true,
  1,
  true
),
(
  'arma',
  'arma',
  '{"en":"ARMA","ar":"أرما"}'::jsonb,
  'AR',
  NULL,
  '{"en":"Industrial Sector — Pending Confirmation","ar":"القطاع الصناعي — قيد التأكيد"}'::jsonb,
  'unconfirmed',
  '{"en":"Engagement Type — Pending Confirmation","ar":"طبيعة التعامل — قيد التأكيد"}'::jsonb,
  '[{"en":"Verified services scope will be published once documented.","ar":"سيتم نشر نطاق الخدمات الموثّق فور استكمال التوثيق."}]'::jsonb,
  '{}',
  'placeholder',
  true,
  2,
  true
),
(
  'al-dar-engineering',
  'al-dar-engineering',
  '{"en":"Al Dar Engineering","ar":"الدار الهندسية"}'::jsonb,
  'AD',
  NULL,
  '{"en":"Industrial Sector — Pending Confirmation","ar":"القطاع الصناعي — قيد التأكيد"}'::jsonb,
  'unconfirmed',
  '{"en":"Engagement Type — Pending Confirmation","ar":"طبيعة التعامل — قيد التأكيد"}'::jsonb,
  '[{"en":"Verified services scope will be published once documented.","ar":"سيتم نشر نطاق الخدمات الموثّق فور استكمال التوثيق."}]'::jsonb,
  '{}',
  'placeholder',
  true,
  3,
  true
),
(
  'abdel-maboud',
  'abdel-maboud',
  '{"en":"Abdel Maboud","ar":"عبد المعبود"}'::jsonb,
  'AM',
  NULL,
  '{"en":"Industrial Sector — Pending Confirmation","ar":"القطاع الصناعي — قيد التأكيد"}'::jsonb,
  'unconfirmed',
  '{"en":"Engagement Type — Pending Confirmation","ar":"طبيعة التعامل — قيد التأكيد"}'::jsonb,
  '[{"en":"Verified services scope will be published once documented.","ar":"سيتم نشر نطاق الخدمات الموثّق فور استكمال التوثيق."}]'::jsonb,
  '{}',
  'placeholder',
  true,
  4,
  true
)
ON CONFLICT (id) DO NOTHING;

-- 4. Projects (5 initial CV-verified records)
INSERT INTO public.projects (
  id, slug, code, kind, kind_label, title, short_description, overview,
  category, category_label, cover_variant, technologies, deliverables,
  status_label, featured, data_source, is_editable, display_order, is_published
) VALUES
(
  'proj-flex-bot',
  'flex-bot-autonomous-hospital-mobile-manipulator',
  'PRJ-GRAD-01',
  'graduation',
  '{"en":"Graduation Project (2026)","ar":"مشروع التخرج (2026)"}'::jsonb,
  '{"en":"Flex Bot — Autonomous Hospital Mobile Manipulator","ar":"Flex Bot — روبوت متنقل ذاتي الحركة بذراع آلية للمستشفيات"}'::jsonb,
  '{"en":"Autonomous Mobile Robot with a 6-DOF Robotic Arm built on ROS 2, designed to navigate hospital environments, operate elevators and doors, and handle secure medical supply delivery.","ar":"روبوت متنقل ذاتي الحركة مزوّد بذراع آلية سداسية المحاور (6-DOF) مبني على ROS 2، مصمم للتنقل داخل المستشفيات وتشغيل المصاعد والأبواب وتوصيل الإمدادات الطبية بأمان."}'::jsonb,
  '{"en":"Graduation project for the Bachelor of Engineering in Mechatronics Engineering at Ain Shams University (2026). Integrates autonomous mobile navigation, low-level embedded motor control, computer vision for elevator buttons and door handles, and vision-guided 6-DOF manipulation on ROS 2.","ar":"مشروع التخرج لدرجة بكالوريوس هندسة الميكاترونكس بجامعة عين شمس (2026). يجمع بين الملاحة الذاتية للقاعدة المتنقلة، التحكم المدمج منخفض المستوى بالمحركات، الرؤية الحاسوبية للتعرف على أزرار المصاعد ومقابض الأبواب، والتحكم بالذراع الآلية 6-DOF الموجهة بالرؤية عبر ROS 2."}'::jsonb,
  'robotics-mechatronics',
  '{"en":"Robotics & Mechatronics","ar":"الروبوتات والميكاترونكس"}'::jsonb,
  'robotics',
  ARRAY['ROS 2','MoveIt 2','TF / TF2','ESP32-S3','YOLOv8','Roboflow','6-DOF Manipulator'],
  '[{"en":"Full mechanical and electrical design of the mobile base and 6-DOF manipulator.","ar":"التصميم الميكانيكي والكهربائي الكامل للقاعدة المتنقلة والذراع الآلية 6-DOF."},{"en":"Low-level motor control of the mobile base using ESP32-S3 with encoder-based odometry.","ar":"التحكم منخفض المستوى بمحركات القاعدة المتنقلة باستخدام ESP32-S3 وقياس المسافة بالإنكودر (Odometry)."},{"en":"Machine vision model training and deployment using YOLOv8 and Roboflow for elevator-button and door-handle detection.","ar":"تدريب ونشر نموذج رؤية حاسوبية باستخدام YOLOv8 و Roboflow للتعرف على أزرار المصاعد ومقابض الأبواب."},{"en":"Forward and inverse kinematics configuration for the 6-DOF arm using MoveIt 2, with arm-to-camera coordinate frame linking via TF/TF2 for vision-guided manipulation.","ar":"إعداد الكينماتيكا الأمامية والعكسية للذراع 6-DOF عبر MoveIt 2، وربط الإطار الإحداثي للذراع بإطار الكاميرا عبر TF/TF2 للمناولة الموجهة بالرؤية."}]'::jsonb,
  '{"en":"Initial CV Record (Editable)","ar":"سجل أولي من السيرة الذاتية (قابل للتعديل)"}'::jsonb,
  true,
  'cv-initial',
  true,
  1,
  true
),
(
  'proj-6dof-inspection',
  '6-dof-inspection-robot-arm',
  'PRJ-ROB-02',
  'engineering',
  '{"en":"Engineering Project","ar":"مشروع هندسي"}'::jsonb,
  '{"en":"6-DOF Inspection Robot Arm","ar":"ذراع روبوتية سداسية المحاور للفحص الصناعي (6-DOF Inspection Robot Arm)"}'::jsonb,
  '{"en":"Designed a 6-DOF robotic arm to increase inspection accuracy for industrial parts such as automotive chassis.","ar":"تصميم ذراع روبوتية سداسية المحاور (6-DOF) لرفع دقة الفحص للأجزاء الصناعية مثل شاسيهات السيارات."}'::jsonb,
  '{"en":"Engineering design of a 6-DOF robotic arm focused on improving inspection accuracy for industrial components such as automotive chassis. Detailed drawings, renderings, and technical specifications can be appended by the owner through future CMS updates.","ar":"تصميم هندسي لذراع روبوتية سداسية المحاور (6-DOF) يهدف إلى رفع دقة فحص الأجزاء الصناعية مثل شاسيهات السيارات. يمكن إضافة الرسومات التفصيلية والصور والمواصفات الفنية لاحقاً عبر نظام إدارة المحتوى."}'::jsonb,
  'robotics-mechatronics',
  '{"en":"Robotics & Mechatronics","ar":"الروبوتات والميكاترونكس"}'::jsonb,
  'robotics',
  ARRAY['6-DOF Robotic Arm','Mechanical Design','Industrial Inspection','CAD'],
  '[{"en":"6-DOF robotic arm design tailored for industrial part inspection (e.g., automotive chassis).","ar":"تصميم ذراع روبوتية 6-DOF مخصصة لفحص الأجزاء الصناعية مثل شاسيهات السيارات."}]'::jsonb,
  '{"en":"Initial CV Record (Editable)","ar":"سجل أولي من السيرة الذاتية (قابل للتعديل)"}'::jsonb,
  true,
  'cv-initial',
  true,
  2,
  true
),
(
  'proj-water-turbine',
  'water-turbine',
  'PRJ-MEC-03',
  'engineering',
  '{"en":"Engineering Project","ar":"مشروع هندسي"}'::jsonb,
  '{"en":"Water Turbine","ar":"تصميم توربينة مياه (Water Turbine)"}'::jsonb,
  '{"en":"Designed a water turbine system aimed at generating clean, renewable energy.","ar":"تصميم منظومة توربينة مياه تهدف إلى توليد طاقة نظيفة ومتجددة."}'::jsonb,
  '{"en":"Mechanical engineering project centered on designing a water turbine system for clean, renewable energy generation. Additional CAD visuals, calculations, and test documentation can be attached as records expand.","ar":"مشروع تصميم ميكانيكي يركز على تصميم منظومة توربينة مياه لتوليد طاقة نظيفة ومتجددة. يمكن إرفاق صور CAD والحسابات الهندسية لاحقاً عند التوسع في المحتوى."}'::jsonb,
  'mechanical-design',
  '{"en":"Mechanical Design","ar":"التصميم الميكانيكي"}'::jsonb,
  'mechanical',
  ARRAY['Mechanical Design','Fluid Mechanics','Renewable Energy','CAD'],
  '[{"en":"Water turbine system design for clean, renewable energy generation.","ar":"تصميم منظومة توربينة مياه لتوليد الطاقة النظيفة والمتجددة."}]'::jsonb,
  '{"en":"Initial CV Record (Editable)","ar":"سجل أولي من السيرة الذاتية (قابل للتعديل)"}'::jsonb,
  true,
  'cv-initial',
  true,
  3,
  true
),
(
  'proj-rc-car',
  'line-following-obstacle-avoiding-rc-car',
  'PRJ-MCT-04',
  'engineering',
  '{"en":"Engineering Project","ar":"مشروع هندسي"}'::jsonb,
  '{"en":"Line-Following & Obstacle-Avoiding RC Car","ar":"سيارة RC لتتبع المسار وتجنب العوائق (Line-Following & Obstacle-Avoiding RC Car)"}'::jsonb,
  '{"en":"Built an RC car capable of autonomous line tracking and obstacle avoidance.","ar":"بناء سيارة تحكم قادرة على تتبع المسار ذاتياً وتجنب العوائق."}'::jsonb,
  '{"en":"Hands-on mechatronics project implementing autonomous line tracking and obstacle avoidance in an RC car platform. Media, schematics, and firmware details can be added later without modifying frontend code.","ar":"مشروع ميكاترونكس عملي لتنفيذ تتبع المسار الذاتي وتجنب العوائق في سيارة RC. يمكن إضافة الصور والمخططات وتفاصيل البرمجة لاحقاً دون تعديل الواجهة الأمامية."}'::jsonb,
  'robotics-mechatronics',
  '{"en":"Robotics & Mechatronics","ar":"الروبوتات والميكاترونكس"}'::jsonb,
  'robotics',
  ARRAY['Embedded Systems','Autonomous Line Tracking','Obstacle Avoidance','Mechatronics'],
  '[{"en":"Autonomous line-tracking and obstacle-avoidance RC car build.","ar":"بناء وتنفيذ سيارة RC قادرة على تتبع المسار وتجنب العوائق ذاتياً."}]'::jsonb,
  '{"en":"Initial CV Record (Editable)","ar":"سجل أولي من السيرة الذاتية (قابل للتعديل)"}'::jsonb,
  true,
  'cv-initial',
  true,
  4,
  true
),
(
  'proj-dc-motor-estimation',
  'dc-motor-parameter-estimation',
  'PRJ-CTL-05',
  'engineering',
  '{"en":"Engineering Project","ar":"مشروع هندسي"}'::jsonb,
  '{"en":"DC Motor Parameter Estimation","ar":"تقدير معاملات محرك التيار المستمر (DC Motor Parameter Estimation)"}'::jsonb,
  '{"en":"Estimated key electrical and mechanical parameters of a DC motor for use in control system modeling.","ar":"تقدير المعاملات الكهربائية والميكانيكية الرئيسية لمحرك تيار مستمر لاستخدامها في نمذجة أنظمة التحكم."}'::jsonb,
  '{"en":"Control engineering project estimating key electrical and mechanical parameters of a DC motor to support accurate control system modeling. Prepared to hold full mathematical models and plots in future updates.","ar":"مشروع هندسة تحكم يهدف إلى تقدير المعاملات الكهربائية والميكانيكية الأساسية لمحرك تيار مستمر لاستخدامها في نمذجة أنظمة التحكم بدقة."}'::jsonb,
  'plc-automation',
  '{"en":"Control & Automation","ar":"التحكم والأتمتة"}'::jsonb,
  'plc',
  ARRAY['Control Systems','DC Motor Modeling','Parameter Estimation','MATLAB / Simulink'],
  '[{"en":"Electrical and mechanical DC motor parameter estimation for control system modeling.","ar":"تقدير المعاملات الكهربائية والميكانيكية لمحرك DC لنمذجة أنظمة التحكم."}]'::jsonb,
  '{"en":"Initial CV Record (Editable)","ar":"سجل أولي من السيرة الذاتية (قابل للتعديل)"}'::jsonb,
  false,
  'cv-initial',
  true,
  5,
  true
)
ON CONFLICT (id) DO NOTHING;

-- 5. Experience & Industrial Training (3 CV-verified records)
INSERT INTO public.experience (
  id, kind, kind_label, role, company, period, is_current,
  responsibilities, related_project_slugs, data_source, is_editable, display_order, is_published
) VALUES
(
  'exp-sccoder',
  'employment',
  '{"en":"Professional Role","ar":"خبرة مهنية"}'::jsonb,
  '{"en":"HVAC & Refrigeration Design Engineer (Sheet Metal Design, CNC Operation & Classic Control)","ar":"مهندس تصميم التكييف والتبريد (تصميم الصاج، تشغيل CNC، والتحكم الكلاسيكي)"}'::jsonb,
  '{"en":"Sccoder — HVAC & Refrigeration","ar":"Sccoder — أنظمة التكييف والتبريد"}'::jsonb,
  '{"en":"April 2026 – Present","ar":"أبريل 2026 – حتى الآن"}'::jsonb,
  true,
  '[{"en":"Design industrial chiller units ranging from 60 to 240 tons of refrigeration, along with cold rooms and central air-conditioning units, with designs carried through to actual industrial manufacturing.","ar":"تصميم وحدات التشيلرات الصناعية بقدرات من 60 إلى 240 طن تبريد، إلى جانب غرف التبريد ووحدات التكييف المركزي، ومتابعة تنفيذ التصميمات حتى التصنيع الصناعي الفعلي."},{"en":"Design sheet metal parts and assemblies for HVAC and refrigeration equipment using SolidWorks, ensuring manufacturability and dimensional accuracy.","ar":"تصميم أجزاء وتجميعات الصاج لمعدات التكييف والتبريد باستخدام SolidWorks مع ضمان قابلية التصنيع ودقة الأبعاد."},{"en":"Work across the production line, from CNC fiber laser cutting (part nesting to final cutting) through to sheet metal bending/forming.","ar":"العمل عبر خط الإنتاج بدءاً من القطع بليزر الفايبر CNC (من تفريد وتوزيع الأجزاء Nesting حتى القطع النهائي) وصولاً إلى ثني وتشكيل الصاج."},{"en":"Apply practical knowledge of refrigeration circuits and common HVAC/refrigeration faults to support troubleshooting during production and testing.","ar":"تطبيق المعرفة العملية بدوائر التبريد والأعطال الشائعة لأنظمة التكييف والتبريد لدعم تشخيص الأعطال أثناء الإنتاج والاختبار."},{"en":"Perform routine equipment maintenance and support classic (relay-based) control panel work and PLC-related tasks for production lines.","ar":"تنفيذ الصيانة الدورية للمعدات ودعم أعمال لوحات التحكم الكلاسيكي (القائمة على الريليهات) والمهام المرتبطة بـ PLC لخطوط الإنتاج."}]'::jsonb,
  '{}',
  'cv-initial',
  true,
  1,
  true
),
(
  'exp-ceramica-cleopatra',
  'training',
  '{"en":"Industrial Training","ar":"تدريب صناعي"}'::jsonb,
  '{"en":"Mechanical & Electrical Trainee","ar":"متدرب هندسة ميكانيكية وكهربائية"}'::jsonb,
  '{"en":"Ceramica Cleopatra","ar":"سيراميكا كليوباترا (Ceramica Cleopatra)"}'::jsonb,
  '{"en":"July – August 2025","ar":"يوليو – أغسطس 2025"}'::jsonb,
  false,
  '[{"en":"Gained hands-on exposure to mechanical and electrical systems within an industrial production environment.","ar":"اكتساب خبرة عملية مباشرة في الأنظمة الميكانيكية والكهربائية داخل بيئة إنتاج صناعية."}]'::jsonb,
  '{}',
  'cv-initial',
  true,
  2,
  true
),
(
  'exp-farma-swede-masr',
  'training',
  '{"en":"Industrial Training","ar":"تدريب صناعي"}'::jsonb,
  '{"en":"Trainee","ar":"متدرب هندسي"}'::jsonb,
  '{"en":"Farma Swede Masr","ar":"فارما سويد مصر (Farma Swede Masr)"}'::jsonb,
  '{"en":"July – August 2024","ar":"يوليو – أغسطس 2024"}'::jsonb,
  false,
  '[{"en":"Assisted in real-world industrial operations and observed maintenance and production processes.","ar":"المساعدة في العمليات الصناعية الفعلية ومتابعة إجراءات الصيانة وخطوط الإنتاج."}]'::jsonb,
  '{}',
  'cv-initial',
  true,
  3,
  true
)
ON CONFLICT (id) DO NOTHING;

-- 6. Skill Groups (5 CV-verified groups)
INSERT INTO public.skill_groups (
  id, code, title, description, skills, is_visible,
  data_source, is_editable, display_order, is_published
) VALUES
(
  'hvac-refrigeration',
  'SKL-01',
  '{"en":"HVAC & Refrigeration","ar":"التكييف والتبريد"}'::jsonb,
  '{"en":"Design-to-manufacturing experience across industrial chillers, cold rooms, central AC units, and refrigeration diagnostics.","ar":"خبرة عملية في التصميم والتصنيع للتشيلرات الصناعية وغرف التبريد ووحدات التكييف المركزي وتشخيص دوائر التبريد."}'::jsonb,
  '[{"en":"Industrial Chiller Design (60–240 TR)","ar":"تصميم التشيلرات الصناعية (60–240 طن تبريد)"},{"en":"Cold Room & Central AC Unit Design","ar":"تصميم غرف التبريد ووحدات التكييف المركزي"},{"en":"Refrigeration Circuits","ar":"دوائر التبريد"},{"en":"HVAC / Refrigeration Fault Troubleshooting","ar":"تشخيص أعطال التكييف والتبريد"}]'::jsonb,
  true, 'cv-initial', true, 1, true
),
(
  'cad-simulation',
  'SKL-02',
  '{"en":"CAD & Simulation","ar":"التصميم الهندسي والمحاكاة CAD"}'::jsonb,
  '{"en":"3D mechanical modeling, sheet metal assemblies, 2D drafting, and control system simulation tools.","ar":"النمذجة الميكانيكية ثلاثية الأبعاد، تجميعات الصاج، الرسم الهندسي ثنائي الأبعاد، وأدوات محاكاة أنظمة التحكم."}'::jsonb,
  '[{"en":"SolidWorks (incl. Sheet Metal Design)","ar":"SolidWorks (شامل تصميم الصاج)"},{"en":"AutoCAD","ar":"AutoCAD"},{"en":"Autodesk Inventor","ar":"Autodesk Inventor"},{"en":"MATLAB / Simulink","ar":"MATLAB / Simulink"}]'::jsonb,
  true, 'cv-initial', true, 2, true
),
(
  'manufacturing-control',
  'SKL-03',
  '{"en":"Manufacturing, Control & Maintenance","ar":"التصنيع وأنظمة التحكم والصيانة"}'::jsonb,
  '{"en":"Sheet metal fabrication workflows, CNC fiber laser cutting, industrial control panels, and equipment maintenance.","ar":"عمليات تصنيع وتشكيل الصاج، القطع بليزر الفايبر CNC، لوحات التحكم الكهربائية و PLC، والصيانة الدورية."}'::jsonb,
  '[{"en":"CNC Operation (Fiber Laser & Part Nesting)","ar":"تشغيل ماكينات القطع بالليزر CNC وتوزيع الأجزاء"},{"en":"Sheet Metal Bending / Forming","ar":"ثني وتشكيل الصاج"},{"en":"PLC Programming","ar":"برمجة PLC"},{"en":"Classic (Relay-Based) Control","ar":"التحكم الكلاسيكي (الريليهات واللوحات)"},{"en":"Routine Equipment Maintenance","ar":"الصيانة الدورية للمعدات"}]'::jsonb,
  true, 'cv-initial', true, 3, true
),
(
  'robotics-software',
  'SKL-04',
  '{"en":"Robotics, Vision & Embedded Systems","ar":"الروبوتات والرؤية الحاسوبية والأنظمة المدمجة"}'::jsonb,
  '{"en":"Autonomous mobile manipulation, kinematics, computer vision deployment, and embedded motor control.","ar":"الروبوتات المتنقلة ذاتية الحركة، الكينماتيكا، نشر نماذج الرؤية الحاسوبية، والتحكم المدمج بالمحركات."}'::jsonb,
  '[{"en":"ROS 2","ar":"ROS 2"},{"en":"MoveIt 2 & TF / TF2","ar":"MoveIt 2 و TF / TF2"},{"en":"Machine Vision (YOLOv8, Roboflow)","ar":"الرؤية الحاسوبية (YOLOv8, Roboflow)"},{"en":"Embedded Systems (ESP32 / ESP32-S3)","ar":"الأنظمة المدمجة (ESP32 / ESP32-S3)"}]'::jsonb,
  true, 'cv-initial', true, 4, true
),
(
  'productivity-ai',
  'SKL-05',
  '{"en":"Productivity & AI Tools","ar":"أدوات الإنتاجية والذكاء الاصطناعي"}'::jsonb,
  '{"en":"Engineering documentation suites and modern AI workflow tools.","ar":"أدوات التوثيق والإنتاجية الهندسية وأدوات الذكاء الاصطناعي الحديثة."}'::jsonb,
  '[{"en":"Microsoft Office","ar":"Microsoft Office"},{"en":"Google Workspace","ar":"Google Workspace"},{"en":"Claude","ar":"Claude"},{"en":"ChatGPT","ar":"ChatGPT"},{"en":"Gemini","ar":"Gemini"}]'::jsonb,
  true, 'cv-initial', true, 5, true
)
ON CONFLICT (id) DO NOTHING;

-- 7. Certifications & Courses (3 CV-verified records)
INSERT INTO public.certifications (
  id, title, issuer, issue_date, credential_id, credential_url, category,
  data_source, is_editable, display_order, is_published
) VALUES
(
  'course-solidworks-sheet-metal',
  '{"en":"SolidWorks Sheet Metal Design","ar":"تصميم الصاج باستخدام SolidWorks (SolidWorks Sheet Metal Design)"}'::jsonb,
  '{"en":"Issuing Organization — To Be Added","ar":"الجهة المانحة — تُضاف لاحقاً"}'::jsonb,
  '{"en":"Date — To Be Added","ar":"التاريخ — يُضاف لاحقاً"}'::jsonb,
  'CRS-CAD-01',
  NULL,
  '{"en":"CAD & Sheet Metal","ar":"التصميم الهندسي والصاج"}'::jsonb,
  'cv-initial', true, 1, true
),
(
  'course-classic-control',
  '{"en":"Classic Control","ar":"التحكم الكلاسيكي (Classic Control)"}'::jsonb,
  '{"en":"Issuing Organization — To Be Added","ar":"الجهة المانحة — تُضاف لاحقاً"}'::jsonb,
  '{"en":"Date — To Be Added","ar":"التاريخ — يُضاف لاحقاً"}'::jsonb,
  'CRS-ELC-02',
  NULL,
  '{"en":"Electrical Control Panels","ar":"لوحات التحكم الكهربائية"}'::jsonb,
  'cv-initial', true, 2, true
),
(
  'course-ai-tools',
  '{"en":"AI Tools & Applications","ar":"أدوات وتطبيقات الذكاء الاصطناعي (AI Tools & Applications)"}'::jsonb,
  '{"en":"Issuing Organization — To Be Added","ar":"الجهة المانحة — تُضاف لاحقاً"}'::jsonb,
  '{"en":"Date — To Be Added","ar":"التاريخ — يُضاف لاحقاً"}'::jsonb,
  'CRS-AI-03',
  NULL,
  '{"en":"Productivity & AI","ar":"الإنتاجية والذكاء الاصطناعي"}'::jsonb,
  'cv-initial', true, 3, true
)
ON CONFLICT (id) DO NOTHING;

-- 8. Site Settings
INSERT INTO public.site_settings (
  id, site_name, seo_title, seo_description,
  show_graduation_portrait, show_contact_email, show_linkedin_link, show_courses_section
) VALUES (
  'default',
  '{"en":"Abdullah Sherif Abdulraouf — Engineering Portfolio","ar":"عبدالله شريف عبدالرؤوف — الملف الهندسي"}'::jsonb,
  '{"en":"Abdullah Sherif Abdulraouf — Mechatronics & HVAC Design Engineer","ar":"عبدالله شريف عبدالرؤوف — مهندس ميكاترونكس وتصميم التكييف والتبريد"}'::jsonb,
  '{"en":"Engineering portfolio covering HVAC & refrigeration design, sheet metal & CNC production, classic/PLC control panels, industrial maintenance, and robotics.","ar":"ملف هندسي يشمل تصميم التكييف والتبريد، الصاج و CNC، لوحات التحكم الكلاسيكي و PLC، الصيانة الصناعية، والروبوتات."}'::jsonb,
  true, true, true, true
) ON CONFLICT (id) DO NOTHING;

-- 9. Initial Media Assets (existing verified local assets)
INSERT INTO public.media_assets (
  id, file_name, storage_path, bucket_name, url, mime_type, size_bytes,
  size_label, dimensions, category, alt, is_local_asset
) VALUES
(
  'media-portrait-01',
  'abdullah-portrait.jpg',
  NULL,
  NULL,
  '/images/abdullah-portrait.jpg',
  'image/jpeg',
  117760,
  'Local asset (~115 KB)',
  '800 × 840',
  'portrait',
  '{"en":"Portrait of Abdullah Sherif Abdulraouf, Mechatronics Engineer","ar":"الصورة الشخصية للمهندس عبدالله شريف عبدالرؤوف — مهندس ميكاترونكس"}'::jsonb,
  true
),
(
  'media-favicon-01',
  'favicon.svg',
  NULL,
  NULL,
  '/favicon.svg',
  'image/svg+xml',
  410,
  'Local asset (~0.4 KB)',
  '64 × 64 (Vector)',
  'branding',
  '{"en":"Abdullah Sherif AS brand monogram icon","ar":"أيقونة الشعار الهندسي AS للمهندس عبدالله شريف"}'::jsonb,
  true
)
ON CONFLICT (id) DO NOTHING;

-- 10. CV Workspace Config
INSERT INTO public.cv_workspace_config (
  id, target_role, custom_summary, use_profile_summary,
  selected_education_ids, selected_experience_ids, selected_project_ids,
  selected_skill_group_ids, selected_certification_ids, sections
) VALUES (
  'default',
  '{"en":"Mechatronics Engineer | HVAC & Refrigeration Design","ar":"مهندس ميكاترونكس | تصميم التكييف والتبريد"}'::jsonb,
  '{"en":"Mechatronics Engineering graduate (2026) from Ain Shams University with hands-on experience in HVAC & refrigeration design and manufacturing — including industrial chillers, cold rooms, and central air-conditioning units — combined with a foundation in mechanical design, sheet metal production, classic/PLC control systems, and robotics.","ar":"خريج هندسة الميكاترونكس (2026) من جامعة عين شمس، بخبرة عملية في تصميم وتصنيع أنظمة التكييف والتبريد — بما في ذلك التشيلرات الصناعية وغرف التبريد ووحدات التكييف المركزي — إلى جانب أساس قوي في التصميم الميكانيكي وإنتاج الصاج وأنظمة التحكم الكلاسيكي و PLC والروبوتات."}'::jsonb,
  true,
  ARRAY['edu-ain-shams-mechatronics'],
  ARRAY['exp-sccoder','exp-ceramica-cleopatra','exp-farma-swede-masr'],
  ARRAY['proj-flex-bot','proj-6dof-inspection','proj-water-turbine','proj-rc-car','proj-dc-motor-estimation'],
  ARRAY['hvac-refrigeration','cad-simulation','manufacturing-control','robotics-software','productivity-ai'],
  ARRAY['course-solidworks-sheet-metal','course-classic-control','course-ai-tools'],
  '[{"key":"summary","visible":true},{"key":"experience","visible":true},{"key":"education","visible":true},{"key":"projects","visible":true},{"key":"skills","visible":true},{"key":"certifications","visible":true}]'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- 11. Initial Activity Log entry (real migration timestamp)
INSERT INTO public.admin_activity_log (
  id, action, target, section
) VALUES (
  'act-init-phase04',
  '{"en":"Migrated verified portfolio records to Supabase PostgreSQL","ar":"تم ترحيل بيانات الملف الهندسي الموثّقة إلى قاعدة بيانات Supabase"}'::jsonb,
  '{"en":"Profile, Education, 3 Experience, 5 Projects, 4 Companies, 5 Skill Groups, 3 Courses","ar":"الملف الشخصي، التعليم، 3 خبرات، 5 مشاريع، 4 شركات، 5 مجموعات مهارات، 3 دورات"}'::jsonb,
  'system'
) ON CONFLICT (id) DO NOTHING;
