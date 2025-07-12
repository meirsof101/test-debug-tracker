// client/cypress/e2e/user-management.cy.js
describe('User Management', () => {
  beforeEach(() => {
    // Reset database state
    cy.task('db:seed');
    cy.visit('/');
  });

  it('should display list of users', () => {
    cy.get('[data-testid="user-list"]').should('exist');
    cy.get('[data-testid="user-item"]').should('have.length.greaterThan', 0);
    
    // Check specific user data
    cy.get('[data-testid="user-item"]').first().should('contain', 'John Doe');
    cy.get('[data-testid="user-item"]').first().should('contain', 'john@example.com');
  });

  it('should create a new user', () => {
    // Fill out the form
    cy.get('[data-testid="name-input"]').type('New User');
    cy.get('[data-testid="email-input"]').type('newuser@example.com');
    cy.get('[data-testid="password-input"]').type('Password123!');
    
    // Submit the form
    cy.get('[data-testid="submit-button"]').click();
    
    // Verify success message
    cy.get('[data-testid="success-message"]').should('contain', 'User created successfully');
    
    // Verify user appears in list
    cy.get('[data-testid="user-list"]').should('contain', 'New User');
    cy.get('[data-testid="user-list"]').should('contain', 'newuser@example.com');
  });

  it('should show validation errors for invalid form data', () => {
    // Submit empty form
    cy.get('[data-testid="submit-button"]').click();
    
    // Check for validation errors
    cy.get('[data-testid="name-error"]').should('contain', 'Name is required');
    cy.get('[data-testid="email-error"]').should('contain', 'Email is required');
    cy.get('[data-testid="password-error"]').should('contain', 'Password is required');
  });

  it('should handle duplicate email error', () => {
    // Try to create user with existing email
    cy.get('[data-testid="name-input"]').type('Duplicate User');
    cy.get('[data-testid="email-input"]').type('john@example.com');
    cy.get('[data-testid="password-input"]').type('Password123!');
    
    cy.get('[data-testid="submit-button"]').click();
    
    // Verify error message
    cy.get('[data-testid="error-message"]').should('contain', 'Email already exists');
  });

  it('should filter users by search term', () => {
    // Type in search box
    cy.get('[data-testid="search-input"]').type('John');
    
    // Verify filtered results
    cy.get('[data-testid="user-item"]').should('have.length', 1);
    cy.get('[data-testid="user-item"]').should('contain', 'John Doe');
  });

  it('should handle network errors gracefully', () => {
    // Intercept API call and force network error
    cy.intercept('GET', '/api/users', { forceNetworkError: true }).as('getUsersError');
    
    cy.visit('/');
    
    // Wait for the failed request
    cy.wait('@getUsersError');
    
    // Verify error message is displayed
    cy.get('[data-testid="error-message"]').should('contain', 'Failed to load users');
  });
});