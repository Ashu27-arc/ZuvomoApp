import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}

export type RootStackParamList = {
  Home: undefined;
  Details: { postId: number };
};

export type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;

export type DetailScreenProps = NativeStackScreenProps<RootStackParamList, 'Details'>;
