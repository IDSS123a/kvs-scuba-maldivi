-- ========================================
-- FIX: Dodaj "confirmed" i "cancelled" u user_status ENUM
-- ========================================

-- KORAK 1: Prikaži trenutne vrijednosti ENUM-a user_status
SELECT 
    t.typname AS enum_name,
    e.enumlabel AS enum_value,
    e.enumsortorder AS sort_order
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname = 'user_status'
ORDER BY e.enumsortorder;

-- KORAK 2: Dodaj "confirmed" u ENUM (ako ne postoji)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_enum e
        JOIN pg_type t ON e.enumtypid = t.oid
        WHERE t.typname = 'user_status' 
          AND e.enumlabel = 'confirmed'
    ) THEN
        ALTER TYPE user_status ADD VALUE 'confirmed';
        RAISE NOTICE 'Added "confirmed" to user_status enum';
    ELSE
        RAISE NOTICE '"confirmed" already exists in user_status enum';
    END IF;
END $$;

-- KORAK 3: Dodaj "cancelled" u ENUM (ako ne postoji)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_enum e
        JOIN pg_type t ON e.enumtypid = t.oid
        WHERE t.typname = 'user_status' 
          AND e.enumlabel = 'cancelled'
    ) THEN
        ALTER TYPE user_status ADD VALUE 'cancelled';
        RAISE NOTICE 'Added "cancelled" to user_status enum';
    ELSE
        RAISE NOTICE '"cancelled" already exists in user_status enum';
    END IF;
END $$;

-- KORAK 4: Prikaži ažurirane vrijednosti ENUM-a
SELECT 
    t.typname AS enum_name,
    e.enumlabel AS enum_value,
    e.enumsortorder AS sort_order
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname = 'user_status'
ORDER BY e.enumsortorder;

-- KORAK 5: Status
SELECT 'user_status enum updated with confirmed and cancelled' AS status;
