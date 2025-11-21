import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/types';
import { ExerciseService } from '../../services/ExerciseService';
import { ExerciseRepository } from '../../data/repositories/ExerciseRepository';
import { Database } from '../../data/database/db';
import { Exercise } from '../../domain/models';

type ExerciseDetailRouteProp = RouteProp<RootStackParamList, 'ExerciseDetail'>;

export default function ExerciseDetailScreen() {
  const route = useRoute<ExerciseDetailRouteProp>();
  const navigation = useNavigation();
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExercise();
  }, [route.params.exerciseId]);

  const loadExercise = async () => {
    try {
      const db = await Database.getInstance();
      const exerciseService = new ExerciseService(new ExerciseRepository(db));
      const ex = await exerciseService.getExerciseById(route.params.exerciseId);
      if (ex) {
        setExercise(ex);
        navigation.setOptions({ title: ex.name });
      }
    } catch (error) {
      console.error('Failed to load exercise:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'stretching':
        return '#4CAF50';
      case 'strengthening':
        return '#F44336';
      case 'flexibility':
        return '#2196F3';
      case 'posture':
        return '#FF9800';
      case 'mobility':
        return '#9C27B0';
      case 'core':
        return '#E91E63';
      case 'upper_body':
        return '#3F51B5';
      case 'lower_body':
        return '#00BCD4';
      default:
        return '#9E9E9E';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return '#4CAF50';
      case 'intermediate':
        return '#FF9800';
      case 'advanced':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  if (!exercise) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Exercise not found</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Exercise Image */}
      {exercise.imageUrl && (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: exercise.imageUrl }}
            style={styles.exerciseImage}
            resizeMode="cover"
          />
          <View style={styles.imageOverlay}>
            <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(exercise.difficulty) }]}>
              <Ionicons name="fitness" size={16} color="#fff" />
              <Text style={styles.difficultyText}>{exercise.difficulty}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Header Card */}
      <View
        style={[
          styles.headerCard,
          { borderLeftColor: getCategoryColor(exercise.category) },
        ]}
      >
        <View style={styles.headerTop}>
          <Text style={styles.exerciseName}>{exercise.name}</Text>
          <View
            style={[
              styles.categoryBadge,
              { backgroundColor: getCategoryColor(exercise.category) },
            ]}
          >
            <Text style={styles.categoryText}>{exercise.category}</Text>
          </View>
        </View>
        <Text style={styles.exerciseDescription}>{exercise.description}</Text>
      </View>

      {/* Exercise Info Grid */}
      <View style={styles.infoSection}>
        <View style={styles.infoGrid}>
          <View style={styles.infoCard}>
            <Ionicons name="repeat" size={20} color="#6366F1" />
            <Text style={styles.infoLabel}>Sets</Text>
            <Text style={styles.infoValue}>{exercise.sets}</Text>
          </View>
          <View style={styles.infoCard}>
            <Ionicons name="timer" size={20} color="#6366F1" />
            <Text style={styles.infoLabel}>Target</Text>
            <Text style={styles.infoValue}>
              {exercise.type === 'reps' ? `${exercise.reps} reps` : `${exercise.duration}s`}
            </Text>
          </View>
          <View style={styles.infoCard}>
            <Ionicons name="time" size={20} color="#6366F1" />
            <Text style={styles.infoLabel}>Rest</Text>
            <Text style={styles.infoValue}>{exercise.restBetweenSets}s</Text>
          </View>
          <View style={styles.infoCard}>
            <Ionicons name={exercise.equipment === 'none' ? 'body' : 'construct'} size={20} color="#6366F1" />
            <Text style={styles.infoLabel}>Equipment</Text>
            <Text style={styles.infoValue}>{exercise.equipment}</Text>
          </View>
        </View>
      </View>

      {/* Target Muscles */}
      {exercise.targetMuscles && exercise.targetMuscles.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="fitness-outline" size={20} color="#333" />
            <Text style={styles.sectionTitle}>Target Muscles</Text>
          </View>
          <View style={styles.muscleContainer}>
            {exercise.targetMuscles.map((muscle, index) => (
              <View key={index} style={styles.muscleChip}>
                <Text style={styles.muscleText}>{muscle}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Instructions */}
      {exercise.instructions && exercise.instructions.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="list" size={20} color="#333" />
            <Text style={styles.sectionTitle}>How to Perform</Text>
          </View>
          {exercise.instructions.map((instruction, index) => (
            <View key={index} style={styles.instructionItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{index + 1}</Text>
              </View>
              <Text style={styles.instructionText}>{instruction}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Form Cues */}
      {exercise.formCues && exercise.formCues.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            <Text style={[styles.sectionTitle, { color: '#4CAF50' }]}>✓ Form Cues</Text>
          </View>
          <View style={styles.formCuesContainer}>
            {exercise.formCues.map((cue, index) => (
              <View key={index} style={styles.formCueItem}>
                <Ionicons name="checkmark" size={16} color="#4CAF50" />
                <Text style={styles.formCueText}>{cue}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Contraindications */}
      {exercise.contraindications && exercise.contraindications.length > 0 && (
        <View style={[styles.section, styles.warningSection]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="warning" size={20} color="#F44336" />
            <Text style={[styles.sectionTitle, { color: '#F44336' }]}>⚠️ Contraindications</Text>
          </View>
          <Text style={styles.contraText}>Do NOT perform this exercise if you have:</Text>
          {exercise.contraindications.map((contra, index) => (
            <View key={index} style={styles.contraItem}>
              <Ionicons name="close-circle" size={16} color="#F44336" />
              <Text style={styles.contraText}>{contra}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Modifications */}
      {exercise.modifications && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="options" size={20} color="#333" />
            <Text style={styles.sectionTitle}>Modifications</Text>
          </View>
          <View style={styles.modificationsContainer}>
            <View style={[styles.modificationCard, styles.easierCard]}>
              <Ionicons name="arrow-down-circle" size={24} color="#2196F3" />
              <Text style={styles.modificationLabel}>Easier</Text>
              <Text style={styles.modificationText}>{exercise.modifications.easier}</Text>
            </View>
            <View style={[styles.modificationCard, styles.harderCard]}>
              <Ionicons name="arrow-up-circle" size={24} color="#F44336" />
              <Text style={styles.modificationLabel}>Harder</Text>
              <Text style={styles.modificationText}>{exercise.modifications.harder}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Legacy fields (backward compatibility) */}
      {exercise.tips && exercise.tips.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="bulb" size={20} color="#FF9800" />
            <Text style={styles.sectionTitle}>💡 Tips</Text>
          </View>
          {exercise.tips.map((tip, index) => (
            <View key={index} style={styles.tipItem}>
              <Text style={styles.tipBullet}>•</Text>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>
      )}

      {exercise.warnings && exercise.warnings.length > 0 && (
        <View style={[styles.section, styles.legacyWarningSection]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="alert-circle" size={20} color="#F44336" />
            <Text style={styles.sectionTitle}>⚠️ Important</Text>
          </View>
          {exercise.warnings.map((warning, index) => (
            <View key={index} style={styles.warningItem}>
              <Text style={styles.warningText}>{warning}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F44336',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  imageContainer: {
    width: '100%',
    height: 250,
    position: 'relative',
  },
  exerciseImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  difficultyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  difficultyText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
    textTransform: 'capitalize',
  },
  headerCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderLeftWidth: 4,
    marginBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  exerciseName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginLeft: 12,
  },
  categoryText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  exerciseDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  infoSection: {
    padding: 16,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  infoCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
    gap: 4,
  },
  infoLabel: {
    fontSize: 12,
    color: '#999',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  muscleContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  muscleChip: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#6366F1',
  },
  muscleText: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '600',
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  formCuesContainer: {
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
  },
  formCueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  formCueText: {
    flex: 1,
    fontSize: 14,
    color: '#2E7D32',
    lineHeight: 20,
  },
  warningSection: {
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    marginHorizontal: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  contraText: {
    fontSize: 14,
    color: '#C62828',
    lineHeight: 20,
    fontWeight: '500',
    marginBottom: 8,
  },
  contraItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  modificationsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  modificationCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  easierCard: {
    backgroundColor: '#E3F2FD',
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  harderCard: {
    backgroundColor: '#FFEBEE',
    borderWidth: 2,
    borderColor: '#F44336',
  },
  modificationLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  modificationText: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    lineHeight: 18,
  },
  tipItem: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingLeft: 8,
  },
  tipBullet: {
    fontSize: 16,
    color: '#6366F1',
    marginRight: 8,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  legacyWarningSection: {
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    marginHorizontal: 16,
  },
  warningItem: {
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#F44336',
  },
  warningText: {
    fontSize: 14,
    color: '#C62828',
    lineHeight: 20,
    fontWeight: '500',
  },
});
