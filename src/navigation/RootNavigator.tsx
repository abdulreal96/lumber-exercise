import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from './types';
import { MainTabNavigator } from './MainTabNavigator';
import SessionScreen from '../presentation/screens/SessionScreen';
import ExerciseDetailScreen from '../presentation/screens/ExerciseDetailScreen';

const Stack = createStackNavigator<RootStackParamList>();

export function RootNavigator() {
  console.log('[RootNavigator] Rendering');
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#2196F3',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="MainTabs"
          component={MainTabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Session"
          component={SessionScreen}
          options={({ route }) => ({
            title: route.params.routineName,
            headerBackTitle: 'Cancel',
          })}
        />
        <Stack.Screen
          name="ExerciseDetail"
          component={ExerciseDetailScreen}
          options={{
            title: 'Exercise Details',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
