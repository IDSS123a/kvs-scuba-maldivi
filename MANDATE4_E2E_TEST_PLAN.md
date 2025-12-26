# Mandate 4: End-to-End Testing Plan

## Overview
Complete testing matrix for Mandate 4 implementation. All tests should pass before production deployment.

**Expected Duration:** 60-90 minutes  
**Required:** Two browser windows (App + Supabase Console side-by-side)  
**Test User Credentials:** Admin PIN `1919` (Davor)

---

## Pre-Test Checklist

### Setup
- [ ] Both database migrations applied to Supabase
- [ ] `npm run dev` running on localhost:5173
- [ ] Supabase console open in another browser tab
- [ ] Browser console open (DevTools F12) to monitor for errors
- [ ] No red errors in console (yellow Fixer.io warnings are OK)

---

## Test Suite 1: PIN Hashing Security

### Test 1.1: Verify pin_hash Column Exists
**Objective:** Confirm database migration #1 applied successfully

**Steps:**
1. Open Supabase SQL Editor
2. Run: `SELECT id, email, pin_code, pin_hash FROM users LIMIT 1;`
3. Verify both `pin_code` and `pin_hash` columns exist

**Expected Result:** ✅ Both columns visible in results

---

### Test 1.2: Test Admin PIN (Legacy, Plain-text)
**Objective:** Verify backward compatibility with existing '1919' PIN

**Steps:**
1. Click **Request Access** on app login page
2. Use test email: `test_pin_legacy@example.com`
3. Request role: Any (e.g., "User")
4. Switch to Supabase console, approve the request manually with PIN '1919'
5. Return to app, attempt PIN entry with '1919'
6. Click **Enter** to verify

**Expected Result:** ✅ Login succeeds with legacy PIN '1919'

---

### Test 1.3: Test New PIN Generation (Hashed)
**Objective:** Verify new PINs are hashed and work correctly

**Steps:**
1. Login as admin using PIN `1919`
2. Navigate to **Admin Panel** → **Korisnici** (Users)
3. Find a test user (e.g., from Test 1.2)
4. Click **Regeneriši PIN** (Regenerate PIN)
5. New PIN is generated and displayed (e.g., `4829`)
6. Logout and login with the new PIN `4829`
7. Should succeed

**Expected Result:** ✅ New PIN works and can login

---

### Test 1.4: Verify PIN Hashing in Database
**Objective:** Confirm new PINs are stored as hashes, not plain-text

**Steps:**
1. After Test 1.3, query Supabase:
   ```sql
   SELECT email, pin_code, pin_hash FROM users 
   WHERE email LIKE 'test_pin%'
   ORDER BY created_at DESC;
   ```
2. Examine the results:
   - Admin user (Davor): pin_code='1919', pin_hash=NULL or plain (legacy)
   - New users: pin_code='XXXX', pin_hash='$2a$10$...' (bcrypt hash)

**Expected Result:** ✅ New users have bcrypt-format pin_hash

---

## Test Suite 2: User Profile Menu

### Test 2.1: User Menu Appears in Top-Right
**Objective:** Verify UI integration of new UserMenu component

**Steps:**
1. Login with any valid PIN
2. Look at top-right corner of app
3. Should see circular avatar with user initials (e.g., "DA" for Davor)
4. Click on avatar

**Expected Result:** ✅ Dropdown menu appears with options

---

### Test 2.2: User Menu Contents
**Objective:** Verify all menu items present and functional

**Steps:**
1. Click avatar to open menu
2. Verify the following are visible:
   - User name (e.g., "Davor Maldic")
   - User email (e.g., "davor@example.com")
   - Profile link (if available)
   - Theme toggle ("Light"/"Dark")
   - Language selector ("BS"/"EN")
   - Logout button

**Expected Result:** ✅ All menu items visible and properly labeled

---

### Test 2.3: Theme Toggle (Light/Dark Mode)
**Objective:** Verify theme switching and persistence

**Steps:**
1. Open user menu, note current theme (Light or Dark)
2. Click theme toggle button
3. Entire app should change to opposite color scheme
4. Refresh browser (F5)
5. Check that theme persisted after refresh

**Expected Result:** ✅ Theme changes and persists across refresh

---

### Test 2.4: Language Toggle (BS/EN)
**Objective:** Verify language switching and persistence

