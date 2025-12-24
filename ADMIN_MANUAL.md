# KVS-SCUBA Maldives 2026 - Administrator Manual

**For: Expedition Organizers (Davor, Adnan, Samir)**

This manual explains how to manage the expedition through the new Admin Dashboard system.

---

## Table of Contents

1. [Accessing the Admin Panel](#accessing-the-admin-panel)
2. [Dashboard Overview](#dashboard-overview)
3. [Managing Access Requests](#managing-access-requests)
4. [Managing Members](#managing-members)
5. [Managing Finances](#managing-finances)
6. [System Administration](#system-administration)
7. [Security & Best Practices](#security--best-practices)
8. [Troubleshooting](#troubleshooting)

---

## Accessing the Admin Panel

### Admin Credentials

You have been pre-configured as an admin:

| Role | Email | PIN Status |
|------|-------|-----------|
| **Davor Mulalić** | mulalic71@gmail.com | Admin Bypass (999999 or direct access) |
| **Adnan Drnda** | adnandrnda@hotmail.com | Admin Bypass (999999 or direct access) |
| **Samir Solakovic** | samirso@hotmail.com | Admin Bypass (999999 or direct access) |

### Logging In

#### Standard Login (If PIN Generated)
1. Open the expedition app
2. You see the "Unlock Expedition" login screen
3. Enter your 6-digit admin PIN
4. Click "Unlock"
5. You're automatically directed to the **Admin Hub**

#### Admin Bypass (Temporary)
For testing/setup:
1. Enter PIN: `999999`
2. Click "Unlock"
3. This only works if you're marked as `is_pro=true` and `access_status=approved'` in the database

#### First-Time Setup
1. One admin (recommend Davor) should:
   - Log in with bypass PIN (999999) or direct link
   - Generate a permanent 6-digit PIN for themselves
   - Write it down securely
   - Share the other admins with their unique PINs via secure channel (WhatsApp, phone, in-person)

### After Login

Once logged in, you'll see the header:
```
🛡️ ADMIN HUB
Logged in as: [Your Name]
```

A red **"Logout"** button is in the top-right. Click it to end your session.

---

## Dashboard Overview

The Admin Hub has **4 main tabs** (tabs at top):

| Tab | Icon | Purpose |
|-----|------|---------|
| **Access Requests** | 👤✓ | Manage pending member access requests |
| **Expedition Members** | 👥 | Full CRUD control over member database |
| **Finance** | 💰 | Track and manage expedition payments |
| **System** | ⚙️ | Administrative tools and system status |

---

## Managing Access Requests

### Viewing Pending Requests

1. Click the **"Access Requests"** tab
2. You see a section: **"Pending Access Requests"**
3. A list displays all users with `access_status='pending'`:
   - Name
   - Email
   - Request Date

### Approving a User (Granting Access)

This is the most important admin task. Follow these steps **exactly**:

#### Step 1: Review the Request
- Look at the user's name and email
- Verify this is a legitimate expedition participant
- Check against your participant list if you have one
- Contact organizers off-app to confirm if unsure

#### Step 2: Click "Approve"
- Next to the user's name, click the green **"Approve"** button
- The system automatically:
  - Generates a **random 6-digit PIN**
  - Hashes it securely in the database
  - Updates the user's status to `access_status='approved'`

#### Step 3: See the Generated PIN
- After clicking Approve, a new section appears at the bottom:
  - **"Generated PINs (Share Securely)"**
  - Shows the PIN for that user
  - Example:
    ```
    123456
    Zahida Ademovic
    [Copy Button]
    ```

#### Step 4: Share the PIN Securely
**CRITICAL:** Do NOT email the PIN! Instead:
1. **WhatsApp** the PIN to the user (most secure)
2. **Call** the user and read the PIN to them
3. **Text Message** (if WhatsApp unavailable)
4. **In Person** (best if possible)

**Sample Message Template:**
```
Hi [Name], your access PIN for the KVS-SCUBA expedition app is: 123456

Keep it safe and use it to log in. Don't share it with others!
```

#### Step 5: Document (Optional)
- Write down who received which PIN (helps if they lose it)
- Keep a secure list (password-protected document, encrypted note app)
- You may be asked to regenerate it later

### Denying a Request

If a user should not have access:

1. Click the red **"Deny"** button next to their name
2. Their status changes to `access_status='revoked'`
3. They cannot log in
4. You can reverse this later if needed by re-approving

### Revoking Access (Existing Member)

If an approved member should lose access (rare):

1. Go to **"Expedition Members"** tab
2. Find the member in the table
3. Click the **red "Revoke"** (trash) icon
4. They can no longer log in
5. Their data remains in the system

---

## Managing Members

### Viewing All Members

1. Click the **"Expedition Members"** tab
2. A table displays all registered members:
   - Name
   - Email
   - Access Status (pending/approved/revoked)
   - Admin Flag (Yes/No)
   - Action buttons

### Member Table Columns

| Column | Meaning |
|--------|---------|
| **Name** | Full name as registered |
| **Email** | Contact email |
| **Status** | Access approval status |
| **Admin** | Can they access this admin panel? |
| **Actions** | Buttons to modify this member |

### Action Buttons (Per Member)

For each member in the table, you have 3 action buttons:

#### 1. Regenerate PIN (Refresh Icon 🔄)
**When to use:** Member lost their PIN

**What happens:**
- Generates a new random 6-digit PIN
- Old PIN becomes invalid
- New PIN displays in the "Generated PINs" box
- Share new PIN with member securely

#### 2. Toggle Admin (Shield Icon 🛡️)
**When to use:** Make someone an admin, or remove admin privileges

**For Non-Admin Member:**
- Click shield button
- Member becomes `is_pro=true`
- They can now access this Admin Hub
- They see all admin functionality

**For Admin Member:**
- Click shield button
- Member becomes `is_pro=false`
- They lose admin access
- They see regular user interface only

**Important:** Use sparingly. Only promote trusted expedition leaders.

#### 3. Delete Member (Trash Icon 🗑️)
**When to use:** Very rarely - if someone should be completely removed

**Warning:** This permanently deletes the member from the system. Their name, email, and data are removed. **This is irreversible.**

**Better Alternative:** Revoke access instead of deleting (keeps audit trail).

### Editing Member Details

Currently, the interface shows member data but inline editing is not fully enabled. For detailed edits:
1. Contact via Supabase console
2. Or use database management tools
3. Future versions will have full edit modal

---

## Managing Finances

### Finance Overview

1. Click the **"Finance"** tab
2. At the top, you see **3 summary cards**:
   - **Total Collected** (€) - All payments combined
   - **Agency** (€) - Payments to the travel agency in Sarajevo
   - **Cash** (€) - On-site payments in Maldives (to Adnan)

These update in real-time as you change payment amounts.

### Payment Table

Below the summary, a table shows all members' payments:

| Column | Meaning |
|--------|---------|
| **Member** | Person's name |
| **Agency** | Amount paid to agency in SJJ |
| **Cash** | Amount paid to Adnan on-site |
| **Total** | Agency + Cash (auto-calculated) |

### Editing a Payment

#### Standard Payment Entry
Standard adult expedition cost: **1,840€ per person**
- 925€ to agency (pre-trip booking)
- 915€ to Adnan (cash on-site)

#### To Update a Payment

1. Find the member in the table
2. Click on the amount field (Agency or Cash)
3. Edit the number (for example, if they paid 500€ to agency instead of 925€, change it)
4. Changes save **automatically** when you click elsewhere
5. The **Total** updates instantly

#### Special Cases

**Children:** Different pricing structure (usually reduced)
- Set Agency: [reduced amount]
- Set Cash: [reduced amount]
- Total: [auto-calculates]

**Discounts:** If someone got a discount
- Subtract from their amounts
- Example: 1840€ with 100€ discount = 1740€ entry

**Partial Payments:** If payment is split over time
- Record the total they owe/paid
- You can add notes if needed (future version)

### Financial Reports

At the bottom of the Finance tab, you can see running totals:
- **Total Collected:** Sum of all payments
- **Agency Total:** Sum of all agency payments
- **Cash Total:** Sum of all cash payments

Use these to verify:
- Did we collect the right total?
- Did the agency receive their share?
- Did we collect cash from Maldives?

### Monthly/Periodic Reconciliation

Best practice:
1. Once per month, review all payments
2. Reconcile against your actual bank/payment records
3. Ensure numbers match
4. Update any discrepancies
5. Export data (see System tab) for accounting

---

## System Administration

### System Tab

The **"System"** tab has administrative tools:

#### 1. Refresh Data
- Button: **"Refresh Data"**
- Use when: You want to reload latest data from Supabase
- What it does: Queries database fresh (doesn't clear your edits)
- When needed: After another admin made changes, to see updates

#### 2. Export CSV
- Button: **"Export to CSV"**
- What it does: Downloads a list of all members
- Format: Excel-compatible file with columns:
  - Name
  - Email
  - Access Status
  - Admin Flag
- Use for:
  - Backup
  - Sharing with team (without sensitive data)
  - Record-keeping
  - Importing to other tools

#### 3. Recent Activity
- Shows:
  - When data was last loaded
  - Total members count
  - Pending requests count
  - Payment records count
- Use for: Quick system status check

#### 4. Connection Status (Future)
- Will show:
  - ✅ Supabase connected / ❌ Offline
  - ✅ API responsive / ❌ API slow
  - ✅ Database healthy / ❌ Database errors
- Currently shows: Load timestamp

---

## Security & Best Practices

### PIN Security Protocol

#### Golden Rules
1. ✅ **DO** use strong, random PINs - System generates them, you don't choose
2. ✅ **DO** share PINs via secure channels (WhatsApp, phone, in-person)
3. ✅ **DO** keep a secure record of who has which PIN
4. ❌ **DON'T** email PINs - Email is not secure
5. ❌ **DON'T** text PINs - SMS is not encrypted
6. ❌ **DON'T** share PINs in public forums or group chats
7. ❌ **DON'T** reuse PINs for multiple members

#### PIN Sharing Checklist
- [ ] Generate PIN from admin panel
- [ ] Write down PIN and member name
- [ ] Contact member via WhatsApp/phone
- [ ] Share PIN verbally (read it out)
- [ ] Ask member to confirm they've written it down
- [ ] Ask member to log in and confirm it works
- [ ] Destroy the written note once confirmed

### Admin Account Security

#### Protect Your Admin PIN
1. Don't share it with other admins verbally - it's personal
2. Write it down and store securely (safe, password manager, etc.)
3. If you suspect it's been compromised, contact Davor/Adnan/Samir
4. Can be regenerated if lost or stolen

#### Session Security
1. **Always Logout** when leaving the admin panel
   - Click the red **"Logout"** button
   - Your session ends immediately
2. **Don't Leave Logged In** on shared computers
3. **Log Out Before Closing** the browser tab
4. **Check Browser URL** - ensure you're on the real app (not a phishing site)

### Access Control Best Practices

1. **Approve Requests Carefully**
   - Verify user identity before approving
   - Check against your expedition roster
   - Contact other admins if unsure
   - Don't approve random email requests

2. **Review Member List Regularly**
   - Weekly: Check if all members have access
   - Monthly: Verify admin flags (who should be admin?)
   - Look for duplicates or suspicious entries
   - Delete fakes/tests

3. **Audit Trail**
   - Keep records of who approved whom
   - Note when PINs were regenerated and why
   - Document any revocations
   - Helps with disputes later

4. **Payment Reconciliation**
   - Monthly: Reconcile app payments vs. actual bank records
   - Flag discrepancies
   - Correct errors promptly
   - Keep backup exports

---

## Troubleshooting

### "User Can't Log In Even With Correct PIN"

**Possible Causes & Solutions:**

1. **User has wrong PIN**
   - Ask: What PIN did you receive?
   - Check: Is it in your "Generated PINs" history?
   - If no match: PIN may have expired, regenerate new one

2. **User's Status is Not "Approved"**
   - Go to Members tab
   - Find user in table
   - Check their Status column
   - If it says "pending" or "revoked", that's why they can't log in
   - Click Approve to enable access

3. **User Exceeded 5 Failed Attempts**
   - They're locked out for 5 minutes
   - Ask them to wait and try again
   - Confirm they have the correct PIN before they try

4. **Database Connection Issue**
   - Click "Refresh Data" in System tab
   - Check if you can load members list
   - If error persists, contact technical support

### "I Can't Generate a PIN - Button Not Working"

1. Verify you're logged in as admin
   - Check header says "🛡️ ADMIN HUB"
2. Verify user has `access_status='pending'`
   - Go to Access Requests tab
   - Is the user listed there?
3. Try refreshing the page
4. If still broken, manually create pin via Supabase console

### "Numbers Don't Add Up - Finance Totals Wrong"

**Debug Steps:**

1. **Recalculate Manually**
   - Add up all individual member totals
   - Does it match the "Total Collected" display?
   - If not, there's a sync issue

2. **Check for Null/Missing Values**
   - Some payment records might be incomplete
   - Look for blank Agency or Cash columns
   - Fill in missing values

3. **Reload Data**
   - Click "Refresh Data" button
   - Totals should recalculate

4. **Export and Verify**
   - Export to CSV
   - Open in Excel
   - Use SUM formula to verify totals
   - If CSV matches DB but display is wrong, it's a display bug (harmless)

### "Member Data Looks Corrupted/Wrong"

1. **Check Member Record**
   - Go to Members tab
   - Click on member
   - Review all fields: name, email, phone, status
   - Is data correct?

2. **If Data is Wrong**
   - Regenerate PIN won't help
   - Edit via Supabase console (SQL)
   - Or delete and have user re-request access

3. **If Data is Correct but Display is Weird**
   - Refresh page (F5)
   - Click "Refresh Data" button
   - May just be a loading issue

### "I'm Locked Out of Admin Panel"

**Scenario:** You forgot your admin PIN or can't log in

**Solutions:**

1. **Ask Another Admin**
   - Contact Davor, Adnan, or Samir
   - One of them can regenerate your PIN in the database
   - Or give you their PIN temporarily to approve requests

2. **Reset via Database** (If you have Supabase access)
   - Go to Supabase SQL Editor
   - UPDATE divers SET access_pin_hash=NULL WHERE email='yourEmail@email.com'
   - This clears your PIN, allowing bypass login with 999999

3. **Prevent Future Lockout**
   - Write down your admin PIN securely when generated
   - Store in password manager
   - Keep backup list with other admins

---

## Appendix: Database Schema Reference

### Divers Table (Key Columns for Admins)

```
id: UUID (unique identifier)
name: TEXT (member name)
email: TEXT (login email)
phone: TEXT (contact number)
status: TEXT (expedition status: 'confirmed', 'pending', etc.)
is_pro: BOOLEAN (true = admin, false = regular user)
access_status: ENUM ('pending', 'approved', 'revoked')
access_pin_hash: TEXT (hashed PIN - you never see this)
pin_created_at: TIMESTAMP (when PIN was generated)
last_login: TIMESTAMP (when they last logged in)
created_at: TIMESTAMP (when account created)
updated_at: TIMESTAMP (last modification time)
```

### Admin Audit Log Table

```
id: UUID
admin_id: UUID (which admin performed action)
action: TEXT (what was done - e.g., "approved_user")
target_user_id: UUID (which member was affected)
target_table: TEXT (which table was modified)
details: JSONB (extra data about the action)
created_at: TIMESTAMP (when action occurred)
```

This table automatically records admin actions (future feature).

### Access Requests Table

```
id: UUID
diver_id: UUID (references divers table)
request_status: ENUM ('pending', 'approved', 'revoked')
approved_by_id: UUID (which admin approved)
approved_at: TIMESTAMP (when approved)
notes: TEXT (any notes about the request)
created_at: TIMESTAMP (when requested)
updated_at: TIMESTAMP (last changed)
```

Historical log of access requests (future feature).

---

## Contact & Support

### Internal Admin Contact
If you have admin-specific questions or issues:
- **Davor**: mulalic71@gmail.com, +387 (61) ...
- **Adnan**: adnandrnda@hotmail.com, +387 (61) ...
- **Samir**: samirso@hotmail.com, +387 (61) ...

### Technical Support
If there are bugs or technical issues with the admin panel:
- Document the issue (what happened, what you did, error message)
- Take a screenshot if possible
- Contact the development team
- Include as much detail as possible

### System Status
- Check the System tab for connection status
- If something says "❌ Offline" or error message, system may be down
- Wait a few minutes and try again
- Contact technical support if persists

---

## Version Information

- **System:** KVS-SCUBA Maldives 2026 Admin Dashboard
- **Version:** Phase 1 Production Ready
- **Updated:** December 23, 2025
- **Expedition Dates:** January 5-16, 2026
- **Admins:** Davor Mulalić, Adnan Drnda, Samir Solakovic

---

**Questions? Need Help?** Contact another admin or refer to specific sections above.

**Remember: Your role as admin is critical to expedition success. Manage access and finances carefully, communicate securely, and keep good records.**

🛡️ **Admin Responsibility: Enable, Protect, Manage** 🛡️

---

*Last Updated: December 23, 2025*
