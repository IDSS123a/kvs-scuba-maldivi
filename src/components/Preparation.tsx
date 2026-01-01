
import React, { useState } from 'react';
import {
    CheckCircle2,
    Backpack,
    Sun,
    MapPin,
    AlertTriangle,
    Fish,
    Globe,
    Thermometer,
    Waves,
    Anchor,
    Zap,
    Users,
    Activity,
    ShieldCheck,
    ShieldAlert
} from 'lucide-react';
import ExpeditionChecklist from './ExpeditionChecklist';

interface PreparationProps {
    lang?: 'BS' | 'EN';
    theme?: 'light' | 'dark';
}

const Preparation: React.FC<PreparationProps> = ({ lang = 'BS', theme = 'light' }) => {
    const [activeTab, setActiveTab] = useState<'checklist' | 'marine' | 'culture' | 'emergency' | 'quick'>('checklist');

    const gearGuide = [
        { title: lang === 'BS' ? "Odijelo" : "Wetsuit", desc: lang === 'BS' ? "3mm Shorty ili Lycra. Voda je stabilnih 29°C." : "3mm Shorty or Lycra. Water is stable at 29°C.", icon: Thermometer },
        { title: lang === 'BS' ? "Maska" : "Mask", desc: lang === 'BS' ? "Uvijek u ručnom prtljagu. Ne želite rent-a-masku." : "Always in carry-on. You don't want a rental mask.", icon: Waves },
        { title: lang === 'BS' ? "SMB" : "SMB", desc: lang === 'BS' ? "Obavezan za kanalske zarone (drift)." : "Mandatory for channel dives (drift).", icon: Anchor },
        { title: lang === 'BS' ? "Lampa" : "Torch", desc: lang === 'BS' ? "Obavezna za Maafushi Caves i noćne zarone." : "Mandatory for Maafushi Caves and night dives.", icon: Zap }
    ];

    const t = {
        gearGuide: lang === 'BS' ? 'VODIČ ZA OPREMU' : 'DIVE GEAR GUIDE',
        safety: lang === 'BS' ? 'SIGURNOSNI PROTOKOLI' : 'SAFETY PROTOCOLS',
        prep: lang === 'BS' ? 'Pripreme za ekspediciju' : 'Expedition Prep',
        subtitle: lang === 'BS' ? 'Sve što vam treba za siguran put' : 'Everything you need for a safe trip'
    };

    return (
        <div className={`w-full mx-auto px-6 space-y-12 pb-24 pt-10 transition-colors duration-300 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className={`text-4xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-[#001219]'}`}>{t.prep}</h2>
                    <p className="text-xs font-black text-[#0a9396] uppercase tracking-[0.3em] mt-1">{t.subtitle}</p>
                </div>
            </div>

            <section className="space-y-8">
                <div className={`flex flex-wrap gap-3 pb-6 border-b transition-colors duration-300 ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}>
                    {[
                        { id: 'checklist', label: lang === 'BS' ? 'Master Čeklista' : 'Master Checklist', icon: CheckCircle2 },
                        { id: 'marine', label: 'Marine Life', icon: Fish },
                        { id: 'culture', label: 'Culture & Laws', icon: Globe },
                        { id: 'emergency', label: 'Emergency', icon: AlertTriangle },
                        { id: 'quick', label: 'Quick Guide', icon: MapPin }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`px-8 py-4 font-black text-xs uppercase tracking-widest rounded-full transition-all border ${activeTab === tab.id
                                ? 'bg-cyan-600 text-white border-cyan-500 shadow-lg'
                                : theme === 'dark'
                                    ? 'bg-white/5 text-gray-400 border-white/10 hover:text-white'
                                    : 'bg-white text-gray-500 border-cyan-50 hover:bg-cyan-50 hover:text-cyan-900 shadow-sm'
                                }`}
                        >
                            <tab.icon className="w-4 h-4 inline mr-2" /> {tab.label}
                        </button>
                    ))}
                </div>

                <div className="animate-in fade-in duration-500">
                    {activeTab === 'checklist' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                            <div className="lg:col-span-2">
                                <ExpeditionChecklist lang={lang} theme={theme} />
                            </div>
                            <div className="space-y-8">
                                <div className="space-y-6">
                                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <Backpack className="w-4 h-4" /> {t.gearGuide}
                                    </h3>
                                    <div className="space-y-4">
                                        {gearGuide.map((item, i) => (
                                            <div key={i} className={`p-6 rounded-[40px] flex items-center gap-5 border transition-all duration-300 ${theme === 'dark' ? 'bg-[#001a24] border-white/5' : 'bg-white border-cyan-50 shadow-lg shadow-cyan-900/5'
                                                }`}>
                                                <div className={`p-4 rounded-2xl shadow-inner ${theme === 'dark' ? 'bg-white/5' : 'bg-cyan-50'}`}>
                                                    <item.icon className={`w-6 h-6 ${theme === 'dark' ? 'text-[#ee9b00]' : 'text-cyan-600'}`} />
                                                </div>
                                                <div>
                                                    <h4 className={`text-sm font-black uppercase tracking-tight ${theme === 'dark' ? 'text-white' : 'text-cyan-900'}`}>{item.title}</h4>
                                                    <p className="text-sm text-gray-400 leading-relaxed mt-1">{item.desc}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className={`p-8 rounded-[40px] border transition-all duration-300 ${theme === 'dark' ? 'bg-amber-500/5 border-amber-500/10' : 'bg-amber-50 border-amber-100'
                                        }`}>
                                        <div className="flex items-center gap-2 text-amber-500 mb-2">
                                            <Sun className="w-5 h-5" />
                                            <h4 className="text-xs font-black uppercase">Reef Safe Sunscreen</h4>
                                        </div>
                                        <p className={`text-xs font-medium italic ${theme === 'dark' ? 'text-amber-200/70' : 'text-amber-900'}`}>
                                            {lang === 'BS'
                                                ? 'Koristite isključivo mineralne kreme bez oksibenzona kako biste zaštitili osjetljive maldivske koralje.'
                                                : 'Use only mineral sunscreens without oxybenzone to protect delicate Maldivian corals.'}
                                        </p>
                                    </div>
                                </div>

                                <div className={`p-8 rounded-[40px] border transition-all duration-300 ${theme === 'dark' ? 'bg-cyan-500/5 border-cyan-500/10' : 'bg-cyan-50 border-cyan-100'}`}>
                                    <h4 className="text-xs font-black text-cyan-600 uppercase tracking-widest mb-4">Safety Quick Tip</h4>
                                    <p className="text-xs font-medium leading-relaxed opacity-80 italic">
                                        {lang === 'BS' ? '"Nikada ne ronite sami. Buddy system je najbolja polica osiguranja koju imate."' : '"Never dive alone. The buddy system is the best insurance policy you have."'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'marine' && (
                        <div className="space-y-8">
                            <h3 className={`text-3xl font-black ${theme === 'dark' ? 'text-white' : 'text-[#001219]'}`}>Marine Life Guide by Dive Site</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {[
                                    { title: "🦈 Shark Tank (Hulhumale)", exp: "Tiger sharks, Hammerheads, Bull sharks, Spinner sharks, Lemon sharks (common). Silvertip, Whitetip reef, Nurse (rare).", tip: "Advanced Open Water only. Deep and murky. Proper shark behavior mandatory." },
                                    { title: "🌊 Guraidhoo Corner", exp: "Grey reef sharks, eagle rays, barracuda, trevally, napoleon wrasse", tip: "Strong currents expected. Known for 'washing machine' conditions." },
                                    { title: "🐚 Cocoa Corner", exp: "Adult and newborn sharks, eagle rays, tuna, schooling reef fish", tip: "400m long pinnacle with steep drop-off. Excellent visibility." },
                                    { title: "⚡ Embudhoo Express", exp: "Grey sharks, hammerheads, manta rays, yellow-fin tuna", tip: "High-octane drift dive. Professional buoyancy control required." }
                                ].map((item, i) => (
                                    <div key={i} className={`p-8 rounded-[40px] border transition-all duration-300 ${theme === 'dark' ? 'bg-[#001a24] border-white/5' : 'bg-blue-50/50 border-blue-100 shadow-sm'
                                        }`}>
                                        <h4 className={`font-black text-xl mb-4 ${theme === 'dark' ? 'text-cyan-400' : 'text-blue-900'}`}>{item.title}</h4>
                                        <p className="text-sm mb-2"><strong>Expected:</strong> {item.exp}</p>
                                        <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}><strong>Tips:</strong> {item.tip}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'culture' && (
                        <div className="space-y-8">
                            <h3 className={`text-3xl font-black ${theme === 'dark' ? 'text-white' : 'text-[#001219]'}`}>Culture & Local Laws</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className={`p-8 rounded-[40px] border shadow-sm ${theme === 'dark' ? 'bg-[#001a24] border-white/5' : 'bg-amber-50/50 border-amber-100'}`}>
                                    <h4 className={`font-black text-xl mb-6 ${theme === 'dark' ? 'text-amber-500' : 'text-amber-900'}`}>👗 Dress Code</h4>
                                    <ul className="space-y-4 text-sm font-medium">
                                        <li className="flex gap-3"><span className="text-amber-500">✓</span> <span><strong>Resorts:</strong> Casual western wear OK</span></li>
                                        <li className="flex gap-3"><span className="text-amber-500">✓</span> <span><strong>Local Islands:</strong> Cover shoulders & knees</span></li>
                                        <li className="flex gap-3"><span className="text-amber-500">✓</span> <span><strong>Mosques:</strong> Shoes off, modest clothing</span></li>
                                    </ul>
                                </div>
                                <div className={`p-8 rounded-[40px] border shadow-sm ${theme === 'dark' ? 'bg-[#001a24] border-white/5' : 'bg-amber-50/50 border-amber-100'}`}>
                                    <h4 className={`font-black text-xl mb-6 ${theme === 'dark' ? 'text-amber-500' : 'text-amber-900'}`}>🍷 Restricted Items</h4>
                                    <ul className="space-y-4 text-sm font-medium">
                                        <li className="flex gap-3"><span className="text-red-500">✗</span> <span><strong>Alcohol:</strong> Illegal on local islands</span></li>
                                        <li className="flex gap-3"><span className="text-red-500">✗</span> <span><strong>Pork:</strong> Strictly prohibited import</span></li>
                                        <li className="flex gap-3"><span className="text-red-500">✗</span> <span><strong>Religious Items:</strong> Contrary to Islam</span></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'emergency' && (
                        <div className="space-y-8">
                            <h3 className={`text-3xl font-black ${theme === 'dark' ? 'text-white' : 'text-[#001219]'}`}>Emergency Hub</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className={`p-8 rounded-[40px] border shadow-sm ${theme === 'dark' ? 'bg-[#001a24] border-white/5' : 'bg-red-50/50 border-red-100'}`}>
                                    <h4 className={`font-black text-xl mb-6 ${theme === 'dark' ? 'text-red-400' : 'text-red-900'}`}>📞 Essential Numbers</h4>
                                    <div className="space-y-4 text-sm font-black mono text-cyan-600 dark:text-cyan-400">
                                        <div className="flex justify-between border-b border-dashed border-gray-300 dark:border-white/10 pb-2"><span>Police / Ambulance</span> <span>119</span></div>
                                        <div className="flex justify-between border-b border-dashed border-gray-300 dark:border-white/10 pb-2"><span>Coast Guard</span> <span>+960 330 3551</span></div>
                                        <div className="flex justify-between border-b border-dashed border-gray-300 dark:border-white/10 pb-2"><span>Main Hospital</span> <span>+960 333 5000</span></div>
                                    </div>
                                </div>
                                <div className={`p-8 rounded-[40px] border shadow-sm ${theme === 'dark' ? 'bg-[#001a24] border-white/5' : 'bg-red-50/50 border-red-100'}`}>
                                    <h4 className={`font-black text-xl mb-6 ${theme === 'dark' ? 'text-red-400' : 'text-red-900'}`}>🏥 Health & DAN</h4>
                                    <p className="text-sm font-medium leading-relaxed opacity-80">
                                        Uvijek nosite DAN karticu u ronilačkoj torbi. Najbliža komora je na Bandos Islandu ili u Maleu (ADK). Obavijestite osiguranje odmah u slučaju nezgode.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'quick' && (
                        <div className="space-y-8">
                            <h3 className={`text-3xl font-black ${theme === 'dark' ? 'text-white' : 'text-[#001219]'}`}>Quick Reference Guide</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {[
                                    { title: "Marine Tips", items: ["Never touch corals", "Back away from sharks", "Sea snakes: AVOID"], color: "from-cyan-500 to-blue-600" },
                                    { title: "Dive Best Practices", items: ["Buddy check always", "Turn back at 1/3 air", "Safety stop obligatory"], color: "from-green-500 to-emerald-600" },
                                    { title: "Expedition Essentials", items: ["New USD bills only", "e-SIM for data", "Respect prayer times"], color: "from-purple-500 to-pink-600" }
                                ].map((card, i) => (
                                    <div key={i} className={`p-8 rounded-[40px] bg-gradient-to-br ${card.color} text-white shadow-xl`}>
                                        <h4 className="font-black text-lg mb-6 uppercase tracking-tight">{card.title}</h4>
                                        <ul className="space-y-3">
                                            {card.items.map((item, idx) => (
                                                <li key={idx} className="text-sm font-black flex gap-3"><span className="opacity-50">•</span> {item}</li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </section>

            <section className={`rounded-[60px] p-10 md:p-16 relative overflow-hidden shadow-2xl transition-all duration-500 ${theme === 'dark' ? 'bg-[#000d11]' : 'bg-[#005f73] text-white'
                }`}>
                <div className={`absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 transition-colors ${theme === 'dark' ? 'bg-cyan-500/5' : 'bg-white/5'
                    }`} />
                <div className="relative z-10 space-y-12">
                    <div className="flex flex-col md:flex-row items-end justify-between gap-6">
                        <div className="space-y-4">
                            <span className={`${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-200'} font-black text-xs uppercase tracking-[0.4em]`}>{t.safety}</span>
                            <h2 className="text-4xl md:text-5xl font-black tracking-tight uppercase">{lang === 'BS' ? 'Budi siguran ronilac' : 'Be a safe diver'}</h2>
                        </div>
                        <ShieldAlert className={`w-12 h-12 ${theme === 'dark' ? 'text-cyan-500' : 'text-cyan-200'}`} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { title: "Buddy System", desc: lang === 'BS' ? "Nikada ne ronite sami. Buddy check je zakon." : "Never dive alone. Buddy check is mandatory.", icon: Users },
                            { title: "Air Reserve", desc: lang === 'BS' ? "Počnite izron sa min 50 bara. Signalizirajte na 100." : "Start ascent at min 50 bar. Signal at 100.", icon: Activity },
                            { title: "Depth Limits", desc: lang === 'BS' ? "Ne prekoračujte dubinu dogovorenu u briefingu." : "Do not exceed depths agreed in briefing.", icon: Zap },
                            { title: "Safety Stop", desc: lang === 'BS' ? "Obavezne 3 minute na 5 metara." : "Mandatory 3 minutes at 5 meters.", icon: ShieldCheck }
                        ].map((p, i) => (
                            <div key={i} className={`p-8 rounded-[40px] border transition-all duration-300 ${theme === 'dark' ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white/10 border-white/20 hover:bg-white/20'
                                }`}>
                                <p className="text-xl font-black mb-3">{p.title}</p>
                                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-cyan-50'}`}>{p.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Preparation;
