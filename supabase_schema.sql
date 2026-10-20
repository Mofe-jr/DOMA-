-- ============================================================================
-- DOMA.ng - Supabase Database Schema
-- Nigerian Real Estate Marketplace & Student Housing Platform
-- ============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create USERS Table (Custom Accounts for Students, Tenants, Agents, Admins)
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('student', 'tenant', 'agent', 'admin')),
    phone TEXT,
    state TEXT DEFAULT 'Lagos',
    university TEXT, -- for students (e.g. UNILAG, LASU, UI, UNIPORT, YabaTech)
    target_budget NUMERIC, -- for students (under ₦300k) and tenants
    preferred_type TEXT, -- self-contain, flat, duplex, store
    agent_id TEXT, -- linked agent ID if role is agent
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Create AGENTS Table (KYC Credentials & Verification State)
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

-- 4. Create LISTINGS Table (Houses, Student Hostels & Stores)
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

-- 4. Create Indexes for High-Speed Marketplace Searches & Student Filtering
CREATE INDEX IF NOT EXISTS idx_listings_type ON public.listings(type);
CREATE INDEX IF NOT EXISTS idx_listings_price ON public.listings(price);
CREATE INDEX IF NOT EXISTS idx_listings_state ON public.listings(state);
CREATE INDEX IF NOT EXISTS idx_listings_campus ON public.listings(campus);
CREATE INDEX IF NOT EXISTS idx_agents_kyc_status ON public.agents(kyc_status);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- 6. Row Level Security Policies (Idempotent: drops prior policies if script is re-run)

-- USERS Policies
DROP POLICY IF EXISTS "Public read users" ON public.users;
CREATE POLICY "Public read users" ON public.users FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Public insert users" ON public.users;
CREATE POLICY "Public insert users" ON public.users FOR INSERT WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Public update users" ON public.users;
CREATE POLICY "Public update users" ON public.users FOR UPDATE USING (TRUE) WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Public delete users" ON public.users;
CREATE POLICY "Public delete users" ON public.users FOR DELETE USING (TRUE);

-- LISTINGS Policies
DROP POLICY IF EXISTS "Public can view active listings" ON public.listings;
CREATE POLICY "Public can view active listings"
    ON public.listings FOR SELECT
    USING (is_active = TRUE);

DROP POLICY IF EXISTS "Public insert access for listings" ON public.listings;
CREATE POLICY "Public insert access for listings"
    ON public.listings FOR INSERT
    WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Public update access for listings" ON public.listings;
CREATE POLICY "Public update access for listings"
    ON public.listings FOR UPDATE
    USING (TRUE)
    WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Public delete access for listings" ON public.listings;
CREATE POLICY "Public delete access for listings"
    ON public.listings FOR DELETE
    USING (TRUE);

-- AGENTS Policies (KYC registration & status moderation)
DROP POLICY IF EXISTS "Public read agents" ON public.agents;
CREATE POLICY "Public read agents"
    ON public.agents FOR SELECT
    USING (TRUE);

DROP POLICY IF EXISTS "Public insert agents" ON public.agents;
CREATE POLICY "Public insert agents"
    ON public.agents FOR INSERT
    WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Public update agents (KYC approval/rejection)" ON public.agents;
CREATE POLICY "Public update agents (KYC approval/rejection)"
    ON public.agents FOR UPDATE
    USING (TRUE)
    WITH CHECK (TRUE);

-- 7. Seed Custom User Accounts (Students, Tenants, Agents, Admins)
INSERT INTO public.users (id, email, full_name, role, phone, state, university, target_budget, preferred_type, agent_id)
VALUES
(
    'USR-STU-001',
    'tunde.student@unilag.edu.ng',
    'Tunde Adeyemi',
    'student',
    '+2348123456789',
    'Lagos',
    'UNILAG (Akoka)',
    250000,
    'Self-Contain Ensuite',
    NULL
),
(
    'USR-TEN-001',
    'amaka.okonkwo@gmail.com',
    'Amaka Okonkwo',
    'tenant',
    '+2348039876543',
    'Lagos',
    NULL,
    3500000,
    '3-Bedroom Flat',
    NULL
),
(
    'USR-AGT-001',
    'babatunde@realty.ng',
    'Babatunde Adeleke',
    'agent',
    '+2348031234567',
    'Lagos',
    'UNILAG & YabaTech Corridor (Akoka / Yaba)',
    NULL,
    'All Residential & Stores',
    'AG-10928'
),
(
    'USR-ADM-001',
    'admin@doma.ng',
    'Super Admin',
    'admin',
    '+2348000000000',
    'Abuja',
    NULL,
    NULL,
    'Administrative Controls',
    NULL
)
ON CONFLICT (email) DO UPDATE SET
    role = EXCLUDED.role;

