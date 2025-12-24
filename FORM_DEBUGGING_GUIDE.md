# Access Request Form - Debugging & Testing Guide

## Form Changes Made

### Simplified Required Fields
- ✅ **Full Name** (required)
- ✅ **Email** (required, validated)
- ⭕ **Phone** (optional)
- ⭕ **Diving Experience** (optional, replaces SSI number)

### Key Improvements
1. **Reduced Required Fields**: Only name + email required (much easier for users)
2. **Better Error Messages**: Only shows validation errors for required fields
3. **Optional Details**: Users can add phone and experience if they want to
4. **Clearer Feedback**: Console logs show "✅ Access request submitted" on success

---

## Step 1: Test Form Submission in Browser

### What to Do
1. Open the application in your browser
2. Click "Request Access" from the login screen
3. Fill in just the **Name** and **Email** fields
4. Leave phone and experience blank
5. Click "Submit Request"

### Expected Behavior
- Form should show loading spinner
- After 1-2 seconds, should see success message
- "Back to Login" button should appear
- Confirmation message: "Your request has been successfully submitted..."

### Check Browser Console
Open Developer Tools (F12) → Console tab:
- Look for: `✅ Access request submitted: [...]`
- This confirms data was sent to Supabase

**If You See Errors:**
```
Error: [message]
```
Note the exact error message - this helps diagnose the issue.

---

## Step 2: Verify Data in Supabase

### How to Check
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Table Editor** → **divers** table
4. Look for newly created row with:
   - `name`: Your test name
   - `email`: Your test email
   - `status`: "pending"
   - `access_status`: "pending"
   - `created_at`: Recent timestamp

### If Data Appears
✅ Form submission is working correctly!

### If Data Does NOT Appear
⚠️ One of these issues:
1. **Supabase Connection**: Check `supabaseClient.ts` - verify API key is correct
2. **Table Permissions**: Row-level security (RLS) might be blocking inserts
3. **Database Error**: The error message in console should show details

---

## Step 3: Check for Database Schema Issues

### Expected Columns in `divers` Table
```
- id (UUID, primary key)
- name (text)
- email (text)
- phone (text, nullable)
- status (text)
- access_status (text)
- created_at (timestamp)
```

### If Column Missing
Add the missing column:
1. Go to Supabase Dashboard
2. Select `divers` table
3. Click "+ Add Column"
4. Fill in name, type, and nullable setting

**Note**: The form stores `phone` as nullable (can be NULL).

---

## Step 4: Test the Admin Approval Flow

### Current Flow
1. User submits request
2. Request stored in `divers` table with `status: 'pending'`
3. Admin needs to:
   - Review pending requests
   - Generate 6-digit PIN
   - Mark as `status: 'approved'`
   - Send PIN to user's email

### What's Missing
- [ ] Admin panel to view pending requests
- [ ] PIN generation and assignment
- [ ] Email notification system

### Recommended Admin Panel Addition
```
Todo: Create admin view showing:
- Pending diver requests
- Approve/Deny buttons
- PIN generation
- Email notification
```

---

## Step 5: Common Issues & Fixes

### Issue: "Svi poljai su obavezni" (All fields are required)
**Cause**: Email field is empty or not valid format  
**Fix**: Enter a valid email like `user@example.com`

### Issue: Form shows generic error after submission
**Cause**: Database error - check Supabase table  
**Fix**: 
1. Verify `divers` table exists
2. Check RLS policies - may need to allow anonymous inserts
3. Verify all required columns exist

### Issue: Success message appears but data doesn't show in Supabase
**Cause**: Frontend shows success but backend failed silently  
**Fix**:
1. Check Supabase RLS policies
2. Check table column types match expectations
3. Try inserting directly in Supabase table editor to test permissions

### Issue: Page hangs after clicking submit
**Cause**: Network issue or infinite loading state  
**Fix**:
1. Check browser console for network errors
2. Verify Supabase connection URL is correct
3. Check internet connection
4. Reload page and try again

---

## Step 6: Testing Checklist

### Basic Functionality
- [ ] Can fill name field
- [ ] Can fill email field
- [ ] Can fill phone field (optional)
- [ ] Can fill experience field (optional)
- [ ] Submit button is clickable
- [ ] Loading spinner appears during submission

### Validation
- [ ] Shows error if name is empty
- [ ] Shows error if email is empty
- [ ] Shows error if email is invalid format
- [ ] Can submit with only name + email (phone/experience blank)

### Success State
- [ ] Success message appears after submission
- [ ] Data appears in Supabase `divers` table
- [ ] "Back to Login" button is clickable
- [ ] Can navigate back to login screen

### Edge Cases
- [ ] Very long name (100+ characters)
- [ ] Email with special characters
- [ ] Multiple rapid submissions (should work independently)
- [ ] Form works on mobile (responsive)

---

## Step 7: Debugging Network Requests

### How to View API Calls
1. Open Developer Tools (F12)
2. Go to **Network** tab
3. Submit the form
4. Look for request to `supabase.co` domain
5. Click on it and check:
   - **Status**: Should be `200` or `201`
   - **Response**: Should show inserted data
   - **Headers**: Should have authorization token

### If Request Shows Error
**Status 400**: Malformed request - check payload format  
**Status 401**: Unauthorized - check Supabase key  
**Status 403**: Forbidden - check RLS policies  
**Status 500**: Server error - check Supabase logs  

---

## Step 8: Enable Supabase RLS for Inserts (If Needed)

If submissions fail with 403 error, you may need to allow anonymous inserts.

### In Supabase Dashboard:
1. Go to **Authentication** → **Policies**
2. Find `divers` table
3. Check if there's a policy allowing inserts
4. If not, create one:
   - **Policy name**: `Allow anonymous insert`
   - **Target roles**: `anon` (anonymous)
   - **Operation**: `INSERT`
   - **Check**: `true` (allow all)

---

## Step 9: Test Email Notification (Future)

Once admin approves request:
1. Admin generates PIN: e.g., `123456`
2. Admin marks diver as `status: 'approved'`
3. System should send email with PIN
4. User uses PIN to log in

**For Now**: Manual process - admin can see pending requests and send PIN email manually.

---

## Troubleshooting Quick Reference

| Symptom | Likely Cause | Solution |
|---------|-------------|----------|
| Form won't submit | Email validation fails | Use valid email: user@domain.com |
| Error: "All fields required" | Name or email empty | Fill both fields |
| Data doesn't appear in DB | RLS policy blocks inserts | Check Supabase RLS settings |
| Page hangs on submit | Network error | Check browser console, refresh |
| Success message but no data | Frontend/backend mismatch | Verify table columns exist |
| 403 Forbidden in network tab | Authentication fails | Check Supabase API key |

---

## Next Steps

1. **Test the form** following Steps 1-3 above
2. **Build admin panel** to manage pending requests (Step 4)
3. **Set up email notifications** when PIN is assigned
4. **Test PIN login** after admin approval

For questions or issues, check browser console and Supabase logs first!
