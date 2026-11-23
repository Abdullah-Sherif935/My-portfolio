-- ============================================================================
-- Migration 06: Editable Home Sections (Engineering Profile & Core Specializations)
-- 1. Creates public.specializations table with strict RLS & seeds the 6 verified
--    disciplines verbatim from src/data/specializations.ts.
-- 2. Adds home_sections_config jsonb column on public.site_settings seeded
--    verbatim with current EN/AR copy from home.json.
-- ============================================================================

-- 1. Create public.specializations table
CREATE TABLE IF NOT EXISTS public.specializations (
  id text PRIMARY KEY,
  code text NOT NULL,
  icon text NOT NULL DEFAULT 'cog'
    CHECK (icon IN ('wind', 'cpu', 'wrench', 'cog', 'layers', 'bot')),
  title jsonb NOT NULL,
  description jsonb NOT NULL,
  highlights jsonb NOT NULL DEFAULT '[]'::jsonb,
  filter_category text NOT NULL DEFAULT '',
  display_order integer NOT NULL DEFAULT 1,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_specializations_order
  ON public.specializations (display_order ASC);

ALTER TABLE public.specializations ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.specializations TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.specializations TO authenticated;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'specializations'
      AND policyname = 'specializations_anon_select_published'
  ) THEN
    CREATE POLICY "specializations_anon_select_published"
      ON public.specializations
      FOR SELECT
      TO anon
      USING (is_published = true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'specializations'
      AND policyname = 'specializations_auth_select'
  ) THEN
    CREATE POLICY "specializations_auth_select"
      ON public.specializations
      FOR SELECT
      TO authenticated
      USING (is_published = true OR private.is_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'specializations'
      AND policyname = 'specializations_admin_insert'
  ) THEN
    CREATE POLICY "specializations_admin_insert"
      ON public.specializations
      FOR INSERT
      TO authenticated
      WITH CHECK (private.is_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'specializations'
      AND policyname = 'specializations_admin_update'
  ) THEN
    CREATE POLICY "specializations_admin_update"
      ON public.specializations
      FOR UPDATE
      TO authenticated
      USING (private.is_admin())
      WITH CHECK (private.is_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'specializations'
      AND policyname = 'specializations_admin_delete'
  ) THEN
    CREATE POLICY "specializations_admin_delete"
      ON public.specializations
      FOR DELETE
      TO authenticated
      USING (private.is_admin());
  END IF;
END $$;

