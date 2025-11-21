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
      sets: 3,
      restBetweenSets: 30,
      targetMuscles: ['lower back'],
      difficulty: 'beginner',
      equipment: 'none',
      imageUrl: 'https://example.com/image1.jpg',
      instructions: ['Test instruction'],
      formCues: ['Keep core engaged'],
      contraindications: ['Acute pain'],
      modifications: {
        easier: 'Reduce range',
        harder: 'Increase reps',
      },
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
      sets: 3,
      restBetweenSets: 45,
      targetMuscles: ['core'],
      difficulty: 'intermediate',
      equipment: 'none',
      imageUrl: 'https://example.com/image2.jpg',
      instructions: ['Test instruction'],
      formCues: ['Keep body straight'],
      contraindications: ['Shoulder injury'],
      modifications: {
        easier: 'Plank on knees',
        harder: 'Full plank',
      },
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
      sets: 3,
      restBetweenSets: 30,
      targetMuscles: ['core', 'back'],
      difficulty: 'beginner',
      equipment: 'none',
      imageUrl: 'https://example.com/image3.jpg',
      instructions: ['Test instruction'],
      formCues: ['Keep hips level'],
      contraindications: ['Balance issues'],
      modifications: {
        easier: 'Arm or leg only',
        harder: 'Add pause',
      },
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
      sets: 3,
      restBetweenSets: 30,
      targetMuscles: ['glutes', 'lower back'],
      difficulty: 'beginner',
      equipment: 'none',
      imageUrl: 'https://example.com/image4.jpg',
      instructions: ['Test instruction'],
      formCues: ['Squeeze glutes'],
      contraindications: ['Hip pain'],
      modifications: {
        easier: 'Smaller range',
        harder: 'Single leg',
      },
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
