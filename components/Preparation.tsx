
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  CheckCircle2, 
  Circle, 
  Luggage, 
  Wallet, 
  ShieldCheck, 
  HeartPulse, 
  Smartphone, 
  Waves,
  ShieldAlert,
  Info,
  Thermometer,
  Anchor,
  Activity,
  Zap,
  Users,
  Compass,
  Battery,
  Camera,
  Backpack,
  Sun,
  MapPin,
  AlertTriangle,
  Fish,
  Layers,
  Globe,
  Phone
} from 'lucide-react';

interface Task {
  id: number;
  label: string;
  category: string;
  completed: boolean;
}

const INITIAL_TASKS: Task[] = [
  { id: 1, label: 'Sken pasoša poslat Adnanu', category: 'Dokumenti', completed: false },
  { id: 2, label: 'DAN osiguranje aktivno', category: 'Sigurnost', completed: false },
  { id: 3, label: 'Provjera baterija na kompjuteru', category: 'Oprema', completed: false },
  { id: 4, label: 'e-SIM kupljen (Airalo/Yassim)', category: 'Travel', completed: false },
  { id: 5, label: 'Dolari (noviji od 2013)', category: 'Finansije', completed: false },
  { id: 6, label: 'Lijekovi i kreme (faktor 50+)', category: 'Zdravlje', completed: false },
  { id: 7, label: 'Rezervni O-ringovi i alat', category: 'Oprema', completed: false },
  { id: 8, label: 'SSI certifikat digitalni', category: 'Dokumenti', completed: false },
  { id: 9, label: 'Maska i peraja provjereni', category: 'Oprema', completed: false },
  { id: 10, label: 'Imuga (Maldives Health Declaration)', category: 'Dokumenti', completed: false },
  { id: 11, label: 'Baterija lampe napunjena', category: 'Oprema', completed: false },
  { id: 12, label: 'Rezervna baterija za kameru', category: 'Oprema', completed: false }
];

