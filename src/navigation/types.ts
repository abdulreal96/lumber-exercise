/**
 * Navigation Type Definitions
 */

import { NavigatorScreenParams } from '@react-navigation/native';

export type MainTabParamList = {
  Home: undefined;
  Exercises: undefined;
  History: undefined;
  Calendar: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  Session: { routineId: string; routineName: string };
  ExerciseDetail: { exerciseId: string };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
