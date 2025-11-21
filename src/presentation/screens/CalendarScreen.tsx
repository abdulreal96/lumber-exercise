import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SessionService } from '../../services/SessionService';
import { SessionRepository } from '../../data/repositories/SessionRepository';
import { Database } from '../../data/database/db';
import { SessionLog } from '../../domain/models';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
} from 'date-fns';

export default function CalendarScreen() {
  console.log('[CalendarScreen] Component initializing');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [sessions, setSessions] = useState<SessionLog[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, []);

  // Auto-refresh when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadSessions();
    }, [])
  );

  const loadSessions = async () => {
    try {
      console.log('[CalendarScreen] Getting database instance...');
      const db = await Database.getInstance();
      const sessionService = new SessionService(new SessionRepository(db));
      
      console.log('[CalendarScreen] Loading sessions...');
      const allSessions = await sessionService.getHistory();
      console.log(`[CalendarScreen] Loaded ${allSessions.length} sessions`);
      setSessions(allSessions.filter((s) => !!s.completed));
    } catch (error) {
      console.error('[CalendarScreen] Failed to load sessions:', error);
      if (error instanceof Error) {
        console.error('[CalendarScreen] Error stack:', error.stack);
      }
    } finally {
      setLoading(false);
    }
  };

  const hasSessionOnDate = (date: Date) => {
    return sessions.some((session) =>
      isSameDay(new Date(session.startTime), date)
    );
  };

  const getSessionsForDate = (date: Date) => {
    return sessions.filter((session) =>
      isSameDay(new Date(session.startTime), date)
    );
  };

  const generateCalendarDays = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  };

  const handlePreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
    setSelectedDate(null);
  };

  const handleDatePress = (date: Date) => {
    setSelectedDate(date);
  };

  if (!!loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" animating={true} />
      </View>
    );
  }

  const days = generateCalendarDays();
  const selectedSessions = selectedDate
    ? getSessionsForDate(selectedDate)
    : [];

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.monthButton}
          onPress={handlePreviousMonth}
        >
          <Text style={styles.monthButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.monthTitle}>{format(currentDate, 'MMMM yyyy')}</Text>
        <TouchableOpacity style={styles.monthButton} onPress={handleNextMonth}>
          <Text style={styles.monthButtonText}>→</Text>
        </TouchableOpacity>
      </View>

      {/* Weekday Headers */}
      <View style={styles.weekdayContainer}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <View key={day} style={styles.weekdayCell}>
            <Text style={styles.weekdayText}>{day}</Text>
          </View>
        ))}
      </View>

      {/* Calendar Grid */}
      <View style={styles.calendarGrid}>
        {days.map((day, index) => {
          const isCurrentMonth = isSameMonth(day, currentDate);
          const hasSession = hasSessionOnDate(day);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isToday = isSameDay(day, new Date());

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayCell,
                !isCurrentMonth && styles.dayCellInactive,
                isSelected && styles.dayCellSelected,
                isToday && styles.dayCellToday,
              ]}
              onPress={() => handleDatePress(day)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.dayText,
                  !isCurrentMonth && styles.dayTextInactive,
                  isSelected && styles.dayTextSelected,
                  isToday && styles.dayTextToday,
                ]}
              >
                {format(day, 'd')}
              </Text>
              {hasSession && (
                <View
                  style={[
                    styles.sessionDot,
                    isSelected && styles.sessionDotSelected,
                  ]}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Selected Date Details */}
      {selectedDate && (
        <View style={styles.detailsSection}>
          <Text style={styles.detailsTitle}>
            {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </Text>
          {selectedSessions.length > 0 ? (
            <View style={styles.sessionsList}>
              {selectedSessions.map((session) => (
                <View key={session.id} style={styles.sessionCard}>
                  <View style={styles.sessionHeader}>
                    <Text style={styles.sessionTime}>
                      {format(new Date(session.startTime), 'h:mm a')}
                    </Text>
                    <View style={styles.completedBadge}>
                      <Text style={styles.completedBadgeText}>
                        ✓ Completed
                      </Text>
                    </View>
                  </View>
                  <View style={styles.sessionStats}>
                    <Text style={styles.sessionStat}>
                      {session.exercises.length} exercises
                    </Text>
                    <Text style={styles.sessionStat}>•</Text>
                    <Text style={styles.sessionStat}>
                      {session.exercises.filter((e) => !!e.completed).length}{' '}
                      completed
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No sessions on this day</Text>
            </View>
          )}
        </View>
      )}

      {/* Stats Summary */}
      <View style={styles.summarySection}>
        <Text style={styles.summaryTitle}>This Month</Text>
        <View style={styles.summaryStats}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>
              {
                sessions.filter((s) =>
                  isSameMonth(new Date(s.startTime), currentDate)
                ).length
              }
            </Text>
            <Text style={styles.summaryLabel}>Sessions</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>
              {sessions.filter((s) => isSameMonth(new Date(s.startTime), currentDate))
                .reduce((total, s) => total + s.exercises.length, 0)}
            </Text>
            <Text style={styles.summaryLabel}>Exercises</Text>
          </View>
        </View>
      </View>
    </ScrollView>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  monthButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  monthButtonText: {
    fontSize: 24,
    color: '#2196F3',
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  weekdayContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
  },
  weekdayText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#fff',
    padding: 4,
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  dayCellInactive: {
    opacity: 0.3,
  },
  dayCellSelected: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
  },
  dayCellToday: {
    borderWidth: 2,
    borderColor: '#FF9800',
    borderRadius: 8,
  },
  dayText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  dayTextInactive: {
    color: '#999',
  },
  dayTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  dayTextToday: {
    color: '#FF9800',
    fontWeight: 'bold',
  },
  sessionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4CAF50',
    marginTop: 2,
  },
  sessionDotSelected: {
    backgroundColor: '#fff',
  },
  detailsSection: {
    padding: 16,
    backgroundColor: '#fff',
    marginTop: 8,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  sessionsList: {
    gap: 12,
  },
  sessionCard: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sessionTime: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  completedBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  completedBadgeText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  sessionStats: {
    flexDirection: 'row',
    gap: 8,
  },
  sessionStat: {
    fontSize: 14,
    color: '#666',
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
  },
  summarySection: {
    padding: 16,
    backgroundColor: '#fff',
    marginTop: 8,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  summaryStats: {
    flexDirection: 'row',
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});
