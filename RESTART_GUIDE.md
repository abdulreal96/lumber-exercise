# Quick Restart Guide

## The Error You're Seeing
The `PlatformConstants` error is from the OLD cached version on your phone.

## Fix: Clear Expo Go Cache on Your Phone

### For Android:
1. **Open Expo Go app** on your phone
2. **Shake your phone** to open the developer menu
3. Select **"Reload"** or **"Disable Fast Refresh"**
4. If that doesn't work:
   - Go to your phone's **Settings → Apps → Expo Go**
   - Tap **"Storage"**
   - Tap **"Clear Cache"** (NOT Clear Data)
   - Tap **"Force Stop"**

### Alternative: Complete Fresh Start
1. **Close Expo Go** completely on your phone
2. **On your computer**, run:
   ```bash
   npx expo start --clear --reset-cache
   ```
3. **Wait** for the QR code to appear
4. **Scan the QR code** with Expo Go (fresh scan)

## Why This Happened
- The configuration files were missing
- Your phone cached the broken bundle
- Even though we fixed the server, your phone still has the old version

## Quick Command
```bash
npx expo start --clear --reset-cache
```

Then **completely close and reopen Expo Go** on your phone before scanning.
