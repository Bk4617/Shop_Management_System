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
  protected readonly confirmPasswordSignal = signal('');
  protected readonly contactSignal = signal('');

  // Username validation: letters only, min 3 characters
  protected readonly usernameError = computed(() => {
    const val = this.nameSignal().trim();
    if (!val) return null;
    if (val.length < 3) return 'Username must be at least 3 characters';
    if (!/^[a-zA-Z]+$/.test(val)) return 'Username must consist of only letters (no numbers or special characters)';
    return null;
  });

  // Password validation: 8 chars, 1 number, 1 upper, 1 special char (only in register mode)
  protected readonly passwordError = computed(() => {
    const val = this.passwordSignal();
    if (!val) return null;
    if (this.isLoginMode()) {
      if (val.length < 6) return 'Password must be at least 6 characters';
    } else {
      if (val.length < 8) return 'Password must be at least 8 characters';
      if (!/[A-Z]/.test(val)) return 'Password must contain at least one uppercase letter';
      if (!/[0-9]/.test(val)) return 'Password must contain at least one number';
      if (!/[^A-Za-z0-9]/.test(val)) return 'Password must contain at least one special character';
    }
    return null;
  });

  // Confirm password validation
  protected readonly confirmPasswordError = computed(() => {
    if (this.isLoginMode()) return null;
    const pass = this.passwordSignal();
    const conf = this.confirmPasswordSignal();
    if (!conf) return null;
    if (pass !== conf) return 'Passwords do not match';
    return null;
  });

  // Password strength meter
  protected readonly passwordStrength = computed(() => {
    const val = this.passwordSignal();
    if (!val) return { score: 0, label: '', color: 'transparent' };
    
    let score = 0;
    if (val.length >= 8) score++;
    if (/[A-Z]/.test(val)) score++;
    if (/[0-9]/.test(val) && /[^A-Za-z0-9]/.test(val)) score++;

    if (score === 1) return { score: 1, label: 'Weak', color: '#ef4444' };
    if (score === 2) return { score: 2, label: 'Medium', color: '#eab308' };
    if (score === 3) return { score: 3, label: 'Strong', color: '#10b981' };
    return { score: 0, label: '', color: 'transparent' };
  });

  // Contact number validation: starts with 6-9, exactly 10 digits
  protected readonly contactError = computed(() => {
    if (this.isLoginMode()) return null;
    const val = this.contactSignal().trim();
    if (!val) return null;
    if (!/^[6-9]\d{9}$/.test(val)) return 'Contact number must start with 6-9 and be exactly 10 digits';
    return null;
  });

  // Check form validity (unused for disabling, we handle in onSubmit to show error alerts)
  protected readonly isFormInvalid = computed(() => {
    return false;
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
    this.confirmPasswordSignal.set('');
    this.contactSignal.set('');
  }

  // Submit Handler
  onSubmit(): void {
    const name = this.nameSignal().trim();
    const password = this.passwordSignal();
    const confirmPassword = this.confirmPasswordSignal();
    const contact = this.contactSignal().trim();

    this.errorMessage.set(null);
    this.successMessage.set(null);

    if (this.isLoginMode()) {
      // Login validation
      if (!name || !password) {
        this.errorMessage.set('Username and Password are required');
        return;
      }

      this.isLoading.set(true);
      const payload: User = { name, password };

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
      // Register validation
      // 1. Check if any field is not entered
      if (!name || !password || !confirmPassword || !contact) {
        this.errorMessage.set('Invalid account creation: all fields must be entered.');
        return;
      }

      // 2. Validate Username (letters only)
      if (!/^[a-zA-Z]+$/.test(name)) {
        this.errorMessage.set('Username must consist of only letters (no special characters or numbers).');
        return;
      }
      if (name.length < 3) {
        this.errorMessage.set('Username must be at least 3 characters long.');
        return;
      }

      // 3. Validate Password (8 chars, 1 number, 1 upper case, 1 special char)
      if (password.length < 8) {
        this.errorMessage.set('Password must be at least 8 characters long.');
        return;
      }
      if (!/[A-Z]/.test(password)) {
        this.errorMessage.set('Password must contain at least one uppercase letter.');
        return;
      }
      if (!/[0-9]/.test(password)) {
        this.errorMessage.set('Password must contain at least one number.');
        return;
      }
      if (!/[^A-Za-z0-9]/.test(password)) {
        this.errorMessage.set('Password must contain at least one special character.');
        return;
      }

      // 4. Validate Passwords match
      if (password !== confirmPassword) {
        this.errorMessage.set('Passwords do not match.');
        return;
      }

      // 5. Validate Contact number (starts with 6-9, exactly 10 digits)
      if (!/^[6-9]\d{9}$/.test(contact)) {
        this.errorMessage.set('Contact number must start with 6-9 and be exactly 10 digits.');
        return;
      }

      this.isLoading.set(true);
      const payload: User = { name, password, contact };

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

