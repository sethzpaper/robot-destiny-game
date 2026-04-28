-- ============================================================
-- SPK iPad System — Security Hardening (Option 2: Real RLS)
-- รันใน Supabase Dashboard > SQL Editor
-- ============================================================
-- สรุปสิ่งที่สคริปต์นี้ทำ:
--   1. ลบ policy "anon_all_*" ที่เปิดเผยทุกอย่าง
--   2. สร้าง profiles table (1-1 กับ auth.users) เก็บ role
--   3. trigger สร้าง profile อัตโนมัติเมื่อมี user ใหม่ใน Supabase Auth
--   4. helper functions: is_admin(), is_staff_or_admin()
--   5. RLS policies ตามหลัก least-privilege ต่อทุกตาราง
-- ============================================================


-- ============================================================
-- 1) ENUM สำหรับ role
-- ============================================================
DO $$ BEGIN
  CREATE TYPE public.user_role AS ENUM ('admin', 'staff', 'teacher', 'student', 'guest');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;


-- ============================================================
-- 2) profiles table — ผูก auth.users กับ role + ข้อมูลแสดงผล
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username    TEXT UNIQUE,
  full_name   TEXT,
  role        public.user_role NOT NULL DEFAULT 'guest',
  created_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- 3) Trigger: สร้าง profile อัตโนมัติเมื่อมี user ใหม่
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'guest')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ============================================================
-- 4) Helper functions (ใช้ใน policy)
-- ============================================================
CREATE OR REPLACE FUNCTION public.current_role()
RETURNS public.user_role
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_staff_or_admin()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'staff')
  );
$$;


-- ============================================================
-- 5) ลบ policy "anon_all_*" ทั้งหมด (เปิดเผย ALL ให้ anon)
-- ============================================================
DROP POLICY IF EXISTS "anon_all_activity_logs"   ON public.activity_logs;
DROP POLICY IF EXISTS "anon_all_service_logs"    ON public.service_logs;
DROP POLICY IF EXISTS "anon_all_devices"         ON public.devices;
DROP POLICY IF EXISTS "anon_all_categories"      ON public.categories;
DROP POLICY IF EXISTS "anon_all_app_users"       ON public.app_users;
DROP POLICY IF EXISTS "anon_all_students"        ON public.students;
DROP POLICY IF EXISTS "anon_all_teachers"        ON public.teachers;
DROP POLICY IF EXISTS "anon_all_transactions"    ON public.transactions;
DROP POLICY IF EXISTS "anon_all_service_reports" ON public.service_reports;


-- เปิด RLS ทุกตาราง (กันลืม)
ALTER TABLE public.devices         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_users       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_logs    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs   ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- 6) RLS Policies (least privilege)
--    หลัก: ต้อง login เสมอ (ใช้ auth.uid() IS NOT NULL)
--          แก้ไขข้อมูลหลัก = staff/admin เท่านั้น
-- ============================================================

-- profiles ----------------------------------------------------
CREATE POLICY "profile_self_read" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR public.is_staff_or_admin());

CREATE POLICY "profile_self_update" ON public.profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "profile_admin_all" ON public.profiles
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());


-- categories : public ดูได้ (LandingPage โชว์ catalog), staff/admin แก้
CREATE POLICY "cat_read_public" ON public.categories
  FOR SELECT USING (true);

CREATE POLICY "cat_write_staff" ON public.categories
  FOR ALL USING (public.is_staff_or_admin())
  WITH CHECK (public.is_staff_or_admin());


-- devices : public ดูได้ (โชว์สถานะอุปกรณ์บน landing), staff/admin แก้
CREATE POLICY "dev_read_public" ON public.devices
  FOR SELECT USING (true);

CREATE POLICY "dev_write_staff" ON public.devices
  FOR ALL USING (public.is_staff_or_admin())
  WITH CHECK (public.is_staff_or_admin());


-- students / teachers : authenticated ดูได้, staff/admin แก้ได้
CREATE POLICY "stu_read_auth" ON public.students
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "stu_write_staff" ON public.students
  FOR ALL USING (public.is_staff_or_admin())
  WITH CHECK (public.is_staff_or_admin());

CREATE POLICY "tch_read_auth" ON public.teachers
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "tch_write_staff" ON public.teachers
  FOR ALL USING (public.is_staff_or_admin())
  WITH CHECK (public.is_staff_or_admin());


-- transactions : ทุกคน auth ยืม/คืนได้ , delete = admin ---------
CREATE POLICY "txn_read_auth" ON public.transactions
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "txn_insert_auth" ON public.transactions
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "txn_update_auth" ON public.transactions
  FOR UPDATE USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "txn_delete_admin" ON public.transactions
  FOR DELETE USING (public.is_admin());


-- service_reports : auth แจ้งได้, staff/admin ดู+อัพเดต -------
CREATE POLICY "svc_insert_auth" ON public.service_reports
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "svc_read_staff" ON public.service_reports
  FOR SELECT USING (public.is_staff_or_admin());

CREATE POLICY "svc_update_staff" ON public.service_reports
  FOR UPDATE USING (public.is_staff_or_admin())
  WITH CHECK (public.is_staff_or_admin());


-- service_logs : auth บันทึกได้, staff/admin อ่านได้ -----------
CREATE POLICY "svclog_insert_auth" ON public.service_logs
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "svclog_read_staff" ON public.service_logs
  FOR SELECT USING (public.is_staff_or_admin());


-- activity_logs : auth บันทึกได้, staff/admin อ่านได้ ----------
CREATE POLICY "actlog_insert_auth" ON public.activity_logs
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "actlog_read_staff" ON public.activity_logs
  FOR SELECT USING (public.is_staff_or_admin());


-- app_users (legacy) : ไม่ใช้แล้ว, lock down -------------------
-- เก็บไว้อ่านได้เฉพาะ admin เผื่อ migrate; เขียนได้เฉพาะ admin
DROP POLICY IF EXISTS "appu_admin_only" ON public.app_users;
CREATE POLICY "appu_admin_only" ON public.app_users
  FOR ALL USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- ============================================================
-- 7) Migration ของ user เดิม (manual step)
-- ============================================================
-- ใน Supabase Dashboard > Authentication > Users > Add user
-- สร้าง user โดยใส่ email (เช่น admin@spk.local) + password
-- จากนั้นรัน UPDATE ด้านล่าง (1 ครั้ง) เพื่อ assign role:
--
--   UPDATE public.profiles SET role = 'admin'   WHERE username = 'admin';
--   UPDATE public.profiles SET role = 'admin'   WHERE username = 'admin2';
--   UPDATE public.profiles SET role = 'admin'   WHERE username = 'admin3';
--   UPDATE public.profiles SET role = 'teacher' WHERE username = 'test';
--   UPDATE public.profiles SET role = 'student' WHERE username = 'student';
--
-- ถ้าต้องการ map username เดิม: ตอนสร้าง user ให้ใส่
-- raw_user_meta_data = {"username":"admin","role":"admin"}
-- หรืออัพเดท profiles หลังสร้างเสร็จ
-- ============================================================

-- DONE