**Steps:**
1. Open user menu, note current language (BS or EN)
2. Click language selector
3. Select opposite language (if BS, select EN; if EN, select BS)
4. App interface text should change language (if translation exists)
5. Refresh browser (F5)
6. Check that language persisted after refresh

**Expected Result:** ✅ Language changes and persists across refresh

---

### Test 2.5: Logout Functionality
**Objective:** Verify logout button works

**Steps:**
1. Click avatar to open menu
2. Click **Logout** button
3. Should be redirected to login page
4. Attempt login with valid credentials to confirm
5. Should succeed

**Expected Result:** ✅ Logout clears session and redirects to login

---

### Test 2.6: Click-Outside Close
**Objective:** Verify menu closes when clicking outside

**Steps:**
1. Click avatar to open menu
2. Click anywhere outside the menu (e.g., on the main content area)
3. Menu should close

**Expected Result:** ✅ Menu closes on external click

---

## Test Suite 3: Expedition Checklist System

### Test 3.1: Verify checklist_items Table Exists
**Objective:** Confirm database migration #2 applied successfully

**Steps:**
1. Open Supabase SQL Editor
2. Run: `SELECT COUNT(*) FROM checklist_items;`
3. Should return a number (initially 0 if not seeded yet)

**Expected Result:** ✅ Table exists and is accessible

---

### Test 3.2: Checklist Loads on First Access
**Objective:** Verify auto-seeding of default checklist items

**Steps:**
1. Login as a NEW user (create a new test account)
2. Look for navigation item **🎒 Moja Priprema** in the main menu
3. Click on it
4. Wait for checklist to load
5. Should see ~70 items across 5 categories:
   - Dokumenti (Documents)
   - Ronilačka Oprema (Diving Equipment)
   - Financije (Money)
   - Zdravlje (Health)
   - Sertifikati (Certifications)

**Expected Result:** ✅ Checklist loads with default items, categories visible

---

### Test 3.3: Category Filtering
**Objective:** Verify category tabs work correctly

**Steps:**
1. In checklist view, click on a category tab (e.g., "Ronilačka Oprema")
2. View should filter to show only items in that category
3. Click "Sve" (All) tab to return to full list

**Expected Result:** ✅ Category filtering works and counts match

---

### Test 3.4: Check/Uncheck Items
**Objective:** Verify checkbox functionality

**Steps:**
1. In checklist view, find any item
2. Click the circle icon (unchecked state) next to an item
3. Icon should change to checkmark (checked)
4. Click again to uncheck
5. Progress bar should update to reflect completion %

**Expected Result:** ✅ Checkboxes toggle and UI updates

---

### Test 3.5: Persistence Across Refresh
**Objective:** Verify checked items persist in database

**Steps:**
1. Check 5-10 items in the checklist
2. Note which items are checked (take a screenshot)
3. Refresh browser (F5)
4. Checklist should reload with same items still checked
5. Open Supabase SQL Editor and verify:
   ```sql
   SELECT category, name, checked FROM checklist_items 
   WHERE user_id = (SELECT id FROM users WHERE email='your_test_email');
   ```

**Expected Result:** ✅ Checked items persist across refresh and in database

---

### Test 3.6: Progress Bars
**Objective:** Verify progress calculations are accurate

**Steps:**
1. Note the checklist has 5 category cards at top (if viewing "All")
2. Each category card shows: Category name, count (e.g., "2/15"), and progress bar
3. Overall progress bar at top shows total completion %
4. Manually calculate: If you check 10 of 70 items total, should show ~14%
5. Verify math is correct

**Expected Result:** ✅ Progress bars show accurate percentages

---

### Test 3.7: CSV Export
**Objective:** Verify export functionality

**Steps:**
1. Click **Preuzmi CSV** (Download CSV) button
2. File should download as `checklist-YYYY-MM-DD.csv`
3. Open the CSV file in a spreadsheet application
4. Verify columns: Kategorija, Stavka, Obavezno, Spremljeno
5. Verify data matches what's shown in app

**Expected Result:** ✅ CSV exports correctly with all data

---

### Test 3.8: Mandatory Items Indicator
**Objective:** Verify mandatory items are marked

**Steps:**
1. Browse through checklist items
2. Some items should have red "OBAVEZNO" (Mandatory) badge
3. Examples of mandatory items:
   - Pasoš (Passport)
   - Viza za Maldive (Maldives Visa)
   - Ronilačko odijelo (Diving Suit)
   - Budžet/Novac (Money)
   - PADI Certification

