
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { MessageCircle, X, Send, Sparkles, Loader2, Anchor } from 'lucide-react';
import { ITINERARY, TOTAL_ADULT_EUR, PRICE_AGENCY_EUR, PRICE_CASH_EUR } from '../constants';

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string}[]>([
    { role: 'ai', text: 'Zdravo! Ja sam tvoj KVS Scuba asistent. Pitaj me bilo šta o našem putovanju na Maldive!' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

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

    try {
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || '' });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: userMessage,
        config: {
          systemInstruction: `
            Ti si KVS SCUBA asistent za privatno putovanje na Maldive (5-16. januar 2026). 
            PODACI O PUTOVANJU:
            - Grupa: 19 osoba (15 odraslih, 4 djece).
            - Lokacija: Maafushi, South Male Atoll (Kaafu Atoll, Island ID 102).
            - Cijene: Ukupno 1840€ po osobi. 925€ se plaća agenciji Green Travel (Sarajevo), 915€ u gotovini Adnanu Drndi.
            - Doplata za djecu (hotel): 150€.
            - Admini: Davor Mulalić, Adnan Drnda, Samir Solaković.
            - Ronjenje: Paket uključuje 12-15 urona. Top lokacije: Shark Tank (Hulhumale - tiger sharks), Maafushi Caves, Guraidhoo Corner, Kuda Giri Wreck.
            - Korisne info: USD novčanice moraju biti novije od 2013. godine. Preporučuje se e-SIM (Airalo). 
            - Radno vrijeme: Lokalne prodavnice na Maafushiju rade dvokratno, zatvaraju se tokom vremena molitvi (Fajr, Dhuhr, Asr, Maghrib, Isha).
            - Hitne situacije: Kontaktirati Adnana ili najbliži medicinski centar na Maafushiju.
            - Odgovaraj kratko, profesionalno i prijateljski na bosanskom jeziku. Koristi emojije vezane za more.
          `,
          temperature: 0.7,
        }
      });

      setMessages(prev => [...prev, { role: 'ai', text: response?.text || "Izvini, došlo je do greške u komunikaciji." }]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: 'ai', text: "Trenutno sam pod vodom i nemam signala. Pokušaj ponovo kasnije!" }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-24 right-5 z-[100] flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="w-[320px] sm:w-[380px] h-[500px] glass-card rounded-[32px] shadow-2xl border-white/20 mb-4 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="p-5 bg-gradient-to-r from-cyan-600 to-blue-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Dive Assistant</h3>
                <p className="text-[10px] text-cyan-200 uppercase font-bold tracking-widest">AI Support</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-hide bg-[#001219]/40">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-4 rounded-[24px] text-xs leading-relaxed shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-cyan-600 text-white rounded-br-none' 
                    : 'bg-white/10 text-gray-200 rounded-bl-none border border-white/10'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white/5 p-4 rounded-[24px] rounded-bl-none border border-white/10 flex gap-1">
                  <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce delay-75" />
                  <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce delay-150" />
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white/5 border-t border-white/10">
            <div className="relative flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Pitaj me o zaronima, cijenama..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-4 pr-12 text-xs text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <button 
                onClick={handleSend}
                disabled={isTyping}
                className="absolute right-2 p-2 bg-cyan-600 text-white rounded-xl hover:bg-cyan-500 transition-colors disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 transform active:scale-90 ${
          isOpen ? 'bg-white text-cyan-900 rotate-90' : 'bg-gradient-to-br from-cyan-500 to-blue-700 text-white'
        }`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-cyan-500"></span>
          </span>
        )}
      </button>
    </div>
  );
};

export default ChatBot;
