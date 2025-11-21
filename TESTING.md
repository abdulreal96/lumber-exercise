# Testing Guide

## Overview
This project uses **Jest** and **React Native Testing Library** for comprehensive testing.

## Test Types

### 1. Unit Tests
Test individual functions, services, and utilities.

**Location:** `src/**/__tests__/`

**Example:**
```typescript
// src/services/__tests__/ExerciseService.test.ts
import { ExerciseService } from '../ExerciseService';
import { MockExerciseRepository } from '../../data/repositories/__mocks__/MockExerciseRepository';

describe('ExerciseService', () => {
  let service: ExerciseService;
  let mockRepo: MockExerciseRepository;

  beforeEach(() => {
    mockRepo = new MockExerciseRepository();
    service = new ExerciseService(mockRepo);
  });

  it('should return all exercises', async () => {
    const exercises = await service.getAllExercises();
    expect(exercises).toHaveLength(4);
    expect(exercises[0].title).toBe('McKenzie Back Extension');
  });

  it('should filter exercises by category', async () => {
    const coreExercises = await service.getByCategory('core');
    expect(coreExercises.every(e => e.category === 'core')).toBe(true);
  });
});
```

### 2. Component Tests
Test React components in isolation.

**Location:** `src/presentation/components/__tests__/`

**Example:**
```typescript
// src/presentation/components/__tests__/ExerciseCard.test.tsx
import { render } from '@testing-library/react-native';
import { ExerciseCard } from '../ExerciseCard';

describe('ExerciseCard', () => {
  const mockExercise = {
    id: 1,
    title: 'McKenzie Extension',
    description: 'Lie on stomach...',
    repetitions: 10,
  };

  it('renders exercise title and description', () => {
    const { getByText } = render(<ExerciseCard exercise={mockExercise} />);
    
    expect(getByText('McKenzie Extension')).toBeTruthy();
    expect(getByText('Lie on stomach...')).toBeTruthy();
  });

  it('displays repetitions when provided', () => {
    const { getByText } = render(<ExerciseCard exercise={mockExercise} />);
    expect(getByText(/10 reps/i)).toBeTruthy();
  });
});
```

### 3. Integration Tests
Test complete workflows across multiple components.

**Location:** `__tests__/integration/`

**Example:**
```typescript
// __tests__/integration/SessionWorkflow.test.ts
describe('Complete Session Workflow', () => {
  it('should complete full session and save to history', async () => {
    // 1. Start session
    const session = await sessionService.startSession('morning');
    expect(session.routine).toBe('morning');
    
    // 2. Complete exercises
    await sessionService.markExerciseComplete(session.id, 1);
    await sessionService.markExerciseComplete(session.id, 2);
    
    // 3. Finish session
    await sessionService.finishSession(session.id);
    
    // 4. Verify saved in history
    const history = await sessionService.getHistory();
    expect(history).toHaveLength(1);
    expect(history[0].completed).toBe(true);
  });
});
```

## Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run tests in watch mode (auto-rerun on file changes)
npm test -- --watch

# Run tests with coverage report
npm test -- --coverage

# Run specific test file
npm test ExerciseService.test

# Run tests matching pattern
npm test Session

# Run tests in a specific folder
npm test src/services
```

### Coverage Reports

After running `npm test -- --coverage`, you'll see:

```
-----------------|---------|----------|---------|---------|-------------------
File             | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
-----------------|---------|----------|---------|---------|-------------------
All files        |   85.23 |    78.45 |   90.12 |   85.67 |
 ExerciseService |   92.30 |    85.71 |   100   |   92.30 | 45-47
 SessionService  |   88.46 |    75.00 |   87.50 |   88.46 | 89,112-115
-----------------|---------|----------|---------|---------|-------------------
```

**Target:** Aim for >80% coverage on services and utilities.

## Test Structure

### Arrange-Act-Assert (AAA) Pattern

```typescript
it('should calculate session duration', () => {
  // Arrange - Set up test data
  const startTime = new Date('2025-11-20T07:00:00');
  const endTime = new Date('2025-11-20T07:15:00');
  
  // Act - Perform the action
  const duration = calculateDuration(startTime, endTime);
  
  // Assert - Verify the result
  expect(duration).toBe(15); // 15 minutes
});
```

### beforeEach and afterEach

```typescript
describe('SessionRepository', () => {
  let db: SQLite.Database;
  let repository: SessionRepository;

  beforeEach(async () => {
    // Setup before each test
    db = await openTestDatabase();
    repository = new SessionRepository(db);
    await seedTestData(db);
  });

  afterEach(async () => {
    // Cleanup after each test
    await db.close();
  });

  it('should save session', async () => {
    // Test uses fresh database
  });
});
```

## Mocking

### Mock Repositories

```typescript
// data/repositories/__mocks__/MockExerciseRepository.ts
export class MockExerciseRepository implements IExerciseRepository {
  private exercises: Exercise[] = [
    { id: 1, title: 'McKenzie Extension', category: 'warmup', repetitions: 10 },
    { id: 2, title: 'Modified Plank', category: 'core', duration_seconds: 30 },
  ];

  async getAll(): Promise<Exercise[]> {
    return [...this.exercises];
  }

  async getById(id: number): Promise<Exercise | null> {
    return this.exercises.find(e => e.id === id) || null;
  }

  async save(exercise: Exercise): Promise<void> {
    this.exercises.push(exercise);
  }
}
```

### Mock Notifications

```typescript
// services/__mocks__/MockNotificationService.ts
export class MockNotificationService {
  scheduledNotifications: any[] = [];

