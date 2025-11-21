// Domain Models - Core business entities

/**
 * Exercise category classification
 */
export type ExerciseCategory = 'stretching' | 'strengthening' | 'flexibility' | 'posture';

/**
 * Exercise type classification
 */
export type ExerciseType = 'reps' | 'duration';

/**
 * Exercise entity - represents a single lumbar exercise
 * Following Single Responsibility Principle: Only data, no logic
 */
export interface Exercise {
  id: string;
  name: string;
  description: string;
  category: ExerciseCategory;
  type: ExerciseType;
  reps?: number; // For rep-based exercises
  duration?: number; // For timed exercises (in seconds)
  targetMuscles: string[];
  instructions: string[];
  tips: string[];
  warnings: string[];
}

/**
 * Routine type classification
 */
export type RoutineType = 'morning' | 'evening' | 'custom';

/**
 * Routine entity - represents a collection of exercises
 */
export interface Routine {
  id: string;
  name: string;
  type: RoutineType;
  exerciseIds: string[]; // Array of exercise IDs
  estimatedDuration: number; // In minutes
}

/**
 * Individual exercise completion status within a session
 */
export interface ExerciseCompletion {
  exerciseId: string;
  completed: boolean;
  reps?: number; // Actual reps performed
  duration?: number; // Actual duration in seconds
}

/**
 * Session log entity - represents a completed or in-progress workout session
 */
export interface SessionLog {
  id: string;
  routineId: string;
  startTime: string; // ISO string
  endTime?: string; // ISO string, undefined if still in progress
  exercises: ExerciseCompletion[];
  completed: boolean;
}

/**
 * Application settings
 */
export interface Settings {
  morning_time: string; // Format: HH:mm
  evening_time: string; // Format: HH:mm
  notifications_enabled: boolean;
  snooze_minutes: number;
  disabled_exercises: number[]; // IDs of disabled exercises
}

/**
 * Statistics for progress tracking
 */
export interface Statistics {
  totalSessions: number;
  currentStreak: number; // Consecutive days with completed sessions
  longestStreak: number;
  completionRate: number; // Percentage (0-100)
  lastSessionDate?: string; // ISO date
}

/**
 * Notification data
 */
export interface NotificationData {
  id: string;
  routineType: RoutineType;
  scheduledTime: string; // HH:mm
}
