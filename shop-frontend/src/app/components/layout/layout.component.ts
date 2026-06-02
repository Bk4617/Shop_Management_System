import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent {
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // Expose current user for sidebar display
  protected readonly currentUser = this.authService.currentUser;

  // Profile Modal State
  protected readonly isProfileOpen = signal(false);
  protected readonly newPassword = signal('');
  protected readonly confirmPassword = signal('');
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly successMessage = signal<string | null>(null);

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  openProfile(): void {
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.newPassword.set('');
    this.confirmPassword.set('');
    this.isProfileOpen.set(true);
  }

  closeProfile(): void {
    this.isProfileOpen.set(false);
  }

  changePassword(): void {
    const user = this.currentUser();
    if (!user) return;

    const newPass = this.newPassword().trim();
    const confPass = this.confirmPassword().trim();

    if (!newPass || !confPass) {
      this.errorMessage.set('Please fill out all password fields');
      return;
    }

    if (newPass !== confPass) {
      this.errorMessage.set('Passwords do not match');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.authService.changePassword(user.name, newPass).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.successMessage.set('Password changed successfully!');
        this.newPassword.set('');
        this.confirmPassword.set('');
      },
      error: (err) => {
        this.isLoading.set(false);
        const msg = typeof err.error === 'string' ? err.error : (err.error?.message || 'Failed to change password');
        this.errorMessage.set(msg);
      }
    });
  }
}