-- Seed the 6 existing specializations verbatim (never overwrites existing edits)
INSERT INTO public.specializations (
  id, code, icon, title, description, highlights, filter_category, display_order, is_published
) VALUES
(
  'hvac-refrigeration',
  'DISC-01',
  'wind',
  '{"en":"HVAC & Refrigeration","ar":"التكييف والتبريد"}'::jsonb,
  '{"en":"Thermal load evaluation, chilled water and DX systems, refrigeration circuits, airflow distribution, and equipment commissioning.","ar":"تقييم الأحمال الحرارية، أنظمة المياه المثلجة و DX، دوائر التبريد، توزيع الهواء، وتشغيل واختبار المعدات."}'::jsonb,
  '[{"en":"Chillers & Air Handling Units","ar":"التشيلرات ووحدات مناولة الهواء"},{"en":"Refrigeration Diagnostics","ar":"تشخيص دوائر التبريد"},{"en":"Ducting & Hydronic Piping","ar":"مجاري الهواء وشبكات المواسير"}]'::jsonb,
  'hvac-refrigeration',
  1,
  true
),
(
  'plc-automation',
  'DISC-02',
  'cpu',
  '{"en":"PLC & Industrial Automation","ar":"الأتمتة الصناعية و PLC"}'::jsonb,
  '{"en":"Structured PLC logic, HMI interfaces, VFD motor control, field instrumentation, and electrical control panel integration.","ar":"برمجة منطق PLC، واجهات HMI، التحكم بالمحركات عبر VFD، أجهزة القياس الميدانية، وتكامل لوحات التحكم الكهربائية."}'::jsonb,
  '[{"en":"Ladder Logic & Structured Control","ar":"برمجة السلم والمنطق الصناعي"},{"en":"Electrical Control Panels","ar":"لوحات التحكم الكهربائية"},{"en":"Sensors, Actuators & VFDs","ar":"الحساسات والمشغلات ومغيرات السرعة"}]'::jsonb,
  'plc-automation',
  2,
  true
),
(
  'industrial-maintenance',
  'DISC-03',
  'wrench',
  '{"en":"Maintenance & Troubleshooting","ar":"الصيانة وتشخيص الأعطال"}'::jsonb,
  '{"en":"Preventive maintenance planning, electro-mechanical root cause fault finding, industrial equipment reliability, and safety compliance.","ar":"تخطيط الصيانة الوقائية، تشخيص الأعطال الكهروميكانيكية من الجذور، موثوقية المعدات الصناعية، والالتزام بالسلامة."}'::jsonb,
  '[{"en":"Preventive & Corrective Plans","ar":"خطط الصيانة الوقائية والعلاجية"},{"en":"Electro-Mechanical Fault Finding","ar":"تشخيص الأعطال الكهروميكانيكية"},{"en":"Equipment Documentation","ar":"توثيق المعدات وجداول الفحص"}]'::jsonb,
  'industrial-maintenance',
  3,
  true
),
(
  'mechanical-design',
  'DISC-04',
  'cog',
  '{"en":"Mechanical Design","ar":"التصميم الميكانيكي"}'::jsonb,
  '{"en":"3D CAD parametric assemblies, mechanism design, tolerance stack-ups, BOM preparation, and workshop production drawings.","ar":"النماذج ثلاثية الأبعاد CAD، تصميم الآليات الميكانيكية، التفاوتات الهندسية، قوائم الخامات BOM، والرسومات التنفيذية."}'::jsonb,
  '[{"en":"3D CAD Assemblies","ar":"التجميعات ثلاثية الأبعاد CAD"},{"en":"Fabrication Drawings & BOMs","ar":"رسومات التصنيع وقوائم الخامات"},{"en":"Design for Assembly","ar":"التصميم لسهولة التجميع والصيانة"}]'::jsonb,
  'mechanical-design',
  4,
  true
),
(
  'sheet-metal-design',
  'DISC-05',
  'layers',
  '{"en":"Sheet Metal Design","ar":"تصميم وتشكيل الصاج"}'::jsonb,
  '{"en":"Industrial enclosures, electrical panel cabinets, flat-pattern DXF generation, bend allowances, and laser-cut nesting readiness.","ar":"تصميم الحاويات الصناعية ولوحات التحكم المعدنية، إفراد الصاج بصيغة DXF، حسابات الثني، والجاهزية للقطع بالليزر."}'::jsonb,
  '[{"en":"Control Panel Enclosures","ar":"حاويات لوحات التحكم المعدنية"},{"en":"Flat Patterns & Bend Tables","ar":"الإفراد وجداول الثني"},{"en":"CNC Laser & Press Brake Ready","ar":"جاهزية القطع بالليزر والثني CNC"}]'::jsonb,
  'sheet-metal-design',
  5,
  true
),
(
  'robotics-mechatronics',
  'DISC-06',
  'bot',
  '{"en":"Robotics & Mechatronics","ar":"الروبوتات والميكاترونكس"}'::jsonb,
  '{"en":"Embedded control prototyping, motion systems, actuator integration, sensor feedback loops, and electromechanical automation.","ar":"النماذج الأولية للتحكم المدمج، أنظمة الحركة، دمج المشغلات، حلقات التغذية الراجعة للحساسات، والأتمتة الميكاترونية."}'::jsonb,
  '[{"en":"Embedded Microcontrollers","ar":"المتحكمات الدقيقة والأنظمة المدمجة"},{"en":"Motion & Actuator Control","ar":"التحكم بالحركة والمشغلات"},{"en":"Mechatronic Prototyping","ar":"النماذج الأولية الميكاترونية"}]'::jsonb,
  'robotics-mechatronics',
  6,
  true
)
ON CONFLICT (id) DO NOTHING;

