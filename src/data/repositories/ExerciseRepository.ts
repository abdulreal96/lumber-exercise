import * as SQLite from 'expo-sqlite';
import { Exercise, ExerciseCategory } from '../../domain/models';
import { IExerciseRepository } from '../../domain/interfaces/IRepositories';

/**
 * SQLite implementation of Exercise Repository
 * Following Dependency Inversion: Implements IExerciseRepository interface
 * Following Single Responsibility: Only handles exercise data persistence
 * 
 * Note: Maps between old DB schema (title, repetitions, duration_seconds) 
 * and new domain model (name, type, reps, duration)
 */

interface DbExercise {
  id: number;
  title: string;
  description: string;
  category: string;
  repetitions: number | null;
  duration_seconds: number | null;
  asset: string;
  contraindications: string | null;
}

export class ExerciseRepository implements IExerciseRepository {
  constructor(private db: SQLite.SQLiteDatabase) {}

  private mapFromDb(dbExercise: DbExercise): Exercise {
    return {
      id: dbExercise.id.toString(),
      name: dbExercise.title,
      description: dbExercise.description,
      category: dbExercise.category as ExerciseCategory,
      type: dbExercise.duration_seconds !== null ? 'duration' : 'reps',
      reps: dbExercise.repetitions ?? undefined,
      duration: dbExercise.duration_seconds ?? undefined,
      targetMuscles: [],
      instructions: [],
      tips: [],
      warnings: dbExercise.contraindications ? [dbExercise.contraindications] : [],
    };
  }

  private mapToDb(exercise: Exercise): Partial<DbExercise> {
    return {
      id: parseInt(exercise.id, 10),
      title: exercise.name,
      description: exercise.description,
      category: exercise.category,
      repetitions: exercise.reps ?? null,
      duration_seconds: exercise.duration ?? null,
      asset: 'default.png',
      contraindications: exercise.warnings?.join('; ') ?? null,
    };
  }

  async getAll(): Promise<Exercise[]> {
    const rows = await this.db.getAllAsync<DbExercise>('SELECT * FROM exercises ORDER BY id');
    return rows.map(row => this.mapFromDb(row));
  }

  async getById(id: string): Promise<Exercise | null> {
    const rows = await this.db.getAllAsync<DbExercise>(
      'SELECT * FROM exercises WHERE id = ?',
      [parseInt(id, 10)]
    );
    return rows.length > 0 ? this.mapFromDb(rows[0]) : null;
  }

  async getByCategory(category: ExerciseCategory): Promise<Exercise[]> {
    const rows = await this.db.getAllAsync<DbExercise>(
      'SELECT * FROM exercises WHERE category = ? ORDER BY id',
      [category]
    );
    return rows.map(row => this.mapFromDb(row));
  }

  async save(exercise: Exercise): Promise<void> {
    const dbExercise = this.mapToDb(exercise);
    await this.db.runAsync(
      `INSERT INTO exercises (id, title, description, category, repetitions, duration_seconds, asset, contraindications)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        dbExercise.id!,
        dbExercise.title!,
        dbExercise.description!,
        dbExercise.category!,
        dbExercise.repetitions ?? null,
        dbExercise.duration_seconds ?? null,
        dbExercise.asset!,
        dbExercise.contraindications ?? null,
      ]
    );
  }

  async update(exercise: Exercise): Promise<void> {
    const dbExercise = this.mapToDb(exercise);
    await this.db.runAsync(
      `UPDATE exercises 
       SET title = ?, description = ?, category = ?, repetitions = ?, 
           duration_seconds = ?, asset = ?, contraindications = ?
       WHERE id = ?`,
      [
        dbExercise.title!,
        dbExercise.description!,
        dbExercise.category!,
        dbExercise.repetitions ?? null,
        dbExercise.duration_seconds ?? null,
        dbExercise.asset!,
        dbExercise.contraindications ?? null,
        dbExercise.id!,
      ]
    );
  }

  async delete(id: string): Promise<void> {
    await this.db.runAsync('DELETE FROM exercises WHERE id = ?', [parseInt(id, 10)]);
  }

  async isDisabled(_id: string): Promise<boolean> {
    // This would check against settings - for now return false
    // Will implement when we add SettingsRepository
    return false;
  }
}
