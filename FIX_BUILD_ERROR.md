# 🚨 FIX ZA BUILD ERROR (Najbrži način)

Greška koja vam se pojavila: `Cannot find package 'vite-plugin-pwa'` znači da Vercel ne može instalirati taj paket, zbog čega cijeli build pada.

Da bismo **ODMAH** vidjeli Shopping dugme, najbrže rješenje je da **privremeno isključimo PWA**.

---

## 🛠️ UPUTSTVO (Traje 1 minut):

1. Otvorite **`vite.config.ts`** na GitHub-u:
   👉 [Klikni ovdje za editovanje](https://github.com/IDSS123a/kvs-scuba-maldivi/edit/main/vite.config.ts)

2. **OBRIŠITE** liniju 4 (Import):
   ```typescript
   import { VitePWA } from 'vite-plugin-pwa';
   ```

3. **OBRIŠITE** cijeli `VitePWA(...)` blok unutar `plugins: [...]`.
   Trebalo bi izgledati ovako nakon brisanja:
   ```typescript
   plugins: [
     react()
   ],
   ```

4. **SAČUVAJTE (COMMIT):**
   - Message: `fix: remove pwa plugin to repair build`
   - Klikni **Commit changes**.

---

## 🚀 ŠTA ĆE SE DESITI?

1. Vercel će automatski pokrenuti novi build.
2. Ovaj build **ĆE PROĆI** (jer smo uklonili problematični plugin).
3. **Shopping dugme će se pojaviti!** 🛒

Ovo ne briše Shopping funkcionalnost, samo isključuje "Offline mode" (koji ionako pravi probleme sa keširanjem).

**Uradite ovo sada!**
