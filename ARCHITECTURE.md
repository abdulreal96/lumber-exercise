# Lumbar Exercise App - Architecture Documentation

## Overview
This app is built using **SOLID principles** and **Clean Architecture** patterns to ensure maintainability, testability, and scalability.

## SOLID Principles Applied

### 1. Single Responsibility Principle (SRP)
**Each class/module has one reason to change.**

- **Repositories** - Only handle data persistence (SQLite/AsyncStorage)
- **Services** - Only contain business logic
- **Components** - Only handle UI rendering
- **Hooks** - Only manage specific state or side effects

**Example:**
```typescript
// ❌ BAD: Component doing too much
function SessionScreen() {
  const [data, setData] = useState();
  // Fetching data
  // Business logic
  // Notification scheduling
  // UI rendering
}

// ✅ GOOD: Separated concerns
function SessionScreen() {
  const { sessions } = useSessionService(); // Business logic
  const { schedule } = useNotifications();  // Notifications
  return <SessionList sessions={sessions} />; // UI only
}
```

### 2. Open/Closed Principle (OCP)
**Open for extension, closed for modification.**

We use **interfaces** and **dependency injection** to allow extending functionality without changing existing code.

**Example:**
```typescript
// Interface defines contract
interface IExerciseRepository {
  getAll(): Promise<Exercise[]>;
  getById(id: number): Promise<Exercise | null>;
  save(exercise: Exercise): Promise<void>;
}

// Can swap implementations without changing consumers
class SQLiteExerciseRepository implements IExerciseRepository { }
class MockExerciseRepository implements IExerciseRepository { } // For testing
```

### 3. Liskov Substitution Principle (LSP)
**Subtypes must be substitutable for their base types.**

All repository implementations follow the same interface, so they can be swapped without breaking code.

**Example:**
```typescript
// Service accepts any IExerciseRepository
class ExerciseService {
  constructor(private repository: IExerciseRepository) {}
  
  async getExercises() {
    return this.repository.getAll(); // Works with ANY implementation
  }
}

// Can use real or mock repository
const service1 = new ExerciseService(new SQLiteRepository());
const service2 = new ExerciseService(new MockRepository()); // For tests
```

### 4. Interface Segregation Principle (ISP)
**Clients shouldn't depend on interfaces they don't use.**

We create **small, focused interfaces** instead of large ones.

**Example:**
```typescript
// ❌ BAD: Fat interface
interface IDataStore {
  saveExercise(): void;
  saveSession(): void;
  saveSetting(): void;
  exportAll(): void;
}

// ✅ GOOD: Segregated interfaces
interface IExerciseRepository {
  save(exercise: Exercise): Promise<void>;
}

interface ISessionRepository {
  save(session: SessionLog): Promise<void>;
}

interface ISettingsRepository {
  save(key: string, value: any): Promise<void>;
}
```

### 5. Dependency Inversion Principle (DIP)
**Depend on abstractions, not concretions.**

High-level modules (Services) depend on interfaces, not concrete implementations.

**Example:**
```typescript
// ❌ BAD: Direct dependency on concrete class
class SessionService {
  private repo = new SQLiteSessionRepository(); // Tightly coupled
}

// ✅ GOOD: Depends on abstraction
class SessionService {
  constructor(private repo: ISessionRepository) {} // Flexible
}

// Inject dependency
const service = new SessionService(new SQLiteSessionRepository());
```

## Architecture Layers

```
┌─────────────────────────────────────┐
│         UI Layer (screens/)          │ ← React Components
│  - Screens, Components              │
│  - Only presentation logic          │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      Application Layer (hooks/)      │ ← Custom Hooks
│  - useSessionService()              │
│  - useNotifications()               │
│  - State management                 │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│     Business Layer (services/)       │ ← Business Logic
│  - ExerciseService                  │
│  - SessionService                   │
│  - NotificationService              │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      Data Layer (repositories/)      │ ← Data Access
│  - IExerciseRepository              │
│  - ISessionRepository               │
│  - SQLite / AsyncStorage            │
└─────────────────────────────────────┘
```

## Directory Structure

```
src/
├── domain/                    # Core business entities
│   ├── models/               # Data models (Exercise, Session)
│   └── interfaces/           # Repository & Service interfaces
│
├── data/                     # Data access layer
│   ├── repositories/         # Repository implementations
│   │   ├── ExerciseRepository.ts
│   │   ├── SessionRepository.ts
│   │   └── SettingsRepository.ts
│   └── database/            # SQLite setup
│       └── db.ts
│
├── services/                 # Business logic
│   ├── ExerciseService.ts
│   ├── SessionService.ts
│   └── NotificationService.ts
│
├── presentation/            # UI layer
│   ├── screens/            # App screens
│   ├── components/         # Reusable components
│   └── hooks/             # Custom React hooks
│
├── utils/                  # Utilities
│   └── dateUtils.ts
│
└── constants/             # Static data
    └── exercises.json
```

