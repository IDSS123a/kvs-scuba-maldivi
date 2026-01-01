
import { supabase } from './supabaseClient';
import { Diver } from '../types';

export async function fetchDiversFromSupabase(): Promise<Diver[]> {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .order('name');

        if (error) throw error;

        return (data || []).map(row => ({
            id: row.id,
            name: row.name,
            email: row.email,
            phone1: row.phone,
            address: row.address,
            city: row.city,
            country: row.country,
            masterId: row.master_id,
            ssiProId: row.ssi_pro_id,
            birthDate: row.birth_date,
            age: row.age,
            dives: row.total_dives,
            startYear: row.start_year,
            role: row.role === 'admin' ? 'Admin' : (row.age && row.age < 18 ? 'Child' : 'Adult'),
            is_pro: row.is_pro || row.role === 'admin',
            isPro: row.is_pro || row.role === 'admin',
            isDiver: row.is_diver || (row.total_dives > 0),
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

export async function upsertDiver(diver: Partial<Diver> & { name: string }) {
    try {
        const { data, error } = await supabase
            .from('users')
            .upsert(
                {
                    name: diver.name,
                    email: diver.email,
                    phone: diver.phone1,
                    birth_date: diver.birthDate,
                    age: diver.age,
                    total_dives: diver.dives || 0,
                    start_year: diver.divesFromYear,
                    role: (diver.role || '').toLowerCase() === 'admin' ? 'admin' : 'member',
                    photo_url: diver.photo,
                    dietary_restrictions: diver.dietaryRestrictions,
                    status: diver.status || 'pending',
                    emergency_contact_name: diver.emergencyContact?.name,
                    emergency_contact_relationship: diver.emergencyContact?.relationship,
                    emergency_contact_phone: diver.emergencyContact?.phone,
                    is_pro: diver.isPro || diver.is_pro || false
                },
                { onConflict: 'email' }
            );

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error upserting diver:', error);
        throw error;
    }
}

export async function fetchPayments() {
    try {
        const { data, error } = await supabase
            .from('payments')
            .select('*, users(name, email)')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching payments:', error);
        throw error;
    }
}

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

export async function fetchGalleryImages(category?: string) {
    try {
        let query = supabase
            .from('gallery')
            .select('*, users(name)');

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

export function subscribeToDivers(callback: (payload: any) => void) {
    const channel = supabase
        .channel('users_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, callback)
        .subscribe();

    return channel;
}

export function subscribeToPayments(callback: (payload: any) => void) {
    const channel = supabase
        .channel('payments_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, callback)
        .subscribe();

    return channel;
}

export function subscribeToGallery(callback: (payload: any) => void) {
    const channel = supabase
        .channel('gallery_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'gallery' }, callback)
        .subscribe();

    return channel;
}
