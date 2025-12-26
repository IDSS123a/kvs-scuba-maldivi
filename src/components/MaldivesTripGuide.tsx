import React, { useState } from 'react';
import {
  CheckCircle2,

  AlertCircle,
  MapPin,
  Thermometer,
  Eye,
  Wind,
  Fish,
  Award,
  Lightbulb
} from 'lucide-react';

interface ChecklistItem {
  id: string;
  name: string;
  description: string;
  checked: boolean;
  mandatory: boolean;
  note?: string;
  quantity?: number;
}

interface ChecklistCategory {
  category: string;
  icon: string;
  priority: 'critical' | 'high' | 'medium';
  items: ChecklistItem[];
}

interface MaldivesTripGuideProps {
  lang?: 'BS' | 'EN';
  theme?: 'light' | 'dark';
}

const MaldivesTripGuide: React.FC<MaldivesTripGuideProps> = ({ lang = 'BS', theme = 'light' }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'diving' | 'checklist' | 'tips'>('overview');

  // Translation object
  const t = {
    title: lang === 'BS' ? '🌴 Maldives Putovanje - KVS Scuba' : '🌴 Maldives Trip - KVS Scuba',
    subtitle: lang === 'BS' ? 'Kompletan vođič za pripremanje i ronjenje na Maldivima' : 'Complete guide for preparation and diving in Maldives',
    overview: lang === 'BS' ? '📍 Pregled' : '📍 Overview',
    diving: lang === 'BS' ? '🤿 Ronjenje' : '🤿 Diving',
    checklist: lang === 'BS' ? '✅ Checklist' : '✅ Checklist',
    tips: lang === 'BS' ? '💡 Savjeti' : '💡 Tips',
    localInfo: lang === 'BS' ? 'Lokalne informacije' : 'Local Info',
    emergency: lang === 'BS' ? 'Brojevi hitnih službi' : 'Emergency Numbers',
    safety: lang === 'BS' ? 'Važne ronilačke informacije' : 'Important Dive Info',
    marineLife: lang === 'BS' ? 'Morski život' : 'Marine Life',
    certifications: lang === 'BS' ? 'Preporučeni certifikati' : 'Recommended Certs',
    mandatoryAttr: lang === 'BS' ? 'OBAVEZNO' : 'MANDATORY',
    priorityCritical: lang === 'BS' ? 'KRITIČNO' : 'CRITICAL',
    priorityHigh: lang === 'BS' ? 'VAŽNO' : 'HIGH',
    priorityMedium: lang === 'BS' ? 'SREDNJE' : 'MEDIUM'
  };

  const divingInfo = {
    water_temperature: '27-30°C',
    wetsuit_recommendation: lang === 'BS' ? '3mm shorty ili fullsuit' : '3mm shorty or fullsuit',
    visibility: lang === 'BS' ? '20-40 metara' : '20-40 meters',
    current: lang === 'BS' ? 'Umjeren do jak - drift diving' : 'Moderate to strong - drift diving',
    marine_life: [
      'Manta rays', 'Whale sharks', 'Grey reef sharks', 'White tip reef sharks',
      'Eagle rays', 'Sea turtles', 'Tuna', 'Barracudas', 'Napoleon wrasse'
    ],
    best_dive_sites: ['Manta Point', 'Banana Reef', 'HP Reef', 'Fish Head', 'Maaya Thila'],
    certifications_recommended: [
      'SSI Open Water Diver', 'SSI Advanced Adventurer', 'SSI Deep Diving', 'SSI Enriched Air Nitrox'
    ]
  };

  const checklistCategories: ChecklistCategory[] = [
    {
      category: lang === 'BS' ? 'Dokumenti' : 'Documents',
      icon: '📋',
      priority: 'critical',
      items: [
        { id: 'doc_01', name: lang === 'BS' ? 'Pasoš' : 'Passport', description: lang === 'BS' ? 'Provjeriti valjanost (>6 mjeseci)' : 'Check validity (>6 months)', checked: false, mandatory: true },
        { id: 'doc_02', name: lang === 'BS' ? 'Osiguranje' : 'Insurance', description: lang === 'BS' ? 'Sa pokrićem za ronjenje' : 'With dive coverage', checked: false, mandatory: true }
      ]
    },
    {
      category: lang === 'BS' ? 'Finansije' : 'Finance',
      icon: '💵',
      priority: 'critical',
      items: [
        { id: 'mon_01', name: lang === 'BS' ? 'Dolari (USD)' : 'Dollars (USD)', description: lang === 'BS' ? 'Novi novčanici (poslije 2013)' : 'Newer bills (post-2013)', checked: false, mandatory: true }
      ]
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return theme === 'dark' ? 'bg-red-500/10 border-red-500/20' : 'bg-red-50 border-red-100';
      case 'high': return theme === 'dark' ? 'bg-orange-500/10 border-orange-500/20' : 'bg-orange-50 border-orange-100';
      case 'medium': return theme === 'dark' ? 'bg-yellow-500/10 border-yellow-500/20' : 'bg-yellow-50 border-yellow-100';
      default: return theme === 'dark' ? 'bg-gray-500/10 border-gray-500/20' : 'bg-gray-50 border-gray-100';
    }
  };

  const tips = [
    lang === 'BS' ? 'Reef-safe krema je obavezna' : 'Reef-safe sunscreen is mandatory',
    lang === 'BS' ? 'Neopren 3mm je idealan' : '3mm neoprene is ideal',
    lang === 'BS' ? 'Poštovati lokalnu kulturu' : 'Respect local culture',
    lang === 'BS' ? 'USD u gotovini za napojnice' : 'USD cash for tips',
    lang === 'BS' ? 'Piti minimum 3L vode' : 'Drink minimum 3L water',
    lang === 'BS' ? 'Paziti na struje' : 'Watch for currents',
    lang === 'BS' ? 'SMB je obavezan' : 'SMB is mandatory',
    lang === 'BS' ? 'Safety stop 3min na 5m' : 'Safety stop 3min at 5m'
  ];

  return (
    <div className={`w-full max-w-6xl mx-auto p-6 space-y-10 transition-colors duration-300 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
      {/* Header */}
      <div className="bg-gradient-to-br from-[#005f73] to-[#0a9396] text-white rounded-[40px] p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">{t.title}</h1>
          <p className="text-cyan-100 font-bold text-lg mb-8 opacity-90">{t.subtitle}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: MapPin, label: 'Maafushi, Kaafu' },
              { icon: Thermometer, label: '27-30°C' },
              { icon: Eye, label: '20-40m Vis' },
              { icon: Award, label: 'Expedition 2026' }
            ].map((stat, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-2xl backdrop-blur-sm border border-white/10">
                <stat.icon size={18} className="text-cyan-300" />
                <span className="text-xs font-black uppercase tracking-widest">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={`flex gap-3 overflow-x-auto pb-4 scrollbar-hide border-b transition-colors duration-300 ${theme === 'dark' ? 'border-white/10' : 'border-gray-100'}`}>
        {(['overview', 'diving', 'checklist', 'tips'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-8 py-4 font-black text-[10px] uppercase tracking-[0.2em] rounded-full transition-all border whitespace-nowrap ${activeTab === tab
              ? 'bg-cyan-600 text-white border-cyan-500 shadow-lg translate-y-[-2px]'
              : theme === 'dark'
                ? 'bg-white/5 text-gray-400 border-white/10 hover:text-white'
                : 'bg-white text-gray-500 border-cyan-50 hover:bg-cyan-50 shadow-sm'
              }`}
          >
            {t[tab]}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="animate-in fade-in duration-500">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className={`p-10 rounded-[40px] border transition-all duration-300 ${theme === 'dark' ? 'bg-[#001a24] border-white/5' : 'bg-white border-cyan-50 shadow-xl shadow-cyan-900/5'
              }`}>
              <h2 className="text-3xl font-black mb-8 flex items-center gap-4 text-cyan-600">
                <Fish size={32} /> {t.marineLife}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {[
                  { l: lang === 'BS' ? 'Temperatura' : 'Temp', v: divingInfo.water_temperature, c: 'bg-blue-500/10 text-blue-500' },
                  { l: lang === 'BS' ? 'Vidljivost' : 'Vis', v: divingInfo.visibility, c: 'bg-emerald-500/10 text-emerald-500' },
                  { l: lang === 'BS' ? 'Odijelo' : 'Wetsuit', v: divingInfo.wetsuit_recommendation, c: 'bg-purple-500/10 text-purple-500' },
                  { l: lang === 'BS' ? 'Struja' : 'Current', v: divingInfo.current, c: 'bg-orange-500/10 text-orange-500' }
                ].map((item, i) => (
                  <div key={i} className={`p-6 rounded-[32px] ${theme === 'dark' ? 'bg-white/5' : item.c.split(' ')[0]}`}>
                    <p className={`text-xs font-black uppercase tracking-widest mb-1 ${theme === 'dark' ? 'text-gray-400' : 'opacity-70'}`}>{item.l}</p>
                    <p className={`text-base font-black ${theme === 'dark' ? 'text-white' : item.c.split(' ')[1]}`}>{item.v}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Top Sites</h4>
                <div className="flex flex-wrap gap-2">
                  {divingInfo.best_dive_sites.map((s, i) => (
                    <span key={i} className={`px-4 py-2 rounded-xl text-xs font-bold border ${theme === 'dark' ? 'bg-white/5 border-white/5 text-cyan-400' : 'bg-cyan-50 border-cyan-100 text-cyan-700'
                      }`}>📍 {s}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className={`p-10 rounded-[40px] border transition-all duration-300 ${theme === 'dark' ? 'bg-[#001a24] border-white/5' : 'bg-white border-cyan-50 shadow-xl shadow-cyan-900/5'
              }`}>
              <h2 className="text-3xl font-black mb-8 flex items-center gap-4 text-amber-500">
                <Award size={32} /> {t.certifications}
              </h2>
              <div className="space-y-4">
                {divingInfo.certifications_recommended.map((c, i) => (
                  <div key={i} className={`flex items-center gap-4 p-5 rounded-3xl border ${theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-amber-50 border-amber-100'
                    }`}>
                    <CheckCircle2 className="text-amber-500" />
                    <span className="text-base font-black">{c}</span>
                  </div>
                ))}
              </div>

              <div className={`mt-10 p-8 rounded-[32px] border ${theme === 'dark' ? 'bg-red-500/5 border-red-500/10' : 'bg-red-50 border-red-100'
                }`}>
                <h4 className="text-xs font-black text-red-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <AlertCircle size={14} /> {t.emergency}
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm font-black">
                  <div className="flex justify-between border-b border-dashed border-red-200 dark:border-red-900/30 pb-2">
                    <span className="opacity-60 uppercase">Police</span>
                    <span className="text-red-500">119</span>
                  </div>
                  <div className="flex justify-between border-b border-dashed border-red-200 dark:border-red-900/30 pb-2">
                    <span className="opacity-60 uppercase">Ambulance</span>
                    <span className="text-red-500">102</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'diving' && (
          <div className="space-y-12">
            {/* Seasonal Info Card */}
            <div className={`p-10 rounded-[40px] border relative overflow-hidden ${theme === 'dark' ? 'bg-cyan-950/20 border-cyan-500/20' : 'bg-cyan-50 border-cyan-100'}`}>
              <div className="absolute top-4 right-4 text-cyan-500/20"><Eye size={120} /></div>
              <div className="relative z-10">
                <h3 className="text-2xl font-black mb-4 flex items-center gap-3 text-cyan-600">
                  <Wind size={28} /> {lang === 'BS' ? 'Sezonski Vrhunac (Januar - Februar)' : 'Peak Season Info (Jan - Feb)'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-white/40 dark:bg-black/20 p-6 rounded-3xl backdrop-blur-sm">
                    <p className="text-xs font-black uppercase tracking-titles mb-2 opacity-60">Visibility</p>
                    <p className="font-black text-xl text-cyan-600">35 - 40 Meters</p>
                  </div>
                  <div className="bg-white/40 dark:bg-black/20 p-6 rounded-3xl backdrop-blur-sm">
                    <p className="text-xs font-black uppercase tracking-titles mb-2 opacity-60">Seas</p>
                    <p className="font-black text-xl text-cyan-600">Exceptionally Calm</p>
                  </div>
                  <div className="bg-white/40 dark:bg-black/20 p-6 rounded-3xl backdrop-blur-sm">
                    <p className="text-xs font-black uppercase tracking-titles mb-2 opacity-60">Best Side</p>
                    <p className="font-black text-sm uppercase">Western Atolls (Downwind)</p>
                  </div>
                </div>
                <p className="mt-6 text-base italic opacity-80">
                  {lang === 'BS'
                    ? "Idealno za fotografe i početnike. Mantas i Whale Sharks prate koncentraciju planktona na zapadnoj strani."
                    : "Perfect for photographers and beginners. Mantas and Whale Sharks follow plankton downwind to the western sides."}
                </p>
              </div>
            </div>

            {/* Dive Sites Grid */}
            <div>
              <h3 className="text-2xl font-black mb-8 px-4 flex items-center gap-3">
                <MapPin size={24} className="text-emerald-500" />
                {lang === 'BS' ? 'Top Ronilačke Lokacije' : 'Top Dive Sites'}
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[
                  { name: "Kandooma Thila", level: "Advanced", highlights: "Sharks, Napolen, Eagle Rays", desc: "One of the best in North Male atoll. Spectacular overhangs." },
                  { name: "Shark Tank", level: "Pro/Advanced", highlights: "Tiger, Bull & Hammerhead Sharks", desc: "Unique encounter with 7+ shark species. Deep and challenging." },
                  { name: "Cocoa Corner", level: "Novice/Adv", highlights: "Adult & Newborn sharks", desc: "400m pinnacle with a steep drop-off. Excellent for shark cruising." },
                  { name: "Guraidhoo", level: "Advanced", highlights: "Pelagic life, Strong currents", desc: "Complex channels known for 'washing machine' currents." },
                  { name: "Kuda Giri Wreck", level: "Novice", highlights: "Lobsters, Macrolife, Wreck", desc: "Embedded with colorful sponges. Home to batfish and shrimp." },
                  { name: "Dhigu Thila", level: "Nov-Int", highlights: "Manta Point", desc: "400m long reef where mantas congregate for feeding." }
                ].map((site, i) => (
                  <div key={i} className={`p-8 rounded-[40px] border transition-all duration-300 hover:scale-[1.02] ${theme === 'dark' ? 'bg-[#001a24] border-white/5' : 'bg-white border-cyan-50 shadow-lg shadow-cyan-900/5'}`}>
                    <div className="flex justify-between items-start mb-6">
                      <h4 className="font-black text-lg text-cyan-600 uppercase">{site.name}</h4>
                      <span className="text-xs font-black bg-emerald-500/10 text-emerald-600 px-3 py-1 rounded-full">{site.level}</span>
                    </div>
                    <p className="text-sm font-black mb-3 opacity-60 tracking-widest">{site.highlights}</p>
                    <p className="text-sm leading-relaxed opacity-80">{site.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Marine Life Showcase */}
            <div>
              <h3 className="text-2xl font-black mb-8 px-4 flex items-center gap-3">
                <Fish size={24} className="text-blue-500" />
                {lang === 'BS' ? 'Morski Život' : 'Marine Life'}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {divingInfo.marine_life.map((m, i) => (
                  <div key={i} className={`p-8 rounded-[40px] border text-center transition-all duration-300 hover:scale-105 ${theme === 'dark' ? 'bg-[#001a24] border-white/5 hover:border-cyan-500/50' : 'bg-white border-cyan-50 shadow-lg'}`}>
                    <div className={`w-14 h-14 mx-auto mb-6 rounded-2xl flex items-center justify-center ${theme === 'dark' ? 'bg-white/5' : 'bg-cyan-50'}`}>
                      <Fish size={24} className="text-cyan-500" />
                    </div>
                    <p className="font-black text-base uppercase tracking-widest">{m}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'checklist' && (
          <div className="space-y-8">
            {checklistCategories.map((cat, i) => (
              <div key={i} className={`p-10 rounded-[40px] border shadow-xl shadow-cyan-900/5 ${getPriorityColor(cat.priority)}`}>
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-black flex items-center gap-4">
                    <span className="text-4xl">{cat.icon}</span>
                    {cat.category}
                  </h3>
                  <span className={`px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase ${cat.priority === 'critical' ? 'bg-red-500 text-white' : 'bg-orange-500 text-white'
                    }`}>
                    {cat.priority === 'critical' ? t.priorityCritical : t.priorityHigh}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {cat.items.map(item => (
                    <div key={item.id} className={`p-6 rounded-[32px] flex items-start gap-5 border ${theme === 'dark' ? 'bg-[#001a24]/50 border-white/5' : 'bg-white border-cyan-50 shadow-sm'
                      }`}>
                      <div className={`w-6 h-6 rounded-md border-2 mt-1 flex items-center justify-center transition-colors ${item.checked ? 'bg-cyan-600 border-cyan-600' : 'border-gray-300 dark:border-gray-700'
                        }`}>
                        {item.checked && <CheckCircle2 size={16} className="text-white" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-black text-base">{item.name}</p>
                          {item.mandatory && <span className="text-[8px] font-black bg-red-500 text-white px-1.5 py-0.5 rounded leading-none">{t.mandatoryAttr}</span>}
                        </div>
                        <p className="text-sm text-gray-400 font-medium leading-relaxed">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'tips' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tips.map((tip, i) => (
              <div key={i} className={`p-6 rounded-[32px] flex items-start gap-4 border transition-all duration-300 hover:translate-y-[-4px] ${theme === 'dark' ? 'bg-[#001a24] border-white/5 hover:border-cyan-500/50' : 'bg-white border-cyan-50 shadow-lg shadow-cyan-900/5'
                }`}>
                <div className={`p-3 rounded-2xl ${theme === 'dark' ? 'bg-cyan-500/10' : 'bg-cyan-50'}`}>
                  <Lightbulb size={20} className="text-cyan-500" />
                </div>
                <p className="text-base font-medium leading-relaxed mt-1 opacity-90">{tip}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={`p-10 rounded-[40px] text-center transition-colors duration-300 ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-100 text-gray-500'
        }`}>
        <p className="font-black text-sm uppercase tracking-[0.3em]">🌍 Safe & Happy Diving in Maldives!</p>
        <p className="text-xs font-bold mt-2 opacity-50">KVS Scuba - Sarajevo Expedition 2026</p>
      </div>
    </div>
  );
};

export default MaldivesTripGuide;
