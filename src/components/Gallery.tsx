
import React, { useState, useEffect } from 'react';
import { Camera, Image as ImageIcon, Plus, Filter, Loader2, X, AlertCircle } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

const DEFAULT_OCEAN_IMAGE = "https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?q=80&w=1170&auto=format&fit=crop";

interface GalleryPhoto {
    id: string;
    image_url: string;
    category: string;
    uploaded_by: string;
    created_at: string;
    title?: string;
}

interface GalleryProps {
    lang?: 'BS' | 'EN';
    theme?: 'light' | 'dark';
}

const Gallery: React.FC<GalleryProps> = ({ lang = 'BS', theme = 'light' }) => {
    const [category, setCategory] = useState('All');
    const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectedCategory, setSelectedCategory] = useState('Other');

    useEffect(() => {
        const loadPhotos = async () => {
            try {
                setLoading(true);
                setError(null);

                const { data, error: fetchError } = await supabase
                    .from('gallery')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (fetchError) {
                    if (fetchError.message.includes('gallery')) {
                        setPhotos([]);
                    } else {
                        console.warn('Gallery error:', fetchError.message);
                    }
                } else {
                    setPhotos((data || []).map((item: any) => ({
                        id: item.id,
                        image_url: item.image_url,
                        category: item.category || 'Other',
                        uploaded_by: item.uploaded_by,
                        created_at: item.created_at,
                        title: item.title
                    })) as GalleryPhoto[]);
                }
            } catch (err: any) {
                if (err.message && (err.message.includes('404') || err.message.includes('Not Found'))) {
                    console.warn('Gallery table not found - please run migration. (Showing empty state)');
                } else {
                    console.error('Error loading gallery:', err);
                }
                setPhotos([]);
            } finally {
                setLoading(false);
            }
        };

        loadPhotos();

        const channel = supabase
            .channel('gallery_changes')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'gallery' },
                () => loadPhotos()
            )
            .subscribe();

        return () => {
            channel.unsubscribe();
        };
    }, []);

    const handleUpload = async () => {
        if (!selectedFile) {
            setError('Molimo izaberite datoteku');
            return;
        }

        if (selectedFile.size > 10 * 1024 * 1024) {
            setError('Datoteka mora biti manja od 10MB');
            return;
        }

        setUploading(true);
        setError(null);
        setUploadProgress(0);

        try {
            const fileName = `${Date.now()}_${selectedFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
            const filePath = `gallery/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('gallery')
                .upload(filePath, selectedFile, {
                    cacheControl: '3600',
                    upsert: false,
                });

            if (uploadError) throw uploadError;

            const { data: urlData } = supabase.storage
                .from('gallery')
                .getPublicUrl(filePath);

            const userString = localStorage.getItem('kvs_auth_session');
            const user = userString ? JSON.parse(userString) : { displayName: 'Anonymous' };

            const { error: insertError } = await supabase
                .from('gallery')
                .insert([
                    {
                        image_url: urlData.publicUrl,
                        category: selectedCategory.toLowerCase(),
                        uploaded_by: user.displayName || 'Anonymous',
                    },
                ]);

            if (insertError) throw insertError;

            setSelectedFile(null);
            setSelectedCategory('Other');
            setUploadProgress(100);

            setTimeout(() => {
                const loadPhotos = async () => {
                    const { data } = await supabase
                        .from('gallery')
                        .select('*')
                        .order('created_at', { ascending: false });
                    setPhotos((data || []).map((item: any) => ({
                        id: item.id,
                        image_url: item.image_url,
                        category: item.category || 'Other',
                        uploaded_by: item.uploaded_by,
                        created_at: item.created_at,
                        title: item.title
                    })) as GalleryPhoto[]);
                };
                loadPhotos();
            }, 1000);

        } catch (err: any) {
            const errorMsg = err instanceof Error ? err.message : 'Greška pri uploadu';
            if (errorMsg.includes('Bucket not found')) {
                setError('Storage bucket missing. Admin setup required.');
                console.warn('Storage bucket "gallery" missing.');
            } else {
                setError(`Upload neuspješan: ${errorMsg}`);
                console.error('Upload error:', err);
            }
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };

    const filteredPhotos = category === 'All' ? photos : photos.filter(p => p.category === category);

    return (
        <div className="space-y-6 pb-24 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Gallery</h2>
                    <p className="text-xs text-gray-400 mt-1">{photos.length} photos</p>
                </div>
                <div className="flex gap-2">
                    <button className="p-2 glass-card rounded-xl text-cyan-400 hover:bg-cyan-500/10 transition-colors">
                        <Filter className="w-5 h-5" />
                    </button>
                    <button
                        className="p-2 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white transition-colors flex items-center gap-2"
                        onClick={() => {
                            const input = document.getElementById('photo-upload') as HTMLInputElement;
                            input?.click();
                        }}
                    >
                        <Plus className="w-5 h-5" />
                        <span className="text-xs hidden sm:inline">Add</span>
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-center gap-3 animate-in slide-in-from-top-2">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <div>
                        <p className="text-sm font-bold text-red-500">Upload Failed</p>
                        <p className="text-xs text-red-400">{error}</p>
                    </div>
                    <button
                        onClick={() => setError(null)}
                        className="ml-auto p-1 hover:bg-red-500/10 rounded transition-colors"
                    >
                        <X className="w-4 h-4 text-red-500" />
                    </button>
                </div>
            )}

            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {['All', 'Dive', 'Group', 'Meal', 'Fun', 'Other'].map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setCategory(cat)}
                        className={`px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all border ${category === cat
                            ? 'bg-cyan-600 text-white border-cyan-500 shadow-lg shadow-cyan-900/20 translate-y-[-2px]'
                            : theme === 'dark'
                                ? 'bg-white/5 text-gray-400 border-white/10 hover:border-cyan-500/50 hover:text-white'
                                : 'bg-white text-gray-500 border-cyan-100 hover:border-cyan-300 hover:text-cyan-900 shadow-sm'
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-16">
                    <Loader2 className="w-8 h-8 text-cyan-500 animate-spin mb-4" />
                    <p className="text-sm text-gray-400">Učitavam galeriju...</p>
                </div>
            ) : filteredPhotos.length === 0 ? (
                <div className={`p-16 rounded-[40px] flex flex-col items-center justify-center text-center space-y-6 border-2 border-dashed transition-colors duration-300 ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-cyan-50/50 border-cyan-100'
                    }`}>
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center shadow-inner ${theme === 'dark' ? 'bg-white/5' : 'bg-white'
                        }`}>
                        <Camera className="w-10 h-10 text-gray-400" />
                    </div>
                    <div>
                        <h4 className={`text-xl font-black uppercase tracking-tight ${theme === 'dark' ? 'text-white' : 'text-cyan-900'}`}>
                            {lang === 'BS' ? 'Galerija je prazna' : 'Gallery is empty'}
                        </h4>
                        <p className="text-sm font-medium text-gray-500 mt-2">
                            {lang === 'BS' ? 'Budite prvi koji ćete podijeliti fotografiju sa ekspedicije!' : 'Be the first to share an expedition photo!'}
                        </p>
                    </div>
                </div>
            ) : (
                <div className="columns-2 gap-4 space-y-4">
                    {filteredPhotos.map((photo) => (
                        <div
                            key={photo.id}
                            className={`relative break-inside-avoid rounded-[32px] overflow-hidden group cursor-pointer animate-in fade-in duration-500 border ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-cyan-50 shadow-lg shadow-cyan-900/5'
                                }`}
                        >
                            <img
                                src={photo.image_url}
                                alt="Gallery"
                                className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-110"
                                onError={(e) => (e.target as HTMLImageElement).src = DEFAULT_OCEAN_IMAGE}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-6">
                                <p className="text-xs text-cyan-400 font-black uppercase tracking-[0.2em] mb-1">{photo.category}</p>
                                <p className="text-[10px] text-white/70 font-bold">uploaded by {photo.uploaded_by}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className={`p-10 rounded-[40px] space-y-8 border-2 border-dashed transition-all duration-300 ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-cyan-100 shadow-xl shadow-cyan-900/5'
                }`}>
                <div className="flex items-center gap-6">
                    <div className={`w-16 h-16 rounded-3xl flex items-center justify-center shadow-lg ${theme === 'dark' ? 'bg-white/5' : 'bg-cyan-50'
                        }`}>
                        <ImageIcon className={`w-8 h-8 ${theme === 'dark' ? 'text-gray-400' : 'text-cyan-600'}`} />
                    </div>
                    <div>
                        <h4 className={`text-xl font-black uppercase tracking-tight ${theme === 'dark' ? 'text-white' : 'text-cyan-900'}`}>
                            {lang === 'BS' ? 'Dodaj nove fotografije' : 'Add new photos'}
                        </h4>
                        <p className="text-sm font-medium text-gray-500 mt-1">
                            {lang === 'BS' ? 'Podijelite trenutke sa ekspedicije (Max 10MB)' : 'Share your expedition moments (Max 10MB)'}
                        </p>
                    </div>
                </div>

                {selectedFile && (
                    <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-2xl p-4">
                        <div className="flex items-center justify-between mb-2">
                            <div>
                                <p className="text-sm font-bold text-cyan-300">{selectedFile.name}</p>
                                <p className="text-xs text-gray-400">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                            <button
                                onClick={() => setSelectedFile(null)}
                                className="p-1 hover:bg-red-500/20 rounded transition-colors"
                            >
                                <X className="w-4 h-4 text-red-400" />
                            </button>
                        </div>
                        {uploadProgress > 0 && (
                            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                                <div
                                    className="bg-cyan-500 h-full transition-all duration-300"
                                    style={{ width: `${uploadProgress}%` }}
                                />
                            </div>
                        )}
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label className="text-xs font-bold text-gray-400 block mb-2">KATEGORIJA</label>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className={`w-full border rounded-2xl px-5 py-3 text-sm font-bold focus:outline-none focus:ring-4 transition-all appearance-none ${theme === 'dark'
                                ? 'bg-gray-900 border-white/10 text-white focus:ring-cyan-500/20'
                                : 'bg-gray-50 border-cyan-100 text-cyan-900 focus:ring-cyan-500/10'
                                }`}
                        >
                            <option value="Dive">Ronjenje 🤿</option>
                            <option value="Group">Grupa 👥</option>
                            <option value="Meal">Hrana 🍽️</option>
                            <option value="Fun">Zabava 🎉</option>
                            <option value="Other">Ostalo 📸</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-400 block mb-2">DATOTEKA</label>
                        <input
                            type="file"
                            id="photo-upload"
                            className="hidden"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) setSelectedFile(file);
                            }}
                        />
                        <label
                            htmlFor="photo-upload"
                            className="w-full block bg-white/5 hover:bg-white/10 border-2 border-dashed border-white/20 hover:border-cyan-500/50 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer text-center"
                        >
                            {selectedFile ? 'Promijeni' : 'Izaberi Datoteku'}
                        </label>
                    </div>
                </div>

                <button
                    onClick={handleUpload}
                    disabled={!selectedFile || uploading}
                    className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                    {uploading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Učitavanje...
                        </>
                    ) : (
                        <>
                            <Plus className="w-5 h-5" />
                            Učitaj Fotografiju
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default Gallery;