  async scheduleDaily(hour: number, minute: number, content: any) {
    this.scheduledNotifications.push({ hour, minute, content });
    return 'mock-notification-id';
  }

  async cancelAll() {
    this.scheduledNotifications = [];
  }
}
```

### Using Mocks in Tests

```typescript
import { MockExerciseRepository } from '../repositories/__mocks__/MockExerciseRepository';

it('should use mock data', async () => {
  const mockRepo = new MockExerciseRepository();
  const service = new ExerciseService(mockRepo);
  
  const exercises = await service.getAllExercises();
  expect(exercises).toHaveLength(2); // Mock has 2 exercises
});
```

## Testing Async Code

### Promises

```typescript
it('should load exercises asynchronously', async () => {
  const exercises = await exerciseService.getAllExercises();
  expect(exercises).toBeDefined();
});
```

### Callbacks

```typescript
it('should call callback after save', (done) => {
  sessionService.save(session, () => {
    expect(sessionService.count()).toBe(1);
    done(); // Must call done()
  });
});
```

## Testing React Components

### Basic Rendering

```typescript
import { render, screen } from '@testing-library/react-native';

it('renders correctly', () => {
  const { getByText } = render(<HomeScreen />);
  expect(getByText('Welcome')).toBeTruthy();
});
```

### User Interactions

```typescript
import { render, fireEvent } from '@testing-library/react-native';

it('calls onPress when button clicked', () => {
  const mockOnPress = jest.fn();
  const { getByText } = render(
    <Button title="Start" onPress={mockOnPress} />
  );
  
  fireEvent.press(getByText('Start'));
  expect(mockOnPress).toHaveBeenCalledTimes(1);
});
```

### Testing Hooks

```typescript
import { renderHook, act } from '@testing-library/react-native';

it('should toggle state', () => {
  const { result } = renderHook(() => useToggle(false));
  
  expect(result.current.value).toBe(false);
  
  act(() => {
    result.current.toggle();
  });
  
  expect(result.current.value).toBe(true);
});
```

## Test Utilities

### Test Data Factories

```typescript
// utils/test-helpers/factories.ts
export function createMockExercise(overrides?: Partial<Exercise>): Exercise {
  return {
    id: 1,
    title: 'Test Exercise',
    description: 'Test description',
    category: 'core',
    repetitions: 10,
    duration_seconds: null,
    asset: 'test.png',
    ...overrides,
  };
}

// Usage in tests
const exercise = createMockExercise({ title: 'Custom Title', repetitions: 15 });
```

### Test Database Setup

```typescript
// utils/test-helpers/testDatabase.ts
export async function setupTestDatabase(): Promise<SQLite.Database> {
  const db = await SQLite.openDatabase(':memory:'); // In-memory DB
  await createTables(db);
  await seedData(db);
  return db;
}

export async function teardownTestDatabase(db: SQLite.Database) {
  await db.close();
}
```

## Common Testing Patterns

### Testing Error Handling

```typescript
it('should throw error for invalid exercise ID', async () => {
  await expect(
    exerciseService.getById(-1)
  ).rejects.toThrow('Invalid exercise ID');
});
```

### Testing State Changes

```typescript
it('should update session status', async () => {
  const session = await sessionService.create();
  expect(session.status).toBe('pending');
  
  await sessionService.start(session.id);
  const updated = await sessionService.getById(session.id);
  expect(updated.status).toBe('in-progress');
});
```

### Snapshot Testing

```typescript
it('matches snapshot', () => {
  const tree = render(<ExerciseCard exercise={mockExercise} />).toJSON();
  expect(tree).toMatchSnapshot();
});
```

## Debugging Tests

### Console Logging

```typescript
it('debug test', () => {
  const data = { id: 1, title: 'Test' };
  console.log('Data:', data); // Shows in test output
  expect(data.id).toBe(1);
});
```

### Only Run Specific Tests

```typescript
// Run only this test
it.only('should run this test', () => {
  expect(true).toBe(true);
});

// Skip this test
it.skip('should skip this test', () => {
  expect(false).toBe(true);
});
```

### Verbose Output

```bash
npm test -- --verbose
```

## Test Configuration

### jest.config.js

```javascript
module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)'
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
    '!src/**/__mocks__/**',
  ],
  coverageThresholds: {
    global: {
      statements: 80,
      branches: 75,
      functions: 80,
      lines: 80,
    },
  },
};
```

## Best Practices

1. **Test behavior, not implementation** - Don't test private methods
2. **One assertion per test** (when possible) - Makes failures clearer
3. **Use descriptive test names** - Should read like documentation
4. **Keep tests independent** - Tests shouldn't depend on each other
5. **Mock external dependencies** - Database, network, filesystem
6. **Test edge cases** - Empty arrays, null values, boundary conditions
7. **Write tests first for bugs** - Reproduce bug, then fix
8. **Keep tests fast** - Use mocks, avoid real I/O when possible

## Continuous Integration

Tests run automatically on:
- Every commit (pre-commit hook)
- Pull requests (CI pipeline)
- Before deployment

## Troubleshooting

### Tests Fail Randomly
- Check for shared state between tests
- Use `beforeEach` to reset state
- Avoid timeouts - use `waitFor` instead

### Async Tests Timeout
- Increase timeout: `jest.setTimeout(10000)`
- Check for missing `await` keywords
- Ensure promises resolve/reject

### Mock Not Working
- Check mock is imported before real module
- Verify mock implementation matches interface
- Clear mocks: `jest.clearAllMocks()`

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Testing Best Practices](https://testingjavascript.com/)

Happy testing! 🧪
