// client/cypress/support/commands.js
Cypress.Commands.add('login', (email = 'john@example.com', password = 'password123') => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/auth/login`,
    body: { email, password }
  }).then((response) => {
    window.localStorage.setItem('token', response.body.token);
    window.localStorage.setItem('user', JSON.stringify(response.body.user));
  });
});

Cypress.Commands.add('seedDatabase', () => {
  cy.task('db:seed');
});

Cypress.Commands.add('clearDatabase', () => {
  cy.task('db:clear');
});