import type { NativeStackScreenProps } from '@react-navigation/native-stack';

/**
 * Public Post model from JSONPlaceholder
 */
export interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}

/**
 * Type-safe navigation parameters for the Native Stack Navigator
 */
export type RootStackParamList = {
  Home: undefined;
  Details: { postId: number };
};

/**
 * Screen Props for HomeScreen
 */
export type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;

/**
 * Screen Props for DetailScreen
 */
export type DetailScreenProps = NativeStackScreenProps<RootStackParamList, 'Details'>;
