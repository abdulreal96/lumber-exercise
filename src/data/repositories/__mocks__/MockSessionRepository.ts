import { SessionLog, Statistics } from '../../../domain/models';
import { ISessionRepository } from '../../../domain/interfaces/IRepositories';

/**
 * Mock Session Repository for testing
 */
export class MockSessionRepository implements ISessionRepository {
  private sessions: SessionLog[] = [];
  private nextId = 1;

  async getAll(): Promise<SessionLog[]> {
    return [...this.sessions];
  }

  async getById(id: string): Promise<SessionLog | null> {
    return this.sessions.find(s => s.id === id) || null;
  }

  async getByDate(date_iso: string): Promise<SessionLog[]> {
    return this.sessions.filter(s => s.startTime.startsWith(date_iso));
  }

  async getByDateRange(start_date: string, end_date: string): Promise<SessionLog[]> {
    return this.sessions.filter(s => {
      const sessionDate = s.startTime.split('T')[0];
      return sessionDate >= start_date && sessionDate <= end_date;
    });
  }

  async save(session: Omit<SessionLog, 'id'>): Promise<string> {
    const newSession: SessionLog = {
      ...session,
      id: (this.nextId++).toString(),
    };
    this.sessions.push(newSession);
    return newSession.id;
  }

  async update(session: SessionLog): Promise<void> {
    const index = this.sessions.findIndex(s => s.id === session.id);
    if (index !== -1) {
      this.sessions[index] = session;
    }
  }

  async delete(id: string): Promise<void> {
    this.sessions = this.sessions.filter(s => s.id !== id);
  }

  async getStatistics(): Promise<Statistics> {
    const completedSessions = this.sessions.filter(s => s.completed);
    return {
      totalSessions: this.sessions.length,
      currentStreak: 0,
      longestStreak: 0,
      completionRate:
        this.sessions.length > 0
          ? Math.round((completedSessions.length / this.sessions.length) * 100)
          : 0,
      lastSessionDate: this.sessions.length > 0 ? this.sessions[0].startTime.split('T')[0] : undefined,
    };
  }

  // Test helpers
  reset() {
    this.sessions = [];
    this.nextId = 1;
  }

  setSessions(sessions: SessionLog[]) {
    this.sessions = sessions;
  }
}
