-- Migration 013: Contact Messages Inbox Table (Backup alongside Web3Forms email delivery)
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_name text NOT NULL CHECK (char_length(trim(sender_name)) >= 2 AND char_length(sender_name) <= 120),
  sender_email text NOT NULL CHECK (char_length(trim(sender_email)) >= 5 AND char_length(sender_email) <= 180),
  organization text DEFAULT NULL CHECK (organization IS NULL OR char_length(organization) <= 150),
  subject text NOT NULL CHECK (char_length(trim(subject)) >= 3 AND char_length(subject) <= 180),
  message text NOT NULL CHECK (char_length(trim(message)) >= 15 AND char_length(message) <= 2500),
  is_read boolean NOT NULL DEFAULT false,
  email_delivered boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Public visitors can submit messages (INSERT only, never read others' messages)
DROP POLICY IF EXISTS "Public can submit contact messages" ON public.contact_messages;
CREATE POLICY "Public can submit contact messages"
  ON public.contact_messages
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only authenticated admin can read, mark as read, or delete messages
DROP POLICY IF EXISTS "Admin can read contact messages" ON public.contact_messages;
CREATE POLICY "Admin can read contact messages"
  ON public.contact_messages
  FOR SELECT
  TO authenticated
  USING (private.is_admin());

DROP POLICY IF EXISTS "Admin can update contact messages" ON public.contact_messages;
CREATE POLICY "Admin can update contact messages"
  ON public.contact_messages
  FOR UPDATE
  TO authenticated
  USING (private.is_admin())
  WITH CHECK (private.is_admin());

DROP POLICY IF EXISTS "Admin can delete contact messages" ON public.contact_messages;
CREATE POLICY "Admin can delete contact messages"
  ON public.contact_messages
  FOR DELETE
  TO authenticated
  USING (private.is_admin());

CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at
  ON public.contact_messages (created_at DESC);
