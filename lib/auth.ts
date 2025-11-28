export function setAuthToken(token: string) {
  localStorage.setItem('admin_token', token);
}

export function getAuthToken(): string | null {
  return localStorage.getItem('admin_token');
}

export function removeAuthToken() {
  localStorage.removeItem('admin_token');
  localStorage.removeItem('admin_user');
}

export function setAuthUser(user: any) {
  localStorage.setItem('admin_user', JSON.stringify(user));
}

export function getAuthUser(): any | null {
  const user = localStorage.getItem('admin_user');
  return user ? JSON.parse(user) : null;
}

export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

export function isAdmin(): boolean {
  const user = getAuthUser();
  return user?.isAdmin === true;
}

