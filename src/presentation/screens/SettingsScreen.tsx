import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SettingsRepository } from '../../data/repositories/SettingsRepository';
import { Settings } from '../../domain/models';

export default function SettingsScreen() {
  console.log('[SettingsScreen] Component initializing');
  const [settings, setSettings] = useState<Settings>({
    notifications_enabled: true,
    morning_time: '07:00',
    evening_time: '17:00',
    snooze_minutes: 10,
    disabled_exercises: [],
  });

  const settingsRepo = new SettingsRepository();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      console.log('[SettingsScreen] Loading settings...');
      const savedSettings = await settingsRepo.getAll();
      console.log('[SettingsScreen] Settings loaded:', JSON.stringify(savedSettings, null, 2));
      setSettings(savedSettings);
    } catch (error) {
      console.error('[SettingsScreen] Failed to load settings:', error);
    }
  };

  const updateSettings = async (updates: Partial<Settings>) => {
    try {
      console.log('[SettingsScreen] Updating settings with:', updates);
      const newSettings = { ...settings, ...updates };
      await settingsRepo.saveAll(newSettings);
      setSettings(newSettings);
      console.log('[SettingsScreen] Settings updated successfully');
    } catch (error) {
      console.error('[SettingsScreen] Failed to save settings:', error);
      Alert.alert('Error', 'Failed to save settings');
    }
  };

  const handleNotificationToggle = (value: boolean) => {
    updateSettings({ notifications_enabled: value });
  };

  const handleTimeChange = (type: 'morning' | 'evening', adjustment: number) => {
    const timeKey =
      type === 'morning'
        ? 'morning_time'
        : 'evening_time';
    const currentTime = settings[timeKey];
    const [hours, minutes] = currentTime.split(':').map(Number);

    let newHours = hours + adjustment;
    if (newHours < 0) newHours = 23;
    if (newHours > 23) newHours = 0;

    const newTime = `${newHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    updateSettings({ [timeKey]: newTime });
  };

  const handleSnoozeChange = (adjustment: number) => {
    const newSnooze = Math.max(5, Math.min(30, settings.snooze_minutes + adjustment));
    updateSettings({ snooze_minutes: newSnooze });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  return (
    <ScrollView style={styles.container}>
      {/* Notifications Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Enable Notifications</Text>
            <Text style={styles.settingDescription}>
              Receive daily reminders for morning and evening routines
            </Text>
          </View>
          <Switch
            value={settings.notifications_enabled}
            onValueChange={handleNotificationToggle}
            trackColor={{ false: '#ccc', true: '#4CAF50' }}
            thumbColor="#fff"
          />
        </View>
      </View>

      {/* Notification Times */}
      {settings.notifications_enabled && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Times</Text>

          {/* Morning Time */}
          <View style={styles.timeCard}>
            <View style={styles.timeHeader}>
              <Text style={styles.timeIcon}>🌅</Text>
              <View style={styles.timeInfo}>
                <Text style={styles.timeLabel}>Morning Routine</Text>
                <Text style={styles.timeDescription}>
                  Daily reminder for morning exercises
                </Text>
              </View>
            </View>
            <View style={styles.timeControls}>
              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => handleTimeChange('morning', -1)}
              >
                <Text style={styles.timeButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.timeValue}>
                {formatTime(settings.morning_time)}
              </Text>
              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => handleTimeChange('morning', 1)}
              >
                <Text style={styles.timeButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Evening Time */}
          <View style={styles.timeCard}>
            <View style={styles.timeHeader}>
              <Text style={styles.timeIcon}>🌙</Text>
              <View style={styles.timeInfo}>
                <Text style={styles.timeLabel}>Evening Routine</Text>
                <Text style={styles.timeDescription}>
                  Daily reminder for evening exercises
                </Text>
              </View>
            </View>
            <View style={styles.timeControls}>
              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => handleTimeChange('evening', -1)}
              >
                <Text style={styles.timeButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.timeValue}>
                {formatTime(settings.evening_time)}
              </Text>
              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => handleTimeChange('evening', 1)}
              >
                <Text style={styles.timeButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Snooze Duration */}
      {settings.notifications_enabled && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Snooze Duration</Text>
          <View style={styles.snoozeCard}>
            <View style={styles.snoozeInfo}>
              <Text style={styles.settingLabel}>Snooze Time</Text>
              <Text style={styles.settingDescription}>
                How long to delay notifications when snoozed
              </Text>
            </View>
            <View style={styles.snoozeControls}>
              <TouchableOpacity
                style={styles.snoozeButton}
                onPress={() => handleSnoozeChange(-5)}
              >
                <Text style={styles.snoozeButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.snoozeValue}>
                {settings.snooze_minutes} min
              </Text>
              <TouchableOpacity
                style={styles.snoozeButton}
                onPress={() => handleSnoozeChange(5)}
              >
                <Text style={styles.snoozeButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* About Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.aboutCard}>
          <Text style={styles.appName}>Lumbar Exercise App</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
          <Text style={styles.appDescription}>
            A dedicated app to help you maintain a healthy lower back through
            regular stretching and strengthening exercises.
          </Text>
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
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingInfo: {
    flex: 1,
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  timeCard: {
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
  timeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  timeIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  timeInfo: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  timeDescription: {
    fontSize: 14,
    color: '#666',
  },
  timeControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  timeButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeButtonText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  timeValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    minWidth: 120,
    textAlign: 'center',
  },
  snoozeCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  snoozeInfo: {
    marginBottom: 16,
  },
  snoozeControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  snoozeButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FF9800',
    justifyContent: 'center',
    alignItems: 'center',
  },
  snoozeButtonText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  snoozeValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    minWidth: 100,
    textAlign: 'center',
  },
  aboutCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  appName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 14,
    color: '#999',
    marginBottom: 16,
  },
  appDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});
