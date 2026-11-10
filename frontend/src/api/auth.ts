
export type AuthSession = {
  authenticated: boolean;
  username: string | null;
};


//region Cross-Site Request Forgery Token
function getCsrfToken(): string {
  const token = document.cookie
    .split('; ')
    .find(cookie => cookie.startsWith('csrftoken='))
    ?.split('=')[1];

  if (!token) {
    throw new Error('Cross-Site Request Forgery token missing.');
  }

  return decodeURIComponent(token);
}
//endregion


//region Check Session
export async function getSession(): Promise<AuthSession> {
  const response = await fetch('/api/auth/session/', {
    credentials: 'same-origin'
  });

  if (!response.ok) {
    throw new Error('Failed to check authentication session.');
  }

  return response.json();
}
//endregion


//region Login
export async function loginUser(
  username: string,
  password: string
): Promise<AuthSession> {

  const response = await fetch('/api/auth/login/', {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCsrfToken()
    },
    body: JSON.stringify({ username, password })
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Invalid username or password.');
    }

    throw new Error(`Login failed: ${response.status}`);
  }

  return response.json();
}
//endregion


//region Logout
export async function logoutUser(): Promise<AuthSession> {
  const response = await fetch('/api/auth/logout/', {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'X-CSRFToken': getCsrfToken()
    }
  });

  if (!response.ok) {
    throw new Error(`Logout failed: ${response.status}`);
  }

  return response.json();
}
//endregion
