import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Platform,
} from 'react-native';
import { getPostById } from '../services/api';
import { Post, DetailScreenProps } from '../types/post';

export const DetailScreen: React.FC<DetailScreenProps> = ({ route, navigation }) => {
  const rawPostId = route.params?.postId;
  const isValidId = typeof rawPostId === 'number' && !isNaN(rawPostId) && rawPostId > 0;

  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Fetch post details by ID with proper cleanup and cancellation
   */
  const loadPostDetails = useCallback(
    async (isPullToRefresh: boolean = false) => {
      if (!isValidId) {
        setIsLoading(false);
        setErrorMessage(`Invalid post ID parameter: "${String(rawPostId)}". A positive numeric ID is required.`);
        return;
      }

      // Cancel previous pending request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      if (isPullToRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
        setErrorMessage(null);
      }

      try {
        const fetchedPost = await getPostById(rawPostId, controller.signal);
        setPost(fetchedPost);
        setErrorMessage(null);
      } catch (err: unknown) {
        // Discard AbortError on unmount
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }

        const errorText =
          err instanceof Error
            ? err.message
            : `An unexpected error occurred while fetching post #${rawPostId}.`;

        setErrorMessage(errorText);
      } finally {
        if (isPullToRefresh) {
          setIsRefreshing(false);
        } else {
          setIsLoading(false);
        }
      }
    },
    [isValidId, rawPostId]
  );

  useEffect(() => {
    let isMounted = true;

    loadPostDetails(false);

    return () => {
      isMounted = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [loadPostDetails]);

  const handleRefresh = useCallback(() => {
    loadPostDetails(true);
  }, [loadPostDetails]);

  const handleGoBack = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Home');
    }
  }, [navigation]);

  // Invalid parameter state
  if (!isValidId) {
    return (
      <View style={styles.centerContainer} testID="invalid-id-container">
        <View style={styles.errorIconContainer}>
          <Text style={styles.errorIconText}>!</Text>
        </View>
        <Text style={styles.errorTitle}>Invalid Parameter</Text>
        <Text style={styles.errorDescription}>
          The requested post ID is invalid or missing. Please select a valid post from the list.
        </Text>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleGoBack}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Go back to posts list"
        >
          <Text style={styles.primaryButtonText}>← Back to Posts</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Loading state
  if (isLoading && !post) {
    return (
      <View style={styles.centerContainer} testID="detail-loading-indicator">
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Fetching post #{rawPostId}...</Text>
      </View>
    );
  }

  // Error state
  if (errorMessage && !post) {
    return (
      <View style={styles.centerContainer} testID="detail-error-container">
        <View style={styles.errorIconContainer}>
          <Text style={styles.errorIconText}>!</Text>
        </View>
        <Text style={styles.errorTitle}>Error Loading Post</Text>
        <Text style={styles.errorDescription}>{errorMessage}</Text>
        <View style={styles.errorActions}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => loadPostDetails(false)}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Retry fetching post details"
          >
            <Text style={styles.primaryButtonText}>Retry</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleGoBack}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Go back to posts"
          >
            <Text style={styles.secondaryButtonText}>← Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          colors={['#2563EB']}
          tintColor="#2563EB"
        />
      }
    >
      {/* Top Navigation & ID Badges */}
      <View style={styles.metaRow}>
        <View style={styles.idBadge}>
          <Text style={styles.idBadgeText}>Post #{post?.id}</Text>
        </View>
        <View style={styles.userBadge}>
          <Text style={styles.userBadgeText}>Author (User #{post?.userId})</Text>
        </View>
      </View>

      {/* Main Content Card */}
      <View style={styles.card}>
        <Text style={styles.label}>Title</Text>
        <Text style={styles.title}>{post?.title}</Text>

        <View style={styles.divider} />

        <Text style={styles.label}>Body</Text>
        <Text style={styles.body}>{post?.body}</Text>
      </View>

      {/* Metadata Card */}
      <View style={styles.metaCard}>
        <Text style={styles.metaCardTitle}>Post Information</Text>

        <View style={styles.metaItem}>
          <Text style={styles.metaItemLabel}>Post ID:</Text>
          <Text style={styles.metaItemValue}>{post?.id}</Text>
        </View>

        <View style={styles.metaItem}>
          <Text style={styles.metaItemLabel}>User / Author ID:</Text>
          <Text style={styles.metaItemValue}>{post?.userId}</Text>
        </View>

        <View style={styles.metaItem}>
          <Text style={styles.metaItemLabel}>Endpoint:</Text>
          <Text style={styles.metaItemValue}>/posts/{post?.id}</Text>
        </View>
      </View>

      {/* Back to Posts Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={handleGoBack}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Back to posts list"
      >
        <Text style={styles.backButtonText}>← Back to Posts</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
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
  errorActions: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    paddingHorizontal: 24,
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
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  secondaryButtonText: {
    color: '#334155',
    fontSize: 15,
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  idBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  idBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  userBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  userBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 28,
    textTransform: 'capitalize',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 16,
  },
  body: {
    fontSize: 16,
    color: '#334155',
    lineHeight: 26,
  },
  metaCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  metaCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  metaItemLabel: {
    fontSize: 13,
    color: '#64748B',
  },
  metaItemValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  backButton: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2563EB',
  },
});

export default DetailScreen;
