import { RoutineService } from '../RoutineService';
import { MockRoutineRepository } from '../../data/repositories/__mocks__/MockRoutineRepository';
import { MockExerciseRepository } from '../../data/repositories/__mocks__/MockExerciseRepository';

describe('RoutineService', () => {
  let service: RoutineService;
  let mockRoutineRepo: MockRoutineRepository;
  let mockExerciseRepo: MockExerciseRepository;

  beforeEach(() => {
    mockRoutineRepo = new MockRoutineRepository();
    mockExerciseRepo = new MockExerciseRepository();
    service = new RoutineService(mockRoutineRepo, mockExerciseRepo);
  });

  describe('getAllRoutines', () => {
    it('should return all routines', async () => {
      const routines = await service.getAllRoutines();

      expect(routines).toHaveLength(2);
      expect(routines[0].name).toBe('Morning Routine');
    });
  });

  describe('getRoutineById', () => {
    it('should return routine by ID', async () => {
      const routine = await service.getRoutineById('1');

      expect(routine).not.toBeNull();
      expect(routine?.name).toBe('Morning Routine');
    });

    it('should return null for non-existent ID', async () => {
      const routine = await service.getRoutineById('999');

      expect(routine).toBeNull();
    });
  });

  describe('getRoutineByType', () => {
    it('should return morning routine', async () => {
      const routine = await service.getRoutineByType('morning');

      expect(routine).not.toBeNull();
      expect(routine?.type).toBe('morning');
    });

    it('should return evening routine', async () => {
      const routine = await service.getRoutineByType('evening');

      expect(routine).not.toBeNull();
      expect(routine?.type).toBe('evening');
    });
  });

  describe('getRoutineExercises', () => {
    it('should return exercises for routine', async () => {
      const exercises = await service.getRoutineExercises('1');

      expect(exercises).toHaveLength(3);
      expect(exercises[0].id).toBe('1'); // McKenzie
    });

    it('should throw error for non-existent routine', async () => {
      await expect(service.getRoutineExercises('999')).rejects.toThrow('Routine not found');
    });
  });

  describe('calculateRoutineDuration', () => {
    it('should calculate duration for routine', async () => {
      const duration = await service.calculateRoutineDuration('1');

      expect(duration).toBeGreaterThan(0);
    });
  });

  describe('createRoutine', () => {
    it('should create custom routine', async () => {
      await service.createRoutine('My Routine', ['1', '2']);

      const routines = await service.getAllRoutines();
      expect(routines.length).toBeGreaterThan(2);
    });

    it('should throw error for empty title', async () => {
      await expect(service.createRoutine('', ['1', '2'])).rejects.toThrow(
        'Routine title is required'
      );
    });

    it('should throw error for empty exercise list', async () => {
      await expect(service.createRoutine('My Routine', [])).rejects.toThrow(
        'Routine must contain at least one exercise'
      );
    });

    it('should throw error for invalid exercise ID', async () => {
      await expect(service.createRoutine('My Routine', ['999'])).rejects.toThrow(
        'Exercise with ID 999 not found'
      );
    });
  });

  describe('deleteRoutine', () => {
    it('should throw error when deleting default routines', async () => {
      await expect(service.deleteRoutine('1')).rejects.toThrow(
        'Cannot delete default routines'
      );
    });

    it('should throw error for non-existent routine', async () => {
      await expect(service.deleteRoutine('999')).rejects.toThrow('Routine not found');
    });
  });

  describe('getRoutineExerciseCount', () => {
    it('should return exercise count', async () => {
      const count = await service.getRoutineExerciseCount('1');

      expect(count).toBe(3);
    });

    it('should return 0 for non-existent routine', async () => {
      const count = await service.getRoutineExerciseCount('999');

      expect(count).toBe(0);
    });
  });
});
