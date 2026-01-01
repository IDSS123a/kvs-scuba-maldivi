# 🚨 FIX ZA FRAMER-MOTION (SILOM) 🔨

Vercel uporno odbija da vidi `framer-motion` paket.
Natjeraćemo ga silom.

---

## 🛠️ UPUTSTVO:

1. Idite na Vercel Dashboard -> **Settings** -> **General**.
2. Pronađite **"Install Command"**.
3. Promijenite komandu u ovo (tačno ovako kopirajte):

   ```bash
   npm install && npm install framer-motion
   ```

4. Klikni **Save**.

---

## 🛠️ REDEPLOY:

1. Idite na **Deployments**.
2. Kliknite **Redeploy**.

---

### ŠTA OVO RADI?
Ovo ne instalira samo iz `package.json`.
Ovo kaže Vercelu: *"Instaliraj sve, A ONDA instaliraj framer-motion direktno iz registra bez obzira na sve!"*

Ovo **MORA** raditi.
