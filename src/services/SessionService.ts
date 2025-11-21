import { format } from 'date-fns';
import { SessionLog, Statistics, ExerciseCompletion } from '../domain/models';
import { ISessionRepository } from '../domain/interfaces/IRepositories';

/**
 * Session Service - Manages workout sessions
 */
export class SessionService {
  constructor(private repository: ISessionRepository) {}

  /**
   * Create a new session
   */
  async createSession(routineId: string): Promise<string> {
    const now = new Date();

    const session: Omit<SessionLog, 'id'> = {
      routineId: routineId,
      startTime: now.toISOString(),
      exercises: [],
      completed: false,
    };

    return await this.repository.save(session);
  }

  /**
   * Mark an exercise as complete in a session
   */
  async markExerciseComplete(
    sessionId: string,
    exerciseId: string,
    reps?: number,
    duration?: number
  ): Promise<void> {
    const session = await this.repository.getById(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const completion: ExerciseCompletion = {
      exerciseId,
      completed: true,
      reps,
      duration,
    };

    // Check if already exists
    const existingIndex = session.exercises.findIndex(e => e.exerciseId === exerciseId);

    if (existingIndex >= 0) {
      session.exercises[existingIndex] = completion;
    } else {
      session.exercises.push(completion);
    }

    await this.repository.update(session);
  }

  /**
   * Finish a session
   */
  async finishSession(sessionId: string): Promise<void> {
    const session = await this.repository.getById(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    session.endTime = new Date().toISOString();
    session.completed = true;

    await this.repository.update(session);
  }

  /**
   * Get session history
   */
  async getHistory(limit?: number): Promise<SessionLog[]> {
    const allSessions = await this.repository.getAll();
    return limit ? allSessions.slice(0, limit) : allSessions;
  }

  /**
   * Get sessions for a specific date
   */
  async getSessionsForDate(date: Date): Promise<SessionLog[]> {
    const dateIso = format(date, 'yyyy-MM-dd');
    return await this.repository.getByDate(dateIso);
  }

  /**
   * Get sessions for date range
   */
  async getSessionsForDateRange(startDate: Date, endDate: Date): Promise<SessionLog[]> {
    const startIso = format(startDate, 'yyyy-MM-dd');
    const endIso = format(endDate, 'yyyy-MM-dd');
    return await this.repository.getByDateRange(startIso, endIso);
  }

  /**
   * Get statistics
   */
  async getStatistics(): Promise<Statistics> {
    return await this.repository.getStatistics();
  }

  /**
   * Calculate session duration in minutes
   */
  calculateSessionDuration(session: SessionLog): number {
    if (!session.endTime) {
      return 0;
    }

    const startMs = new Date(session.startTime).getTime();
    const endMs = new Date(session.endTime).getTime();
    const durationMs = endMs - startMs;
    return Math.round(durationMs / 1000 / 60); // Convert to minutes
  }

  /**
   * Check if user has completed session today
   */
  async hasCompletedToday(): Promise<boolean> {
    const today = format(new Date(), 'yyyy-MM-dd');
    const sessions = await this.repository.getByDate(today);
    return sessions.some(s => s.completed);
  }

  /**
   * Delete a session
   */
  async deleteSession(sessionId: string): Promise<void> {
    await this.repository.delete(sessionId);
  }
}
