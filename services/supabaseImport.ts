/**
 * Utility functions for importing data from Google Sheets to Supabase
 * Use this to bulk-import participant data
 */

import { supabase } from './supabaseClient';

export interface ImportResult {
  imported: number;
  failed: number;
  errors: Array<{ row: number; error: string }>;
}

/**
 * Import divers from CSV data
 * CSV format expected: name, address, city, country, birthdate(age), email, phone, dives info, master id, ssi pro id, photo url, dietary, em_name, em_rel, em_phone
 */
export async function importDiversFromCSV(csvText: string): Promise<ImportResult> {
  const result: ImportResult = { imported: 0, failed: 0, errors: [] };
  const lines = csvText.trim().split('\n');

  // Skip header row
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    try {
      const fields = parseCSVLine(line);
      if (fields.length < 10) {
        result.errors.push({ row: i + 1, error: 'Insufficient columns' });
        result.failed++;
        continue;
      }

      const [name, address, city, country, birthInfo, email, phone, diveInfo, masterId, ssiPro, photo, dietary, emName, emRel, emPhone] = fields;

      if (!name?.trim()) {
        result.errors.push({ row: i + 1, error: 'Missing name' });
        result.failed++;
        continue;
      }

      // Parse age from birth date
      const ageMatch = birthInfo?.match(/\((\d+)\)/);
      const age = ageMatch ? parseInt(ageMatch[1]) : null;
      const birthDate = birthInfo?.split('(')[0].trim() || null;

      // Parse dives from dive info
      const diveMatch = diveInfo?.match(/^(\d+)/);
      const totalDives = diveMatch ? parseInt(diveMatch[1]) : 0;
      const startYearMatch = diveInfo?.match(/Od (\d+)/i);
      const startYear = startYearMatch ? parseInt(startYearMatch[1]) : null;

      const isPro = !!ssiPro?.trim();

      const { error } = await supabase
        .from('divers')
        .insert({
          name: name.trim(),
          email: email?.trim() || null,
          phone: phone?.trim() || null,
          birth_date: birthDate,
          age,
          total_dives: totalDives,
          start_year: startYear,
          is_pro: isPro,
          photo_url: photo?.trim() || null,
          dietary_restrictions: dietary?.trim() || null,
          emergency_contact_name: emName?.trim() || null,
          emergency_contact_relationship: emRel?.trim() || null,
          emergency_contact_phone: emPhone?.trim() || null,
          status: 'confirmed',
        });

      if (error) {
        result.errors.push({ row: i + 1, error: error.message });
        result.failed++;
      } else {
        result.imported++;
      }
    } catch (error) {
      result.errors.push({
        row: i + 1,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      result.failed++;
    }
  }

  return result;
}

/**
 * Parse a CSV line handling quoted fields
 */
function parseCSVLine(line: string): string[] {
  const fields: string[] = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        currentField += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        fields.push(currentField.trim());
        currentField = '';
      } else {
        currentField += char;
      }
    }
  }

  fields.push(currentField.trim());
  return fields;
}

/**
 * Import from File input (HTML file upload)
 */
export async function importDiversFromFile(file: File): Promise<ImportResult> {
  const text = await file.text();
  return importDiversFromCSV(text);
}

/**
 * Import from Google Sheets CSV export URL
 * @deprecated - Google Sheets integration removed. Use Supabase only.
 */
export async function importDiversFromSheetURL(sheetUrl: string): Promise<ImportResult> {
  return {
    imported: 0,
    failed: 1,
    errors: [
      {
        row: 0,
        error: 'Google Sheets integration has been removed. Please use Supabase directly.',
      },
    ],
  };
}

/**
 * Verify and test a single diver record
 */
export async function testDiverImport(diverData: any): Promise<boolean> {
  try {
    const { error } = await supabase.from('divers').insert({
      name: diverData.name,
      email: diverData.email || null,
      phone: diverData.phone || null,
      birth_date: diverData.birth_date || null,
      age: diverData.age || null,
      total_dives: diverData.total_dives || 0,
      start_year: diverData.start_year || null,
      is_pro: diverData.is_pro || false,
      photo_url: diverData.photo_url || null,
      dietary_restrictions: diverData.dietary_restrictions || null,
      emergency_contact_name: diverData.emergency_contact_name || null,
      emergency_contact_relationship: diverData.emergency_contact_relationship || null,
      emergency_contact_phone: diverData.emergency_contact_phone || null,
      status: diverData.status || 'pending',
    });

    return !error;
  } catch (error) {
    console.error('Test import failed:', error);
    return false;
  }
}
