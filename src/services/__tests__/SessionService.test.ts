import { SessionService } from '../SessionService';
import { MockSessionRepository } from '../../data/repositories/__mocks__/MockSessionRepository';
import { format } from 'date-fns';

describe('SessionService', () => {
  let service: SessionService;
  let mockRepo: MockSessionRepository;

  beforeEach(() => {
    mockRepo = new MockSessionRepository();
    service = new SessionService(mockRepo);
  });

  describe('createSession', () => {
    it('should create a new session', async () => {
      const sessionId = await service.createSession('1');

      expect(sessionId).toBe('1');

      const session = await mockRepo.getById(sessionId);
      expect(session).not.toBeNull();
      expect(session?.routineId).toBe('1');
      expect(session?.completed).toBe(false);
      expect(session?.exercises).toEqual([]);
    });

    it('should set correct date for session', async () => {
      const sessionId = await service.createSession('1');
      const session = await mockRepo.getById(sessionId);

      const today = format(new Date(), 'yyyy-MM-dd');
      expect(session?.startTime).toContain(today);
    });
  });

  describe('markExerciseComplete', () => {
    it('should mark exercise as complete', async () => {
      const sessionId = await service.createSession('1');

      await service.markExerciseComplete(sessionId, '1', 10);

      const session = await mockRepo.getById(sessionId);
      expect(session?.exercises).toHaveLength(1);
      expect(session?.exercises[0].exerciseId).toBe('1');
      expect(session?.exercises[0].completed).toBe(true);
      expect(session?.exercises[0].reps).toBe(10);
    });

    it('should update existing exercise completion', async () => {
      const sessionId = await service.createSession('1');

      await service.markExerciseComplete(sessionId, '1', 10);
      await service.markExerciseComplete(sessionId, '1', 12); // Update

      const session = await mockRepo.getById(sessionId);
      expect(session?.exercises).toHaveLength(1);
      expect(session?.exercises[0].reps).toBe(12);
    });

    it('should throw error for non-existent session', async () => {
      await expect(service.markExerciseComplete('999', '1', 10)).rejects.toThrow(
        'Session not found'
      );
    });
  });

  describe('finishSession', () => {
    it('should finish session and mark as completed', async () => {
      const sessionId = await service.createSession('1');

      await service.finishSession(sessionId);

      const session = await mockRepo.getById(sessionId);
      expect(session?.completed).toBe(true);
      expect(session?.endTime).not.toBeNull();
    });

    it('should throw error for non-existent session', async () => {
      await expect(service.finishSession('999')).rejects.toThrow('Session not found');
    });
  });

  describe('getHistory', () => {
    it('should return all sessions', async () => {
      await service.createSession('1');
      await service.createSession('2');

      const history = await service.getHistory();

      expect(history).toHaveLength(2);
    });

    it('should limit history results', async () => {
      await service.createSession('1');
      await service.createSession('2');
      await service.createSession('1');

      const history = await service.getHistory(2);

      expect(history).toHaveLength(2);
    });
  });

  describe('calculateSessionDuration', () => {
    it('should calculate duration in minutes', async () => {
      const sessionId = await service.createSession('1');
      const session = await mockRepo.getById(sessionId);

      if (!session) throw new Error('Session not found');

      // Simulate 5 minute session
      const startTime = new Date(session.startTime);
      session.endTime = new Date(startTime.getTime() + 5 * 60 * 1000).toISOString();

      const duration = service.calculateSessionDuration(session);

      expect(duration).toBe(5);
    });

    it('should return 0 for unfinished session', async () => {
      const sessionId = await service.createSession('1');
      const session = await mockRepo.getById(sessionId);

      if (!session) throw new Error('Session not found');

      const duration = service.calculateSessionDuration(session);

      expect(duration).toBe(0);
    });
  });

  describe('hasCompletedToday', () => {
    it('should return true if completed session exists today', async () => {
      const sessionId = await service.createSession('1');
      await service.finishSession(sessionId);

      const hasCompleted = await service.hasCompletedToday();

      expect(hasCompleted).toBe(true);
    });

    it('should return false if no completed sessions today', async () => {
      await service.createSession('1'); // Not finished

      const hasCompleted = await service.hasCompletedToday();

      expect(hasCompleted).toBe(false);
    });
  });

  describe('deleteSession', () => {
    it('should delete session', async () => {
      const sessionId = await service.createSession('1');

      await service.deleteSession(sessionId);

      const session = await mockRepo.getById(sessionId);
      expect(session).toBeNull();
    });
  });
});
