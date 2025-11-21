import * as SQLite from 'expo-sqlite';

/**
 * Database wrapper - Singleton pattern for single DB connection
 * Following Single Responsibility: Only handles DB connection and table creation
 */
export class Database {
  private static instance: SQLite.SQLiteDatabase | null = null;
  private static readonly DB_NAME = 'lumbar_exercise.db';

  private constructor() {}

  /**
   * Get database instance (Singleton)
   */
  static async getInstance(): Promise<SQLite.SQLiteDatabase> {
    if (!Database.instance) {
      Database.instance = await SQLite.openDatabaseAsync(Database.DB_NAME);
      await Database.initializeTables();
    }
    return Database.instance;
  }

  /**
   * Initialize database tables
   */
  private static async initializeTables(): Promise<void> {
    const db = Database.instance;
    if (!db) throw new Error('Database not initialized');

    // Create exercises table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS exercises (
        id INTEGER PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        repetitions INTEGER,
        duration_seconds INTEGER,
        asset TEXT NOT NULL,
        contraindications TEXT
      );
    `);

    // Create routines table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS routines (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        type TEXT NOT NULL,
        exercise_order TEXT NOT NULL
      );
    `);

    // Create session_logs table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS session_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        routine_id INTEGER NOT NULL,
        date_iso TEXT NOT NULL,
        start_timestamp INTEGER NOT NULL,
        end_timestamp INTEGER,
        exercises_done TEXT NOT NULL,
        notes TEXT DEFAULT '',
        completed INTEGER DEFAULT 0,
        FOREIGN KEY (routine_id) REFERENCES routines(id)
      );
    `);

    // Create index for faster queries
    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_session_date 
      ON session_logs(date_iso);
    `);

    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_session_completed 
      ON session_logs(completed);
    `);
  }

  /**
   * Reset database by dropping all tables and recreating schema
   * WARNING: This deletes all user data!
   */
  static async resetDatabase(): Promise<void> {
    const db = Database.instance;
    if (!db) throw new Error('Database not initialized');

    console.log('Resetting database...');

    // Drop all tables
    await db.execAsync('DROP TABLE IF EXISTS exercises');
    await db.execAsync('DROP TABLE IF EXISTS routines');
    await db.execAsync('DROP TABLE IF EXISTS session_logs');
    await db.execAsync('DROP INDEX IF EXISTS idx_session_date');
    await db.execAsync('DROP INDEX IF EXISTS idx_session_completed');

    // Recreate schema
    await Database.initializeTables();

    console.log('Database reset complete');
  }

  /**
   * Seed initial data (exercises and default routines)
   */
  static async seedData(exercises: any[]): Promise<void> {
    const db = Database.instance;
    if (!db) throw new Error('Database not initialized');

    // Check if already seeded
    const existingExercises = await db.getAllAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM exercises'
    );
    if (existingExercises[0]?.count > 0) {
      console.log('Database already seeded');
      return;
    }

    // Insert exercises - Map new format to old DB schema
    for (const exercise of exercises) {
      await db.runAsync(
        `INSERT INTO exercises (id, title, description, category, repetitions, duration_seconds, asset, contraindications)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          parseInt(exercise.id, 10), // Convert string ID to number for DB
          exercise.name, // NEW: name -> OLD: title
          exercise.description,
          exercise.category,
          exercise.reps ?? null, // NEW: reps -> OLD: repetitions
          exercise.duration ?? null, // NEW: duration -> OLD: duration_seconds
          'default.png', // NEW: no asset field -> use default
          exercise.warnings?.join('; ') ?? null, // NEW: warnings[] -> OLD: contraindications
        ]
      );
    }

    // Create default morning routine (exercises 1-10)
    // Designed for polyradiculopathy: focus on nerve gliding, core stability, safe strengthening
    await db.runAsync(
      `INSERT INTO routines (title, type, exercise_order) VALUES (?, ?, ?)`,
      ['Morning Routine', 'morning', JSON.stringify([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])]
      // Cat-Cow, Bird Dog, Dead Bug, Wall Push-ups, Plank, Side Plank, Scapular Wall Slides, Glute Bridges, Chest Stretch, Child's Pose
    );

    // Create default evening routine (exercises 11-20)
    // Designed for polyradiculopathy: focus on decompression, flexibility, gentle strengthening
    await db.runAsync(
      `INSERT INTO routines (title, type, exercise_order) VALUES (?, ?, ?)`,
      ['Evening Routine', 'evening', JSON.stringify([11, 12, 13, 14, 15, 16, 17, 18, 19, 20])]
      // Pelvic Tilts, Superman, Push-ups, Shoulder Taps, Quad Hip Extension, Knee Plank, Wall Angels, Prone Y-T-W, Hip Flexor Stretch, Cobra
    );

    console.log('Database seeded successfully');
  }

  /**
   * Close database connection
   */
  static async close(): Promise<void> {
    if (Database.instance) {
      await Database.instance.closeAsync();
      Database.instance = null;
    }
  }

  /**
   * Clear all data (for testing)
   */
  static async clearAll(): Promise<void> {
    const db = Database.instance;
    if (!db) return;

    await db.execAsync('DELETE FROM session_logs');
    await db.execAsync('DELETE FROM routines');
    await db.execAsync('DELETE FROM exercises');
  }
}
