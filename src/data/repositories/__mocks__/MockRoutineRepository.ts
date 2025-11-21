import { Routine } from '../../../domain/models';
import { IRoutineRepository } from '../../../domain/interfaces/IRepositories';

/**
 * Mock Routine Repository for Testing
 */
export class MockRoutineRepository implements IRoutineRepository {
  private routines: Routine[] = [
    {
      id: '1',
      name: 'Morning Routine',
      type: 'morning',
      exerciseIds: ['1', '3', '4'],
      estimatedDuration: 15,
    },
    {
      id: '2',
      name: 'Evening Routine',
      type: 'evening',
      exerciseIds: ['2', '3', '4'],
      estimatedDuration: 20,
    },
  ];

  private nextId = 3;

  async getAll(): Promise<Routine[]> {
    return [...this.routines];
  }

  async getById(id: string): Promise<Routine | null> {
    return this.routines.find(r => r.id === id) || null;
  }

  async getByType(type: string): Promise<Routine | null> {
    return this.routines.find(r => r.type === type) || null;
  }

  async save(routine: Routine): Promise<void> {
    const newRoutine = { ...routine, id: String(this.nextId++) };
    this.routines.push(newRoutine);
  }

  async update(routine: Routine): Promise<void> {
    const index = this.routines.findIndex(r => r.id === routine.id);
    if (index >= 0) {
      this.routines[index] = routine;
    }
  }

  async delete(id: string): Promise<void> {
    this.routines = this.routines.filter(r => r.id !== id);
  }

  // Helper method for tests
  reset(): void {
    this.routines = [
      {
        id: '1',
        name: 'Morning Routine',
        type: 'morning',
        exerciseIds: ['1', '3', '4'],
        estimatedDuration: 15,
      },
      {
        id: '2',
        name: 'Evening Routine',
        type: 'evening',
        exerciseIds: ['2', '3', '4'],
        estimatedDuration: 20,
      },
    ];
    this.nextId = 3;
  }
}
