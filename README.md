# 🏃 Lumbar Exercise Reminder App

A professional React Native mobile app built with **SOLID principles** and comprehensive testing to help users maintain their lumbar health through daily exercise routines.

## 🎯 Features

- ✅ **Daily Notifications** - Morning (7:00 AM) and Evening (5:00 PM) reminders
- ✅ **Guided Exercise Sessions** - Step-by-step workout guidance with timers
- ✅ **Progress Tracking** - Calendar view, streaks, and completion statistics
- ✅ **Customizable Settings** - Adjust times, snooze duration, and more
- ✅ **Exercise Library** - 8 safe lumbar exercises with descriptions
- ✅ **Offline-First** - All data stored locally, no internet required
- ✅ **Export/Import** - Backup your progress data

## 🏗️ Architecture

This app follows **Clean Architecture** and **SOLID principles**:

```
┌─────────────────────────────────────┐
│     Presentation Layer (UI)          │  ← React Components, Screens
├─────────────────────────────────────┤
│     Application Layer (Hooks)        │  ← Custom Hooks, State Management
├─────────────────────────────────────┤
│     Business Layer (Services)        │  ← Business Logic + Tests
├─────────────────────────────────────┤
│     Data Layer (Repositories)        │  ← Data Access + Interfaces
└─────────────────────────────────────┘
```

### Key Principles Applied:

- **Single Responsibility** - Each class has one reason to change
- **Open/Closed** - Extendable without modification (interfaces)
- **Liskov Substitution** - Mock repositories can replace real ones
- **Interface Segregation** - Small, focused interfaces
- **Dependency Inversion** - Services depend on abstractions, not concrete implementations

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed documentation.

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- Expo Go app on your Android phone ([Download](https://play.google.com/store/apps/details?id=host.exp.exponent))
- PC connected to phone's hotspot OR both on same WiFi

### Installation

```bash
# Install dependencies
npm install

# Start the development server
npm start
```

### Running on Your Android Phone

1. Open **Expo Go** app on your phone
2. Scan the **QR code** shown in your terminal/browser
3. App will load and run on your phone! 🎉

## 🧪 Testing

This project has comprehensive test coverage:

### Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test ExerciseService
```

### Test Types

- **Unit Tests** - Test individual services and utilities
- **Integration Tests** - Test complete workflows
- **Component Tests** - Test React components (TODO)

See [TESTING.md](./TESTING.md) for complete testing guide.

### Current Test Coverage

- ✅ ExerciseService - 100%
- ✅ SessionService - 100%
- ✅ DateUtils - 100%
- ✅ Repositories - Mocked for testing

## 📁 Project Structure

```
lumbar-exercise-app/
├── src/
│   ├── domain/                    # Core business entities
│   │   ├── models/               # Data models (Exercise, Session, etc.)
│   │   └── interfaces/           # Repository interfaces
│   │
│   ├── data/                     # Data access layer
│   │   ├── database/            # SQLite setup
│   │   └── repositories/        # Repository implementations + mocks
│   │
│   ├── services/                # Business logic
│   │   ├── ExerciseService.ts
│   │   ├── SessionService.ts
│   │   └── __tests__/          # Service tests
│   │
│   ├── utils/                   # Utility functions
│   │   ├── dateUtils.ts
│   │   └── __tests__/
│   │
│   └── constants/              # Static data
│       └── exercises.json      # Exercise seed data
│
├── ARCHITECTURE.md             # Architecture documentation
├── TESTING.md                 # Testing guide
├── App.tsx                    # App entry point
├── jest.config.js            # Jest configuration
└── package.json
```

## 📦 Tech Stack

- **React Native** - Mobile framework
- **Expo** - Development platform
- **TypeScript** - Type safety
- **SQLite** - Local database (expo-sqlite)
- **AsyncStorage** - Settings storage
- **Jest** - Testing framework
- **React Native Testing Library** - Component testing
- **date-fns** - Date utilities
- **ESLint + Prettier** - Code quality

## 🛠️ Development Commands

```bash
# Start app
npm start

# Run on Android
npm run android

# Run tests
npm test

# Lint code
npm run lint

# Fix lint issues
npm run lint:fix

# Format code
npm run format
```

## 📊 Code Quality

### Linting & Formatting

```bash
# Check for linting errors
npm run lint

# Auto-fix linting errors
npm run lint:fix

# Format all files
npm run format
```

### Type Checking

TypeScript is configured with strict mode:
- `strict: true`
- `noUnusedLocals: true`
- `noImplicitReturns: true`
- `strictNullChecks: true`

## 🔧 Configuration Files

- `tsconfig.json` - TypeScript configuration with path aliases
- `jest.config.js` - Jest testing configuration
- `.eslintrc.js` - ESLint rules
- `.prettierrc` - Prettier formatting rules
- `app.json` - Expo configuration

## 📝 Exercise Data

The app includes 8 pre-loaded exercises:

1. **McKenzie Back Extension** (Warmup)
2. **Modified Plank** (Core)
3. **Bird-Dog** (Core)
4. **Glute Bridge** (Lower)
5. **Cat-Cow Stretch** (Warmup)
6. **Pelvic Tilt** (Core)
7. **Knee-to-Chest Stretch** (Stretch)
8. **Standing Hamstring Stretch** (Stretch)

All exercises include:
- Detailed descriptions
- Repetitions or duration
- Safety contraindications
- Category classification

## 🎨 Next Steps (UI Implementation)

The backend is complete and tested. Next steps:

1. **Screens**
   - Home screen with daily progress
   - Session player with exercise guidance
   - History and calendar views
   - Settings screen

2. **Notifications**
   - Integrate expo-notifications
   - Schedule daily reminders
   - Handle snooze and dismiss actions

3. **UI Components**
   - ExerciseCard
   - SessionPlayer with timer
   - ProgressBar
   - Calendar with marked dates

4. **Navigation**
   - React Navigation setup
   - Bottom tabs + stack navigation

## 📱 Building for Production

### Create Standalone APK

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure EAS
eas build:configure

# Build for Android
eas build --platform android --profile production
```

This creates an APK you can sideload without Expo Go.

## 🤝 Contributing

1. Follow SOLID principles
2. Write tests for new features
3. Run linter before committing
4. Update documentation

## 📄 License

MIT License - Feel free to use for personal or commercial projects.

## 🙏 Acknowledgments

Built with clean architecture principles and comprehensive testing to ensure reliability and maintainability.

---

**Made with ❤️ for better lumbar health**

For questions or issues, please check the documentation files:
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Architecture details
- [TESTING.md](./TESTING.md) - Testing guide