-- 8. Seed Sample Verified Agents & KYC Applications
INSERT INTO public.agents (id, name, agency, phone, email, state, cac, nin, id_type, id_number, campus_focus, office_address, kyc_status)
VALUES 
(
    'AG-10928',
    'Babatunde Adeleke',
    'Prime Sanctuary Realtors',
    '+2348031234567',
    'babatunde@realty.ng',
    'Lagos',
    'RC 1948201',
    '28491028412',
    'NIMC National ID Slip',
    'NIMC-2849102',
    'UNILAG & YabaTech Corridor (Akoka / Yaba)',
    'Suite 4, 12 Commercial Avenue, Sabo, Yaba, Lagos',
    'verified'
),
(
    'AG-48201',
    'Chinedu Eze',
    'Student Nest Properties NG',
    '+2348029988776',
    'chinedu@studentnest.ng',
    'Lagos',
    'BN 3847291',
    '59381920481',
    'Driver''s License (FRSC)',
    'FRSC-892019A',
    'LASU Corridor (Ojo, Iba, Okokomaiko)',
    'Plot 18 Badagry Expressway, Iba Town, Lagos',
    'verified'
),
(
    'AG-77391',
    'Fatima Ibrahim',
    'Capital Haven Estates',
    '+2348055543210',
    'fatima@capitalhaven.ng',
    'Abuja',
    'RC 8392019',
    '83920182940',
    'Nigerian International Passport',
    'A10294819',
    'General Residential & Commercial',
    'Plot 402 Aminu Kano Crescent, Wuse 2, Abuja',
    'pending'
),
(
    'AG-33910',
    'Olumide Bakare',
    'Ibadan Youth Housing Hub',
    '+2348091122334',
    'bakare@ibadanhub.ng',
    'Oyo',
    'BN 9920182',
    '10293847561',
    'Voter''s Card (INEC)',
    'INEC-OYO-39102',
    'UI & Poly Ibadan Corridor (Agbowo / Bodija)',
    '15 Agbowo Shopping Complex, UI Road, Ibadan',
    'verified'
)
ON CONFLICT (id) DO UPDATE SET
    kyc_status = EXCLUDED.kyc_status;

-- 8. Seed Sample Realistic Nigerian Listings (Student Hostels < 300k & Residential)
INSERT INTO public.listings (id, agent_id, agent_name, agent_agency, agent_phone, type, title, price, price_formatted, period, state, area, address, spec1, spec2, campus, campus_dist, lat, lng, media)
VALUES
(
    'DOMA-STU-001',
    'AG-10928',
    'Babatunde Adeleke',
    'Prime Sanctuary Realtors',
    '+2348031234567',
    'student',
    'Self-Contain Student Apartment (5 Mins to UNILAG Gate)',
    240000,
    '₦240,000',
    '/year',
    'Lagos',
    'Akoka',
    '14 St Finbarrs Road, Near UNILAG Gate',
    'Self-Contain',
    'Ensuite Bath & Water Borehole',
    'UNILAG (Akoka)',
    '5 mins walk to Gate',
    6.5186,
    3.3878,
    '[{"type":"image","url":"assets/images/hero_student_hostel.jpg","name":"unilag_room.jpg"}]'::jsonb
),
(
    'DOMA-STU-002',
    'AG-48201',
    'Chinedu Eze',
    'Student Nest Properties NG',
    '+2348029988776',
    'student',
    'Modern Single Bedspace Ensuite - LASU Iba Gate',
    180000,
    '₦180,000',
    '/year',
    'Lagos',
    'Iba / Ojo',
    'Along LASU-Iba Road, Ojo',
    'Single Room Ensuite',
    'Prepaid Meter & Security Guard',
    'LASU (Ojo)',
    '3 mins walk to Iba Gate',
    6.4674,
    3.1981,
    '[{"type":"image","url":"assets/images/hero_budget_selfcon.jpg","name":"lasu_selfcon.jpg"}]'::jsonb
),
(
    'DOMA-STU-003',
    'AG-33910',
    'Olumide Bakare',
    'Ibadan Youth Housing Hub',
    '+2348091122334',
    'student',
    'Serviced Room & Parlour Self-Con near UI Agbowo',
    220000,
    '₦220,000',
    '/year',
    'Oyo',
    'Agbowo / Bodija',
    'Behind Premier Hotel Link, Agbowo, Ibadan',
    'Room & Parlour',
    'Running Tap & Fenced Compound',
    'UI (Ibadan)',
    '8 mins walk to UI Main Gate',
    7.4443,
    3.9032,
    '[{"type":"image","url":"assets/images/hero_budget_selfcon.jpg","name":"ui_room.jpg"}]'::jsonb
),
(
    'DOMA-HOU-001',
    'AG-10928',
    'Babatunde Adeleke',
    'Prime Sanctuary Realtors',
    '+2348031234567',
    'house',
    'Luxury 4-Bedroom Semi-Detached Duplex with BQ in Lekki Phase 1',
    8500000,
    '₦8,500,000',
    '/year',
    'Lagos',
    'Lekki Phase 1',
    'Off Admiralty Way, Lekki Phase 1',
    '4 Bedrooms',
    '4 Bathrooms & BQ',
    'none',
    '',
    6.4474,
    3.4723,
    '[{"type":"image","url":"assets/images/hero_modern_villa.jpg","name":"lekki_villa.jpg"}]'::jsonb
)
ON CONFLICT (id) DO NOTHING;
