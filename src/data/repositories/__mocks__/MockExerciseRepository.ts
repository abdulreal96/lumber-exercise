import { Exercise, ExerciseCategory } from '../../../domain/models';
import { IExerciseRepository } from '../../../domain/interfaces/IRepositories';

/**
 * Mock Exercise Repository for testing
 * Following Liskov Substitution: Can replace real repository in tests
 */
export class MockExerciseRepository implements IExerciseRepository {
  private exercises: Exercise[] = [
    {
      id: '1',
      name: 'McKenzie Back Extension',
      description: 'Test description',
      category: 'stretching',
      type: 'reps',
      reps: 10,
      targetMuscles: ['lower back'],
      instructions: ['Test instruction'],
      tips: ['Test tip'],
      warnings: ['Test warning'],
    },
    {
      id: '2',
      name: 'Modified Plank',
      description: 'Test description',
      category: 'strengthening',
      type: 'duration',
      duration: 30,
      targetMuscles: ['core'],
      instructions: ['Test instruction'],
      tips: ['Test tip'],
      warnings: ['Test warning'],
    },
    {
      id: '3',
      name: 'Bird-Dog',
      description: 'Test description',
      category: 'strengthening',
      type: 'reps',
      reps: 10,
      targetMuscles: ['core', 'back'],
      instructions: ['Test instruction'],
      tips: ['Test tip'],
      warnings: ['Test warning'],
    },
    {
      id: '4',
      name: 'Glute Bridge',
      description: 'Test description',
      category: 'strengthening',
      type: 'reps',
      reps: 12,
      targetMuscles: ['glutes', 'lower back'],
      instructions: ['Test instruction'],
      tips: ['Test tip'],
      warnings: ['Test warning'],
    },
  ];

  async getAll(): Promise<Exercise[]> {
    return [...this.exercises];
  }

  async getById(id: string): Promise<Exercise | null> {
    return this.exercises.find(e => e.id === id) || null;
  }

  async getByCategory(category: ExerciseCategory): Promise<Exercise[]> {
    return this.exercises.filter(e => e.category === category);
  }

  async save(exercise: Exercise): Promise<void> {
    this.exercises.push(exercise);
  }

  async update(exercise: Exercise): Promise<void> {
    const index = this.exercises.findIndex(e => e.id === exercise.id);
    if (index !== -1) {
      this.exercises[index] = exercise;
    }
  }

  async delete(id: string): Promise<void> {
    this.exercises = this.exercises.filter(e => e.id !== id);
  }

  async isDisabled(_id: string): Promise<boolean> {
    return false;
  }

  // Test helpers
  reset() {
    this.exercises = [];
  }

  setExercises(exercises: Exercise[]) {
    this.exercises = exercises;
  }
}
