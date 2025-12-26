---
description: Implement diver/non-diver distinction and update admin panel
---

### Plan:
1. Update `Admin.tsx` states (`newDiver`, `editingDiver`) to include `isDiver` and `isPro`.
2. Update `Admin.tsx` CRUD operations to use the `users` table and include new fields.
3. Update `Admin.tsx` UI to show "Non-Diver" badges and conditional fields.
4. Update `Participants.tsx` to display "Non-Diver" status and hide diving stats for those 6 members.

### Status:
- [ ] Update Admin.tsx CRUD & State
- [ ] Update Admin.tsx UI
- [ ] Update Participants.tsx UI
- [ ] Final Data Sync Verification
