# ⚡ Google OAuth URIs - Copy-Paste Reference

**⚠️ PASTE CAREFULLY - NO TYPOS!**

---

## 📋 Copy These Exactly

### Authorized JavaScript Origins

Paste each on separate line:

```
http://localhost:3000
http://localhost:5173
https://wgghitqmclpttslzffge.supabase.co
```

### Authorized Redirect URIs

Paste each on separate line:

```
http://localhost:3000/auth/callback
http://localhost:5173/auth/callback
https://wgghitqmclpttslzffge.supabase.co/auth/v1/callback
https://wgghitqmclpttslzffge.supabase.co/auth/v1/providers/callback/google
```

---

## ✅ Verification Checklist

Before clicking CREATE:

- [ ] **javascript origins count:** 3
- [ ] **redirect URIs count:** 4
- [ ] Each URL starts with **"http://"** or **"https://"** (NOT "ttp://")
- [ ] No trailing spaces
- [ ] No trailing slashes (except in `/auth/callback`)
- [ ] URLs match exactly (copy from code block above)

---

## 🆘 If You Get "Invalid Redirect URI"

**Step 1:** Clear all entries
- Select all text in the field
- Delete

**Step 2:** Copy one URL at a time
- Open code block above
- Triple-click to select entire line
- Ctrl+C to copy
- Click in field
- Ctrl+V to paste
- Press Enter to create new line

**Step 3:** Verify no typos
- Check first 4 characters are "http://" (NOT "ttp://")
- Check last characters match (e.g., "/callback")

---

## 📱 Minimal Setup (if having issues)

If you keep getting errors, start with just development URL:

**JavaScript Origins:**
```
http://localhost:3000
```

**Redirect URIs:**
```
http://localhost:3000/auth/callback
```

Then add the others after it works!

---

## 💡 Pro Tip

Use your browser's developer tools:

1. Open Browser DevTools (F12)
2. Copy the URL from address bar: http://localhost:3000
3. Paste into origins field
4. Append "/auth/callback" for redirect URI

This guarantees no typos!

---

**Ready?** Go back to [PHASE3_OAUTH_SETUP.md](PHASE3_OAUTH_SETUP.md) Step 1.3
