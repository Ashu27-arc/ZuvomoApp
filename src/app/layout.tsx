import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import DetailScreen from '../screens/DetailScreen';
import { RootStackParamList } from '../types/post';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Native Stack Navigator
 */
export const RootNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#2563EB',
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 18,
        },
        headerShadowVisible: false,
        contentStyle: {
          backgroundColor: '#F8FAFC',
        },
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Zuvomo Posts',
        }}
      />
      <Stack.Screen
        name="Details"
        component={DetailScreen}
        options={{
          title: 'Post Details',
        }}
      />
    </Stack.Navigator>
  );
};

export default RootNavigator;
