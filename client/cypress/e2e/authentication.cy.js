// client/cypress/e2e/authentication.cy.js
describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.task('db:seed');
  });

  it('should login successfully with valid credentials', () => {
    cy.visit('/login');
    
    cy.get('[data-testid="email-input"]').type('john@example.com');
    cy.get('[data-testid="password-input"]').type('password123');
    cy.get('[data-testid="login-button"]').click();
    
    // Should redirect to dashboard
    cy.url().should('include', '/dashboard');
    cy.get('[data-testid="user-greeting"]').should('contain', 'Welcome, John Doe');
  });

  it('should show error for invalid credentials', () => {
    cy.visit('/login');
    
    cy.get('[data-testid="email-input"]').type('invalid@example.com');
    cy.get('[data-testid="password-input"]').type('wrongpassword');
    cy.get('[data-testid="login-button"]').click();
    
    cy.get('[data-testid="error-message"]').should('contain', 'Invalid credentials');
  });

  it('should register a new user', () => {
    cy.visit('/register');
    
    cy.get('[data-testid="name-input"]').type('New User');
    cy.get('[data-testid="email-input"]').type('newuser@example.com');
    cy.get('[data-testid="password-input"]').type('Password123!');
    cy.get('[data-testid="confirm-password-input"]').type('Password123!');
    cy.get('[data-testid="register-button"]').click();
    
    // Should redirect to login with success message
    cy.url().should('include', '/login');
    cy.get('[data-testid="success-message"]').should('contain', 'Registration successful');
  });

  it('should logout successfully', () => {
    // Login first
    cy.visit('/login');
    cy.get('[data-testid="email-input"]').type('john@example.com');
    cy.get('[data-testid="password-input"]').type('password123');
    cy.get('[data-testid="login-button"]').click();
    
    // Logout
    cy.get('[data-testid="logout-button"]').click();
    
    // Should redirect to login page
    cy.url().should('include', '/login');
    cy.get('[data-testid="login-form"]').should('exist');
  });

  it('should protect routes when not authenticated', () => {
    cy.visit('/dashboard');
    
    // Should redirect to login
    cy.url().should('include', '/login');
    cy.get('[data-testid="error-message"]').should('contain', 'Please login to access this page');
  });
});