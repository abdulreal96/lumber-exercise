import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SessionService } from '../../services/SessionService';
import { SessionRepository } from '../../data/repositories/SessionRepository';
import { Database } from '../../data/database/db';
import { SessionLog, Statistics } from '../../domain/models';
import { format, isToday, isYesterday } from 'date-fns';

export default function HistoryScreen() {
  console.log('[HistoryScreen] Component initializing');
  const [sessions, setSessions] = useState<SessionLog[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  // Auto-refresh when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      const db = await Database.getInstance();
      const sessionService = new SessionService(new SessionRepository(db));
      const allSessions = await sessionService.getHistory();
      const stats = await sessionService.getStatistics();

      // Sort by date descending
      const sortedSessions = allSessions.sort(
        (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
      );

      setSessions(sortedSessions);
      setStatistics(stats);
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const getDateLabel = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMM d, yyyy');
  };

  const formatDuration = (startTime: string, endTime?: string) => {
    if (!endTime) return 'In progress';
    const start = new Date(startTime);
    const end = new Date(endTime);
    const duration = Math.floor((end.getTime() - start.getTime()) / 1000 / 60);
    return `${duration} min`;
  };

  const renderSessionItem = ({ item }: { item: SessionLog }) => {
    const completionRate =
      item.exercises.length > 0
        ? (item.exercises.filter((e) => e.completed).length /
            item.exercises.length) *
          100
        : 0;

    return (
      <View style={styles.sessionCard}>
        <View style={styles.sessionHeader}>
          <View>
            <Text style={styles.sessionDate}>{getDateLabel(item.startTime)}</Text>
            <Text style={styles.sessionTime}>
              {format(new Date(item.startTime), 'h:mm a')}
            </Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              !!item.completed
                ? styles.statusCompleted
                : styles.statusIncomplete,
            ]}
          >
            <Text style={styles.statusText}>
              {!!item.completed ? '✓ Completed' : 'In Progress'}
            </Text>
          </View>
        </View>

        <View style={styles.sessionStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{item.exercises.length}</Text>
            <Text style={styles.statLabel}>Exercises</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {item.exercises.filter((e) => e.completed).length}
            </Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {formatDuration(item.startTime, item.endTime)}
            </Text>
            <Text style={styles.statLabel}>Duration</Text>
          </View>
        </View>

        {item.exercises.length > 0 && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${completionRate}%` },
                ]}
              />
            </View>
            <Text style={styles.progressText}>{completionRate.toFixed(0)}%</Text>
          </View>
        )}
      </View>
    );
  };

  if (!!loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" animating={true} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Statistics Header */}
      {statistics && (
        <View style={styles.statsHeader}>
          <View style={styles.headerStatCard}>
            <Text style={styles.headerStatValue}>
              {statistics.totalSessions}
            </Text>
            <Text style={styles.headerStatLabel}>Total Sessions</Text>
          </View>
          <View style={styles.headerStatCard}>
            <Text style={styles.headerStatValue}>
              {statistics.currentStreak}
            </Text>
            <Text style={styles.headerStatLabel}>Day Streak</Text>
          </View>
          <View style={styles.headerStatCard}>
            <Text style={styles.headerStatValue}>
              {statistics.completionRate.toFixed(0)}%
            </Text>
            <Text style={styles.headerStatLabel}>Completion</Text>
          </View>
        </View>
      )}

      {/* Session List */}
      <FlatList
        data={sessions}
        keyExtractor={(item) => item.id}
        renderItem={renderSessionItem}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>📊</Text>
            <Text style={styles.emptyText}>No sessions yet</Text>
            <Text style={styles.emptySubtext}>
              Complete your first workout to see it here
            </Text>
          </View>
        }
      />
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
  statsHeader: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    gap: 12,
  },
  headerStatCard: {
    flex: 1,
    alignItems: 'center',
  },
  headerStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  headerStatLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  listContainer: {
    padding: 16,
  },
  sessionCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sessionDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  sessionTime: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusCompleted: {
    backgroundColor: '#E8F5E9',
  },
  statusIncomplete: {
    backgroundColor: '#FFF3E0',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  sessionStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  progressText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    minWidth: 40,
    textAlign: 'right',
  },
  emptyContainer: {
    padding: 60,
    alignItems: 'center',
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
