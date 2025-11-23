/**
 * NotificationService
 * Handles scheduling and managing daily workout notifications
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Settings } from '../domain/models';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface INotificationService {
  requestPermissions(): Promise<boolean>;
  scheduleRoutineNotifications(settings: Settings): Promise<void>;
  cancelAllNotifications(): Promise<void>;
  scheduleSnooze(minutes: number): Promise<void>;
  schedule30MinuteReminders(settings: Settings): Promise<void>;
}

export class NotificationService implements INotificationService {
  /**
   * Request notification permissions from the user
   */
  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === 'granted';
  }

  /**
   * Schedule daily notifications for morning and evening routines
   */
  async scheduleRoutineNotifications(settings: Settings): Promise<void> {
    // Cancel existing notifications first
    await this.cancelAllNotifications();

    if (!settings.notifications_enabled) {
      return;
    }

    // Parse time strings (format: "HH:MM")
    const [morningHour, morningMinute] = settings.morning_time
      .split(':')
      .map(Number);
    const [eveningHour, eveningMinute] = settings.evening_time
      .split(':')
      .map(Number);

    // Calculate 30 minutes before each routine
    const morningReminderTime = this.subtractMinutes(morningHour, morningMinute, 30);
    const eveningReminderTime = this.subtractMinutes(eveningHour, eveningMinute, 30);

    // Schedule 30-minute advance reminder for morning
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🔔 Morning Routine in 30 Minutes',
        body: "Don't miss today's workout! You've been doing great - keep the streak alive! 💪",
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        data: { type: 'morning-reminder', routineId: 'morning-routine' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: morningReminderTime.hour,
        minute: morningReminderTime.minute,
      },
    });

    // Schedule morning notification
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🌅 Morning Routine',
        body: 'Time for your morning lumbar exercises! Start your day healthy.',
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        data: { type: 'morning', routineId: 'morning-routine' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: morningHour,
        minute: morningMinute,
      },
    });

    // Schedule 30-minute advance reminder for evening
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🔔 Evening Routine in 30 Minutes',
        body: "Your evening workout is coming up! Stay consistent and strong! 🌟",
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        data: { type: 'evening-reminder', routineId: 'evening-routine' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: eveningReminderTime.hour,
        minute: eveningReminderTime.minute,
      },
    });

    // Schedule evening notification
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🌙 Evening Routine',
        body: 'Time for your evening lumbar exercises! End your day strong.',
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        data: { type: 'evening', routineId: 'evening-routine' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: eveningHour,
        minute: eveningMinute,
      },
    });
  }

  /**
   * Cancel all scheduled notifications
   */
  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  /**
   * Schedule a snooze notification
   */
  async scheduleSnooze(minutes: number): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '⏰ Snooze Reminder',
        body: "Time's up! Ready for your lumbar exercises?",
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        data: { type: 'snooze' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: minutes * 60,
      },
    });
  }

  /**
   * Add listener for when notification is received while app is in foreground
   */
  addNotificationReceivedListener(
    callback: (notification: Notifications.Notification) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationReceivedListener(callback);
  }

  /**
   * Add listener for when user taps on a notification
   */
  addNotificationResponseListener(
    callback: (response: Notifications.NotificationResponse) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationResponseReceivedListener(callback);
  }

  /**
   * Get all scheduled notifications (for debugging)
   */
  async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    return await Notifications.getAllScheduledNotificationsAsync();
  }

  /**
   * Helper to subtract minutes from a time (handles day rollover)
   */
  private subtractMinutes(hour: number, minute: number, minutesToSubtract: number): { hour: number; minute: number } {
    let totalMinutes = hour * 60 + minute - minutesToSubtract;
    
    if (totalMinutes < 0) {
      totalMinutes += 24 * 60; // Handle previous day
    }
    
    return {
      hour: Math.floor(totalMinutes / 60) % 24,
      minute: totalMinutes % 60,
    };
  }

  /**
   * Schedule 30-minute advance reminders (for manual use if needed)
   */
  async schedule30MinuteReminders(settings: Settings): Promise<void> {
    // This is now integrated into scheduleRoutineNotifications
    // but kept as a separate method for flexibility
    await this.scheduleRoutineNotifications(settings);
  }
}
