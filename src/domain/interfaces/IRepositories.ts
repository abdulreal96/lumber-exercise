/**
 * Repository Interfaces - Following Dependency Inversion Principle
 * High-level modules depend on these abstractions, not concrete implementations
 */

import {
  Exercise,
  ExerciseCategory,
  Routine,
  SessionLog,
  Settings,
  Statistics,
} from '../models';

/**
 * Exercise Repository Interface
 * Manages exercise data persistence
 */
export interface IExerciseRepository {
  /**
   * Get all exercises
   */
  getAll(): Promise<Exercise[]>;

  /**
   * Get exercise by ID
   */
  getById(id: string): Promise<Exercise | null>;

  /**
   * Get exercises by category
   */
  getByCategory(category: ExerciseCategory): Promise<Exercise[]>;

  /**
   * Save new exercise
   */
  save(exercise: Exercise): Promise<void>;

  /**
   * Update existing exercise
   */
  update(exercise: Exercise): Promise<void>;

  /**
   * Delete exercise
   */
  delete(id: string): Promise<void>;

  /**
   * Check if exercise is disabled
   */
  isDisabled(id: string): Promise<boolean>;
}

/**
 * Routine Repository Interface
 * Manages routine configurations
 */
export interface IRoutineRepository {
  getAll(): Promise<Routine[]>;
  getById(id: string): Promise<Routine | null>;
  getByType(type: string): Promise<Routine | null>;
  save(routine: Routine): Promise<void>;
  update(routine: Routine): Promise<void>;
  delete(id: string): Promise<void>;
}

/**
 * Session Repository Interface
 * Manages workout session logs
 */
export interface ISessionRepository {
  /**
   * Get all session logs
   */
  getAll(): Promise<SessionLog[]>;

  /**
   * Get session by ID
   */
  getById(id: string): Promise<SessionLog | null>;

  /**
   * Get sessions by date
   */
  getByDate(date_iso: string): Promise<SessionLog[]>;

  /**
   * Get sessions in date range
   */
  getByDateRange(start_date: string, end_date: string): Promise<SessionLog[]>;

  /**
   * Save new session
   */
  save(session: Omit<SessionLog, 'id'>): Promise<string>; // Returns new session ID

  /**
   * Update existing session
   */
  update(session: SessionLog): Promise<void>;

  /**
   * Delete session
   */
  delete(id: string): Promise<void>;

  /**
   * Get statistics
   */
  getStatistics(): Promise<Statistics>;
}

/**
 * Settings Repository Interface
 * Manages app settings (key-value store)
 */
export interface ISettingsRepository {
  /**
   * Get all settings
   */
  getAll(): Promise<Settings>;

  /**
   * Get specific setting value
   */
  get<K extends keyof Settings>(key: K): Promise<Settings[K]>;

  /**
   * Set specific setting value
   */
  set<K extends keyof Settings>(key: K, value: Settings[K]): Promise<void>;

  /**
   * Save all settings
   */
  saveAll(settings: Settings): Promise<void>;

  /**
   * Reset to default settings
   */
  reset(): Promise<void>;
}
