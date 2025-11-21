import { Routine, Exercise } from '../domain/models';
import { IRoutineRepository, IExerciseRepository } from '../domain/interfaces/IRepositories';

/**
 * Routine Service - Manages exercise routines
 * Following Dependency Inversion: Depends on repository interfaces
 */
export class RoutineService {
  constructor(
    private routineRepository: IRoutineRepository,
    private exerciseRepository: IExerciseRepository
  ) {}

  /**
   * Get all routines
   */
  async getAllRoutines(): Promise<Routine[]> {
    return await this.routineRepository.getAll();
  }

  /**
   * Get routine by ID
   */
  async getRoutineById(id: string): Promise<Routine | null> {
    return await this.routineRepository.getById(id);
  }

  /**
   * Get routine by type (morning/evening/custom)
   */
  async getRoutineByType(type: string): Promise<Routine | null> {
    return await this.routineRepository.getByType(type);
  }

  /**
   * Get exercises for a routine with full details
   */
  async getRoutineExercises(routineId: string): Promise<Exercise[]> {
    const routine = await this.routineRepository.getById(routineId);
    if (!routine) {
      throw new Error('Routine not found');
    }

    const exercises: Exercise[] = [];
    for (const exerciseId of routine.exerciseIds) {
      const exercise = await this.exerciseRepository.getById(exerciseId);
      if (exercise) {
        exercises.push(exercise);
      }
    }

    return exercises;
  }

  /**
   * Calculate total routine duration in minutes
   */
  async calculateRoutineDuration(routineId: string): Promise<number> {
    const exercises = await this.getRoutineExercises(routineId);
    
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

    return Math.ceil(totalSeconds / 60);
  }

  /**
   * Create custom routine
   */
  async createRoutine(title: string, exerciseIds: string[]): Promise<void> {
    if (!title || title.trim() === '') {
      throw new Error('Routine title is required');
    }

    if (exerciseIds.length === 0) {
      throw new Error('Routine must contain at least one exercise');
    }

    // Validate all exercises exist
    for (const id of exerciseIds) {
      const exercise = await this.exerciseRepository.getById(id);
      if (!exercise) {
        throw new Error(`Exercise with ID ${id} not found`);
      }
    }

    const routine: Routine = {
      id: '0', // Will be assigned by repository
      name: title,
      type: 'custom',
      exerciseIds: exerciseIds,
      estimatedDuration: 0,
    };

    await this.routineRepository.save(routine);
  }

  /**
   * Update routine exercise order
   */
  async updateRoutineExercises(routineId: string, exerciseIds: string[]): Promise<void> {
    const routine = await this.routineRepository.getById(routineId);
    if (!routine) {
      throw new Error('Routine not found');
    }

    // Validate all exercises exist
    for (const id of exerciseIds) {
      const exercise = await this.exerciseRepository.getById(id);
      if (!exercise) {
        throw new Error(`Exercise with ID ${id} not found`);
      }
    }

    routine.exerciseIds = exerciseIds;
    await this.routineRepository.update(routine);
  }

  /**
   * Delete routine
   */
  async deleteRoutine(routineId: string): Promise<void> {
    const routine = await this.routineRepository.getById(routineId);
    if (!routine) {
      throw new Error('Routine not found');
    }

    // Don't allow deleting default routines
    if (routine.type === 'morning' || routine.type === 'evening') {
      throw new Error('Cannot delete default routines');
    }

    await this.routineRepository.delete(routineId);
  }

  /**
   * Get exercise count for routine
   */
  async getRoutineExerciseCount(routineId: string): Promise<number> {
    const routine = await this.routineRepository.getById(routineId);
    return routine ? routine.exerciseIds.length : 0;
  }
}
