import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Image,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
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

      {/* Exercise Content - Scrollable */}
      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.exerciseContainer}>
        {/* Exercise Image */}
        {currentExercise.imageUrl && (
          <Image
            source={{ uri: currentExercise.imageUrl }}
            style={styles.exerciseImage}
            resizeMode="cover"
          />
        )}

        {/* Exercise Header */}
        <View style={styles.exerciseHeader}>
          <Text style={styles.exerciseName}>{currentExercise.name}</Text>
          <View style={styles.exerciseMetaRow}>
            <View style={styles.metaBadge}>
              <Ionicons name="repeat" size={14} color="#6366F1" />
              <Text style={styles.metaText}>{currentExercise.sets} sets</Text>
            </View>
            <View style={styles.metaBadge}>
              <Ionicons name="time" size={14} color="#6366F1" />
              <Text style={styles.metaText}>{currentExercise.restBetweenSets}s rest</Text>
            </View>
            <View style={styles.metaBadge}>
              <Ionicons name="fitness" size={14} color="#6366F1" />
              <Text style={styles.metaText}>{currentExercise.difficulty}</Text>
            </View>
          </View>
        </View>

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
              Target: {currentExercise.duration}s ({currentExercise.sets} sets)
            </Text>
            {timer >= (currentExercise.duration! * currentExercise.sets) && (
              <Text style={styles.timerComplete}>✓ All sets complete!</Text>
            )}
          </View>
        ) : (
          <View style={styles.repsContainer}>
            <Text style={styles.repsLabel}>Target Repetitions</Text>
            <Text style={styles.repsValue}>{currentExercise.reps}</Text>
            <Text style={styles.repsText}>reps × {currentExercise.sets} sets</Text>
          </View>
        )}

        {/* Form Cues - Highlighted */}
        {currentExercise.formCues && currentExercise.formCues.length > 0 && (
          <View style={styles.formCuesCard}>
            <View style={styles.formCuesHeader}>
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              <Text style={styles.formCuesTitle}>Key Form Points</Text>
            </View>
            {currentExercise.formCues.map((cue, index) => (
              <View key={index} style={styles.formCueItem}>
                <Ionicons name="checkmark" size={16} color="#4CAF50" />
                <Text style={styles.formCueText}>{cue}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Instructions - Collapsible */}
        {currentExercise.instructions && currentExercise.instructions.length > 0 && (
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsTitle}>How to perform:</Text>
            {currentExercise.instructions.map((instruction, index) => (
              <View key={index} style={styles.instructionItem}>
                <View style={styles.instructionNumber}>
                  <Text style={styles.instructionNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.instructionText}>{instruction}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Contraindications Warning */}
        {currentExercise.contraindications && currentExercise.contraindications.length > 0 && (
          <View style={styles.contraCard}>
            <View style={styles.contraHeader}>
              <Ionicons name="warning" size={18} color="#F44336" />
              <Text style={styles.contraTitle}>Stop if you have:</Text>
            </View>
            {currentExercise.contraindications.map((contra, index) => (
              <Text key={index} style={styles.contraText}>• {contra}</Text>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Controls */}
      <View style={styles.controlsContainer}>
        {currentExercise.type === 'duration' && (
          <TouchableOpacity
            style={[styles.controlButton, styles.pauseButton]}
            onPress={handlePauseResume}
          >
            <Ionicons name={isPaused ? 'play' : 'pause'} size={20} color="#fff" />
            <Text style={styles.controlButtonText}>
              {isPaused ? 'Resume' : 'Pause'}
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.controlButton, styles.skipButton]}
          onPress={handleSkip}
        >
          <Ionicons name="play-forward" size={20} color="#fff" />
          <Text style={styles.controlButtonText}>Skip</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, styles.completeButton]}
          onPress={handleComplete}
        >
          <Ionicons name="checkmark" size={20} color="#fff" />
          <Text style={styles.completeButtonText}>
            {currentIndex === exercises.length - 1 ? 'Finish' : 'Complete'}
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
    padding: 20,
  },
  exerciseImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  exerciseHeader: {
    marginBottom: 12,
  },
  exerciseName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  exerciseMetaRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#6366F1',
    fontWeight: '600',
  },
  exerciseDescription: {
    fontSize: 15,
    color: '#666',
    marginBottom: 20,
    lineHeight: 22,
  },
  scrollContainer: {
    flex: 1,
  },
  formCuesCard: {
    backgroundColor: '#E8F5E9',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  formCuesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  formCuesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  formCueItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 8,
  },
  formCueText: {
    flex: 1,
    fontSize: 14,
    color: '#2E7D32',
    lineHeight: 20,
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  instructionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  instructionNumberText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  contraCard: {
    backgroundColor: '#FFEBEE',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  contraHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  contraTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#C62828',
  },
  contraText: {
    fontSize: 13,
    color: '#C62828',
    lineHeight: 20,
    marginLeft: 4,
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
    flexDirection: 'row',
    gap: 8,
  },
  controlButton: {
    flex: 1,
    flexDirection: 'row',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
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
