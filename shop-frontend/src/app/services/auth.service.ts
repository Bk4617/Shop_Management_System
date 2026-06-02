import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface User {
  id?: number;
  name: string;
  password?: string;
  contact?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = 'http://localhost:8081/api/users';
  
  // State management using Signals
  private readonly currentUserSignal = signal<User | null>(null);
  
  // Expose read-only state
  public readonly currentUser = this.currentUserSignal.asReadonly();
  public readonly isAuthenticated = computed(() => this.currentUserSignal() !== null);

  constructor(private http: HttpClient) {
    // Check localStorage on service initialization
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        this.currentUserSignal.set(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('currentUser');
      }
    }
  }

  // Register User
  register(user: User): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/register`, user);
  }

  // Login User
  login(user: User): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/login`, user).pipe(
      tap(loggedUser => {
        if (loggedUser) {
          localStorage.setItem('currentUser', JSON.stringify(loggedUser));
          this.currentUserSignal.set(loggedUser);
        }
      })
    );
  }

  // Logout User
  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSignal.set(null);
  }

  // Change Password
  changePassword(username: string, newPassword: string): Observable<any> {
    const params = { username, newPassword };
    return this.http.put<any>(`${this.apiUrl}/change-password`, null, { params }).pipe(
      tap(() => {
        const currentUser = this.currentUserSignal();
        if (currentUser && currentUser.name === username) {
          currentUser.password = newPassword;
          localStorage.setItem('currentUser', JSON.stringify(currentUser));
          this.currentUserSignal.set({ ...currentUser });
        }
      })
    );
  }
}
