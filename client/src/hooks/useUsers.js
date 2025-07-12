// client/src/__tests__/unit/useUsers.test.js
import { renderHook, act } from '@testing-library/react';
import { useUsers } from '../../hooks/useUsers';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios;

describe('useUsers Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('fetches users successfully', async () => {
    const mockUsers = [
      { _id: '1', name: 'John Doe', email: 'john@example.com' }
    ];

    mockedAxios.get.mockResolvedValue({ data: mockUsers });

    const { result } = renderHook(() => useUsers());

    expect(result.current.loading).toBe(true);

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.users).toEqual(mockUsers);
    expect(result.current.error).toBe(null);
  });

  test('handles fetch error', async () => {
    mockedAxios.get.mockRejectedValue(new Error('Network Error'));

    const { result } = renderHook(() => useUsers());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.users).toEqual([]);
    expect(result.current.error).toBe('Network Error');
  });
});