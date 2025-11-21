import { Settings } from '../../../domain/models';
import { ISettingsRepository } from '../../../domain/interfaces/IRepositories';

/**
 * Mock Settings Repository for Testing
 */
export class MockSettingsRepository implements ISettingsRepository {
  private settings: Settings = {
    morning_time: '07:00',
    evening_time: '17:00',
    notifications_enabled: true,
    snooze_minutes: 10,
    disabled_exercises: [],
  };

  async getAll(): Promise<Settings> {
    return { ...this.settings };
  }

  async get<K extends keyof Settings>(key: K): Promise<Settings[K]> {
    return this.settings[key];
  }

  async set<K extends keyof Settings>(key: K, value: Settings[K]): Promise<void> {
    this.settings[key] = value;
  }

  async saveAll(settings: Settings): Promise<void> {
    this.settings = { ...settings };
  }

  async reset(): Promise<void> {
    this.settings = {
      morning_time: '07:00',
      evening_time: '17:00',
      notifications_enabled: true,
      snooze_minutes: 10,
      disabled_exercises: [],
    };
  }
}
