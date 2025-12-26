# 🚀 Uputstvo za Deployment na Vercel (Za Početnike)

Ovo je detaljan vodič "korak po korak" kako da vašu aplikaciju **KVS Scuba Maldivi** postavite na internet koristeći Vercel. Nije vam potrebno nikakvo programersko znanje.

---

## ✅ Preduslovi

1.  **GitHub Račun**: Morate imati račun na [GitHub.com](https://github.com).
2.  **Vercel Račun**: Morate imati račun na [Vercel.com](https://vercel.com) (najbolje je prijaviti se koristeći vaš GitHub račun).
3.  **Vaš kod na GitHub-u**: Kod mora biti poslan na GitHub.

---

## Korak 1: Slanje Koda na GitHub

Već smo pripremili automatizovanu skriptu koja će ovo uraditi za vas.

1.  Otvorite folder projekta na vašem računaru: `c:\DAVOR_IDSS\Locker\AI\Maldivi\kvs-scuba-maldivi`
2.  Pronađite fajl pod nazivom **`push-to-github.bat`**.
3.  **Dvaput kliknite** na njega.
4.  Otvorit će se crni prozor (terminal). Sačekajte da završi sve korake.
5.  Ako vas pita za GitHub korisničko ime i šifru, unesite ih.
6.  Kada piše "Push complete!", pritisnite bilo koju tipku da zatvorite prozor.

> **Napomena:** Ako skripta javi grešku (crveni tekst), to može značiti da je kod već poslan. Provjerite na GitHub-u da li vidite svoje fajlove na `https://github.com/IDSS123a/kvs-scuba-maldivi`.

---

## Korak 2: Prijavljivanje na Vercel

1.  Otiđite na **[vercel.com](https://vercel.com)**.
2.  Kliknite na **"Sign Up"** (ili "Login").
3.  Odaberite **"Continue with GitHub"**. Ovo je najlakši način jer automatski povezuje vaše projekte.

---

## Korak 3: Importovanje Projekta

1.  Na vašoj Vercel kontrolnoj tabli (Dashboard), kliknite dugme **"Add New..."** (u gornjem desnom uglu) i odaberite **"Project"**.
2.  Vidjet ćete listu vaših GitHub repozitorija.
3.  Pronađite **`kvs-scuba-maldivi`** (ili kako ste ga nazvali na GitHub-u).
4.  Kliknite dugme **"Import"** pored tog naziva.

---

## Korak 4: Konfiguracija (Veoma Važno!) 🔑

Ovo je najbitniji korak. Vercel mora znati vaše "tajne ključeve" (za bazu podataka, Google login, itd.) da bi aplikacija radila.

1.  Na ekranu "Configure Project", vidjet ćete sekciju **"Environment Variables"**. Kliknite da je proširite.
2.  Morate dodati varijable jednu po jednu.
3.  Otvorite vaš lokalni fajl `.env.local` (u folderu projekta) koristeći **Notepad** da vidite vaše stvarne ključeve.
4.  Kopirajte nazive i vrijednosti u Vercel polja i kliknite **"Add"** za svaku:

| Naziv (Name) | Vrijednost (Value) |
| :--- | :--- |
| `VITE_SUPABASE_URL` | *(Kopirajte URL iz vašeg .env.local fajla)* |
| `VITE_SUPABASE_ANON_KEY` | *(Kopirajte ključ iz vašeg .env.local fajla)* |
| `VITE_GOOGLE_CLIENT_ID` | *(Kopirajte ID iz .env.local ako koristite Google Login)* |
| `VITE_FIXER_API_KEY` | *(Kopirajte ključ iz .env.local ako ga imate)* |
| `VITE_SHEETS_API_KEY` | *(Kopirajte ključ iz .env.local ako ga imate)* |
| `VITE_MODE` | `production` |

> **Pažnja:** Nemojte kopirati `.env.example` vrijednosti (poput "your-key-here"). Morate kopirati **stvarne** vrijednosti iz `.env.local`.

---

## Korak 5: Deploy (Lansiranje) 🚀

1.  Kada ste unijeli sve varijable, kliknite veliko plavo dugme **"Deploy"**.
2.  Vercel će početi proces "Build". Ovo traje oko 1-2 minute. Vidjet ćete logove kako se vrte.
3.  Ako je sve u redu, ekran će se pretvoriti u konfete 🎉 i pisat će **"Congratulations!"**.

---

## Korak 6: Testiranje

1.  Kliknite na sliku (screenshot) vaše aplikacije ili na dugme **"Visit"**.
2.  Vaša aplikacija je sada uživo na adresi koja izgleda kao `kvs-scuba-maldivi.vercel.app`.
3.  **Provjerite:**
    *   Da li se možete prijaviti (Login)?
    *   Da li se učitava Admin Panel?

---

### Šta ako nešto ne radi? (Troubleshooting)

*   **Greška pri Build-u:** Provjerite "Logs" tab na Vercelu. Ako vidite greške vezane za `TypeScript` ili `Lint`, javite mi. (Već smo popravili većinu ovih stvari, pa bi trebalo proći glatko).
*   **Aplikacija se učita, ali nema podataka:** Vjerovatno niste dobro unijeli `VITE_SUPABASE_URL` ili `VITE_SUPABASE_ANON_KEY`. Otiđite u Vercel -> Settings -> Environment Variables i provjerite ih.

Sretno! 🤞