-- 2. Extend public.site_settings with editable home_sections_config JSONB
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS home_sections_config jsonb NOT NULL DEFAULT '{
    "intro": {
      "visible": true,
      "eyebrow": {"en":"01 // ENGINEERING PROFILE","ar":"01 // التعريف الهندسي"},
      "title": {"en":"Engineering Profile & Academic Foundation","ar":"الملف الهندسي والأساس الأكاديمي"},
      "description": {"en":"Bridging Mechatronics Engineering fundamentals with hands-on industrial design-to-manufacturing across HVAC systems, SolidWorks sheet metal, CNC fiber laser production, and classic/PLC control.","ar":"الربط بين أسس هندسة الميكاترونكس والخبرة الصناعية من التصميم إلى التصنيع في أنظمة التكييف والصاج بـ SolidWorks والقطع بالليزر CNC والتحكم الكلاسيكي و PLC."},
      "educationLabel": {"en":"Academic Education","ar":"التعليم الأكاديمي"},
      "graduationProjectLabel": {"en":"Graduation Project","ar":"مشروع التخرج"},
      "ctaLabel": {"en":"Full Profile & Education","ar":"الملف الكامل والتعليم"},
      "showEducationCard": true,
      "showGpa": true,
      "showGraduationProject": true,
      "showPillars": true,
      "pillarsTitle": {"en":"Core Engineering Approach","ar":"ركائز العمل الهندسي"},
      "pillars": [
        {
          "code": "SYS-01",
          "title": {"en":"Design-to-Manufacturing Execution","ar":"من التصميم إلى التصنيع الفعلي"},
          "description": {"en":"Developing chillers, cold rooms, and SolidWorks sheet metal assemblies ready for CNC laser cutting and forming.","ar":"تطوير التشيلرات وغرف التبريد وتجميعات الصاج بـ SolidWorks جاهزة للقطع بالليزر CNC والثني."}
        },
        {
          "code": "SYS-02",
          "title": {"en":"Control & Industrial Reliability","ar":"التحكم وموثوقية التشغيل الصناعي"},
          "description": {"en":"Supporting relay-based control panels, PLC tasks, refrigeration troubleshooting, and routine equipment maintenance.","ar":"دعم لوحات التحكم الكلاسيكي ومهام PLC وتشخيص أعطال التبريد والصيانة الدورية للمعدات."}
        },
        {
          "code": "SYS-03",
          "title": {"en":"Robotics & Embedded Integration","ar":"الروبوتات والأنظمة المدمجة"},
          "description": {"en":"Integrating mechanical design, ESP32-S3 motor control, ROS 2 / MoveIt 2 kinematics, and machine vision.","ar":"دمج التصميم الميكانيكي والتحكم بـ ESP32-S3 وكينماتيكا ROS 2 / MoveIt 2 والرؤية الحاسوبية."}
        }
      ]
    },
    "specializations": {
      "visible": true,
      "eyebrow": {"en":"02 // CORE SPECIALIZATIONS","ar":"02 // التخصصات الأساسية"},
      "title": {"en":"Core Engineering Expertise","ar":"مجالات الخبرة الهندسية"},
      "subtitle": {"en":"Six integrated disciplines across thermal systems, industrial automation, maintenance, mechanical CAD, sheet metal, and mechatronics.","ar":"ستة مجالات مترابطة تغطي الأنظمة الحرارية، الأتمتة الصناعية، الصيانة، التصميم الميكانيكي، الصاج، والميكاترونكس."}
    }
  }'::jsonb;
