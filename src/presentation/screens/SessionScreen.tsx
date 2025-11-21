import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/types';
import { SessionService } from '../../services/SessionService';
import { RoutineService } from '../../services/RoutineService';
import { SessionRepository } from '../../data/repositories/SessionRepository';
import { RoutineRepository } from '../../data/repositories/RoutineRepository';
import { ExerciseRepository } from '../../data/repositories/ExerciseRepository';
import { Database } from '../../data/database/db';
import { Exercise } from '../../domain/models';

type SessionRouteProp = RouteProp<RootStackParamList, 'Session'>;

export default function SessionScreen() {
  const route = useRoute<SessionRouteProp>();
  const navigation = useNavigation();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timer, setTimer] = useState(0);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadSession();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (currentExercise && currentExercise.type === 'duration' && !isPaused) {
      startTimer();
    } else {
      stopTimer();
    }
  }, [currentIndex, isPaused]);

  const getServices = async () => {
    const db = await Database.getInstance();
    return {
      sessionService: new SessionService(new SessionRepository(db)),
      routineService: new RoutineService(
        new RoutineRepository(db),
        new ExerciseRepository(db)
      ),
    };
  };

  const loadSession = async () => {
    try {
      const { sessionService, routineService } = await getServices();
      const routineExercises = await routineService.getRoutineExercises(
        route.params.routineId
      );
      setExercises(routineExercises);

      const newSessionId = await sessionService.createSession(
        route.params.routineId
      );
      setSessionId(newSessionId);

      navigation.setOptions({ title: route.params.routineName });
    } catch (error) {
      console.error('Failed to load session:', error);
      Alert.alert('Error', 'Failed to start session');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const startTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setTimer(0);
    intervalRef.current = setInterval(() => {
      setTimer((prev) => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const handleComplete = async () => {
    if (!sessionId || !currentExercise) return;

    try {
      const { sessionService } = await getServices();
      await sessionService.markExerciseComplete(sessionId, currentExercise.id);

      if (currentIndex < exercises.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setTimer(0);
      } else {
        await sessionService.finishSession(sessionId);
        setIsComplete(true);
      }
    } catch (error) {
      console.error('Failed to mark exercise complete:', error);
      Alert.alert('Error', 'Failed to save progress');
    }
  };

  const handleSkip = () => {
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setTimer(0);
    }
  };

  const handlePauseResume = () => {
    setIsPaused((prev) => !prev);
  };

  const handleFinish = () => {
    navigation.navigate('MainTabs', { screen: 'Home' });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  const currentExercise = exercises[currentIndex];
  const progress = ((currentIndex + 1) / exercises.length) * 100;

  if (isComplete) {
    return (
      <View style={styles.completeContainer}>
        <Text style={styles.completeEmoji}>🎉</Text>
        <Text style={styles.completeTitle}>Session Complete!</Text>
        <Text style={styles.completeText}>
          Great job! You've completed all exercises.
        </Text>
        <View style={styles.completeStats}>
          <Text style={styles.completeStatValue}>{exercises.length}</Text>
          <Text style={styles.completeStatLabel}>Exercises Completed</Text>
        </View>
        <TouchableOpacity style={styles.finishButton} onPress={handleFinish}>
          <Text style={styles.finishButtonText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>
          Exercise {currentIndex + 1} of {exercises.length}
        </Text>
      </View>

      {/* Exercise Content */}
      <View style={styles.exerciseContainer}>
        <Text style={styles.exerciseName}>{currentExercise.name}</Text>
        <Text style={styles.exerciseDescription}>
          {currentExercise.description}
        </Text>

        {/* Timer/Reps Display */}
        {currentExercise.type === 'duration' ? (
          <View style={styles.timerContainer}>
            <Text style={styles.timerLabel}>Time</Text>
            <Text style={styles.timerValue}>
              {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
            </Text>
            <Text style={styles.timerTarget}>
              Target: {currentExercise.duration}s
            </Text>
            {timer >= currentExercise.duration && (
              <Text style={styles.timerComplete}>✓ Target reached!</Text>
            )}
          </View>
        ) : (
          <View style={styles.repsContainer}>
            <Text style={styles.repsLabel}>Target Repetitions</Text>
            <Text style={styles.repsValue}>{currentExercise.reps}</Text>
            <Text style={styles.repsText}>reps</Text>
          </View>
        )}

        {/* Instructions */}
        {currentExercise.instructions &&
          currentExercise.instructions.length > 0 && (
            <View style={styles.instructionsContainer}>
              <Text style={styles.instructionsTitle}>How to perform:</Text>
              {currentExercise.instructions.map((instruction, index) => (
                <Text key={index} style={styles.instructionText}>
                  {index + 1}. {instruction}
                </Text>
              ))}
            </View>
          )}
      </View>

      {/* Controls */}
      <View style={styles.controlsContainer}>
        {currentExercise.type === 'duration' && (
          <TouchableOpacity
            style={[styles.controlButton, styles.pauseButton]}
            onPress={handlePauseResume}
          >
            <Text style={styles.controlButtonText}>
              {isPaused ? '▶ Resume' : '⏸ Pause'}
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.controlButton, styles.skipButton]}
          onPress={handleSkip}
        >
          <Text style={styles.controlButtonText}>Skip ⏭</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, styles.completeButton]}
          onPress={handleComplete}
        >
          <Text style={styles.completeButtonText}>
            {currentIndex === exercises.length - 1 ? 'Finish ✓' : 'Complete ✓'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  progressContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  exerciseContainer: {
    flex: 1,
    padding: 20,
  },
  exerciseName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  exerciseDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  timerContainer: {
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 32,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  timerLabel: {
    fontSize: 16,
    color: '#999',
    marginBottom: 8,
  },
  timerValue: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#2196F3',
    fontVariant: ['tabular-nums'],
  },
  timerTarget: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  timerComplete: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginTop: 12,
  },
  repsContainer: {
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 32,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  repsLabel: {
    fontSize: 16,
    color: '#999',
    marginBottom: 8,
  },
  repsValue: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#F44336',
  },
  repsText: {
    fontSize: 18,
    color: '#666',
    marginTop: 4,
  },
  instructionsContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  controlsContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 12,
  },
  controlButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  pauseButton: {
    backgroundColor: '#FF9800',
  },
  skipButton: {
    backgroundColor: '#9E9E9E',
  },
  completeButton: {
    backgroundColor: '#4CAF50',
  },
  controlButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  completeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 32,
  },
  completeEmoji: {
    fontSize: 80,
    marginBottom: 24,
  },
  completeTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  completeText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  completeStats: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  completeStatValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  completeStatLabel: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  finishButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  finishButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
