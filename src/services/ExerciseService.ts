import { Exercise, ExerciseCategory } from '../domain/models';
import { IExerciseRepository } from '../domain/interfaces/IRepositories';

/**
 * Exercise Service - Business Logic Layer
 * Following Single Responsibility: Only handles exercise-related business logic
 * Following Dependency Inversion: Depends on IExerciseRepository interface
 */
export class ExerciseService {
  constructor(private repository: IExerciseRepository) {}

  /**
   * Get all exercises
   */
  async getAllExercises(): Promise<Exercise[]> {
    return await this.repository.getAll();
  }

  /**
   * Get exercise by ID
   */
  async getExerciseById(id: string): Promise<Exercise | null> {
    if (!id || id.trim() === '') {
      throw new Error('Invalid exercise ID');
    }
    return await this.repository.getById(id);
  }

  /**
   * Get exercises by category
   */
  async getExercisesByCategory(category: ExerciseCategory): Promise<Exercise[]> {
    return await this.repository.getByCategory(category);
  }

  /**
   * Get exercises for a routine (by IDs)
   */
  async getExercisesForRoutine(exerciseIds: string[]): Promise<Exercise[]> {
    const exercises: Exercise[] = [];
    for (const id of exerciseIds) {
      const exercise = await this.repository.getById(id);
      if (exercise) {
        exercises.push(exercise);
      }
    }
    return exercises;
  }

  /**
   * Calculate total duration for a set of exercises (in minutes)
   */
  calculateTotalDuration(exercises: Exercise[]): number {
    let totalSeconds = 0;

    for (const exercise of exercises) {
      if (exercise.duration) {
        totalSeconds += exercise.duration;
      } else if (exercise.reps) {
        // Estimate: 3 seconds per rep
        totalSeconds += exercise.reps * 3;
      }
    }

    // Add rest time between exercises (10 seconds each)
    totalSeconds += (exercises.length - 1) * 10;

    return Math.ceil(totalSeconds / 60); // Return in minutes
  }

  /**
   * Get stretching exercises
   */
  async getStretchingExercises(): Promise<Exercise[]> {
    return await this.repository.getByCategory('stretching');
  }

  /**
   * Get strengthening exercises
   */
  async getStrengtheningExercises(): Promise<Exercise[]> {
    return await this.repository.getByCategory('strengthening');
  }

  /**
   * Get flexibility exercises
   */
  async getFlexibilityExercises(): Promise<Exercise[]> {
    return await this.repository.getByCategory('flexibility');
  }

  /**
   * Get posture exercises
   */
  async getPostureExercises(): Promise<Exercise[]> {
    return await this.repository.getByCategory('posture');
  }

  /**
   * Validate exercise data
   */
  validateExercise(exercise: Partial<Exercise>): string | null {
    if (!exercise.name || exercise.name.trim() === '') {
      return 'Name is required';
    }

    if (!exercise.description || exercise.description.trim() === '') {
      return 'Description is required';
    }

    if (!exercise.category) {
      return 'Category is required';
    }

    if (!exercise.reps && !exercise.duration) {
      return 'Either reps or duration must be specified';
    }

    return null; // Valid
  }
}
