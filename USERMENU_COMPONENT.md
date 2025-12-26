# UserMenu Component Documentation

## Overview
The `UserMenu` component provides a professional user profile dropdown menu for the KVS-SCUBA Maldives application. It's located at `src/components/layout/UserMenu.tsx` and serves as the main user interface for account and preference management.

## Features

### 1. **Avatar Trigger Button**
- Circular user avatar (40x40px)
- Displays user's avatar from OAuth providers (Google, etc.)
- Falls back to Gravatar with email hash
- Shows user initials if no avatar available
- Displays user name on hover with tooltip
- Blue gradient background with hover effects
- Professional shadow and border styling

### 2. **Dropdown Menu**
When clicked, reveals a comprehensive dropdown menu with:

#### User Information Section
- User's full name (bold)
- User's email address (gray text)
- Divider line

#### Language Selector
- 🇧🇦 Bosanski button
- 🇬🇧 English button
- Active language highlighted in blue
- Persists to localStorage via i18n
- Updates app language immediately
- Closes dropdown after selection

#### Dark/Light Mode Toggle
- Shows current theme preference (Sun icon for light, Moon icon for dark)
- Visual toggle switch
- Persists to localStorage (`theme` key)
- Immediately updates DOM by adding/removing `dark` class
- Smooth transitions between themes

#### Navigation Links
- **My Profile** - Links to `/profile` page
- **My Checklist** - Links to `/checklist` page
- Right-facing chevron icons
- Hover effects for better UX

#### Logout Button
- Red text color for visual distinction
- Logout icon from Lucide React
- Shows loading state during logout
- Disabled while logout is in progress
- Calls `authService.signOut()`
- Redirects to home page after successful logout

## Technical Implementation

### Dependencies
```typescript
- React (hooks: useState, useRef, useEffect)
- react-i18next (language switching)
- lucide-react (icons)
- AuthContext (user authentication)
- authService (logout function)
```

### State Management
```typescript
- isOpen: boolean - Controls dropdown visibility
- isDarkMode: boolean - Tracks current theme
- isLoggingOut: boolean - Tracks logout loading state
- menuRef: useRef - References dropdown menu
- buttonRef: useRef - References trigger button
```

### Event Handlers
1. **handleThemeToggle()** - Toggles dark/light mode
2. **handleLanguageChange(lang)** - Changes i18n language
3. **handleLogout()** - Signs user out
4. **handleProfileClick()** - Navigates to profile
5. **handleChecklistClick()** - Navigates to checklist

### Event Listeners
- **Click Outside** - Closes dropdown when clicking outside
- **Escape Key** - Closes dropdown on ESC press
- **Image Load Error** - Falls back to initials if avatar fails

## Styling

### Tailwind Classes Used
- **Dark Mode Support** - Full dark theme with `dark:` variants
- **Transitions** - Smooth animations for hover, theme, and dropdown
- **Responsive Design** - Works on all screen sizes
- **Accessibility** - Large touch targets for mobile
- **Color Scheme**:
  - Primary: Blue (`blue-600`)
  - Accent: Red for logout (`red-600`)
  - Theme: Slate grays with dark mode variants

### Responsive Behavior
- Avatar: 40x40px (always visible)
- Dropdown width: 256px (w-64)
- Full-width buttons with large padding
- Mobile-friendly touch targets (min 44px)

## Integration Guide

### 1. Add to Navigation/Header
```tsx
import UserMenu from './layout/UserMenu';

export function Header() {
  return (
    <header className="...">
      {/* Other header content */}
      <UserMenu />
    </header>
  );
}
```

### 2. Ensure AuthContext is Available
The component requires the `AuthProvider` to be wrapped around your app:
```tsx
import { AuthProvider } from './contexts/AuthContext';

export function App() {
  return (
    <AuthProvider>
      {/* Your app components */}
    </AuthProvider>
  );
}
```

### 3. Update Routes (if needed)
The component currently navigates to:
- `/profile` - For "My Profile" link
- `/checklist` - For "My Checklist" link

Update these route paths if your app structure differs:
```tsx
// In UserMenu.tsx, modify these functions:
const handleProfileClick = () => {
  window.location.href = '/your-profile-route';
  setIsOpen(false);
};

const handleChecklistClick = () => {
  window.location.href = '/your-checklist-route';
  setIsOpen(false);
};
```

### 4. Translation Keys (Optional)
Add these translation keys to your i18n JSON files for full localization:
```json
{
  "common": {
    "user_menu": "User menu",
    "language": "Language",
    "dark_mode": "Dark Mode",
    "light_mode": "Light Mode",
    "toggle_theme": "Toggle theme",
    "my_profile": "My Profile",
    "my_checklist": "My Checklist",
    "logout": "Logout",
    "logging_out": "Logging out..."
  }
}
```

## User Flow

1. **User clicks avatar** → Dropdown opens
2. **Language selection** → Language changes immediately, dropdown closes
3. **Theme toggle** → Theme updates immediately, dropdown stays open
4. **Profile/Checklist click** → Navigates to respective page, dropdown closes
5. **Logout click** → Shows loading state, calls signOut, redirects home
6. **Click outside** → Dropdown closes
7. **Press ESC** → Dropdown closes

## Accessibility Features
- ✅ ARIA labels and roles
- ✅ Keyboard support (ESC to close)
- ✅ Semantic HTML
- ✅ Color contrast compliance
- ✅ Large touch targets
- ✅ Focus management

## Browser Support
- All modern browsers (Chrome, Firefox, Safari, Edge)
- Requires:
  - ES6+ (async/await, arrow functions, template literals)
  - CSS Grid/Flexbox
  - CSS Transitions
  - localStorage API

## Performance Considerations
- Minimal re-renders with proper dependency arrays
- Event listeners cleaned up on component unmount
- No memory leaks from event handlers
- Efficient DOM queries with refs

## Future Enhancements
- Add user preferences panel
- Profile picture upload
- Notification badge on avatar
- Settings submenu
- Account security options
- Theme preview mode
