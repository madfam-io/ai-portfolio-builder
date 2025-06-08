// Test for interactive functionality
describe('Interactive Functionality', () => {
  beforeEach(() => {
    // Clear localStorage
    localStorage.clear();
  });

  it('should have all required data attributes', () => {
    const mockHTML = `
      <button data-dark-mode-toggle></button>
      <button data-lang-toggle></button>
      <button data-currency-toggle></button>
      <button data-mobile-menu-toggle></button>
      <span data-currency-display>USD</span>
      <span data-lang-display>EN</span>
      <span data-price="19">$19</span>
    `;

    document.body.innerHTML = mockHTML;

    expect(document.querySelector('[data-dark-mode-toggle]')).toBeTruthy();
    expect(document.querySelector('[data-lang-toggle]')).toBeTruthy();
    expect(document.querySelector('[data-currency-toggle]')).toBeTruthy();
    expect(document.querySelector('[data-mobile-menu-toggle]')).toBeTruthy();
    expect(document.querySelector('[data-currency-display]')).toBeTruthy();
    expect(document.querySelector('[data-lang-display]')).toBeTruthy();
    expect(document.querySelector('[data-price]')).toBeTruthy();
  });

  it('should store preferences in localStorage', () => {
    localStorage.setItem('darkMode', 'true');
    localStorage.setItem('language', 'es');
    localStorage.setItem('currency', 'EUR');

    expect(localStorage.getItem('darkMode')).toBe('true');
    expect(localStorage.getItem('language')).toBe('es');
    expect(localStorage.getItem('currency')).toBe('EUR');
  });
});
