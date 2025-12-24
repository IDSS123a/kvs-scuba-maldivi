import { supabase } from './supabaseClient';
import { Diver } from '../types';

/**
 * Fetch all divers from Supabase
 */
export async function fetchDiversFromSupabase(): Promise<Diver[]> {
  try {
    const { data, error } = await supabase
      .from('divers')
      .select('*')
      .order('name');

    if (error) throw error;

    return (data || []).map(row => ({
      id: row.id,
      name: row.name,
      email: row.email,
      phone1: row.phone,
      birthDate: row.birth_date,
      age: row.age,
      dives: row.total_dives,
      startYear: row.start_year,
      role: row.is_pro ? 'Admin' : (row.age && row.age < 18 ? 'Child' : 'Adult'),
      photo: row.photo_url,
      dietaryRestrictions: row.dietary_restrictions,
      status: row.status,
      emergencyContact: {
        name: row.emergency_contact_name,
        relationship: row.emergency_contact_relationship,
        phone: row.emergency_contact_phone,
      },
    }));
  } catch (error) {
    console.error('Error fetching divers from Supabase:', error);
    throw error;
  }
}

/**
 * Insert or update a diver in Supabase
 */
export async function upsertDiver(diver: Partial<Diver> & { name: string }) {
  try {
    const { data, error } = await supabase
      .from('divers')
      .upsert(
        {
          name: diver.name,
          email: diver.email,
          phone: diver.phone1,
          birth_date: diver.birthDate,
          age: diver.age,
          total_dives: diver.dives || 0,
          start_year: diver.divesFromYear,
          is_pro: diver.role === 'Admin',
          photo_url: diver.photo,
          dietary_restrictions: diver.dietaryRestrictions,
          status: diver.status || 'pending',
          emergency_contact_name: diver.emergencyContact?.name,
          emergency_contact_relationship: diver.emergencyContact?.relationship,
          emergency_contact_phone: diver.emergencyContact?.phone,
        },
        { onConflict: 'name' }
      );

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error upserting diver:', error);
    throw error;
  }
}

/**
 * Fetch all payments from Supabase
 */
export async function fetchPayments() {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('*, divers(name, email)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching payments:', error);
    throw error;
  }
}

/**
 * Record a payment in Supabase
 */
export async function recordPayment(
  diverId: string,
  amountEur: number,
  paymentMethod: 'agency' | 'cash',
  paymentDate?: string,
  notes?: string
) {
  try {
    const { data, error } = await supabase
      .from('payments')
      .insert({
        diver_id: diverId,
        amount_eur: amountEur,
        payment_method: paymentMethod,
        payment_date: paymentDate,
        status: 'completed',
        notes,
      });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error recording payment:', error);
    throw error;
  }
}

/**
 * Fetch gallery images from Supabase
 */
export async function fetchGalleryImages(category?: string) {
  try {
    let query = supabase
      .from('gallery')
      .select('*, divers(name)');

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching gallery:', error);
    throw error;
  }
}

/**
 * Upload a gallery image to Supabase
 */
export async function uploadGalleryImage(
  imageUrl: string,
  title?: string,
  description?: string,
  category: 'dive' | 'group' | 'meal' | 'fun' | 'other' = 'other',
  diverId?: string,
  uploadedBy?: string
) {
  try {
    const { data, error } = await supabase
      .from('gallery')
      .insert({
        image_url: imageUrl,
        title,
        description,
        category,
        diver_id: diverId,
        uploaded_by: uploadedBy || 'anonymous',
      });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error uploading gallery image:', error);
    throw error;
  }
}

/**
 * Fetch itinerary from Supabase
 */
export async function fetchItinerary() {
  try {
    const { data, error } = await supabase
      .from('itinerary')
      .select('*')
      .order('day', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching itinerary:', error);
    throw error;
  }
}

/**
 * Subscribe to real-time changes in divers table (v2 API)
 */
export function subscribeToDivers(callback: (payload: any) => void) {
  const channel = supabase
    .channel('divers_changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'divers' }, callback)
    .subscribe();

  return channel;
}

/**
 * Subscribe to real-time changes in payments table (v2 API)
 */
export function subscribeToPayments(callback: (payload: any) => void) {
  const channel = supabase
    .channel('payments_changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, callback)
    .subscribe();

  return channel;
}

/**
 * Subscribe to real-time changes in gallery table (v2 API)
 */
export function subscribeToGallery(callback: (payload: any) => void) {
  const channel = supabase
    .channel('gallery_changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'gallery' }, callback)
    .subscribe();

  return channel;
}
