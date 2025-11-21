import * as SQLite from 'expo-sqlite';
import { SessionLog, Statistics } from '../../domain/models';
import { ISessionRepository } from '../../domain/interfaces/IRepositories';
import { parseISO, differenceInDays, startOfDay } from 'date-fns';

/**
 * SQLite implementation of Session Repository
 * Maps between old DB schema (routine_id, start_timestamp, exercises_done) 
 * and new model (routineId, startTime, exercises)
 */

interface DbSessionLog {
  id: number;
  routine_id: number;
  date_iso: string;
  start_timestamp: number;
  end_timestamp: number | null;
  exercises_done: string;
  notes: string | null;
  completed: number;
}

export class SessionRepository implements ISessionRepository {
  constructor(private db: SQLite.SQLiteDatabase) {}

  private mapFromDb(dbSession: DbSessionLog): SessionLog {
    const exercises = JSON.parse(dbSession.exercises_done);
    return {
      id: dbSession.id.toString(),
      routineId: dbSession.routine_id.toString(),
      startTime: new Date(dbSession.start_timestamp).toISOString(),
      endTime: dbSession.end_timestamp ? new Date(dbSession.end_timestamp).toISOString() : undefined,
      exercises: exercises.map((ex: any) => ({
        ...ex,
        completed: !!ex.completed || ex.completed === 1 || ex.completed === '1',
      })),
      completed: dbSession.completed === 1,
    };
  }

  private mapToDb(session: Omit<SessionLog, 'id'>): Partial<DbSessionLog> {
    return {
      routine_id: parseInt(session.routineId, 10),
      date_iso: session.startTime.split('T')[0],
      start_timestamp: new Date(session.startTime).getTime(),
      end_timestamp: session.endTime ? new Date(session.endTime).getTime() : null,
      exercises_done: JSON.stringify(session.exercises),
      notes: null,
      completed: session.completed ? 1 : 0,
    };
  }

  async getAll(): Promise<SessionLog[]> {
    const rows = await this.db.getAllAsync<DbSessionLog>(
      'SELECT * FROM session_logs ORDER BY start_timestamp DESC'
    );
    return rows.map(row => this.mapFromDb(row));
  }

  async getById(id: string): Promise<SessionLog | null> {
    const rows = await this.db.getAllAsync<DbSessionLog>(
      'SELECT * FROM session_logs WHERE id = ?',
      [parseInt(id, 10)]
    );
    return rows.length > 0 ? this.mapFromDb(rows[0]) : null;
  }

  async getByDate(date_iso: string): Promise<SessionLog[]> {
    const rows = await this.db.getAllAsync<DbSessionLog>(
      'SELECT * FROM session_logs WHERE date_iso = ? ORDER BY start_timestamp',
      [date_iso]
    );
    return rows.map(row => this.mapFromDb(row));
  }

  async getByDateRange(start_date: string, end_date: string): Promise<SessionLog[]> {
    const rows = await this.db.getAllAsync<DbSessionLog>(
      'SELECT * FROM session_logs WHERE date_iso >= ? AND date_iso <= ? ORDER BY start_timestamp',
      [start_date, end_date]
    );
    return rows.map(row => this.mapFromDb(row));
  }

  async save(session: Omit<SessionLog, 'id'>): Promise<string> {
    const dbSession = this.mapToDb(session);
    const result = await this.db.runAsync(
      `INSERT INTO session_logs (routine_id, date_iso, start_timestamp, end_timestamp, exercises_done, notes, completed)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        dbSession.routine_id!,
        dbSession.date_iso!,
        dbSession.start_timestamp!,
        dbSession.end_timestamp ?? null,
        dbSession.exercises_done!,
        dbSession.notes ?? null,
        dbSession.completed!,
      ]
    );
    return result.lastInsertRowId.toString();
  }

  async update(session: SessionLog): Promise<void> {
    const dbSession = this.mapToDb(session);
    await this.db.runAsync(
      `UPDATE session_logs 
       SET routine_id = ?, date_iso = ?, start_timestamp = ?, end_timestamp = ?, 
           exercises_done = ?, notes = ?, completed = ?
       WHERE id = ?`,
      [
        dbSession.routine_id!,
        dbSession.date_iso!,
        dbSession.start_timestamp!,
        dbSession.end_timestamp ?? null,
        dbSession.exercises_done!,
        dbSession.notes ?? null,
        dbSession.completed!,
        parseInt(session.id, 10),
      ]
    );
  }

  async delete(id: string): Promise<void> {
    await this.db.runAsync('DELETE FROM session_logs WHERE id = ?', [parseInt(id, 10)]);
  }

  async getStatistics(): Promise<Statistics> {
    // Get all completed sessions
    const completedSessions = await this.db.getAllAsync<{
      date_iso: string;
      completed: number;
    }>('SELECT date_iso, completed FROM session_logs WHERE completed = 1 ORDER BY date_iso DESC');

    const totalSessions = await this.db.getAllAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM session_logs'
    );

    const total = totalSessions[0]?.count || 0;
    const completed = completedSessions.length;

    // Calculate current streak
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    const today = startOfDay(new Date());
    const uniqueDates = [...new Set(completedSessions.map(s => s.date_iso))].sort().reverse();

    // Calculate current streak
    for (let i = 0; i < uniqueDates.length; i++) {
      const sessionDate = startOfDay(parseISO(uniqueDates[i]));
      const daysDiff = differenceInDays(today, sessionDate);

      if (i === 0 && (daysDiff === 0 || daysDiff === 1)) {
        currentStreak++;
        tempStreak = 1;
      } else if (
        i > 0 &&
        differenceInDays(parseISO(uniqueDates[i - 1]), parseISO(uniqueDates[i])) === 1
      ) {
        currentStreak++;
        tempStreak++;
      } else {
        break;
      }

      longestStreak = Math.max(longestStreak, tempStreak);
    }

    // Calculate longest streak (including historical)
    tempStreak = 1;
    for (let i = 1; i < uniqueDates.length; i++) {
      if (differenceInDays(parseISO(uniqueDates[i - 1]), parseISO(uniqueDates[i])) === 1) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 1;
      }
    }

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const lastSessionDate = uniqueDates.length > 0 ? uniqueDates[0] : null;

    return {
      totalSessions: total,
      currentStreak: currentStreak,
      longestStreak: longestStreak,
      completionRate: completionRate,
      lastSessionDate: lastSessionDate ?? undefined,
    };
  }
}
