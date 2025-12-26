
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Setup __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MANUALLY READ .env.local (since dotenv is not installed)
function loadEnv() {
    try {
        const envPath = path.resolve(__dirname, '../.env.local');
        if (!fs.existsSync(envPath)) {
            console.error('❌ .env.local file not found at ' + envPath);
            return {};
        }
        const content = fs.readFileSync(envPath, 'utf8');
        const env = {};
        content.split('\n').forEach(line => {
            const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
            if (match) {
                let key = match[1];
                let value = match[2] || '';
                // Remove quotes if present
                if (value.length > 0 && value.charAt(0) === '"' && value.charAt(value.length - 1) === '"') {
                    value = value.substring(1, value.length - 1);
                }
                env[key] = value;
            }
        });
        return env;
    } catch (e) {
        console.error('❌ Error reading env file:', e);
        return {};
    }
}

const env = loadEnv();
const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const CHECKLIST_ITEMS = [
    // DOKUMENTI
    { id: 'doc_001', category: 'dokumenti', name: 'Pasoš', name_en: 'Passport', mandatory: true, priority: 'critical', icon: '🛂' },
    { id: 'doc_002', category: 'dokumenti', name: 'Putničko osiguranje', name_en: 'Travel Insurance', mandatory: true, priority: 'critical', icon: '🛡️' },
    { id: 'doc_003', category: 'dokumenti', name: 'Lična karta', name_en: 'ID Card', mandatory: false, priority: 'medium', icon: '🪪' },
    { id: 'doc_005', category: 'dokumenti', name: 'SSI certifikat', name_en: 'SSI Certification', mandatory: true, priority: 'critical', icon: '💳' },
    { id: 'doc_006', category: 'dokumenti', name: 'Potvrda o rezervaciji hotela', name_en: 'Hotel Booking Confirmation', mandatory: false, priority: 'medium', icon: '🏨' },
    { id: 'doc_007', category: 'dokumenti', name: 'Kontakt za hitne slučajeve', name_en: 'Emergency Contact', mandatory: false, priority: 'high', icon: '📞' },

    // NOVAC
    { id: 'mon_001', category: 'novac', name: 'Dolari (USD)', name_en: 'Dollars (USD)', mandatory: true, priority: 'critical', icon: '💵' },
    { id: 'mon_002', category: 'novac', name: 'Kreditna kartica', name_en: 'Credit Card', mandatory: false, priority: 'high', icon: '💳' },
    { id: 'mon_003', category: 'novac', name: 'Dolari sitno za napojnice', name_en: 'Small USD for tips', mandatory: false, priority: 'medium', icon: '💸' },

    // RONILAČKA OPREMA
    { id: 'div_001', category: 'oprema', name: 'Neopren odijelo 3mm', name_en: 'Wetsuit 3mm', mandatory: true, priority: 'high', icon: '🏄' },
    { id: 'div_002', category: 'oprema', name: 'Maska', name_en: 'Mask', mandatory: true, priority: 'high', icon: '🤿' },
    { id: 'div_003', category: 'oprema', name: 'Disalica (snorkel)', name_en: 'Snorkel', mandatory: true, priority: 'high', icon: '🎋' },
    { id: 'div_004', category: 'oprema', name: 'Peraje', name_en: 'Fins', mandatory: true, priority: 'high', icon: '🧜' },
    { id: 'div_005', category: 'oprema', name: 'Ronilačke čizme', name_en: 'Dive Boots', mandatory: true, priority: 'high', icon: '👢' },
    { id: 'div_006', category: 'oprema', name: 'Diving kompjuter', name_en: 'Dive Computer', mandatory: true, priority: 'critical', icon: '⌚' },
    { id: 'div_007', category: 'oprema', name: 'BCD', name_en: 'BCD', mandatory: true, priority: 'high', icon: '🎒' },
    { id: 'div_008', category: 'oprema', name: 'Regulator', name_en: 'Regulator', mandatory: true, priority: 'high', icon: '🌬️' },
    { id: 'div_009', category: 'oprema', name: 'Octopus', name_en: 'Octopus', mandatory: false, priority: 'high', icon: '🐙' },
    { id: 'div_010', category: 'oprema', name: 'Nož', name_en: 'Dive Knife', mandatory: false, priority: 'medium', icon: '🔪' },
    { id: 'div_011', category: 'oprema', name: 'Podvodna kamera', name_en: 'Underwater Camera', mandatory: false, priority: 'medium', icon: '📷' },
    { id: 'div_012', category: 'oprema', name: 'Torba za opremu', name_en: 'Gear Bag', mandatory: false, priority: 'medium', icon: '👜' },

    // ODJEĆA I OBUĆA
    { id: 'clo_001', category: 'odjeca', name: 'Kupaći kostimi', name_en: 'Swimwear', mandatory: false, priority: 'high', icon: '🩱' },
    { id: 'clo_002', category: 'odjeca', name: 'Šorc', name_en: 'Shorts', mandatory: false, priority: 'medium', icon: '🩳' },
    { id: 'clo_003', category: 'odjeca', name: 'Bermude', name_en: 'Bermuda', mandatory: false, priority: 'medium', icon: '🩳' },
    { id: 'clo_004', category: 'odjeca', name: 'Majice', name_en: 'T-shirts', mandatory: false, priority: 'medium', icon: '👕' },
    { id: 'clo_005', category: 'odjeca', name: 'Duks', name_en: 'Hoodie', mandatory: false, priority: 'medium', icon: '🧥' },
    { id: 'clo_006', category: 'odjeca', name: 'Jakna', name_en: 'Jacket', mandatory: false, priority: 'medium', icon: '🧥' },
    { id: 'clo_007', category: 'odjeca', name: 'Šešir', name_en: 'Hat', mandatory: false, priority: 'medium', icon: '👒' },
    { id: 'clo_008', category: 'odjeca', name: 'Sunčane naočale', name_en: 'Sunglasses', mandatory: false, priority: 'medium', icon: '🕶️' },
    { id: 'clo_009', category: 'odjeca', name: 'Patike', name_en: 'Sneakers', mandatory: false, priority: 'medium', icon: '👟' },
    { id: 'clo_010', category: 'odjeca', name: 'Čarape', name_en: 'Socks', mandatory: false, priority: 'low', icon: '🧦' },
    { id: 'clo_011', category: 'odjeca', name: 'Donje rublje', name_en: 'Underwear', mandatory: false, priority: 'medium', icon: '🩲' },
    { id: 'clo_012', category: 'odjeca', name: 'Pidžama', name_en: 'Pajamas', mandatory: false, priority: 'low', icon: '👕' },

    // ZDRAVLJE I HIGIJENA
    { id: 'hea_001', category: 'zdravlje', name: 'UV krema SPF 50+', name_en: 'Sunscreen 50+', mandatory: true, priority: 'high', icon: '🧴' },
    { id: 'hea_002', category: 'zdravlje', name: 'After sun njega', name_en: 'After sun care', mandatory: false, priority: 'medium', icon: '🧴' },
    { id: 'hea_003', category: 'zdravlje', name: 'Sprej protiv komaraca', name_en: 'Mosquito spray', mandatory: false, priority: 'medium', icon: '🦟' },
    { id: 'hea_004', category: 'zdravlje', name: 'Paracetamol', name_en: 'Paracetamol', mandatory: true, priority: 'high', icon: '💊' },
    { id: 'hea_005', category: 'zdravlje', name: 'Ibuprofen', name_en: 'Ibuprofen', mandatory: true, priority: 'high', icon: '💊' },
    { id: 'hea_006', category: 'zdravlje', name: 'Probiotici', name_en: 'Probiotics', mandatory: false, priority: 'medium', icon: '💊' },
    { id: 'hea_007', category: 'zdravlje', name: 'Tablete protiv mučnine', name_en: 'Motion sickness pills', mandatory: false, priority: 'medium', icon: '💊' },
    { id: 'hea_008', category: 'zdravlje', name: 'Flasteri', name_en: 'Plasters', mandatory: false, priority: 'low', icon: '🩹' },
    { id: 'hea_009', category: 'zdravlje', name: 'Gaze', name_en: 'Gauze', mandatory: false, priority: 'low', icon: '🩹' },
    { id: 'hea_010', category: 'zdravlje', name: 'Dezinfekcija', name_en: 'Disinfectant', mandatory: false, priority: 'medium', icon: '🧼' },
    { id: 'hea_011', category: 'zdravlje', name: 'Kapi za uši', name_en: 'Ear drops', mandatory: true, priority: 'high', icon: '💧' },
    { id: 'hea_012', category: 'zdravlje', name: 'Pribor za higijenu', name_en: 'Toiletries', mandatory: false, priority: 'medium', icon: '🪥' },

    // ELEKTRONIKA
    { id: 'ele_001', category: 'elektronika', name: 'Podvodno kućište', name_en: 'Underwater Housing', mandatory: false, priority: 'high', icon: '📦' },
    { id: 'ele_002', category: 'elektronika', name: 'Dodatne baterije', name_en: 'Extra batteries', mandatory: false, priority: 'medium', icon: '🔋' },
    { id: 'ele_003', category: 'elektronika', name: 'Punjač za kameru', name_en: 'Camera charger', mandatory: false, priority: 'medium', icon: '🔌' },
    { id: 'ele_004', category: 'elektronika', name: 'Memorijske kartice', name_en: 'Memory cards', mandatory: false, priority: 'medium', icon: '💾' },
    { id: 'ele_005', category: 'elektronika', name: 'Punjač za mobitel', name_en: 'Phone charger', mandatory: false, priority: 'high', icon: '🔌' },
    { id: 'ele_006', category: 'elektronika', name: 'Power bank', name_en: 'Power bank', mandatory: false, priority: 'high', icon: '🔋' },
    { id: 'ele_007', category: 'elektronika', name: 'Putnički adapter za struju (D)', name_en: 'Travel adapter (D)', mandatory: false, priority: 'high', icon: '🔌' }
];

async function populate() {
    console.log('🔍 Fetching all participants...');
    const { data: users, error: userError } = await supabase
        .from('users')
        .select('id, name')
        .in('status', ['active', 'confirmed']);

    if (userError) {
        console.error('❌ Error fetching users:', userError);
        return;
    }

    console.log(`✅ Found ${users.length} active/confirmed participants.`);

    for (const user of users) {
        console.log(`📦 Initializing checklist for: ${user.name}...`);

        const itemsToInsert = CHECKLIST_ITEMS.map((item, index) => ({
            ...item,
            user_id: user.id,
            sort_order: index
        }));

        const { error: insertError } = await supabase
            .from('checklist_items')
            .upsert(itemsToInsert, { onConflict: 'id,user_id' });

        if (insertError) {
            console.error(`  ❌ Error: ${insertError.message}`);
        } else {
            console.log(`  ✅ Done.`);
        }
    }

    console.log('\n🎉 ALL CHECKLISTS REPAIRED!');
}

populate().catch(console.error);
