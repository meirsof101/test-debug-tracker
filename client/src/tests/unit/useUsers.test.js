import { renderHook, waitFor } from '@testing-library/react';
import { useUsers } from '../../hooks/useUsers';

// Mock fetch
global.fetch = jest.fn();

describe('useUsers Hook', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('successfully fetches users', async () => {
    const mockUsers = [
      { id: 1, name: 'John Doe', email: 'john@example.com' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
    ];

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUsers,
    });

    const { result } = renderHook(() => useUsers());

    // Initially should be loading
    expect(result.current.loading).toBe(true);
    expect(result.current.users).toEqual([]);
    expect(result.current.error).toBe(null);

    // Wait for the fetch to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.users).toEqual(mockUsers);
    expect(result.current.error).toBe(null);
  });

  test('handles fetch error', async () => {
    fetch.mockRejectedValueOnce(new Error('Failed to fetch'));

    const { result } = renderHook(() => useUsers());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.users).toEqual([]);
    expect(result.current.error).toBe('Failed to fetch');
  });

  test('handles HTTP error response', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ message: 'Server error' }),
    });

    const { result } = renderHook(() => useUsers());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.users).toEqual([]);
    expect(result.current.error).toBe('Failed to fetch users');
  });
});