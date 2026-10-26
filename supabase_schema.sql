-- ============================================================================
-- DOMA.ng - Supabase Database Schema (v2: Supabase Auth + Row Level Security)
-- Nigerian Real Estate Marketplace & Student Housing Platform
--
-- Run the whole file in the Supabase SQL Editor. It is safe to run on a fresh
-- project and safe to run over the v1 schema (it replaces the open policies).
--
-- After running it:
--   1. Authentication > Providers: keep Email enabled.
--   2. Sign up on the site with the account that should be the admin, then run:
--        update public.profiles set role = 'admin' where email = 'you@example.com';
--      (The SQL Editor runs as the service role, so the role guard allows it.)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. PROFILES (one row per Supabase Auth user)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL DEFAULT '',
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'tenant', 'agent', 'admin')),
    phone TEXT,
    state TEXT DEFAULT 'Lagos',
    university TEXT,          -- students (e.g. UNILAG, LASU, UI, UNIPORT, YabaTech)
    target_budget NUMERIC,    -- students (under ₦300k) and tenants
    preferred_type TEXT,      -- self-contain, flat, duplex, store
    preferred_area TEXT,      -- tenants
    agency TEXT,              -- agents
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- SECURITY DEFINER so policies can call it without recursing into profiles RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
    SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin');
$$;

-- Create the profile from sign-up metadata. Self-service sign-up can never
-- produce an admin: unknown or 'admin' roles fall back to 'student'.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    meta JSONB := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);
    requested_role TEXT := meta->>'role';
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role, phone, state, university, target_budget, preferred_type, preferred_area, agency)
    VALUES (
        NEW.id,
        NEW.email,
        LEFT(COALESCE(meta->>'full_name', ''), 120),
        CASE WHEN requested_role IN ('student', 'tenant', 'agent') THEN requested_role ELSE 'student' END,
        LEFT(meta->>'phone', 32),
        LEFT(COALESCE(meta->>'state', 'Lagos'), 40),
        LEFT(meta->>'university', 80),
        CASE WHEN meta->>'target_budget' ~ '^[0-9]{1,12}(\.[0-9]+)?$' THEN (meta->>'target_budget')::NUMERIC END,
        LEFT(meta->>'preferred_type', 80),
        LEFT(meta->>'preferred_area', 80),
        LEFT(meta->>'agency', 120)
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Users may edit their own profile, but only admins (or the SQL Editor, where
-- auth.uid() is null) may change role or email.
CREATE OR REPLACE FUNCTION public.guard_profile_update()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF auth.uid() IS NOT NULL AND NOT public.is_admin() THEN
        IF NEW.role IS DISTINCT FROM OLD.role THEN
            RAISE EXCEPTION 'Only an admin can change account roles';
        END IF;
        IF NEW.email IS DISTINCT FROM OLD.email OR NEW.id IS DISTINCT FROM OLD.id THEN
            RAISE EXCEPTION 'Email and account id cannot be changed here';
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_guard_update ON public.profiles;
CREATE TRIGGER profiles_guard_update
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.guard_profile_update();

-- ----------------------------------------------------------------------------
-- 2. AGENTS (KYC credentials & verification state)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.agents (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    agency TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    state TEXT NOT NULL DEFAULT 'Lagos',
    cac TEXT NOT NULL,
    nin TEXT NOT NULL,
    id_type TEXT NOT NULL DEFAULT 'NIMC Slip / National ID',
    id_number TEXT,
    campus_focus TEXT DEFAULT 'General Residential & Commercial',
    office_address TEXT NOT NULL,
    kyc_status TEXT NOT NULL DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'verified', 'rejected')),
    rejection_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.agents ALTER COLUMN id SET DEFAULT ('AG-' || UPPER(SUBSTR(REPLACE(gen_random_uuid()::TEXT, '-', ''), 1, 8)));

