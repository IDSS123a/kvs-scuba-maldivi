# Admin Login Setup - For Davor Mulalić

## ✅ Corrected Admin Setup

The database fields are different from what was initially documented. Here's the **correct** setup:

---

## Your Admin Access (Correct Version)

### Step 1: Open Supabase Dashboard
- https://app.supabase.com
- Select your project

### Step 2: Go to SQL Editor → New Query

### Step 3: Copy & Paste **this SQL:**
```sql
INSERT INTO divers (name, email, is_pro, status)
VALUES (
  'Davor Mulalić',
  'mulalic71@gmail.com',
  true,
  'confirmed'
)
ON CONFLICT (name) DO UPDATE SET
  email = EXCLUDED.email,
  is_pro = true,
  status = 'confirmed';
```

### Step 4: Click RUN
Should show: `Success!` ✅

### Step 5: Back in Web App
1. Refresh the page (F5)
2. PIN login screen appears
3. Enter PIN: **123456** (default admin PIN)
4. Click Login
5. You're logged in as admin! ✅

---

## Important Notes

- ✅ **Status must be:** `'confirmed'` (not 'approved')
- ✅ **Default admin PIN:** 123456
- ✅ **Your email:** mulalic71@gmail.com (already in admin list)
- ✅ **is_pro:** true (marks you as admin/professional)

---


---

### After Login
You'll automatically see the **⚙️ Admin Panel** button with access to:
- 💰 Finance (payments, budgets)
- 📋 Manifest (participants)
- 📊 Logs (records)

---

## Status: ✅ Ready to Login

1. Run the SQL above
2. Refresh the web page
3. Enter PIN: **123456**
4. You're admin! 🚀

**Total time: 2 minutes**
