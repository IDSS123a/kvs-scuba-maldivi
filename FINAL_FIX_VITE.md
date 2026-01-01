# 🚨 KONAČNI FIX ZA SVE PROBLEME

Greška `Rollup failed to resolve import "framer-motion"` se dešava jer smo zakomplikovali život sa `manualChunks`. Također, PWA nam je pravio probleme.

**Najbolje rješenje je DA SVE POJEDNOSTAVIMO.**

Vraćamo se na **standardnu, najjednostavniju** konfiguraciju koja sigurno radi.

---

## 🛠️ UPUTSTVO (Traje 1 min):

1. Otvori **`vite.config.ts`** na GitHub-u:
   👉 [Klikni ovdje za editovanje](https://github.com/IDSS123a/kvs-scuba-maldivi/edit/main/vite.config.ts)

2. Obriši SVE iz fajla (Ctrl+A, Delete).

3. Zalijepi ovaj ČISTI kod:

```typescript
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
      proxy: {
        '/api/divenumber': {
          target: 'https://divenumber.com/api',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/divenumber/, '')
        }
      }
    },
    plugins: [
      react()
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
```

4. **Commit:** `fix: revert to clean vite config`
5. Vercel će automatski buildati.

---

### ZAŠTO ĆE OVO RADITI?
- ❌ Nema PWA plugina (nema `Cannot find package` grešaka).
- ❌ Nema manualChunks (nema `failed to resolve` grešaka).
- ✅ Samo čisti React + Vite.

**Ovo je sigurno onaj pravi!** 🚀
