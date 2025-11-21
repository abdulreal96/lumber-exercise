import { ExerciseService } from '../ExerciseService';
import { MockExerciseRepository } from '../../data/repositories/__mocks__/MockExerciseRepository';
import { Exercise } from '../../domain/models';

describe('ExerciseService', () => {
  let service: ExerciseService;
  let mockRepo: MockExerciseRepository;

  beforeEach(() => {
    mockRepo = new MockExerciseRepository();
    service = new ExerciseService(mockRepo);
  });

  describe('getAllExercises', () => {
    it('should return all exercises', async () => {
      const exercises = await service.getAllExercises();

      expect(exercises).toHaveLength(4);
      expect(exercises[0].name).toBe('McKenzie Back Extension');
    });
  });

  describe('getExerciseById', () => {
    it('should return exercise by ID', async () => {
      const exercise = await service.getExerciseById('1');

      expect(exercise).not.toBeNull();
      expect(exercise?.name).toBe('McKenzie Back Extension');
    });

    it('should return null for non-existent ID', async () => {
      const exercise = await service.getExerciseById('999');

      expect(exercise).toBeNull();
    });

    it('should throw error for invalid ID', async () => {
      await expect(service.getExerciseById('')).rejects.toThrow('Invalid exercise ID');
      await expect(service.getExerciseById('')).rejects.toThrow('Invalid exercise ID');
    });
  });

  describe('getExercisesByCategory', () => {
    it('should return exercises for specific category', async () => {
      const stretchingExercises = await service.getExercisesByCategory('stretching');

      expect(stretchingExercises).toHaveLength(2);
      expect(stretchingExercises.every(e => e.category === 'stretching')).toBe(true);
    });

    it('should return empty array for category with no exercises', async () => {
      const postureExercises = await service.getExercisesByCategory('posture');

      expect(postureExercises).toHaveLength(0);
    });
  });

  describe('getExercisesForRoutine', () => {
    it('should return exercises in correct order', async () => {
      const exerciseIds = ['3', '1', '2'];
      const exercises = await service.getExercisesForRoutine(exerciseIds);

      expect(exercises).toHaveLength(3);
      expect(exercises[0].id).toBe('3'); // Bird-Dog
      expect(exercises[1].id).toBe('1'); // McKenzie
      expect(exercises[2].id).toBe('2'); // Plank
    });

    it('should skip non-existent exercise IDs', async () => {
      const exerciseIds = ['1', '999', '2'];
      const exercises = await service.getExercisesForRoutine(exerciseIds);

      expect(exercises).toHaveLength(2);
    });
  });

  describe('calculateTotalDuration', () => {
    it('should calculate duration for timed exercises', async () => {
      const exercises: Exercise[] = [
        {
          id: '1',
          name: 'Plank',
          description: 'Test',
          category: 'strengthening',
          type: 'duration',
          duration: 30,
          targetMuscles: [],
          instructions: [],
          tips: [],
          warnings: [],
        },
        {
          id: '2',
          name: 'Hold',
          description: 'Test',
          category: 'strengthening',
          type: 'duration',
          duration: 60,
          targetMuscles: [],
          instructions: [],
          tips: [],
          warnings: [],
        },
      ];

      const duration = service.calculateTotalDuration(exercises);

      // 30 + 60 + 10 (rest) = 100 seconds = 2 minutes (rounded up)
      expect(duration).toBe(2);
    });

    it('should calculate duration for rep-based exercises', async () => {
      const exercises: Exercise[] = [
        {
          id: '1',
          name: 'Squats',
          description: 'Test',
          category: 'strengthening',
          type: 'reps',
          reps: 10,
          targetMuscles: [],
          instructions: [],
          tips: [],
          warnings: [],
        },
      ];

      const duration = service.calculateTotalDuration(exercises);

      // 10 reps * 3 seconds = 30 seconds = 1 minute (rounded up)
      expect(duration).toBe(1);
    });

    it('should handle mixed exercises', async () => {
      const exercises: Exercise[] = [
        {
          id: '1',
          name: 'Plank',
          description: 'Test',
          category: 'strengthening',
          type: 'duration',
          duration: 30,
          targetMuscles: [],
          instructions: [],
          tips: [],
          warnings: [],
        },
        {
          id: '2',
          name: 'Squats',
          description: 'Test',
          category: 'strengthening',
          type: 'reps',
          reps: 10,
          targetMuscles: [],
          instructions: [],
          tips: [],
          warnings: [],
        },
      ];

      const duration = service.calculateTotalDuration(exercises);

      // 30 + (10*3) + 10 (rest) = 70 seconds = 2 minutes (rounded up)
      expect(duration).toBe(2);
    });
  });

  describe('validateExercise', () => {
    it('should return null for valid exercise', () => {
      const exercise: Partial<Exercise> = {
        name: 'Test Exercise',
        description: 'Test description',
        category: 'strengthening',
        reps: 10,
      };

      const error = service.validateExercise(exercise);

      expect(error).toBeNull();
    });

    it('should return error for missing name', () => {
      const exercise: Partial<Exercise> = {
        description: 'Test description',
        category: 'strengthening',
        reps: 10,
      };

      const error = service.validateExercise(exercise);

      expect(error).toBe('Name is required');
    });

    it('should return error for empty name', () => {
      const exercise: Partial<Exercise> = {
        name: '   ',
        description: 'Test description',
        category: 'strengthening',
        reps: 10,
      };

      const error = service.validateExercise(exercise);

      expect(error).toBe('Name is required');
    });

    it('should return error for missing description', () => {
      const exercise: Partial<Exercise> = {
        name: 'Test',
        category: 'strengthening',
        reps: 10,
      };

      const error = service.validateExercise(exercise);

      expect(error).toBe('Description is required');
    });

    it('should return error for missing category', () => {
      const exercise: Partial<Exercise> = {
        name: 'Test',
        description: 'Test description',
        reps: 10,
      };

      const error = service.validateExercise(exercise);

      expect(error).toBe('Category is required');
    });

    it('should return error when both reps and duration are missing', () => {
      const exercise: Partial<Exercise> = {
        name: 'Test',
        description: 'Test description',
        category: 'strengthening',
      };

      const error = service.validateExercise(exercise);

      expect(error).toBe('Either reps or duration must be specified');
    });
  });
});
