
-- ============================================================================
-- MASTER CHECKLIST EXPANSION & SYNC FIX - FINAL VERSION
-- ============================================================================

-- 1. SECURITY RESET
-- Disabling RLS is necessary because the custom PIN auth system doesn't set a standard Supabase session.
-- This allows the front-end to save progress directly.
ALTER TABLE public.checklist_items DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public access to checklists" ON public.checklist_items;
DROP POLICY IF EXISTS "Users can manage own checklist" ON public.checklist_items;
DROP POLICY IF EXISTS "Admins can manage all checklists" ON public.checklist_items;

-- 2. RE-POPULATE (Clean slate with detailed 52-item list)
DELETE FROM public.checklist_items;

DO $$
DECLARE
    u RECORD;
BEGIN
    FOR u IN SELECT id FROM public.users WHERE status IN ('active', 'confirmed')
    LOOP
        INSERT INTO public.checklist_items (id, user_id, category, name, name_en, mandatory, priority, icon, sort_order)
        VALUES 
        -- DOKUMENTI
        ('doc_001', u.id, 'dokumenti', 'Pasoš', 'Passport', true, 'critical', '🛂', 1),
        ('doc_002', u.id, 'dokumenti', 'Putničko osiguranje', 'Travel Insurance', true, 'critical', '🛡️', 2),
        ('doc_003', u.id, 'dokumenti', 'Lična karta', 'ID Card', false, 'medium', '🪪', 3),
        ('doc_005', u.id, 'dokumenti', 'SSI certifikat', 'SSI Certification', true, 'critical', '💳', 4),
        ('doc_006', u.id, 'dokumenti', 'Potvrda o rezervaciji hotela', 'Hotel Booking Confirmation', false, 'medium', '🏨', 5),
        ('doc_007', u.id, 'dokumenti', 'Kontakt za hitne slučajeve', 'Emergency Contact', false, 'high', '📞', 6),
        
        -- NOVAC
        ('mon_001', u.id, 'novac', 'Dolari (USD)', 'Dollars (USD)', true, 'critical', '💵', 7),
        ('mon_002', u.id, 'novac', 'Kreditna kartica', 'Credit Card', false, 'high', '💳', 8),
        ('mon_003', u.id, 'novac', 'Dolari sitno za napojnice', 'Small USD for tips', false, 'medium', '💸', 9),
        
        -- OPREMA
        ('div_001', u.id, 'oprema', 'Neopren odijelo 3mm', 'Wetsuit 3mm', true, 'high', '🏄', 10),
        ('div_002', u.id, 'oprema', 'Maska', 'Mask', true, 'high', '🤿', 11),
        ('div_003', u.id, 'oprema', 'Disalica (snorkel)', 'Snorkel', true, 'high', '🎋', 12),
        ('div_004', u.id, 'oprema', 'Peraje', 'Fins', true, 'high', '🧜', 13),
        ('div_005', u.id, 'oprema', 'Ronilačke čizme', 'Dive Boots', true, 'high', '👢', 14),
        ('div_006', u.id, 'oprema', 'Diving kompjuter', 'Dive Computer', true, 'critical', '⌚', 15),
        ('div_007', u.id, 'oprema', 'BCD', 'BCD', true, 'high', '🎒', 16),
        ('div_008', u.id, 'oprema', 'Regulator', 'Regulator', true, 'high', '🌬️', 17),
        ('div_009', u.id, 'oprema', 'Octopus', 'Octopus', false, 'high', '🐙', 18),
        ('div_010', u.id, 'oprema', 'Nož', 'Dive Knife', false, 'medium', '🔪', 19),
        ('div_011', u.id, 'oprema', 'Podvodna kamera', 'Underwater Camera', false, 'medium', '📷', 20),
        ('div_012', u.id, 'oprema', 'Torba za opremu', 'Gear Bag', false, 'medium', '👜', 21),
        
        -- ODJEĆA I OBUĆA
        ('clo_001', u.id, 'odjeca', 'Kupaći kostimi', 'Swimwear', false, 'high', '🩱', 22),
        ('clo_002', u.id, 'odjeca', 'Šorc', 'Shorts', false, 'medium', '🩳', 23),
        ('clo_003', u.id, 'odjeca', 'Bermude', 'Bermuda', false, 'medium', '🩳', 24),
        ('clo_004', u.id, 'odjeca', 'Majice', 'T-shirts', false, 'medium', '👕', 25),
        ('clo_005', u.id, 'odjeca', 'Duks', 'Hoodie', false, 'medium', '🧥', 26),
        ('clo_006', u.id, 'odjeca', 'Jakna', 'Jacket', false, 'medium', '🧥', 27),
        ('clo_007', u.id, 'odjeca', 'Šešir', 'Hat', false, 'medium', '👒', 28),
        ('clo_008', u.id, 'odjeca', 'Sunčane naočale', 'Sunglasses', false, 'medium', '🕶️', 29),
        ('clo_009', u.id, 'odjeca', 'Patike', 'Sneakers', false, 'medium', '👟', 30),
        ('clo_010', u.id, 'odjeca', 'Čarape', 'Socks', false, 'low', '🧦', 31),
        ('clo_011', u.id, 'odjeca', 'Donje rublje', 'Underwear', false, 'medium', '🩲', 32),
        ('clo_012', u.id, 'odjeca', 'Pidžama', 'Pajamas', false, 'low', '👕', 33),
        
        -- ZDRAVLJE I HIGIJENA
        ('hea_001', u.id, 'zdravlje', 'UV krema SPF 50+', 'Sunscreen 50+', true, 'high', '🧴', 34),
        ('hea_002', u.id, 'zdravlje', 'After sun njega', 'After sun care', false, 'medium', '🧴', 35),
        ('hea_003', u.id, 'zdravlje', 'Sprej protiv komaraca', 'Mosquito spray', false, 'medium', '🦟', 36),
        ('hea_004', u.id, 'zdravlje', 'Paracetamol', 'Paracetamol', true, 'high', '💊', 37),
        ('hea_005', u.id, 'zdravlje', 'Ibuprofen', 'Ibuprofen', true, 'high', '💊', 38),
        ('hea_006', u.id, 'zdravlje', 'Probiotici', 'Probiotics', false, 'medium', '💊', 39),
        ('hea_007', u.id, 'zdravlje', 'Tablete protiv mučnine', 'Motion sickness pills', false, 'medium', '💊', 40),
        ('hea_008', u.id, 'zdravlje', 'Flasteri', 'Plasters', false, 'low', '🩹', 41),
        ('hea_009', u.id, 'zdravlje', 'Gaze', 'Gauze', false, 'low', '🩹', 42),
        ('hea_010', u.id, 'zdravlje', 'Dezinfekcija', 'Disinfectant', false, 'medium', '🧼', 43),
        ('hea_011', u.id, 'zdravlje', 'Kapi za uši', 'Ear drops', true, 'high', '💧', 44),
        ('hea_012', u.id, 'zdravlje', 'Pribor za higijenu', 'Toiletries', false, 'medium', '🪥', 45),
        
        -- ELEKTRONIKA
        ('ele_001', u.id, 'elektronika', 'Podvodno kućište', 'Underwater Housing', false, 'high', '📦', 46),
        ('ele_002', u.id, 'elektronika', 'Dodatne baterije', 'Extra batteries', false, 'medium', '🔋', 47),
        ('ele_003', u.id, 'elektronika', 'Punjač za kameru', 'Camera charger', false, 'medium', '🔌', 48),
        ('ele_004', u.id, 'elektronika', 'Memorijske kartice', 'Memory cards', false, 'medium', '💾', 49),
        ('ele_005', u.id, 'elektronika', 'Punjač za mobitel', 'Phone charger', false, 'high', '🔌', 50),
        ('ele_006', u.id, 'elektronika', 'Power bank', 'Power bank', false, 'high', '🔋', 51),
        ('ele_007', u.id, 'elektronika', 'Putnički adapter za struju (D)', 'Travel adapter (D)', false, 'high', '🔌', 52)
        ON CONFLICT (id, user_id) DO NOTHING;
    END LOOP;
END $$;

-- 3. IMPROVED READINESS FUNCTION (Dynamic)
-- This function now dynamically counts all items marked as 'mandatory' in the table.
-- No more hardcoded IDs!
CREATE OR REPLACE FUNCTION public.calculate_readiness_status(user_uuid UUID)
RETURNS TABLE (total_mandatory INTEGER, checked_mandatory INTEGER, is_ready BOOLEAN) 
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::INTEGER,
    COUNT(CASE WHEN checked = true THEN 1 END)::INTEGER,
    (COUNT(*) > 0 AND COUNT(CASE WHEN checked = true THEN 1 END) = COUNT(*))
  FROM public.checklist_items
  WHERE user_id = user_uuid 
    AND mandatory = true;
END;
$$;
