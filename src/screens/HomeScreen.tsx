import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  StatusBar,
  Platform,
} from 'react-native';
import { getPosts } from '../services/api';
import { Post, HomeScreenProps } from '../types/post';

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [refreshErrorBanner, setRefreshErrorBanner] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);


  const fetchPosts = useCallback(async (isPullToRefresh: boolean = false) => {

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    if (isPullToRefresh) {
      setIsRefreshing(true);
      setRefreshErrorBanner(null);
    } else {
      setIsLoading(true);
      setErrorMessage(null);
    }

    try {
      const data = await getPosts(controller.signal);
      setPosts(data);
      setErrorMessage(null);
      setRefreshErrorBanner(null);
    } catch (err: unknown) {

      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }

      const errorText =
        err instanceof Error ? err.message : 'An unexpected error occurred while loading posts.';

      if (isPullToRefresh) {

        setRefreshErrorBanner(`Refresh failed: ${errorText}`);
      } else {
        setErrorMessage(errorText);
      }
    } finally {
      if (isPullToRefresh) {
        setIsRefreshing(false);
      } else {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchPosts(false);

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchPosts]);

  const handleRefresh = useCallback(() => {
    fetchPosts(true);
  }, [fetchPosts]);

  const handleCardPress = useCallback(
    (postId: number) => {
      navigation.navigate('Details', { postId });
    },
    [navigation]
  );

  /**
   * Render single post card
   */
  const renderPostCard = useCallback(
    ({ item }: { item: Post }) => (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={() => handleCardPress(item.id)}
        testID={`post-card-${item.id}`}
        accessibilityRole="button"
        accessibilityLabel={`Post number ${item.id}: ${item.title}`}
      >
        <View style={styles.cardHeader}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>#{item.id}</Text>
          </View>
          <View style={styles.authorBadge}>
            <Text style={styles.authorBadgeText}>User {item.userId}</Text>
          </View>
        </View>

        <Text style={styles.cardTitle} numberOfLines={2}>
          {item.title}
        </Text>

        <Text style={styles.cardPreview} numberOfLines={2}>
          {item.body.replace(/\n/g, ' ')}
        </Text>

        <View style={styles.cardFooter}>
          <Text style={styles.readMoreText}>View Post Details</Text>
          <Text style={styles.arrowIcon}>→</Text>
        </View>
      </TouchableOpacity>
    ),
    [handleCardPress]
  );

  const keyExtractor = useCallback((item: Post) => item.id.toString(), []);

  // Initial loading state
  if (isLoading && posts.length === 0) {
    return (
      <View style={styles.centerContainer} testID="loading-indicator">
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Fetching posts from JSONPlaceholder...</Text>
      </View>
    );
  }

  // Initial fetch failure state
  if (errorMessage && posts.length === 0) {
    return (
      <View style={styles.centerContainer} testID="error-container">
        <View style={styles.errorIconContainer}>
          <Text style={styles.errorIconText}>!</Text>
        </View>
        <Text style={styles.errorTitle}>Unable to Load Posts</Text>
        <Text style={styles.errorDescription}>{errorMessage}</Text>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => fetchPosts(false)}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Retry loading posts"
        >
          <Text style={styles.primaryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1D4ED8" />

      {refreshErrorBanner && (
        <View style={styles.bannerContainer}>
          <View style={styles.bannerContent}>
            <Text style={styles.bannerText}>{refreshErrorBanner}</Text>
            <TouchableOpacity
              onPress={() => setRefreshErrorBanner(null)}
              style={styles.bannerCloseButton}
              accessibilityRole="button"
              accessibilityLabel="Dismiss error banner"
            >
              <Text style={styles.bannerCloseText}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <FlatList
        data={posts}
        renderItem={renderPostCard}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={['#2563EB']}
            tintColor="#2563EB"
            title="Pull to refresh posts..."
            titleColor="#64748B"
          />
        }
        ListHeaderComponent={
          posts.length > 0 ? (
            <View style={styles.listHeader}>
              <Text style={styles.listHeaderTitle}>All Posts</Text>
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{posts.length} items</Text>
              </View>
            </View>
          ) : null
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No Posts Available</Text>
              <Text style={styles.emptyDescription}>
                The API returned an empty list of posts.
              </Text>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => fetchPosts(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.secondaryButtonText}>Refresh</Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 28,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  listHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  countBadge: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  badge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  authorBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  authorBadgeText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 22,
    marginBottom: 8,
    textTransform: 'capitalize',
  },
  cardPreview: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
  },
  readMoreText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563EB',
    marginRight: 4,
  },
  arrowIcon: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '700',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 14,
    fontSize: 15,
    color: '#475569',
    fontWeight: '500',
  },
  errorIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  errorIconText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#DC2626',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorDescription: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  primaryButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 10,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#EFF6FF',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  secondaryButtonText: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '600',
  },
  bannerContainer: {
    backgroundColor: '#FEF2F2',
    borderBottomWidth: 1,
    borderBottomColor: '#FECACA',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bannerText: {
    flex: 1,
    fontSize: 13,
    color: '#991B1B',
    fontWeight: '500',
    marginRight: 8,
  },
  bannerCloseButton: {
    padding: 4,
  },
  bannerCloseText: {
    color: '#991B1B',
    fontSize: 14,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 16,
  },
});

export default HomeScreen;
