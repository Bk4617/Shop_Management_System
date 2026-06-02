import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // Component state
  protected readonly isLoginMode = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly successMessage = signal<string | null>(null);
  protected readonly isLoading = signal(false);
  protected readonly showPassword = signal(false);

  // Form Inputs using Signals
  protected readonly nameSignal = signal('');
  protected readonly passwordSignal = signal('');
  protected readonly contactSignal = signal('');

  // Username validation
  protected readonly usernameError = computed(() => {
    const val = this.nameSignal().trim();
    if (!val) return null;
    if (val.length < 3) return 'Username must be at least 3 characters';
    if (!/^[a-zA-Z0-9_]+$/.test(val)) return 'Username must be alphanumeric or underscores only';
    return null;
  });

  // Password validation
  protected readonly passwordError = computed(() => {
    const val = this.passwordSignal();
    if (!val) return null;
    if (val.length < 6) return 'Password must be at least 6 characters';
    return null;
  });

  // Password strength meter
  protected readonly passwordStrength = computed(() => {
    const val = this.passwordSignal();
    if (!val) return { score: 0, label: '', color: 'transparent' };
    
    let score = 0;
    if (val.length >= 6) score++;
    if (/[A-Z]/.test(val)) score++;
    if (/[0-9]/.test(val) || /[^A-Za-z0-9]/.test(val)) score++;

    if (score === 1) return { score: 1, label: 'Weak', color: '#ef4444' };
    if (score === 2) return { score: 2, label: 'Medium', color: '#eab308' };
    if (score === 3) return { score: 3, label: 'Strong', color: '#10b981' };
    return { score: 0, label: '', color: 'transparent' };
  });

  // Contact number validation
  protected readonly contactError = computed(() => {
    if (this.isLoginMode()) return null;
    const val = this.contactSignal().trim();
    if (!val) return null;
    if (!/^\d{10}$/.test(val)) return 'Contact number must be exactly 10 digits';
    return null;
  });

  // Check form validity
  protected readonly isFormInvalid = computed(() => {
    const name = this.nameSignal().trim();
    const pass = this.passwordSignal();
    if (this.isLoginMode()) {
      return !name || !pass || this.usernameError() !== null || this.passwordError() !== null;
    } else {
      const contact = this.contactSignal().trim();
      return !name || !pass || !contact || 
             this.usernameError() !== null || 
             this.passwordError() !== null || 
             this.contactError() !== null;
    }
  });

  constructor() {
    // If already authenticated, redirect directly to dashboard
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  // Toggle Mode
  toggleMode(mode: boolean): void {
    this.isLoginMode.set(mode);
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.resetForm();
  }

  togglePasswordVisibility(): void {
    this.showPassword.update(v => !v);
  }

  resetForm(): void {
    this.nameSignal.set('');
    this.passwordSignal.set('');
    this.contactSignal.set('');
  }

  // Submit Handler
  onSubmit(): void {
    const name = this.nameSignal().trim();
    const password = this.passwordSignal();
    const contact = this.contactSignal().trim();

    if (!name || !password) {
      this.errorMessage.set('Username and Password are required');
      return;
    }

    if (!this.isLoginMode() && !contact) {
      this.errorMessage.set('Contact number is required');
      return;
    }

    if (this.isFormInvalid()) {
      this.errorMessage.set('Please fix form validation errors before submitting.');
      return;
    }

    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.isLoading.set(true);

    const payload: User = {
      name,
      password,
      contact: this.isLoginMode() ? undefined : contact
    };

    if (this.isLoginMode()) {
      // Login flow
      this.authService.login(payload).subscribe({
        next: (user) => {
          this.isLoading.set(false);
          if (user) {
            this.router.navigate(['/dashboard']);
          } else {
            this.errorMessage.set('Invalid username or password');
          }
        },
        error: (err) => {
          this.isLoading.set(false);
          if (err.status === 401) {
            this.errorMessage.set('Invalid username or password');
          } else {
            const msg = typeof err.error === 'string' ? err.error : (err.error?.message || 'Server error. Please try again later.');
            this.errorMessage.set(msg);
          }
        }
      });
    } else {
      // Register flow
      this.authService.register(payload).subscribe({
        next: (user) => {
          this.isLoading.set(false);
          if (user) {
            this.successMessage.set('Registration successful! Please login.');
            this.toggleMode(true); // Switch to login mode
          } else {
            this.errorMessage.set('Username already exists');
          }
        },
        error: (err) => {
          this.isLoading.set(false);
          if (err.status === 409) {
            this.errorMessage.set('Username already exists');
          } else {
            const msg = typeof err.error === 'string' ? err.error : (err.error?.message || 'Registration failed. Try again.');
            this.errorMessage.set(msg);
          }
        }
      });
    }
  }
}
