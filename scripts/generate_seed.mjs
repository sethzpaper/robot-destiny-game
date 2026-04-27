import { readFileSync, writeFileSync } from 'fs';
import Papa from 'papaparse';

const sqlEsc = (v) => {
  if (v === null || v === undefined || v === '') return 'NULL';
  return "'" + String(v).replace(/'/g, "''") + "'";
};
const intOrNull = (v) => {
  if (v === null || v === undefined || v === '') return 'NULL';
  const n = parseInt(String(v).trim(), 10);
  return Number.isNaN(n) ? 'NULL' : String(n);
};

const parseCsv = (path) =>
  Papa.parse(readFileSync(path, 'utf8').replace(/^﻿/, ''), {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  }).data;

const out = [];
out.push('-- ============================================================');
out.push('-- SPK iPad System - Supabase seed/migration');
out.push('-- Run this in Supabase Dashboard > SQL Editor');
out.push('-- ============================================================');
out.push('');

out.push('-- 1) Missing tables ----------------------------------------');
out.push(`CREATE TABLE IF NOT EXISTS public.activity_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT,
  action TEXT,
  details TEXT,
  timestamp TIMESTAMPTZ DEFAULT now()
);`);
out.push('');
out.push(`CREATE TABLE IF NOT EXISTS public.service_logs (
  id BIGSERIAL PRIMARY KEY,
  product_id TEXT,
  issue TEXT,
  report_date TIMESTAMPTZ DEFAULT now(),
  status TEXT
);`);
out.push('');
out.push('-- Allow anon read/write (matches the rest of your tables) --');
out.push('ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;');
out.push('ALTER TABLE public.service_logs  ENABLE ROW LEVEL SECURITY;');
out.push(`DROP POLICY IF EXISTS "anon_all_activity_logs" ON public.activity_logs;`);
out.push(`CREATE POLICY "anon_all_activity_logs" ON public.activity_logs FOR ALL USING (true) WITH CHECK (true);`);
out.push(`DROP POLICY IF EXISTS "anon_all_service_logs" ON public.service_logs;`);
out.push(`CREATE POLICY "anon_all_service_logs" ON public.service_logs FOR ALL USING (true) WITH CHECK (true);`);
out.push('');

out.push('-- 2) Seed app_users ---------------------------------------');
const users = parseCsv('csv/app_users.csv');
out.push('INSERT INTO public.app_users (username, password, name, role) VALUES');
out.push(
  users
    .map(
      (u) =>
        `  (${sqlEsc(u.loginId)}, ${sqlEsc(u.password)}, ${sqlEsc(u.loginId)}, ${sqlEsc(u.role)})`
    )
    .join(',\n')
);
out.push('ON CONFLICT (username) DO UPDATE SET password = EXCLUDED.password, role = EXCLUDED.role;');
out.push('');

out.push('-- 3) Seed students ----------------------------------------');
const students = parseCsv('csv/students.csv');
const validStudents = students.filter((s) => s.id && s.fullName);
out.push('INSERT INTO public.students (student_id, full_name, grade, classroom, email) VALUES');
out.push(
  validStudents
    .map(
      (s) =>
        `  (${sqlEsc(s.id)}, ${sqlEsc(s.fullName)}, ${intOrNull(s.grade)}, ${intOrNull(s.classroom)}, ${sqlEsc(s.email)})`
    )
    .join(',\n')
);
out.push('ON CONFLICT (student_id) DO UPDATE SET full_name = EXCLUDED.full_name, grade = EXCLUDED.grade, classroom = EXCLUDED.classroom, email = EXCLUDED.email;');
out.push('');

out.push(`-- DONE. ${validStudents.length} students, ${users.length} users.`);

writeFileSync('supabase_seed.sql', out.join('\n'));
console.log(`Wrote supabase_seed.sql  (${validStudents.length} students, ${users.length} users)`);
