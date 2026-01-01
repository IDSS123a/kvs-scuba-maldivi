# 🚨 FIX ZA TYPES GREŠKU

Fajl `types.ts` se ne može pronaći (ili build system ima problem s njim).
Najbrže rješenje je da **definišemo tipove direktno u fajlu**.

---

## 🛠️ UPUTSTVO (Edit src/AppFinal.tsx):

1. Idite na GitHub i editujte **`src/AppFinal.tsx`**.

2. **PRONAĐITE I OBRIŠITE** ovu liniju (pri vrhu):
   ```typescript
   import { View, Theme, Language } from './types';
   ```

3. **NA NJENO MJESTO ZALIJEPITE** ovaj kod:

   ```typescript
   export type Theme = 'light' | 'dark';
   export type Language = 'BS' | 'EN';

   export enum View {
       DASHBOARD = 'dashboard',
       ITINERARY = 'itinerary',
       PARTICIPANTS = 'participants',
       GALLERY = 'gallery',
       PREPARATION = 'preparation',
       GUIDES = 'guides',
       ESSENTIAL_INFO = 'essentialInfo',
       ADMIN = 'admin'
   }
   ```

4. **Commit:** `fix: inline types to resolve build error`.

---

### REZULTAT:
Build više neće tražiti `./types` fajl.
Shopping dugme stiže! 🛒
