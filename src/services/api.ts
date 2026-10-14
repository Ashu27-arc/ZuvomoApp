import { Post } from '../types/post';

const BASE_URL = 'https://jsonplaceholder.typicode.com';

/**
 * Custom API Error class to preserve HTTP status code and detailed error messages
 */
export class ApiError extends Error {
  public status?: number;
  public isNetworkError: boolean;

  constructor(message: string, status?: number, isNetworkError: boolean = false) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.isNetworkError = isNetworkError;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

/**
 * Type guard to validate whether an unknown object adheres to the Post schema
 */
function isPost(data: unknown): data is Post {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const candidate = data as Record<string, unknown>;
  return (
    typeof candidate.id === 'number' &&
    typeof candidate.userId === 'number' &&
    typeof candidate.title === 'string' &&
    typeof candidate.body === 'string'
  );
}

/**
 * Type guard to validate an array of Post items
 */
function isPostArray(data: unknown): data is Post[] {
  return Array.isArray(data) && data.every(isPost);
}

/**
 * Fetches all posts from the JSONPlaceholder API.
 *
 * @param signal Optional AbortSignal to cancel pending requests when unmounting
 * @returns Promise<Post[]>
 * @throws ApiError when an HTTP, network, or schema validation error occurs
 */
export async function getPosts(signal?: AbortSignal): Promise<Post[]> {
  const url = `${BASE_URL}/posts`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal,
    });

    if (!response.ok) {
      throw new ApiError(
        `Failed to fetch posts: HTTP ${response.status} (${response.statusText || 'Error'})`,
        response.status
      );
    }

    let data: unknown;
    try {
      data = await response.json();
    } catch {
      throw new ApiError('Invalid JSON response received from server.');
    }

    if (!isPostArray(data)) {
      throw new ApiError('Unexpected response format: expected a list of posts.');
    }

    return data;
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw error;
      }
      throw new ApiError(
        `Network error: ${error.message || 'Unable to connect to the server. Please check your internet connection.'}`,
        undefined,
        true
      );
    }

    throw new ApiError('An unexpected error occurred while fetching posts.');
  }
}

/**
 * Fetches a single post by ID from the JSONPlaceholder API.
 *
 * @param id The post ID to retrieve
 * @param signal Optional AbortSignal to cancel pending requests when unmounting
 * @returns Promise<Post>
 * @throws ApiError when an HTTP, network, or schema validation error occurs
 */
export async function getPostById(id: number, signal?: AbortSignal): Promise<Post> {
  if (typeof id !== 'number' || isNaN(id) || id <= 0) {
    throw new ApiError(`Invalid post ID requested: ${id}`);
  }

  const url = `${BASE_URL}/posts/${id}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal,
    });

    if (response.status === 404) {
      throw new ApiError(`Post with ID #${id} was not found.`, 404);
    }

    if (!response.ok) {
      throw new ApiError(
        `Failed to fetch post #${id}: HTTP ${response.status} (${response.statusText || 'Error'})`,
        response.status
      );
    }

    let data: unknown;
    try {
      data = await response.json();
    } catch {
      throw new ApiError('Invalid JSON response received from server.');
    }

    if (!isPost(data)) {
      throw new ApiError('Unexpected response format: invalid post structure.');
    }

    return data;
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw error;
      }
      throw new ApiError(
        `Network error: ${error.message || 'Unable to connect to the server. Please check your internet connection.'}`,
        undefined,
        true
      );
    }

    throw new ApiError(`An unexpected error occurred while fetching post #${id}.`);
  }
}
