describe('Auth Flow', () => {
  it('should register a new user', () => {
    cy.visit('http://localhost:3000/register');
    cy.get('input[name=name]').type('Cypress User');
    cy.get('input[name=email]').type('cypress@example.com');
    cy.get('input[name=password]').type('password123');
    cy.get('button[type=submit]').click();

    cy.contains('Welcome, Cypress User');
  });
});
