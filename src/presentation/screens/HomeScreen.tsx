import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/types';
import { SessionService } from '../../services/SessionService';
import { RoutineService } from '../../services/RoutineService';
import { SessionRepository } from '../../data/repositories/SessionRepository';
import { RoutineRepository } from '../../data/repositories/RoutineRepository';
import { ExerciseRepository } from '../../data/repositories/ExerciseRepository';
import { Database } from '../../data/database/db';
import { Routine, Statistics } from '../../domain/models';
import { format } from 'date-fns';
import { theme } from '../../constants/theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  console.log('[HomeScreen] Component initializing');
  const navigation = useNavigation<NavigationProp>();
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [morningRoutine, setMorningRoutine] = useState<Routine | null>(null);
  const [eveningRoutine, setEveningRoutine] = useState<Routine | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    console.log('[HomeScreen] useEffect triggered');
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Get database instance
      console.log('[HomeScreen] Getting database instance...');
      const db = await Database.getInstance();
      console.log('[HomeScreen] Database instance retrieved');
      
      // Create services with database
      console.log('[HomeScreen] Creating services...');
      const sessionService = new SessionService(new SessionRepository(db));
      const routineService = new RoutineService(
        new RoutineRepository(db),
        new ExerciseRepository(db)
      );
      console.log('[HomeScreen] Services created');
      
      // Load statistics
      console.log('[HomeScreen] Loading statistics...');
      const stats = await sessionService.getStatistics();
      console.log('[HomeScreen] Stats:', JSON.stringify(stats, null, 2));
      setStatistics(stats);

      // Load routines
      console.log('[HomeScreen] Loading routines...');
      try {
        const morning = await routineService.getRoutineByType('morning');
        console.log('[HomeScreen] Morning routine:', JSON.stringify(morning, null, 2));
        setMorningRoutine(morning);
      } catch (err) {
        console.error('[HomeScreen] Error loading morning routine:', err);
      }
      
      console.log('[HomeScreen] About to load evening routine...');
      try {
        const evening = await routineService.getRoutineByType('evening');
        console.log('[HomeScreen] Evening routine:', JSON.stringify(evening, null, 2));
        setEveningRoutine(evening);
      } catch (err) {
        console.error('[HomeScreen] Error loading evening routine:', err);
      }
      
      console.log('[HomeScreen] Data loaded successfully');
    } catch (error) {
      console.error('Failed to load home data:', error);
      if (error instanceof Error) {
        console.error('Error stack:', error.stack);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleStartRoutine = async (routine: Routine) => {
    try {
      const db = await Database.getInstance();
      const routineService = new RoutineService(
        new RoutineRepository(db),
        new ExerciseRepository(db)
      );
      const exercises = await routineService.getRoutineExercises(routine.id);
      navigation.navigate('Session', {
        routineId: routine.id,
        routineName: routine.name,
      });
    } catch (error) {
      console.error('Failed to start routine:', error);
    }
  };

  if (loading) {
    console.log('[HomeScreen] Rendering loading state, loading=', loading);
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading your progress...</Text>
      </View>
    );
  }

  console.log('[HomeScreen] Rendering main content');

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>{getGreeting()}!</Text>
        <Text style={styles.date}>{format(new Date(), 'EEEE, MMMM d')}</Text>
      </View>

      {/* Statistics Cards */}
      {statistics && (
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: theme.colors.primary + '15' }]}>
              <Ionicons name="flame" size={24} color={theme.colors.primary} />
            </View>
            <Text style={styles.statValue}>{statistics.currentStreak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: theme.colors.accent + '15' }]}>
              <Ionicons name="trophy" size={24} color={theme.colors.accent} />
            </View>
            <Text style={styles.statValue}>{statistics.longestStreak}</Text>
            <Text style={styles.statLabel}>Best Streak</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: theme.colors.success + '15' }]}>
              <Ionicons name="checkmark-circle" size={24} color={theme.colors.success} />
            </View>
            <Text style={styles.statValue}>
              {statistics.completionRate.toFixed(0)}%
            </Text>
            <Text style={styles.statLabel}>Complete</Text>
          </View>
        </View>
      )}

      {/* Routines Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Routines</Text>

        {/* Morning Routine */}
        {morningRoutine && (
          <TouchableOpacity
            style={[styles.routineCard, styles.morningCard]}
            onPress={() => handleStartRoutine(morningRoutine)}
            activeOpacity={0.7}
          >
            <View style={[styles.routineIcon, { backgroundColor: theme.colors.morning + '15' }]}>
              <Ionicons name="sunny" size={28} color={theme.colors.morning} />
            </View>
            <View style={styles.routineInfo}>
              <Text style={styles.routineName}>{morningRoutine.name}</Text>
              <View style={styles.routineMetrics}>
                <View style={styles.routineMetricItem}>
                  <Ionicons name="fitness" size={14} color={theme.colors.textSecondary} />
                  <Text style={styles.routineDetails}>{morningRoutine.exerciseIds.length} exercises</Text>
                </View>
                <View style={styles.routineMetricItem}>
                  <Ionicons name="time" size={14} color={theme.colors.textSecondary} />
                  <Text style={styles.routineDetails}>{morningRoutine.estimatedDuration} min</Text>
                </View>
              </View>
            </View>
            <View style={styles.startButton}>
              <Ionicons name="play" size={20} color={theme.colors.textInverse} />
            </View>
          </TouchableOpacity>
        )}

        {/* Evening Routine */}
        {eveningRoutine && (
          <TouchableOpacity
            style={[styles.routineCard, styles.eveningCard]}
            onPress={() => handleStartRoutine(eveningRoutine)}
            activeOpacity={0.7}
          >
            <View style={[styles.routineIcon, { backgroundColor: theme.colors.evening + '15' }]}>
              <Ionicons name="moon" size={28} color={theme.colors.evening} />
            </View>
            <View style={styles.routineInfo}>
              <Text style={styles.routineName}>{eveningRoutine.name}</Text>
              <View style={styles.routineMetrics}>
                <View style={styles.routineMetricItem}>
                  <Ionicons name="fitness" size={14} color={theme.colors.textSecondary} />
                  <Text style={styles.routineDetails}>{eveningRoutine.exerciseIds.length} exercises</Text>
                </View>
                <View style={styles.routineMetricItem}>
                  <Ionicons name="time" size={14} color={theme.colors.textSecondary} />
                  <Text style={styles.routineDetails}>{eveningRoutine.estimatedDuration} min</Text>
                </View>
              </View>
            </View>
            <View style={styles.startButton}>
              <Ionicons name="play" size={20} color={theme.colors.textInverse} />
            </View>
          </TouchableOpacity>
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('MainTabs', { screen: 'Exercises' })}
          >
            <View style={[styles.quickActionIconContainer, { backgroundColor: theme.colors.info + '15' }]}>
              <Ionicons name="barbell" size={28} color={theme.colors.info} />
            </View>
            <Text style={styles.quickActionText}>Browse Exercises</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('MainTabs', { screen: 'History' })}
          >
            <View style={[styles.quickActionIconContainer, { backgroundColor: theme.colors.secondary + '15' }]}>
              <Ionicons name="stats-chart" size={28} color={theme.colors.secondary} />
            </View>
            <Text style={styles.quickActionText}>View History</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    paddingBottom: theme.spacing.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  header: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  greeting: {
    fontSize: theme.fontSize['3xl'],
    fontWeight: '700',
    color: theme.colors.text,
  },
  date: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    ...theme.shadow.md,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  statValue: {
    fontSize: theme.fontSize['2xl'],
    fontWeight: '700',
    color: theme.colors.text,
    marginTop: theme.spacing.xs,
  },
  statLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
  section: {
    padding: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  routineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadow.md,
  },
  morningCard: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.morning,
  },
  eveningCard: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.evening,
  },
  routineIcon: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  routineInfo: {
    flex: 1,
  },
  routineName: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  routineMetrics: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  routineMetricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  routineDetails: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  startButton: {
    backgroundColor: theme.colors.primary,
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadow.sm,
  },
  quickActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    ...theme.shadow.md,
  },
  quickActionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  quickActionText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
  },
});
