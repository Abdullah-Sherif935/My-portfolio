-- Defense-in-depth: enable RLS on private.admin_users with zero client policies
-- (private.is_admin() runs as SECURITY DEFINER to verify admin membership safely)
ALTER TABLE private.admin_users ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE private.admin_users FROM anon, authenticated;
