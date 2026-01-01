# 📋 COPY-PASTE UPUTE ZA GITHUB

## 🎯 Cilj: Ažurirati `vite.config.ts` na GitHub-u

---

## 📝 KORAK PO KORAK:

### 1. Otvori fajl za editovanje

Klikni na ovaj link:
```
https://github.com/IDSS123a/kvs-scuba-maldivi/edit/main/vite.config.ts
```

Ili:
1. Idi na: https://github.com/IDSS123a/kvs-scuba-maldivi
2. Klikni na `vite.config.ts`
3. Klikni na **ikonu olovke** (Edit this file)

---

### 2. Obriši SVE postojeće sadržaje

1. Pritisni **Ctrl+A** (Select All)
2. Pritisni **Delete**

---

### 3. Kopiraj NOVI kod

**Otvori fajl:** `vite.config.ts.GITHUB_COPY_PASTE` (u projektu)

**Ili kopiraj ovaj kod:**

```typescript
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

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
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
        manifest: {
          name: 'KVS SCUBA Maldives 2026',
          short_name: 'KVS Maldives',
          description: 'Official application for the KVS SCUBA Sarajevo expedition to the Maldives 2026.',
          theme_color: '#005f73',
          background_color: '#f8fdff',
          display: 'standalone',
          orientation: 'portrait',
          icons: [
            {
              src: 'https://www.scubasarajevo.com/wp-content/uploads/2024/02/cropped-LOGO-SCUBA-Sarajevo-okrugli-192px.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'https://www.scubasarajevo.com/wp-content/uploads/2024/02/cropped-LOGO-SCUBA-Sarajevo-okrugli-512px.png',
              sizes: '512x512',
              type: 'image/png'
            }
          ]
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/api\.geoapify\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'geoapify-cache',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            {
              urlPattern: /^https:\/\/www\.scubasarajevo\.com\/wp-content\/uploads\/.*/i,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'scuba-sarajevo-assets',
                expiration: {
                  maxEntries: 20
                }
              }
            }
          ]
        }
      })
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'shopping': ['./src/components/ShoppingCalculator.tsx']
          }
        }
      }
    }
  };
});
```

---

### 4. Paste u GitHub editor

1. Klikni u GitHub editor (gdje si obrisao stari kod)
2. Pritisni **Ctrl+V** (Paste)

---

### 5. Commit izmjene

1. Scroll na dno stranice
2. U "Commit message" upiši:
   ```
   fix: prevent tree shaking of ShoppingCalculator in production build
   ```
3. Klikni **"Commit changes"**

---

### 6. Sačekaj Vercel deployment

1. **Sačekaj 2-3 minute** da Vercel deployuje
2. Otvori: https://kvs-scuba-maldivi.vercel.app/
3. **Hard refresh:** Pritisni **Ctrl+Shift+R**
4. **Provjeri** da li se pojavljuje **KUPOVINA** dugme 🛒

---

## 🔍 ŠTA SAM DODAO:

Na kraju fajla (linije 81-89), dodao sam:

```typescript
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'shopping': ['./src/components/ShoppingCalculator.tsx']
      }
    }
  }
}
```

Ovo **forsiram** Vite da **NE BRIŠE** ShoppingCalculator komponentu u production build-u!

---

## ✅ OČEKIVANI REZULTAT:

Nakon Vercel deployment-a, Shopping dugme **MORA** se pojaviti jer smo **eksplicitno** rekli Vite-u da zadrži tu komponentu.

---

**KRENI SA KORAK 1 SADA!** 🚀

Javi mi kada završiš commit i kada Vercel završi deployment!
