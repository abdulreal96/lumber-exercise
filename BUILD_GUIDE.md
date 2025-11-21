# Building APK with EAS Build

## Setup (First Time Only)

1. **Create an Expo account** (if you don't have one):
   - Go to https://expo.dev/signup
   - Sign up with your email

2. **Login to EAS CLI**:
   ```bash
   eas login
   ```
   Enter your Expo credentials

3. **Configure the project**:
   ```bash
   eas build:configure
   ```
   This will create a project ID and update your app.json

## Build APK

### Option 1: Build APK for Preview/Testing (Recommended)
```bash
eas build -p android --profile preview
```

This will:
- Build an APK (not app bundle)
- You can install directly on your phone
- Build happens in the cloud (no Android Studio needed)
- Takes about 10-15 minutes

### Option 2: Build for Production (Google Play Store)
```bash
eas build -p android --profile production
```

This builds an AAB (Android App Bundle) for Google Play Store submission.

## Download and Install

1. After the build completes, you'll get a download link
2. Download the APK to your phone
3. Enable "Install from Unknown Sources" in Android settings
4. Install the APK

## Build Locally (Alternative)

If you want to build locally without EAS:

```bash
npx expo prebuild
```

This creates android/ios folders, then you'd need Android Studio.

## Troubleshooting

**Error: "This project is missing an owner"**
- Run: `eas build:configure` again

**Build fails with "No bundle identifier"**
- The package name is set to: `com.lumbarexercise.app`

**Want to change app icon?**
- Replace `assets/icon.png` (1024x1024)
- Replace `assets/adaptive-icon.png` (1024x1024)
- Run the build again

## Cost

- EAS Build is FREE for:
  - 30 builds per month on free tier
  - Unlimited builds with paid plan ($29/month)

## Build Status

Check your builds at: https://expo.dev/accounts/[your-username]/projects/lumbar-exercise-app/builds
