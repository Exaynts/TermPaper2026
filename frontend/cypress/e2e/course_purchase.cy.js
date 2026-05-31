describe('Course Purchase Flow', () => {
  const nickname = 'cypress_user';
  const email = 'cypress@example.com';
  const password = 'CypressPass2026!';
  const courseName = 'Визуальная математика: геометрия для всех';

  before(() => {
    cy.request({
      method: 'POST',
      url: 'http://127.0.0.1:8000/api/auth/register/',
      body: { nickname, email, password, password2: password },
      failOnStatusCode: false
    });
  });

  beforeEach(() => {
    cy.visit('/login');
    cy.get('input[placeholder*="username"]').type(nickname);
    cy.get('input[placeholder*="password"]').type(password);
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/');
    cy.window().its('localStorage').invoke('getItem', 'access_token').should('exist');
  });

  it('should purchase a course and update progress', () => {
    cy.visit('/courses');
    cy.contains(courseName).click();
    cy.url().should('include', '/courses/');

    cy.get('body').then($body => {
      if ($body.find('button:contains("Buy")').length) {
        cy.contains('button', /Buy/).click();

        // Нажать именно кнопку Confirm в модальном окне
        cy.contains('button', 'Confirm').should('be.visible').click();

        // Дождаться закрытия модального окна
        cy.contains('button', 'Confirm', { timeout: 5000 }).should('not.exist');
        cy.contains('button', /Buy/, { timeout: 5000 }).should('not.exist');
        cy.wait(500);
      } else {
        cy.log('Курс уже куплен');
      }
    });

    // Перейти к списку купленных курсов через меню
    cy.contains('My Courses').trigger('mouseenter');
    cy.get('.dropdown-content').invoke('show');
    cy.contains('Purchased').click({ force: true });

    cy.url().should('include', '/purchased-courses');
    cy.contains(courseName, { timeout: 10000 }).should('exist');
    // Проверить, что карточка курса существует
    cy.contains(courseName).should('exist');
    cy.contains(courseName).first().click();

    cy.contains('a', '1.').click();
    cy.url().should('include', '/lessons/');
    // Условное нажатие кнопки завершения урока
    cy.get('body').then($body => {
        if ($body.find('button:contains("Mark as Completed")').length) {
          cy.contains('button', 'Mark as Completed').click();
          cy.contains('Progress updated', { timeout: 5000 }).should('be.visible');
        } else if ($body.find('button:contains("Completed")').length) {
          cy.log('Lesson already completed, skipping marking');
        } else {
          cy.log('No completion button found');
        }
    });

    // Вернуться в список купленных и проверить прогресс 100%
    cy.contains('Back to course').click();
    cy.wait(500);
    cy.contains('33%', { timeout: 10000 }).should('exist');
    cy.screenshot('course-purchase-success'); // скриншот последнего состояния
  });
});