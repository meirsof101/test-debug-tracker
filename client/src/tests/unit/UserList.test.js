// client/src/__tests__/unit/UserList.test.js
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import UserList from '../../components/UserList';
import { useUsers } from '../../hooks/useUsers';

// Mock the custom hook
jest.mock('../../hooks/useUsers');

describe('UserList Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders loading state', () => {
    useUsers.mockReturnValue({
      users: [],
      loading: true,
      error: null
    });

    render(<UserList />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('renders error state', () => {
    useUsers.mockReturnValue({
      users: [],
      loading: false,
      error: 'Failed to fetch users'
    });

    render(<UserList />);
    expect(screen.getByText('Error: Failed to fetch users')).toBeInTheDocument();
  });

  test('renders users list', async () => {
    const mockUsers = [
      { _id: '1', name: 'John Doe', email: 'john@example.com' },
      { _id: '2', name: 'Jane Smith', email: 'jane@example.com' }
    ];

    useUsers.mockReturnValue({
      users: mockUsers,
      loading: false,
      error: null
    });

    render(<UserList />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  test('renders empty state when no users', () => {
    useUsers.mockReturnValue({
      users: [],
      loading: false,
      error: null
    });

    render(<UserList />);
    expect(screen.getByText('No users found')).toBeInTheDocument();
  });
});