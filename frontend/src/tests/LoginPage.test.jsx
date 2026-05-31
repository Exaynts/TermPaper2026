import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from '../components/pages/LoginPage.jsx';
import { AuthProvider } from '../contexts/AuthContext.jsx';

// Мокаем login, возвращаем успешный результат
const mockLogin = vi.fn().mockResolvedValue({ success: true });

// Мокаем весь модуль контекста, но оставляем AuthProvider (просто возвращаем детей)
vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ login: mockLogin }),
  AuthProvider: ({ children }) => <>{children}</>,
}));

test('LoginPage submits form with correct data', async () => {
  render(
    <BrowserRouter>
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    </BrowserRouter>
  );

  fireEvent.change(screen.getByPlaceholderText(/username or email/i), {
    target: { value: 'testuser' },
  });
  fireEvent.change(screen.getByPlaceholderText(/password/i), {
    target: { value: 'testpass' },
  });

  // Найти кнопку по точному тексту и тегу button
  const signInButton = screen.getByText('Sign in', { selector: 'button' });
  fireEvent.click(signInButton);

  await waitFor(() => {
    expect(mockLogin).toHaveBeenCalledWith('testuser', 'testpass');
  });
});