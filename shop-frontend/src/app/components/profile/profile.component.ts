import { Component, inject, signal, computed, EffectRef, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly currentUser = this.authService.currentUser;
  
  // Form signals
  protected readonly nameSignal = signal('');
  protected readonly contactSignal = signal('');
  protected readonly passwordSignal = signal('');
  protected readonly confirmPasswordSignal = signal('');

  protected readonly showPassword = signal(false);
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly successMessage = signal<string | null>(null);

  constructor() {
    // Redirect to login if not authenticated
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    // Prefill form from current user signal
    const user = this.currentUser();
    if (user) {
      this.nameSignal.set(user.name);
      this.contactSignal.set(user.contact || '');
    }
  }

  // Username validation: letters only, min 3
  protected readonly usernameError = computed(() => {
    const val = this.nameSignal().trim();
    if (!val) return null;
    if (val.length < 3) return 'Username must be at least 3 characters';
    if (!/^[a-zA-Z]+$/.test(val)) return 'Username must consist of only letters (no numbers or special characters)';
    return null;
  });

  // Password validation: min 8, 1 upper, 1 number, 1 special char (if typed)
  protected readonly passwordError = computed(() => {
    const val = this.passwordSignal();
    if (!val) return null;
    if (val.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(val)) return 'Password must contain at least one uppercase letter';
    if (!/[0-9]/.test(val)) return 'Password must contain at least one number';
    if (!/[^A-Za-z0-9]/.test(val)) return 'Password must contain at least one special character';
    return null;
  });

  // Confirm password validation
  protected readonly confirmPasswordError = computed(() => {
    const pass = this.passwordSignal();
    const conf = this.confirmPasswordSignal();
    if (!conf && !pass) return null;
    if (pass !== conf) return 'Passwords do not match';
    return null;
  });

  // Contact validation: starts with 6-9, exactly 10 digits
  protected readonly contactError = computed(() => {
    const val = this.contactSignal().trim();
    if (!val) return null;
    if (!/^[6-9]\d{9}$/.test(val)) return 'Contact number must start with 6-9 and be exactly 10 digits';
    return null;
  });

  togglePasswordVisibility(): void {
    this.showPassword.update(v => !v);
  }

  cancel(): void {
    this.router.navigate(['/dashboard']);
  }

  onSubmit(): void {
    const user = this.currentUser();
    if (!user) return;

    const name = this.nameSignal().trim();
    const contact = this.contactSignal().trim();
    const password = this.passwordSignal();
    const confirmPassword = this.confirmPasswordSignal();

    this.errorMessage.set(null);
    this.successMessage.set(null);

    // 1. Check required fields (username & contact)
    if (!name || !contact) {
      this.errorMessage.set('Invalid profile update: all fields must be entered.');
      return;
    }

    // 2. Validate Username
    if (!/^[a-zA-Z]+$/.test(name)) {
      this.errorMessage.set('Username must consist of only letters (no special characters or numbers).');
      return;
    }
    if (name.length < 3) {
      this.errorMessage.set('Username must be at least 3 characters long.');
      return;
    }

    // 3. Validate Contact
    if (!/^[6-9]\d{9}$/.test(contact)) {
      this.errorMessage.set('Contact number must start with 6-9 and be exactly 10 digits.');
      return;
    }

    // 4. Validate Password (if provided)
    if (password) {
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

      // Check passwords match
      if (password !== confirmPassword) {
        this.errorMessage.set('Passwords do not match.');
        return;
      }
    }

    this.isLoading.set(true);

    const payload: User = {
      id: user.id,
      name,
      contact,
      password: password || undefined
    };

    this.authService.updateProfile(user.name, payload).subscribe({
      next: (updated) => {
        this.isLoading.set(false);
        this.successMessage.set('Profile updated successfully!');
        this.passwordSignal.set('');
        this.confirmPasswordSignal.set('');
      },
      error: (err) => {
        this.isLoading.set(false);
        if (err.status === 409) {
          this.errorMessage.set('Username already exists. Please choose another username.');
        } else {
          const msg = typeof err.error === 'string' ? err.error : (err.error?.message || 'Failed to update profile.');
          this.errorMessage.set(msg);
        }
      }
    });
  }
}
