
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../contexts/AuthProvider';
import {
  CheckCircle2,
  Circle,
  Download,
  RotateCw,
  AlertCircle,
  Loader2,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Printer,
  ShieldCheck,
  Plane,
  Info,
  ExternalLink
} from 'lucide-react';

interface ChecklistItem {
  id: string;
  category: string;
  name: string;
  name_en: string;
  description?: string;
  description_en?: string;
  mandatory: boolean;
  checked: boolean;
  checked_at?: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  icon: string;
  quantity: number;
  notes?: string;
  sort_order: number;
}

interface CategoryProgress {
  category: string;
  total: number;
  checked: number;
  mandatoryTotal: number;
  mandatoryChecked: number;
}

interface ExpeditionChecklistProps {
  lang?: 'BS' | 'EN';
  theme?: 'light' | 'dark';
}

const ExpeditionChecklist: React.FC<ExpeditionChecklistProps> = ({ lang = 'BS', theme = 'light' }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (user) {
      loadChecklist();
    }
  }, [user]);

  const loadChecklist = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('checklist_items')
        .select('*')
        .eq('user_id', user?.uid)
        .order('sort_order', { ascending: true });

      if (fetchError) throw fetchError;

      if (!data || data.length === 0) {
        setError(lang === 'BS' ? 'Checklist nije pronađen. Kontaktiraj admina.' : 'Checklist not found. Contact admin.');
      } else {
        setItems(data);
        // Expand all by default
        const cats = new Set<string>();
        data.forEach((i: ChecklistItem) => cats.add(i.category));
        setExpandedCategories(cats);
      }
    } catch (err: any) {
      console.error('Error loading checklist:', err);
      setError(err.message || 'Failed to load checklist');
    } finally {
      setLoading(false);
    }
  };

  const calculateReadiness = (allChecklistItems: ChecklistItem[]) => {
    const mandatoryItems = allChecklistItems.filter(i => i.mandatory);
    const allMandatoryChecked = mandatoryItems.length > 0 && mandatoryItems.every(i => i.checked);
    setIsReady(allMandatoryChecked);
  };

  useEffect(() => {
    calculateReadiness(items);
  }, [items]);

  const handleToggleItem = async (itemId: string, currentChecked: boolean) => {
    if (!user) return;

    const newChecked = !currentChecked;
    const now = new Date().toISOString();

    // Optimistic update
    setItems(prev => prev.map(item =>
      item.id === itemId ? { ...item, checked: newChecked, checked_at: newChecked ? now : undefined } : item
    ));
    setSyncError(null);
    setSaving(itemId);

    try {
      const { error: updateError } = await supabase
        .from('checklist_items')
        .update({
          checked: newChecked,
          checked_at: newChecked ? now : null
        })
        .eq('id', itemId)
        .eq('user_id', user.uid);

      if (updateError) throw updateError;
    } catch (err: any) {
      console.error('Error updating item:', err);
      setSyncError(lang === 'BS' ? 'Greška pri spremanju. Provjeri internet konekciju.' : 'Error saving. Check internet connection.');
      // Revert on error
      setItems(prev => prev.map(item =>
        item.id === itemId ? { ...item, checked: currentChecked, checked_at: currentChecked ? item.checked_at : undefined } : item
      ));
    } finally {
      setSaving(null);
    }
  };

  const groupedItems = useMemo(() => {
    const filtered = items.filter(item =>
      (lang === 'BS' ? item.name : item.name_en).toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.category).toLowerCase().includes(searchQuery.toLowerCase())
    );

    const groups: { [key: string]: ChecklistItem[] } = {};
    filtered.forEach(item => {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    });
    return groups;
  }, [items, searchQuery, lang]);

  const categoryProgress = useMemo(() => {
    const progress: { [key: string]: CategoryProgress } = {};
    items.forEach(item => {
      if (!progress[item.category]) {
        progress[item.category] = {
          category: item.category,
          total: 0,
          checked: 0,
          mandatoryTotal: 0,
          mandatoryChecked: 0
        };
      }
      const p = progress[item.category];
      p.total++;
      if (item.checked) p.checked++;
      if (item.mandatory) {
        p.mandatoryTotal++;
        if (item.checked) p.mandatoryChecked++;
      }
    });
    return progress;
  }, [items]);

  const toggleCategory = (cat: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <Loader2 className="w-12 h-12 text-cyan-500 animate-spin" />
      <p className="text-sm font-bold animate-pulse text-cyan-600">{lang === 'BS' ? 'UČITAVANJE EKSPEDICIJSKE LISTE...' : 'LOADING EXPEDITION CHECKLIST...'}</p>
    </div>
  );

  const t = {
    title: lang === 'BS' ? 'Expedition Master Checklist' : 'Expedition Master Checklist',
    subtitle: lang === 'BS' ? 'Priprema za Maldive 2026' : 'Maldives 2026 Preparation',
    ready: lang === 'BS' ? 'SPREMAN ZA PUT' : 'READY FOR TRAVEL',
    notReady: lang === 'BS' ? 'U PRIPREMI' : 'IN PREPARATION',
    mandatory: lang === 'BS' ? 'OBAVEZNO' : 'MANDATORY',
    search: lang === 'BS' ? 'Pretraži stavke...' : 'Search items...',
    criticalItems: lang === 'BS' ? 'Kritične stavke (obavezno)' : 'Critical items (mandatory)',
    overallProgress: lang === 'BS' ? 'Ukupni napredak' : 'Overall Progress'
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
      {/* Status Bar & Header */}
      <div className={`p-8 rounded-[40px] border relative overflow-hidden transition-all duration-500 ${isReady
        ? 'bg-emerald-500/10 border-emerald-500/30'
        : (theme === 'dark' ? 'bg-[#001a24] border-white/10' : 'bg-white border-cyan-100 shadow-xl shadow-cyan-900/5')
        }`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className={`px-4 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${isReady ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                }`}>
                {isReady ? t.ready : t.notReady}
              </span>
              <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">{t.subtitle}</span>
            </div>
            <h2 className={`text-4xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-[#001219]'}`}>{t.title}</h2>

            {syncError && (
              <div className="mt-4 flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-500 text-xs font-bold animate-pulse">
                <AlertCircle className="w-4 h-4" />
                {syncError}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button onClick={handlePrint} className={`p-3 rounded-2xl transition-all ${theme === 'dark' ? 'bg-white/5 hover:bg-white/10 text-gray-400' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}>
              <Printer className="w-5 h-5" />
            </button>
            <div className={`flex flex-col items-end`}>
              <div className="flex items-center gap-4 mb-2">
                <span className="text-xs font-black uppercase text-gray-400">{t.overallProgress}</span>
                <span className={`text-2xl font-black ${isReady ? 'text-emerald-500' : 'text-cyan-500'}`}>
                  {items.length > 0 ? Math.round((items.filter(i => i.checked).length / items.length) * 100) : 0}%
                </span>
              </div>
              <div className={`w-48 h-2 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-white/10' : 'bg-gray-100'}`}>
                <div
                  className={`h-full transition-all duration-1000 ${isReady ? 'bg-emerald-500' : 'bg-cyan-500'}`}
                  style={{ width: `${items.length > 0 ? (items.filter(i => i.checked).length / items.length) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className={`flex-1 flex items-center gap-3 px-6 py-4 rounded-3xl border transition-all ${theme === 'dark' ? 'bg-[#001a24] border-white/10 focus-within:border-cyan-500/50' : 'bg-white border-cyan-50 shadow-sm focus-within:border-cyan-200'
          }`}>
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder={t.search}
            className="bg-transparent border-none outline-none w-full text-sm font-medium"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="p-6 rounded-3xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center gap-4">
          <AlertCircle className="w-6 h-6" />
          <p className="text-sm font-bold uppercase tracking-tight">{error}</p>
        </div>
      )}

      {/* Checklist Sections */}
      <div className="space-y-6">
        {Object.entries(groupedItems).map(([cat, catItems]) => {
          const progress = categoryProgress[cat];
          const isExpanded = expandedCategories.has(cat);
          const allMandatoryChecked = progress.mandatoryChecked === progress.mandatoryTotal;

          return (
            <div key={cat} className={`rounded-[40px] border transition-all duration-300 ${theme === 'dark' ? 'bg-[#001a24] border-white/5' : 'bg-white border-cyan-50 shadow-sm'
              }`}>
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(cat)}
                className="w-full flex items-center justify-between p-8 text-left"
              >
                <div className="flex items-center gap-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner ${theme === 'dark' ? 'bg-white/5' : 'bg-cyan-50'
                    }`}>
                    {catItems[0]?.icon || '📦'}
                  </div>
                  <div>
                    <h3 className="text-xl font-black tracking-tight uppercase">{cat.replace('_', ' ')}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="w-24 h-1 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
                        <div
                          className={`h-full ${allMandatoryChecked ? 'bg-emerald-500' : 'bg-cyan-500'}`}
                          style={{ width: `${(progress.checked / progress.total) * 100}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        {progress.checked}/{progress.total} {lang === 'BS' ? 'STAVKI' : 'ITEMS'}
                      </span>
                    </div>
                  </div>
                </div>
                {isExpanded ? <ChevronUp className="w-6 h-6 text-gray-400" /> : <ChevronDown className="w-6 h-6 text-gray-400" />}
              </button>

              {/* Category Items */}
              {isExpanded && (
                <div className="px-8 pb-8 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                  {(catItems as ChecklistItem[]).map(item => (
                    <div
                      key={item.id}
                      onClick={() => handleToggleItem(item.id, item.checked)}
                      className={`group flex items-center gap-5 p-5 rounded-3xl border cursor-pointer transition-all duration-300 ${item.checked
                        ? (theme === 'dark' ? 'bg-emerald-500/5 border-emerald-500/20 opacity-60' : 'bg-emerald-50 border-emerald-100 opacity-60')
                        : (theme === 'dark' ? 'bg-white/5 border-white/5 hover:border-cyan-500/50' : 'bg-white border-cyan-50 hover:border-cyan-200 shadow-sm hover:shadow-md')
                        } ${item.mandatory && !item.checked ? 'border-amber-500/30' : ''}`}
                    >
                      <div className="relative">
                        {saving === item.id ? (
                          <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
                        ) : item.checked ? (
                          <CheckCircle2 className="w-8 h-8 text-emerald-500 fill-emerald-500/10" />
                        ) : (
                          <Circle className={`w-8 h-8 transition-colors ${theme === 'dark' ? 'text-white/10 group-hover:text-cyan-500/50' : 'text-gray-100 group-hover:text-cyan-200'
                            }`} />
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <p className={`font-black tracking-tight ${item.checked ? 'line-through text-gray-500' : (theme === 'dark' ? 'text-white' : 'text-cyan-900')
                            }`}>
                            {lang === 'BS' ? item.name : item.name_en}
                          </p>
                          {item.mandatory && (
                            <span className={`px-2 py-0.5 rounded text-[8px] font-black tracking-tighter uppercase ${item.checked ? 'bg-gray-100 text-gray-400 line-through' : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                              }`}>
                              {t.mandatory}
                            </span>
                          )}
                          {item.priority === 'critical' && !item.checked && (
                            <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                          )}
                        </div>
                        {(lang === 'BS' ? item.description : item.description_en) && (
                          <p className={`text-xs mt-1 leading-relaxed ${item.checked ? 'opacity-30' : 'text-gray-400 font-medium'
                            }`}>
                            {lang === 'BS' ? item.description : item.description_en}
                          </p>
                        )}
                      </div>

                      {item.quantity > 1 && (
                        <div className={`px-3 py-1 rounded-xl text-[10px] font-black ${theme === 'dark' ? 'bg-white/5 text-cyan-400' : 'bg-cyan-50 text-cyan-700'
                          }`}>
                          x{item.quantity}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ExpeditionChecklist;