**Expected Result:** ✅ Mandatory items marked with badge

---

### Test 3.9: Multi-User Isolation
**Objective:** Verify users only see their own checklist items

**Steps:**
1. User A checks items 1, 2, 3 in their checklist
2. Logout and login as User B
3. User B's checklist should show all items UNCHECKED (not affected by User A's choices)
4. User B checks different items (e.g., 5, 6, 7)
5. Logout and login as User A again
6. User A's original items 1, 2, 3 should still be checked

**Expected Result:** ✅ Users have isolated checklists (RLS working)

---

## Test Suite 4: Integration Testing

### Test 4.1: Admin Panel Still Works
**Objective:** Verify existing features not broken by Mandate 4

**Steps:**
1. Login as admin (PIN `1919`)
2. Navigate to Admin Panel
3. Check each tab:
   - **Zahtevi** (Requests) - Can see user requests? ✅
   - **Korisnici** (Users) - Can see user list, regenerate PINs? ✅
   - **Finansije** (Payments) - Can see/edit payments? ✅
   - **Manifest** (Manifest) - Can see dives? ✅
   - **Evidencija** (Logs) - Can see audit logs? ✅

**Expected Result:** ✅ All admin functions still operational

---

### Test 4.2: Payment Management
**Objective:** Verify payment functionality with new UserMenu

**Steps:**
1. Login as admin
2. Go to Admin Panel → Finansije
3. Edit a payment record (click to inline-edit)
4. Verify user menu in top-right still accessible
5. Update payment, save
6. Check Supabase: payment updated correctly

**Expected Result:** ✅ Payments can be managed while using new UI

---

### Test 4.3: User Management
**Objective:** Verify user management with new menu

**Steps:**
1. Login as admin
2. Go to Admin Panel → Korisnici
3. Use UserMenu to change theme (verify still works)
4. Approve a user request
5. Regenerate PIN for a user
6. Verify theme persists after these actions

**Expected Result:** ✅ User management works alongside new menu

---

## Test Suite 5: Console & Performance

### Test 5.1: Console Errors
**Objective:** Verify no critical errors in browser console

**Steps:**
1. Open DevTools (F12)
2. Go to **Console** tab
3. Perform these actions:
   - Login
   - Open UserMenu (click avatar)
   - Change theme
   - Change language
   - Open checklist
   - Check/uncheck items
   - Logout
4. Monitor console for red error messages

**Expected Result:** ✅ No red errors. Yellow warnings (e.g., Fixer.io) are acceptable.

---

### Test 5.2: Performance (Page Load Time)
**Objective:** Verify app loads quickly

**Steps:**
1. Open DevTools → Network tab
2. Refresh page (Ctrl+Shift+R for hard refresh)
3. Monitor:
   - Page load time (should be < 5 seconds)
   - Largest resources (JS, CSS, images)
   - No failed requests

**Expected Result:** ✅ Page loads in under 5 seconds

---

### Test 5.3: Database Queries
**Objective:** Verify efficient database usage

**Steps:**
1. Open Supabase SQL Editor
2. Check query history or logs:
   - When checklist loads, should query `checklist_items` table once
   - When items checked, should UPDATE one row
   - No N+1 queries detected

**Expected Result:** ✅ Database queries are efficient

---

## Test Suite 6: Edge Cases & Error Handling

### Test 6.1: Checklist with Zero Items
**Objective:** Verify handling of empty checklist

**Steps:**
1. Create a new user without navigation to checklist
2. Delete all their checklist items via SQL:
   ```sql
   DELETE FROM checklist_items WHERE user_id = 'user_id_here';
   ```
3. Login as that user and open checklist
4. Should either:
   - Show "No items" message and allow re-seeding, OR
   - Auto-seed again

**Expected Result:** ✅ App handles empty checklist gracefully

---

### Test 6.2: Missing pin_hash Column (Backward Compat)
**Objective:** Verify app works even if pin_hash migration not applied

**Steps:**
1. This is already backward-compatible by design
2. Verify in code: `pinService.ts` checks both `pin_code` and `pin_hash`
3. Even if `pin_hash` is NULL, `pin_code` verification still works

**Expected Result:** ✅ App works whether pin_hash migration applied or not

---

### Test 6.3: Concurrent Checklist Updates
**Objective:** Verify no race conditions

