import AsyncStorage from '@react-native-async-storage/async-storage';
import { Settings } from '../../domain/models';
import { ISettingsRepository } from '../../domain/interfaces/IRepositories';

/**
 * AsyncStorage implementation of Settings Repository
 * Using AsyncStorage instead of SQLite for simple key-value storage
 */
export class SettingsRepository implements ISettingsRepository {
  private readonly SETTINGS_KEY = '@lumbar_app_settings';

  private readonly DEFAULT_SETTINGS: Settings = {
    morning_time: '07:00',
    evening_time: '17:00',
    notifications_enabled: true,
    snooze_minutes: 10,
    disabled_exercises: [],
  };

  async getAll(): Promise<Settings> {
    try {
      const data = await AsyncStorage.getItem(this.SETTINGS_KEY);
      if (!data) {
        await this.saveAll(this.DEFAULT_SETTINGS);
        return this.DEFAULT_SETTINGS;
      }
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading settings:', error);
      return this.DEFAULT_SETTINGS;
    }
  }

  async get<K extends keyof Settings>(key: K): Promise<Settings[K]> {
    const settings = await this.getAll();
    return settings[key];
  }

  async set<K extends keyof Settings>(key: K, value: Settings[K]): Promise<void> {
    const settings = await this.getAll();
    settings[key] = value;
    await this.saveAll(settings);
  }

  async saveAll(settings: Settings): Promise<void> {
    try {
      await AsyncStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
      throw error;
    }
  }

  async reset(): Promise<void> {
    await this.saveAll(this.DEFAULT_SETTINGS);
  }
}