-- Agents can submit and edit their own application but can never approve it.
-- Changing identity documents sends the application back to 'pending'.
CREATE OR REPLACE FUNCTION public.guard_agent_write()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF auth.uid() IS NULL OR public.is_admin() THEN
        RETURN NEW;
    END IF;

    IF TG_OP = 'INSERT' THEN
        NEW.user_id := auth.uid();
        NEW.kyc_status := 'pending';
        NEW.rejection_reason := NULL;
        RETURN NEW;
    END IF;

    IF NEW.id IS DISTINCT FROM OLD.id OR NEW.user_id IS DISTINCT FROM OLD.user_id THEN
        RAISE EXCEPTION 'Agent id and owner cannot be changed';
    END IF;
    IF NEW.kyc_status IS DISTINCT FROM OLD.kyc_status OR NEW.rejection_reason IS DISTINCT FROM OLD.rejection_reason THEN
        RAISE EXCEPTION 'KYC status can only be changed by an admin';
    END IF;
    IF (NEW.cac, NEW.nin, NEW.id_type, NEW.id_number) IS DISTINCT FROM (OLD.cac, OLD.nin, OLD.id_type, OLD.id_number) THEN
        NEW.kyc_status := 'pending';
        NEW.rejection_reason := NULL;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS agents_guard_write ON public.agents;
CREATE TRIGGER agents_guard_write
    BEFORE INSERT OR UPDATE ON public.agents
    FOR EACH ROW EXECUTE FUNCTION public.guard_agent_write();