## Testing Strategy

### Unit Tests
Test individual functions and classes in isolation.

```typescript
// services/__tests__/ExerciseService.test.ts
describe('ExerciseService', () => {
  it('should return all exercises', async () => {
    const mockRepo = new MockExerciseRepository();
    const service = new ExerciseService(mockRepo);
    const exercises = await service.getAllExercises();
    expect(exercises).toHaveLength(4);
  });
});
```

### Integration Tests
Test how multiple components work together.

```typescript
// __tests__/integration/SessionFlow.test.ts
describe('Complete Session Flow', () => {
  it('should save session and update stats', async () => {
    // Test: Start session → Complete exercises → Save → Check history
  });
});
```

### Component Tests
Test React components with React Native Testing Library.

```typescript
// components/__tests__/ExerciseCard.test.tsx
it('should display exercise title and description', () => {
  const { getByText } = render(<ExerciseCard exercise={mockExercise} />);
  expect(getByText('McKenzie Extension')).toBeTruthy();
});
```

## Dependency Injection

We use **constructor injection** for services:

```typescript
// Create dependencies
const db = await openDatabase();
const exerciseRepo = new SQLiteExerciseRepository(db);
const sessionRepo = new SQLiteSessionRepository(db);

// Inject into services
const exerciseService = new ExerciseService(exerciseRepo);
const sessionService = new SessionService(sessionRepo, exerciseService);

// Use in hooks
function useExercises() {
  return useService(exerciseService);
}
```

## Benefits of This Architecture

1. **Testable** - Can easily mock dependencies
2. **Maintainable** - Each piece has clear responsibility
3. **Flexible** - Can swap implementations (e.g., SQLite → AsyncStorage)
4. **Readable** - Clear separation of concerns
5. **Scalable** - Easy to add new features

## Code Quality Tools

- **TypeScript** - Type safety
- **ESLint** - Code quality rules
- **Prettier** - Code formatting
- **Jest** - Testing framework
- **React Native Testing Library** - Component testing

## Running Tests

```bash
# Run all tests
npm test

# Run in watch mode
npm test -- --watch

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test ExerciseService.test
```

## Best Practices

1. **Always use interfaces for repositories and services**
2. **Keep components pure** - no business logic
3. **Test business logic in services, not components**
4. **Use custom hooks to connect services to UI**
5. **Keep functions small and focused**
6. **Write tests first for complex logic (TDD)**
7. **Use TypeScript types strictly** - no `any`

## Example: Adding a New Feature

Let's say you want to add **Exercise Notes**.

### Step 1: Update Model
```typescript
// domain/models/Exercise.ts
export interface Exercise {
  id: number;
  title: string;
  notes?: string; // Add new field
}
```

### Step 2: Update Interface
```typescript
// domain/interfaces/IExerciseRepository.ts
interface IExerciseRepository {
  updateNotes(id: number, notes: string): Promise<void>;
}
```

### Step 3: Implement in Repository
```typescript
// data/repositories/ExerciseRepository.ts
async updateNotes(id: number, notes: string): Promise<void> {
  await this.db.executeSql(
    'UPDATE exercises SET notes = ? WHERE id = ?',
    [notes, id]
  );
}
```

### Step 4: Add Service Method
```typescript
// services/ExerciseService.ts
async saveNotes(exerciseId: number, notes: string): Promise<void> {
  await this.repository.updateNotes(exerciseId, notes);
}
```

### Step 5: Write Test
```typescript
// services/__tests__/ExerciseService.test.ts
it('should save exercise notes', async () => {
  await service.saveNotes(1, 'This was hard');
  const exercise = await service.getById(1);
  expect(exercise.notes).toBe('This was hard');
});
```

### Step 6: Update UI
```typescript
// screens/ExerciseDetailScreen.tsx
const { saveNotes } = useExerciseService();
// Add input and save button
```

## Questions?

This architecture may seem like "extra work" initially, but it pays off:
- **Easier debugging** - Clear where logic belongs
- **Faster testing** - Mock dependencies easily
- **Less bugs** - Type safety catches errors
- **Team-friendly** - Clear conventions

Enjoy building! 🚀
