
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Anchor } from 'lucide-react';
import { ITINERARY, TOTAL_ADULT_EUR, PRICE_AGENCY_EUR, PRICE_CASH_EUR } from '../constants';

interface ChatBotProps {
  theme?: 'light' | 'dark';
  lang?: 'BS' | 'EN';
  isAdmin?: boolean;
}

const ChatBot: React.FC<ChatBotProps> = ({ theme = 'light', lang = 'BS', isAdmin = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([
    {
      role: 'ai',
      text: lang === 'BS'
        ? 'Zdravo! Ja sam tvoj KVS Scuba asistent. Pitaj me bilo šta o našem putovanju na Maldive!'
        : 'Hello! I am your KVS Scuba assistant. Ask me anything about our trip to the Maldives!'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const PREFERRED_MODELS = [
    'gemini-2.5-flash-lite',
    'gemini-2.5-flash',
    'gemini-2.0-flash-lite',
    'gemini-2.0-flash'
  ];

  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsTyping(true);

    if (!API_KEY) {
      setMessages(prev => [...prev, {
        role: 'ai',
        text: lang === 'BS'
          ? "AI asistent nije konfigurisan. Molimo unesite VITE_GEMINI_API_KEY u Vercel setingsima."
          : "AI assistant is not configured. Please add VITE_GEMINI_API_KEY to your environment variables."
      }]);
      setIsTyping(false);
      return;
    }

    const tripContext = ITINERARY.map(item => `Day ${item.day}: ${item.title} at ${item.location || 'various'}. ${item.description}`).join('\n');
    let success = false;

    const sysInstruction = `
      Ti si KVS SCUBA AI asistent za ekspediciju na Maldive (5-16. januar 2026).
      KORISNIK: ${isAdmin ? 'ADMINISTRATOR' : 'RONILAC'}
      
      PRIVATNOST I FINANSIJE:
      - Podaci o tome ko je koliko platio za aranžman su STROGO POVJERLJIVI (samo za admine).
      - ${isAdmin ? `Cijene: Ukupno ${TOTAL_ADULT_EUR}€ (Agencija ${PRICE_AGENCY_EUR}€, Adnan ${PRICE_CASH_EUR}€).` : 'Cijene aranžmana su tajne, uputi na Davora.'}
      
      ZALUŽENO ZNANJE (KNOWLEDGE BASE):
      - SEZONA: Januar/Februar je VRHUNAC vidljivosti (35-40m). More je mirno. Idealno za fotografe.
      - NAJBOLJA STRANA: Zapadna strana atola (downwind) je najbolja za Mante i Whale Sharkove jer prate plankton.
      - SHARK TANK: 7+ vrsta ajkula (Tigar, Bull, Hammerhead, Spinner, Lemon, Silvertip). Samo za iskusne (Advanced), duboko i mutno.
      - KANDOOMA THILA: Jedan od najboljih site-ova. Soft corals, ajkule, orlove raže. Struje su jake.
      - COCOA CORNER: 400m pinnacle, sharks (odrasle i bebe), eagle rays.
      - GURAIDHOO: "Washing machine" struje, pelagijski život, siva grebenska ajkula.
      - KUDA GIRI: Olupina (wreck), jastozi, lion fish, žabe. Odlično za početnike.
      - DHIGU THILA: Manta point, mantas se hrane ovdje tokom odlaznih struja.
      
      LOGISTIKA NOVCA:
      - USD gotovina je obavezna (Sarajevo ili Male aerodrom). Kartice rade u hotelima.
      
      KONTEKST PUTA:
      Plan puta: ${tripContext}
      
      PRAVILA:
      - Odgovaraj na ${lang === 'BS' ? 'bosanskom' : 'engleskom'} jeziku.
      - Budi ljubazan, precizan i koristi ove detalje da WOW-uješ ronioce.
    `;

    for (const modelName of PREFERRED_MODELS) {
      if (success) break;
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              { role: 'user', parts: [{ text: `CONTEXT:\n${sysInstruction}\n\nUSER QUESTION: ${userMessage}` }] }
            ],
            generationConfig: { temperature: 0.7, maxOutputTokens: 1000 }
          })
        });

        const data = await response.json();

        if (response.ok) {
          const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (aiText) {
            setMessages(prev => [...prev, { role: 'ai', text: aiText }]);
            success = true;
          }
        } else {
          console.warn(`Model ${modelName} failed:`, data.error?.message);
          if (data.error?.message?.includes('not found') || data.error?.message?.includes('limit: 0')) continue;
          break; // Stop if it's a fatal error (like invalid key)
        }
      } catch (e) {
        console.error(`Fetch error for ${modelName}:`, e);
        // Continue to next model if it's a transient fetch error
      }
    }

    if (!success) {
      setMessages(prev => [...prev, {
        role: 'ai',
        text: lang === 'BS'
          ? "Trenutno imam tehničkih poteškoća sa povezivanjem. Pokušaj ponovo za minut."
          : "I'm having technical difficulties connecting right now. Please try again in a minute."
      }]);
    }

    setIsTyping(false);
  };

  const t = {
    title: lang === 'BS' ? 'Dive Asistent' : 'Dive Assistant',
    subtitle: lang === 'BS' ? 'KVS AI Podrška' : 'KVS AI Support',
    placeholder: lang === 'BS' ? 'Pitaj me o putovanju...' : 'Ask me about the trip...'
  };

  return (
    <div className="fixed bottom-24 right-5 z-[1000] flex flex-col items-end transition-all duration-300">
      {isOpen && (
        <div className={`w-[320px] sm:w-[380px] h-[550px] rounded-[32px] shadow-2xl mb-4 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300 border ${theme === 'dark' ? 'bg-[#001a24] border-white/10' : 'bg-white border-cyan-100'}`}>
          <div className="p-5 bg-gradient-to-r from-cyan-600 to-blue-800 flex items-center justify-between shadow-lg text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
                <Anchor className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-tight">{t.title}</h3>
                <p className="text-[10px] text-cyan-200 uppercase font-bold tracking-widest">{t.subtitle}</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div ref={scrollRef} className={`flex-1 overflow-y-auto p-5 space-y-4 scrollbar-hide ${theme === 'dark' ? 'bg-[#000d11]/50' : 'bg-cyan-50/30'}`}>
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-[24px] text-xs leading-relaxed shadow-sm ${msg.role === 'user'
                  ? 'bg-cyan-600 text-white rounded-br-none'
                  : theme === 'dark' ? 'bg-gray-800 text-gray-100 rounded-bl-none border border-white/5' : 'bg-white text-gray-800 rounded-bl-none border border-cyan-100'
                  }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className={`p-4 rounded-[24px] rounded-bl-none flex gap-1.5 ${theme === 'dark' ? 'bg-gray-800 border-white/5' : 'bg-white border-cyan-100'} border`}>
                  <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce delay-75" />
                  <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce delay-150" />
                </div>
              </div>
            )}
          </div>

          <div className={`p-4 border-t ${theme === 'dark' ? 'bg-[#001a24] border-white/5' : 'bg-white border-cyan-50'}`}>
            <div className="relative flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder={t.placeholder}
                className={`w-full rounded-2xl py-3.5 pl-4 pr-12 text-sm transition-all duration-300 outline-none border focus:ring-2 focus:ring-cyan-500/20 ${theme === 'dark'
                  ? 'bg-gray-900 border-white/10 text-white placeholder-gray-500'
                  : 'bg-gray-50 border-cyan-100 text-gray-900 placeholder-gray-400'
                  }`}
              />
              <button onClick={handleSend} disabled={isTyping} className="absolute right-1.5 p-2 bg-cyan-600 text-white rounded-xl hover:bg-cyan-500 transition-all shadow-lg shadow-cyan-900/20 disabled:opacity-50">
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      <button onClick={() => setIsOpen(!isOpen)} className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 transform hover:scale-110 active:scale-90 border-2 border-white/50 ${isOpen ? 'bg-white text-cyan-600 rotate-90' : 'bg-gradient-to-br from-cyan-500 to-blue-700 text-white'}`}>
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>
    </div>
  );
};

export default ChatBot;