-- ----------------------------------------------------------------------------
-- 3. LISTINGS (houses, student hostels & stores)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.listings (
    id TEXT PRIMARY KEY,
    agent_id TEXT REFERENCES public.agents(id) ON DELETE CASCADE,
    agent_name TEXT NOT NULL,
    agent_agency TEXT,
    agent_phone TEXT,
    type TEXT NOT NULL CHECK (type IN ('house', 'student', 'store')),
    title TEXT NOT NULL,
    price NUMERIC NOT NULL,
    price_formatted TEXT NOT NULL,
    period TEXT NOT NULL DEFAULT '/year',
    state TEXT NOT NULL DEFAULT 'Lagos',
    area TEXT NOT NULL,
    address TEXT,
    spec1 TEXT,
    spec2 TEXT,
    campus TEXT DEFAULT 'none',
    campus_dist TEXT,
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    media JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Listing ids end up in HTML attributes and URLs; keep them to a safe alphabet.
ALTER TABLE public.listings DROP CONSTRAINT IF EXISTS listings_id_format;
ALTER TABLE public.listings ADD CONSTRAINT listings_id_format CHECK (id ~ '^[A-Za-z0-9_-]{1,64}$') NOT VALID;
ALTER TABLE public.listings DROP CONSTRAINT IF EXISTS listings_price_positive;
ALTER TABLE public.listings ADD CONSTRAINT listings_price_positive CHECK (price > 0) NOT VALID;

-- Agent name and agency always come from the agent record, not the client.
CREATE OR REPLACE FUNCTION public.fill_listing_agent()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    a public.agents%ROWTYPE;
BEGIN
    SELECT * INTO a FROM public.agents WHERE id = NEW.agent_id;
    IF FOUND THEN
        NEW.agent_name := a.name;
        NEW.agent_agency := a.agency;
        NEW.agent_phone := COALESCE(NULLIF(NEW.agent_phone, ''), a.phone);
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS listings_fill_agent ON public.listings;
CREATE TRIGGER listings_fill_agent
    BEFORE INSERT OR UPDATE OF agent_id ON public.listings
    FOR EACH ROW EXECUTE FUNCTION public.fill_listing_agent();

-- Indexes for marketplace searches & student filtering
CREATE INDEX IF NOT EXISTS idx_listings_type ON public.listings(type);
CREATE INDEX IF NOT EXISTS idx_listings_price ON public.listings(price);
CREATE INDEX IF NOT EXISTS idx_listings_state ON public.listings(state);
CREATE INDEX IF NOT EXISTS idx_listings_campus ON public.listings(campus);
CREATE INDEX IF NOT EXISTS idx_listings_agent ON public.listings(agent_id);
CREATE INDEX IF NOT EXISTS idx_agents_kyc_status ON public.agents(kyc_status);

-- ----------------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY
-- ----------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- Remove every v1 policy (they allowed anyone to read, edit and delete anything)
DROP POLICY IF EXISTS "Public read agents" ON public.agents;
DROP POLICY IF EXISTS "Public insert agents" ON public.agents;
DROP POLICY IF EXISTS "Public update agents (KYC approval/rejection)" ON public.agents;
DROP POLICY IF EXISTS "Public can view active listings" ON public.listings;
DROP POLICY IF EXISTS "Public insert access for listings" ON public.listings;
DROP POLICY IF EXISTS "Public update access for listings" ON public.listings;
DROP POLICY IF EXISTS "Public delete access for listings" ON public.listings;

-- PROFILES: you see and edit only yourself; admins see everyone.
DROP POLICY IF EXISTS "Profiles: read own or admin" ON public.profiles;
CREATE POLICY "Profiles: read own or admin" ON public.profiles
    FOR SELECT USING (id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Profiles: update own or admin" ON public.profiles;
CREATE POLICY "Profiles: update own or admin" ON public.profiles
    FOR UPDATE USING (id = auth.uid() OR public.is_admin())
    WITH CHECK (id = auth.uid() OR public.is_admin());

-- AGENTS: KYC documents (NIN, CAC, ID numbers) are visible only to the agent and admins.
DROP POLICY IF EXISTS "Agents: read own or admin" ON public.agents;
CREATE POLICY "Agents: read own or admin" ON public.agents
    FOR SELECT USING (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Agents: agent accounts submit own application" ON public.agents;
CREATE POLICY "Agents: agent accounts submit own application" ON public.agents
    FOR INSERT WITH CHECK (
        user_id = auth.uid()
        AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'agent')
    );

DROP POLICY IF EXISTS "Agents: update own or admin" ON public.agents;
CREATE POLICY "Agents: update own or admin" ON public.agents
    FOR UPDATE USING (user_id = auth.uid() OR public.is_admin())
    WITH CHECK (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Agents: admin delete" ON public.agents;
CREATE POLICY "Agents: admin delete" ON public.agents
    FOR DELETE USING (public.is_admin());

-- LISTINGS: anyone can browse active listings; only KYC-verified agents publish.
DROP POLICY IF EXISTS "Listings: read active, own or admin" ON public.listings;
CREATE POLICY "Listings: read active, own or admin" ON public.listings
    FOR SELECT USING (
        is_active
        OR public.is_admin()
        OR EXISTS (SELECT 1 FROM public.agents a WHERE a.id = listings.agent_id AND a.user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Listings: verified agents insert own" ON public.listings;
CREATE POLICY "Listings: verified agents insert own" ON public.listings
    FOR INSERT WITH CHECK (
        public.is_admin()
        OR EXISTS (
            SELECT 1 FROM public.agents a
            WHERE a.id = listings.agent_id AND a.user_id = auth.uid() AND a.kyc_status = 'verified'
        )
    );

DROP POLICY IF EXISTS "Listings: owner or admin update" ON public.listings;
CREATE POLICY "Listings: owner or admin update" ON public.listings
    FOR UPDATE USING (
        public.is_admin()
        OR EXISTS (SELECT 1 FROM public.agents a WHERE a.id = listings.agent_id AND a.user_id = auth.uid())
    )
    WITH CHECK (
        public.is_admin()
        OR EXISTS (
            SELECT 1 FROM public.agents a
            WHERE a.id = listings.agent_id AND a.user_id = auth.uid() AND a.kyc_status = 'verified'
        )
    );

DROP POLICY IF EXISTS "Listings: owner or admin delete" ON public.listings;
CREATE POLICY "Listings: owner or admin delete" ON public.listings
    FOR DELETE USING (
        public.is_admin()
        OR EXISTS (SELECT 1 FROM public.agents a WHERE a.id = listings.agent_id AND a.user_id = auth.uid())
    );

-- ----------------------------------------------------------------------------
-- 5. RETIRE THE v1 public.users TABLE
-- v1 stored accounts here with no passwords and fully public policies.
-- Supabase Auth + public.profiles replace it. This closes all access to it;
-- once you have checked nothing in it is needed, drop it:
--     DROP TABLE public.users;
-- ----------------------------------------------------------------------------
DO $$
BEGIN
    IF to_regclass('public.users') IS NOT NULL THEN
        EXECUTE 'ALTER TABLE public.users ENABLE ROW LEVEL SECURITY';
        EXECUTE 'DROP POLICY IF EXISTS "Public read users" ON public.users';
        EXECUTE 'DROP POLICY IF EXISTS "Public insert users" ON public.users';
        EXECUTE 'DROP POLICY IF EXISTS "Public update users" ON public.users';
        EXECUTE 'DROP POLICY IF EXISTS "Public delete users" ON public.users';
    END IF;
END $$;

-- ----------------------------------------------------------------------------
-- 6. SAMPLE DATA (fictional agents & listings so the marketplace isn't empty)
-- Sample agents have no user_id, so nobody can sign in as them; admins manage them.
-- ----------------------------------------------------------------------------
INSERT INTO public.agents (id, name, agency, phone, email, state, cac, nin, id_type, id_number, campus_focus, office_address, kyc_status)
VALUES
('AG-10928', 'Babatunde Adeleke', 'Prime Sanctuary Realtors', '+2348031234567', 'babatunde@realty.ng', 'Lagos', 'RC 0000001', '00000000001', 'NIMC National ID Slip', 'SAMPLE-0001', 'UNILAG & YabaTech Corridor (Akoka / Yaba)', 'Suite 4, 12 Commercial Avenue, Sabo, Yaba, Lagos', 'verified'),
('AG-48201', 'Chinedu Eze', 'Student Nest Properties NG', '+2348029988776', 'chinedu@studentnest.ng', 'Lagos', 'BN 0000002', '00000000002', 'Driver''s License (FRSC)', 'SAMPLE-0002', 'LASU Corridor (Ojo, Iba, Okokomaiko)', 'Plot 18 Badagry Expressway, Iba Town, Lagos', 'verified'),
('AG-33910', 'Olumide Bakare', 'Ibadan Youth Housing Hub', '+2348091122334', 'bakare@ibadanhub.ng', 'Oyo', 'BN 0000003', '00000000003', 'Voter''s Card (INEC)', 'SAMPLE-0003', 'UI & Poly Ibadan Corridor (Agbowo / Bodija)', '15 Agbowo Shopping Complex, UI Road, Ibadan', 'verified')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.listings (id, agent_id, agent_name, agent_agency, agent_phone, type, title, price, price_formatted, period, state, area, address, spec1, spec2, campus, campus_dist, lat, lng, media)
VALUES
('DOMA-STU-001', 'AG-10928', 'Babatunde Adeleke', 'Prime Sanctuary Realtors', '+2348031234567', 'student', 'Self-Contain Student Apartment (5 Mins to UNILAG Gate)', 240000, '₦240,000', '/year', 'Lagos', 'Akoka', '14 St Finbarrs Road, Near UNILAG Gate', 'Self-Contain', 'Ensuite Bath & Water Borehole', 'UNILAG (Akoka)', '5 mins walk to Gate', 6.5186, 3.3878, '[{"type":"image","url":"assets/images/hero_student_hostel.jpg","name":"unilag_room.jpg"}]'::jsonb),
('DOMA-STU-002', 'AG-48201', 'Chinedu Eze', 'Student Nest Properties NG', '+2348029988776', 'student', 'Modern Single Bedspace Ensuite - LASU Iba Gate', 180000, '₦180,000', '/year', 'Lagos', 'Iba / Ojo', 'Along LASU-Iba Road, Ojo', 'Single Room Ensuite', 'Prepaid Meter & Security Guard', 'LASU (Ojo)', '3 mins walk to Iba Gate', 6.4674, 3.1981, '[{"type":"image","url":"assets/images/hero_budget_selfcon.jpg","name":"lasu_selfcon.jpg"}]'::jsonb),
('DOMA-STU-003', 'AG-33910', 'Olumide Bakare', 'Ibadan Youth Housing Hub', '+2348091122334', 'student', 'Serviced Room & Parlour Self-Con near UI Agbowo', 220000, '₦220,000', '/year', 'Oyo', 'Agbowo / Bodija', 'Behind Premier Hotel Link, Agbowo, Ibadan', 'Room & Parlour', 'Running Tap & Fenced Compound', 'UI (Ibadan)', '8 mins walk to UI Main Gate', 7.4443, 3.9032, '[{"type":"image","url":"assets/images/hero_budget_selfcon.jpg","name":"ui_room.jpg"}]'::jsonb),
('DOMA-HOU-001', 'AG-10928', 'Babatunde Adeleke', 'Prime Sanctuary Realtors', '+2348031234567', 'house', 'Luxury 4-Bedroom Semi-Detached Duplex with BQ in Lekki Phase 1', 8500000, '₦8,500,000', '/year', 'Lagos', 'Lekki Phase 1', 'Off Admiralty Way, Lekki Phase 1', '4 Bedrooms', '4 Bathrooms & BQ', 'none', '', 6.4474, 3.4723, '[{"type":"image","url":"assets/images/hero_modern_villa.jpg","name":"lekki_villa.jpg"}]'::jsonb)
ON CONFLICT (id) DO NOTHING;
