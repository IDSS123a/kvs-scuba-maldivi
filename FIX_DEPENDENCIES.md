# 🚨 FIX ZA NEDOSTAJUĆE PAKETE (framer-motion)

Greška `Rollup failed to resolve import "framer-motion"` znači da taj paket **fali** na serveru.

Najbrži način da ga instalirate bez pristupa terminalu je promjena postavke na Vercel-u.

---

## 🛠️ KORAK 1: Promjena Install Command

1. Idite na Vercel Dashboard -> Vaš projekat -> **Settings**.
2. Kliknite na **General**.
3. Scroll do **"Build & Development Settings"**.
4. Pronađite **"Install Command"**.
5. Uključite prekidač **OVERRIDE**.
6. Upišite ovo u polje:
   ```bash
   npm install
   ```
   *(Umjesto defaultnog `npm ci`)*.
7. Kliknite **Save**.

---

## 🛠️ KORAK 2: Ponovni Build

1. Idite na **Deployments**.
2. Kliknite na posljednji (neuspjeli) deployment.
3. Kliknite na **3 tačkice** (...) gore desno -> **Redeploy**.
4. Kliknite **Redeploy**.

---

### ZAŠTO OVO RADI?
- `npm ci` (default) je strog i traži da sve bude u `package-lock.json`.
- `npm install` (naš fix) je fleksibilan i instaliraće sve što piše u `package.json` (gdje `framer-motion` sigurno postoji).

**Uradite ovo i build će proći!** 🚀