**Steps:**
1. Open app in TWO browser windows, same user login
2. In Window A, check item #1
3. In Window B, check item #2
4. Refresh Window A - should show both items checked
5. Refresh Window B - should show both items checked

**Expected Result:** ✅ Concurrent updates don't conflict

---

## Test Suite 7: Mobile Responsiveness

### Test 7.1: Mobile View - Checklist
**Objective:** Verify checklist works on mobile screens

**Steps:**
1. Open app in browser
2. Press F12, click Device Toolbar (mobile view)
3. Select a mobile device (e.g., iPhone 12)
4. Refresh and open checklist
5. Verify:
   - Text is readable
   - Checkboxes are tappable (not too small)
   - Category tabs scroll if needed
   - Progress bars display correctly

**Expected Result:** ✅ Checklist fully functional on mobile

---

### Test 7.2: Mobile View - User Menu
**Objective:** Verify user menu works on mobile

**Steps:**
1. In mobile view, click avatar (top-right)
2. Menu should appear (may need to be repositioned for mobile)
3. Verify all items are tappable and functional
4. Change theme and language on mobile

**Expected Result:** ✅ User menu functional on mobile

---

## Test Summary Sheet

| Test Suite | Test # | Description | Status | Notes |
|-----------|--------|-------------|--------|-------|
| PIN Hashing | 1.1 | pin_hash column exists | ⏳ | |
| PIN Hashing | 1.2 | Legacy PIN '1919' works | ⏳ | |
| PIN Hashing | 1.3 | New PIN generation works | ⏳ | |
| PIN Hashing | 1.4 | PIN hashing verified in DB | ⏳ | |
| User Menu | 2.1 | Avatar appears | ⏳ | |
| User Menu | 2.2 | Menu items present | ⏳ | |
| User Menu | 2.3 | Theme toggle works | ⏳ | |
| User Menu | 2.4 | Language toggle works | ⏳ | |
| User Menu | 2.5 | Logout works | ⏳ | |
| User Menu | 2.6 | Click-outside closes menu | ⏳ | |
| Checklist | 3.1 | Table exists | ⏳ | |
| Checklist | 3.2 | Items load | ⏳ | |
| Checklist | 3.3 | Category filtering | ⏳ | |
| Checklist | 3.4 | Checkboxes work | ⏳ | |
| Checklist | 3.5 | Persistence works | ⏳ | |
| Checklist | 3.6 | Progress accurate | ⏳ | |
| Checklist | 3.7 | CSV export works | ⏳ | |
| Checklist | 3.8 | Mandatory items marked | ⏳ | |
| Checklist | 3.9 | Multi-user isolation | ⏳ | |
| Integration | 4.1 | Admin panel works | ⏳ | |
| Integration | 4.2 | Payments work | ⏳ | |
| Integration | 4.3 | User mgmt works | ⏳ | |
| Console | 5.1 | No red errors | ⏳ | |
| Console | 5.2 | Fast load time | ⏳ | |
| Console | 5.3 | Efficient queries | ⏳ | |
| Edge Cases | 6.1 | Empty checklist | ⏳ | |
| Edge Cases | 6.2 | Backward compat | ⏳ | |
| Edge Cases | 6.3 | Concurrent updates | ⏳ | |
| Mobile | 7.1 | Mobile checklist | ⏳ | |
| Mobile | 7.2 | Mobile menu | ⏳ | |

---

## Pass Criteria

✅ **MANDATE 4 COMPLETE** when:
- [ ] All PIN hashing tests pass (1.1-1.4)
- [ ] All user menu tests pass (2.1-2.6)
- [ ] All checklist tests pass (3.1-3.9)
- [ ] All integration tests pass (4.1-4.3)
- [ ] Console validation passes (5.1-5.3)
- [ ] No blocking issues in edge cases (6.1-6.3)
- [ ] Mobile views functional (7.1-7.2)
- [ ] Production build completes successfully
- [ ] No database integrity issues
- [ ] Deployment checklist completed

---

## Failure Handling

If any test fails:
1. Note the exact failure condition
2. Check browser console for errors (F12)
3. Check Supabase logs for database errors
4. Compare with expected results above
5. If database issue: Re-apply migrations
6. If UI issue: Check component props and state
7. If permission issue: Verify RLS policies configured correctly

---

**Ready to test!** Start with Test Suite 1 (PIN Hashing) and work through sequentially.