const Preparation: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'checklist' | 'marine' | 'culture' | 'emergency' | 'quick'>('checklist');
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('scuba_prep_tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  useEffect(() => {
    localStorage.setItem('scuba_prep_tasks', JSON.stringify(tasks));
  }, [tasks]);

  const toggleTask = (id: number) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const progress = Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100);

  const gearGuide = [
    { title: "Odijelo", desc: "3mm Shorty ili Lycra. Voda je stabilnih 29°C.", icon: Thermometer },
    { title: "Maska", desc: "Uvijek u ručnom prtljagu. Ne želite rent-a-masku.", icon: Waves },
    { title: "SMB", desc: "Obavezan za kanalske zarone (drift).", icon: Anchor },
    { title: "Lampa", desc: "Obavezna za Maafushi Caves i noćne zarone.", icon: Zap }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 space-y-12 pb-24 pt-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-[#001219]">Pripreme za ekspediciju</h2>
          <p className="text-[10px] font-black text-[#0a9396] uppercase tracking-[0.3em] mt-1">Sve što vam treba za siguran put</p>
        </div>
        <div className="flex items-center gap-4 bg-white px-6 py-3 rounded-full border border-cyan-50 shadow-sm">
           <div className="w-40 h-2 bg-gray-100 rounded-full overflow-hidden">
             <div className="h-full bg-cyan-600 transition-all duration-1000" style={{ width: `${progress}%` }} />
           </div>
           <span className="text-xs font-black text-[#005f73] uppercase tracking-widest">{progress}% Spremni</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Checklist */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> MASTER CHECKLIST
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tasks.map((task) => (
              <button 
                key={task.id} 
                onClick={() => toggleTask(task.id)} 
                className={`flex items-center gap-4 p-5 rounded-3xl border transition-all text-left ${task.completed ? 'bg-emerald-50 border-emerald-100 opacity-60' : 'bg-white border-cyan-50 shadow-sm hover:border-cyan-200'}`}
              >
                {task.completed ? <CheckCircle2 className="w-8 h-8 text-emerald-500" /> : <Circle className="w-8 h-8 text-gray-200" />}
                <div>
                  <p className={`text-sm font-black ${task.completed ? 'line-through' : ''}`}>{task.label}</p>
                  <p className="text-[9px] font-bold text-gray-400 uppercase">{task.category}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Gear Guide */}
        <div className="space-y-6">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <Backpack className="w-4 h-4" /> DIVE GEAR GUIDE
          </h3>
          <div className="space-y-4">
            {gearGuide.map((item, i) => (
              <div key={i} className="bg-[#001219] p-6 rounded-[40px] text-white flex items-center gap-5">
                <div className="bg-white/10 p-3 rounded-2xl"><item.icon className="w-6 h-6 text-[#ee9b00]" /></div>
                <div>
                  <h4 className="text-sm font-black uppercase tracking-tight">{item.title}</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-amber-500/10 p-6 rounded-[40px] border border-amber-500/20">
             <div className="flex items-center gap-2 text-amber-500 mb-2">
                <Sun className="w-5 h-5" />
                <h4 className="text-[10px] font-black uppercase">Reef Safe Sunscreen</h4>
             </div>
             <p className="text-xs font-medium text-amber-900 italic">Koristite isključivo mineralne kreme bez oksibenzona kako biste zaštitili osjetljive maldivske koralje.</p>
          </div>
        </div>
      </div>

      {/* Safety Protocols */}
      <section className="bg-[#001219] rounded-[60px] p-10 md:p-16 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#ee9b00]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 space-y-12">
            <div className="flex flex-col md:flex-row items-end justify-between gap-6">
              <div className="space-y-4">
                <span className="text-[#ee9b00] font-black text-xs uppercase tracking-[0.4em]">Safety Protocols</span>
                <h2 className="text-4xl md:text-5xl font-black tracking-tight uppercase">Budi siguran ronilac</h2>
              </div>
              <ShieldAlert className="w-12 h-12 text-[#ee9b00]" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { title: "Buddy System", desc: "Nikada ne ronite sami. Buddy check je zakon.", icon: Users },
                { title: "Air Reserve", desc: "Počnite izron sa min 50 bara. Signalizirajte na 100.", icon: Activity },
                { title: "Depth Limits", desc: "Ne prekoračujte dubinu dogovorenu u briefingu.", icon: Zap },
                { title: "Safety Stop", desc: "Obavezne 3 minute na 5 metara.", icon: ShieldCheck }
              ].map((p, i) => (
                <div key={i} className="bg-white/5 p-8 rounded-[40px] border border-white/10 group hover:bg-white/10 transition-all">
                  <p className="text-xl font-black mb-3">{p.title}</p>
                  <p className="text-sm text-gray-400 font-medium">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
      </section>

      {/* Enhanced Guides Tabs */}
      <section className="space-y-8">
        <div className="flex flex-wrap gap-3 border-b border-gray-200 pb-6">
          <button onClick={() => setActiveTab('marine')} className={`px-6 py-3 font-bold text-sm rounded-full transition-all ${activeTab === 'marine' ? 'bg-cyan-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}><Fish className="w-4 h-4 inline mr-2" /> Marine Life Guide</button>
          <button onClick={() => setActiveTab('culture')} className={`px-6 py-3 font-bold text-sm rounded-full transition-all ${activeTab === 'culture' ? 'bg-cyan-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}><Globe className="w-4 h-4 inline mr-2" /> Culture & Laws</button>
          <button onClick={() => setActiveTab('emergency')} className={`px-6 py-3 font-bold text-sm rounded-full transition-all ${activeTab === 'emergency' ? 'bg-cyan-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}><AlertTriangle className="w-4 h-4 inline mr-2" /> Emergency</button>
          <button onClick={() => setActiveTab('quick')} className={`px-6 py-3 font-bold text-sm rounded-full transition-all ${activeTab === 'quick' ? 'bg-cyan-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}><MapPin className="w-4 h-4 inline mr-2" /> Quick Guide</button>
        </div>

        {/* Marine Life Guide */}
        {activeTab === 'marine' && (
          <div className="space-y-8">
            <h3 className="text-2xl font-bold text-[#001219]">Marine Life Guide by Dive Site</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 p-8 rounded-[30px] border border-blue-200">
                <h4 className="font-bold text-lg text-blue-900 mb-3">🐠 Maafushi Caves</h4>
                <p className="text-sm mb-3"><strong>Expected:</strong> Eagle rays, grey reef sharks, napoleon fish, nudibranchs, lionfish</p>
                <p className="text-sm mb-3"><strong>Seasonality:</strong> Best Jan-Apr (dry season), year-round visibility</p>
                <p className="text-sm"><strong>Tips:</strong> Drift dive moguće, pratiti struje. Noćni divi spektakularan za nocturnal life (mantis shrimp, eels)</p>
              </div>
              <div className="bg-blue-50 p-8 rounded-[30px] border border-blue-200">
                <h4 className="font-bold text-lg text-blue-900 mb-3">🦈 Guraidhoo Corner</h4>
                <p className="text-sm mb-3"><strong>Expected:</strong> Grey reef sharks, eagle rays, barracuda jatama, trevally, napoleon wrasse</p>
                <p className="text-sm mb-3"><strong>Seasonality:</strong> Peak visibility Mar-Apr, currents possible</p>
                <p className="text-sm"><strong>Tips:</strong> Straže jatama riba, mogućih struja. Fotografski dragocjeno - sharks nisu agresivne</p>
              </div>
              <div className="bg-blue-50 p-8 rounded-[30px] border border-blue-200">
                <h4 className="font-bold text-lg text-blue-900 mb-3">🐢 South Ari Atoll (Whale Shark)</h4>
                <p className="text-sm mb-3"><strong>Expected:</strong> Whale sharks (best May-Nov), manta rays, reef sharks, jacks, turtles</p>
                <p className="text-sm mb-3"><strong>Seasonality:</strong> Whale shark plankton season May-Oct, manta rays year-round</p>
                <p className="text-sm"><strong>Tips:</strong> Respectful distance (5m), snorkeling opcija, ljetna destinacija</p>
              </div>
              <div className="bg-blue-50 p-8 rounded-[30px] border border-blue-200">
                <h4 className="font-bold text-lg text-blue-900 mb-3">⚡ Shark Tank (Hulhumale)</h4>
                <p className="text-sm mb-3"><strong>Expected:</strong> Tiger sharks, hammerhead sharks, grey reef sharks, trevally, jacks</p>
                <p className="text-sm mb-3"><strong>Seasonality:</strong> Best Dec-Jan, occasional sightings other months</p>
                <p className="text-sm"><strong>Tips:</strong> SAMO za iskusne ronioce. Duboki ronjenja (20-40m), struje. Spojena boja može biti opasna</p>
              </div>
              <div className="bg-blue-50 p-8 rounded-[30px] border border-blue-200">
                <h4 className="font-bold text-lg text-blue-900 mb-3">🎋 Banana Reef</h4>
                <p className="text-sm mb-3"><strong>Expected:</strong> Barracuda jatama, trevally, fusiliers, surgeonfish, parrotfish, sweet lips</p>
                <p className="text-sm mb-3"><strong>Seasonality:</strong> Good year-round, peak visibility Nov-Apr</p>
                <p className="text-sm"><strong>Tips:</strong> Ikonični rif, pelagalni život, idealno za fotografiju školske ribe</p>
              </div>
              <div className="bg-blue-50 p-8 rounded-[30px] border border-blue-200">
                <h4 className="font-bold text-lg text-blue-900 mb-3">🚢 Kuda Giri Wreck</h4>
                <p className="text-sm mb-3"><strong>Expected:</strong> Batfish, shrimp, eels, corals, occasional turtles, morays</p>
                <p className="text-sm mb-3"><strong>Seasonality:</strong> Year-round accessible, 20-35m depth</p>
                <p className="text-sm"><strong>Tips:</strong> Wreck je sigurna - nema intrusive exploration. Macro photography odličnog</p>
              </div>
            </div>
          </div>
        )}

        {/* Culture & Laws */}
        {activeTab === 'culture' && (
          <div className="space-y-8">
            <h3 className="text-2xl font-bold text-[#001219]">Culture & Local Laws</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-amber-50 p-8 rounded-[30px] border border-amber-200">
                <h4 className="font-bold text-lg text-amber-900 mb-4">👗 Dress Code</h4>
                <ul className="space-y-3 text-sm">
                  <li><strong>Resorts:</strong> Casual western wear je OK</li>
                  <li><strong>Local Islands:</strong> Cover shoulders & knees (modesty)</li>
                  <li><strong>Mosques:</strong> Shoes off, women cover head & hair</li>
                  <li><strong>Beach:</strong> Swimwear OK at resorts, conservative on local islands</li>
                </ul>
              </div>
              <div className="bg-amber-50 p-8 rounded-[30px] border border-amber-200">
                <h4 className="font-bold text-lg text-amber-900 mb-4">🙏 Behavior & Respect</h4>
                <ul className="space-y-3 text-sm">
                  <li><strong>Greetings:</strong> Say "Assalam alaikum" (hello)</li>
                  <li><strong>Photography:</strong> ALWAYS ask before photographing people</li>
                  <li><strong>Prayer Times:</strong> Respect Islamic practices, restaurants may close</li>
                  <li><strong>Customs:</strong> No pointing, remove hat indoors, left hand for eating</li>
                </ul>
              </div>
              <div className="bg-amber-50 p-8 rounded-[30px] border border-amber-200">
                <h4 className="font-bold text-lg text-amber-900 mb-4">🍷 Alcohol Rules</h4>
                <ul className="space-y-3 text-sm">
                  <li><strong>Prohibition:</strong> Illegal in public, local islands dry</li>
                  <li><strong>Resorts Only:</strong> Available exclusively at tourist resorts</li>
                  <li><strong>Possession:</strong> Don't carry alcohol outside resort premises</li>
                  <li><strong>Intoxication:</strong> Can result in legal consequences</li>
                </ul>
              </div>
              <div className="bg-amber-50 p-8 rounded-[30px] border border-amber-200">
                <h4 className="font-bold text-lg text-amber-900 mb-4">📸 Underwater Photography</h4>
                <ul className="space-y-3 text-sm">
                  <li><strong>Respect Marine Life:</strong> No touching corals or animals</li>
                  <li><strong>Distance:</strong> Use zoom instead of swimming closer</li>
                  <li><strong>Coral Safe:</strong> Use reef-safe practices only</li>
                  <li><strong>Flash:</strong> Avoid at night to prevent animal disturbance</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Emergency Hub */}
        {activeTab === 'emergency' && (
          <div className="space-y-8">
            <h3 className="text-2xl font-bold text-[#001219]">Emergency Hub</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-red-50 p-8 rounded-[30px] border border-red-200">
                <h4 className="font-bold text-lg text-red-900 mb-4">📞 Emergency Numbers</h4>
                <div className="space-y-3 text-sm font-mono">
                  <p><strong>Police:</strong> 119</p>
                  <p><strong>Ambulance:</strong> 119</p>
                  <p><strong>Fire:</strong> 119</p>
                  <p><strong>Coast Guard:</strong> +960 330 3551</p>
                  <p><strong>Main Hospital:</strong> +960 333 5000</p>
                </div>
              </div>
              <div className="bg-red-50 p-8 rounded-[30px] border border-red-200">
                <h4 className="font-bold text-lg text-red-900 mb-4">🏥 Recompression Chambers</h4>
                <ul className="space-y-3 text-sm">
                  <li><strong>Male City Hospital:</strong> Primary facility with hyperbaric chamber</li>
                  <li><strong>Hulhumale:</strong> Secondary backup chamber</li>
                  <li><strong>Resort Protocols:</strong> Major resorts have emergency procedures</li>
                  <li><strong>Evacuation:</strong> Helicopter available for critical cases</li>
                </ul>
              </div>
              <div className="bg-red-50 p-8 rounded-[30px] border border-red-200">
                <h4 className="font-bold text-lg text-red-900 mb-4">⚠️ Dive Accident Procedures</h4>
                <ol className="space-y-2 text-sm list-decimal list-inside">
                  <li>Stop diving, alert buddy immediately</li>
                  <li>Swim calmly to surface, perform safety stop if able</li>
                  <li>Exit water, lay victim flat if breathing issues</li>
                  <li>Call 119 or alert dive center immediately</li>
                  <li>Do NOT remove equipment until medical check</li>
                  <li>Transport to recompression chamber ASAP</li>
                </ol>
              </div>
              <div className="bg-red-50 p-8 rounded-[30px] border border-red-200">
                <h4 className="font-bold text-lg text-red-900 mb-4">🛡️ Insurance & Support</h4>
                <ul className="space-y-3 text-sm">
                  <li><strong>DAN Insurance:</strong> Covers decompression sickness & evacuation</li>
                  <li><strong>Claim Process:</strong> Contact provider immediately with incident report</li>
                  <li><strong>Embassy:</strong> No BiH embassy; Indian Embassy is closest</li>
                  <li><strong>Contact Info:</strong> Keep emergency numbers in phone & wallet</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Quick Guide */}
        {activeTab === 'quick' && (
          <div className="space-y-8">
            <h3 className="text-2xl font-bold text-[#001219]">Quick Reference Guide</h3>
            <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-10 rounded-[40px] text-white shadow-xl">
              <h4 className="font-bold text-xl mb-6">⚡ Marine Encounter Quick Tips</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <p><strong>🦈 Sharks:</strong> Safe if undisturbed. Maintain distance, back away calmly</p>
                <p><strong>🐍 Sea Snakes:</strong> AVOID completely - highly venomous</p>
                <p><strong>🐠 Stingrays:</strong> Shuffle feet entering water, never touch</p>
                <p><strong>⚫ Sea Urchins:</strong> Sharp spines - wear reef shoes</p>
                <p><strong>🪨 Coral:</strong> DON'T TOUCH - harms coral & you</p>
                <p><strong>🐢 Eels:</strong> Shy - don't probe crevices</p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-10 rounded-[40px] text-white shadow-xl">
              <h4 className="font-bold text-xl mb-6">🎯 Dive Best Practices</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <p>✓ Always dive with buddy at all times</p>
                <p>✓ Monitor air - turn back at 1/3</p>
                <p>✓ Don't exceed certification depth</p>
                <p>✓ If caught in current, swim perpendicular</p>
                <p>✓ Wear appropriate wetsuit for warmth</p>
                <p>✓ Check equipment before every dive</p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-10 rounded-[40px] text-white shadow-xl">
              <h4 className="font-bold text-xl mb-6">🌍 Cultural Essentials</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <p>👗 Dress conservatively outside resorts</p>
                <p>📸 Ask before photographing people</p>
                <p>🕌 Respect prayer times - be quiet</p>
                <p>🍷 Alcohol only at resorts</p>
                <p>💵 USD dollars preferred (use new bills)</p>
                <p>📱 Get local e-SIM for connectivity</p>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default Preparation;
