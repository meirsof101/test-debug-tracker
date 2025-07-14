import React from 'react';
import { render, screen } from '@testing-library/react';
import UserList from '../../components/UserList';

// Mock the useUsers hook
jest.mock('../../hooks/useUsers', () => ({
  useUsers: jest.fn()
}));

const { useUsers } = require('../../hooks/useUsers');

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
      error: 'Failed to fetch'
    });

    render(<UserList />);
    expect(screen.getByText('Error: Failed to fetch')).toBeInTheDocument();
  });

  test('renders users list', () => {
    const mockUsers = [
      { id: 1, name: 'John Doe', email: 'john@example.com' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
    ];

    useUsers.mockReturnValue({
      users: mockUsers,
      loading: false,
      error: null
    });

    render(<UserList />);
    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText('John Doe - john@example.com')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith - jane@example.com')).toBeInTheDocument();
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