import * as SQLite from 'expo-sqlite';
import { Routine } from '../../domain/models';
import { IRoutineRepository } from '../../domain/interfaces/IRepositories';

/**
 * SQLite implementation of Routine Repository
 * Maps between old DB schema (title, exercise_order) and new model (name, exerciseIds)
 */

interface DbRoutine {
  id: number;
  title: string;
  type: string;
  exercise_order: string;
}

export class RoutineRepository implements IRoutineRepository {
  constructor(private db: SQLite.SQLiteDatabase) {}

  private mapFromDb(dbRoutine: DbRoutine): Routine {
    const exerciseIds = JSON.parse(dbRoutine.exercise_order) as number[];
    return {
      id: dbRoutine.id.toString(),
      name: dbRoutine.title,
      type: dbRoutine.type as 'morning' | 'evening' | 'custom',
      exerciseIds: exerciseIds.map(id => id.toString()),
      estimatedDuration: exerciseIds.length * 5, // Rough estimate: 5 mins per exercise
    };
  }

  private mapToDb(routine: Routine): Partial<DbRoutine> {
    return {
      id: parseInt(routine.id, 10),
      title: routine.name,
      type: routine.type,
      exercise_order: JSON.stringify(routine.exerciseIds.map(id => parseInt(id, 10))),
    };
  }

  async getAll(): Promise<Routine[]> {
    const rows = await this.db.getAllAsync<DbRoutine>('SELECT * FROM routines ORDER BY id');
    return rows.map(row => this.mapFromDb(row));
  }

  async getById(id: string): Promise<Routine | null> {
    const rows = await this.db.getAllAsync<DbRoutine>(
      'SELECT * FROM routines WHERE id = ?',
      [parseInt(id, 10)]
    );
    return rows.length > 0 ? this.mapFromDb(rows[0]) : null;
  }

  async getByType(type: string): Promise<Routine | null> {
    const rows = await this.db.getAllAsync<DbRoutine>(
      'SELECT * FROM routines WHERE type = ?',
      [type]
    );
    return rows.length > 0 ? this.mapFromDb(rows[0]) : null;
  }

  async save(routine: Routine): Promise<void> {
    const dbRoutine = this.mapToDb(routine);
    await this.db.runAsync(
      'INSERT INTO routines (title, type, exercise_order) VALUES (?, ?, ?)',
      [dbRoutine.title!, dbRoutine.type!, dbRoutine.exercise_order!]
    );
  }

  async update(routine: Routine): Promise<void> {
    const dbRoutine = this.mapToDb(routine);
    await this.db.runAsync(
      'UPDATE routines SET title = ?, type = ?, exercise_order = ? WHERE id = ?',
      [dbRoutine.title!, dbRoutine.type!, dbRoutine.exercise_order!, dbRoutine.id!]
    );
  }

  async delete(id: string): Promise<void> {
    await this.db.runAsync('DELETE FROM routines WHERE id = ?', [parseInt(id, 10)]);
  }
}
