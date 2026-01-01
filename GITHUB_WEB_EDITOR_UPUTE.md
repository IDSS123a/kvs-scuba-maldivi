# 🛠️ KAKO DODATI SHOPPING NA GITHUB (Web Editor)

## Metoda: Direktno editovanje na GitHub-u

### Korak 1: Otvori fajl za editovanje

1. Idi na: https://github.com/IDSS123a/kvs-scuba-maldivi/blob/main/src/App.tsx
2. Klikni na **ikonu olovke** (Edit this file) u gornjem desnom uglu
3. Otvoriće se GitHub Web Editor

---

### Korak 2: Dodaj import (LINIJA 21-22)

**Pronađi liniju 20:**
```typescript
import { SystemDiagnostics } from './components/SystemDiagnostics';
```

**DODAJ ISPOD (nove linije 21-22):**
```typescript
import ShoppingCalculator from './components/ShoppingCalculator';
import { ShoppingCart } from 'lucide-react';
```

---

### Korak 3: Dodaj state (LINIJA ~78)

**Pronađi liniju:**
```typescript
const [subscribed, setSubscribed] = useState(false);
```

**DODAJ ISPOD:**
```typescript
const [isShoppingOpen, setIsShoppingOpen] = useState(false);
```

---

### Korak 4: Dodaj translation za BS (LINIJA ~135)

**Pronađi (unutar BS translations):**
```typescript
joinList: 'Pridruži se listi za najnovija ažuriranja.',
```

**DODAJ ISPOD (prije zatvaranja BS objekta):**
```typescript
shopping: { trigger: 'KUPOVINA' }
```

---

### Korak 5: Dodaj translation za EN (LINIJA ~148)

**Pronađi (unutar EN translations):**
```typescript
joinList: 'Join the list for the latest updates.',
```

**DODAJ ISPOD (prije zatvaranja EN objekta):**
```typescript
shopping: { trigger: 'SHOPPING' }
```

---

### Korak 6: Dodaj Shopping UI (LINIJA ~401)

**Pronađi (prije zatvaranja glavnog </div>):**
```typescript
<ChatBot theme={theme} lang={lang} isAdmin={isAdmin} />
```

**DODAJ ISPOD:**
```typescript

{/* Shopping Calculator Trigger & Modal */}
<div className="fixed bottom-40 right-5 z-[1000] flex flex-col items-end">
    <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsShoppingOpen(true)}
        className="bg-[#ee9b00] text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border-2 border-white/50 group"
    >
        <ShoppingCart className="w-5 h-5 group-hover:rotate-12 transition-transform" />
        <span className="text-[11px] font-black uppercase tracking-widest">{t.shopping?.trigger || 'KUPOVINA'}</span>
    </motion.button>
    <ShoppingCalculator
        theme={theme}
        isOpen={isShoppingOpen}
        onClose={() => setIsShoppingOpen(false)}
    />
</div>
```

---

### Korak 7: Commit izmjene

1. Scroll na dno stranice
2. U "Commit message" upiši: `feat: add shopping calculator to App.tsx`
3. Klikni **"Commit changes"**

---

### Korak 8: Sačekaj Vercel deployment

1. GitHub će automatski triggerovati Vercel deployment
2. Sačekaj 1-2 minute
3. Otvori: https://kvs-scuba-maldivi.vercel.app/
4. Provjeri da li se pojavljuje dugme **"KUPOVINA"** 🛒

---

## ⚠️ VAŽNO:

- **NE MIJENJAJ** ništa drugo u fajlu
- **SAMO** dodaj ovih 6 izmjena
- Sve ostale izmjene ostaju netaknute
