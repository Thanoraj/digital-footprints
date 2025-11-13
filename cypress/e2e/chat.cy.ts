describe('Ecomate E2E Tests', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should load the application', () => {
    cy.contains('Ecomate').should('be.visible');
  });

  it('should create a new session', () => {
    cy.get('[data-testid="new-session-button"]').click();
    cy.contains('New Chat').should('be.visible');
  });

  it('should send a message and receive a response', () => {
    // Create new session
    cy.get('[data-testid="new-session-button"]').click();
    
    // Type and send message
    cy.get('[data-testid="chat-input"]').type('Hello, how are you?');
    cy.get('[data-testid="send-button"]').click();
    
    // Check user message appears
    cy.get('[data-testid="message-user"]').should('contain', 'Hello, how are you?');
    
    // Wait for assistant response
    cy.get('[data-testid="message-assistant"]', { timeout: 10000 }).should('exist');
  });

  it('should display metrics for current session', () => {
    cy.get('[data-testid="metric-tokens"]').should('be.visible');
    cy.get('[data-testid="metric-energy"]').should('be.visible');
    cy.get('[data-testid="metric-carbon"]').should('be.visible');
    cy.get('[data-testid="metric-water"]').should('be.visible');
  });

  it('should update settings', () => {
    cy.get('[data-testid="model-size-select"]').click();
    cy.contains('Large (GPT-4/Ultra)').click();
    
    cy.get('[data-testid="energy-mix-select"]').click();
    cy.contains('Renewables (Hydro/Solar)').click();
  });

  it('should switch between sessions', () => {
    // Create first session
    cy.get('[data-testid="new-session-button"]').click();
    cy.get('[data-testid="chat-input"]').type('First session message');
    cy.get('[data-testid="send-button"]').click();
    
    // Create second session
    cy.get('[data-testid="new-session-button"]').click();
    cy.get('[data-testid="chat-input"]').type('Second session message');
    cy.get('[data-testid="send-button"]').click();
    
    // Switch back to first session
    cy.contains('First session message').click();
    cy.get('[data-testid="message-user"]').should('contain', 'First session message');
  });

  it('should delete a session', () => {
    // Create session
    cy.get('[data-testid="new-session-button"]').click();
    
    // Delete button should appear on hover
    cy.get('[data-testid^="delete-session"]').first().click({ force: true });
    
    // Confirm deletion in dialog
    cy.on('window:confirm', () => true);
  });

  it('should be responsive on mobile', () => {
    cy.viewport('iphone-x');
    cy.contains('Ecomate').should('be.visible');
    cy.get('[data-testid="chat-input"]').should('be.visible');
  });
});


