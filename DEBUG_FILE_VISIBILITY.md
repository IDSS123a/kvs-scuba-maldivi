# 🚨 FIX ZA NEVIDLJIVE KOMPONENTE

Vercel kaže da ne vidi `Dashboard.tsx`, iako ga vi vidite.
To je vjerovatno problem sa velikim/malim slovima (Case Sensitivity) na Linuxu.

Da bismo znali tačno kako Vercel vidi fajlove, natjeraćemo ga da nam ih izlista.

---

## 🛠️ KORAK 1: Edit package.json

1. Otvorite **`package.json`**.
2. Pronađite `"scripts"` sekciju.
3. Promijenite `"build"` skriptu u ovo:
   ```json
   "build": "find src -name \"*.tsx\" && vite build"
   ```
   *(Koristimo `find` umjesto `ls -R` jer je preglednije).*

4. Commit: `chore: debug file names in build`.

---

## 🛠️ KORAK 2: Pogledajte Logove

1. Sačekajte da build faila (vjerovatno hoće).
2. Pogledajte logove.
3. Vidjećete listu fajlova.
   - Da li piše `src/components/dashboard.tsx` (malo slovo)?
   - Ili `src/Components/Dashboard.tsx` (veliko C)?

---

### POPRAVAK:
Kada vidite tačno ime, ispravite import u `AppFinal.tsx` da se **SKROZ POKLAPA**.
To rješava problem.
