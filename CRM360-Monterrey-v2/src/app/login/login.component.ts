import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatSnackBarModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  form: FormGroup = this.fb.group({
    usuario: ['', Validators.required],
    senha: ['', Validators.required]
  });

  // Modern Angular Signals out-of-the-box UI state management
  passwordType = signal<'password' | 'text'>('password');
  waitingLoginResponse = signal<boolean>(false);

  togglePasswordVisibility() {
    this.passwordType.update(type => type === 'password' ? 'text' : 'password');
  }

  onLogoClienteError(event: any) {
    event.target.src = 'images/logo/crm-360.png';
  }

  onSubmit() {
    if (this.form.invalid) return;

    this.waitingLoginResponse.set(true);
    const { usuario, senha } = this.form.value;

    this.authService.login(usuario, senha).subscribe({
      next: (response) => {
        this.waitingLoginResponse.set(false);
        if (response.success) {
          this.snackBar.open('Inicio de sesión exitoso', 'Cerrar', { duration: 3000 });
          this.router.navigate(['/dashboard']);
        } else {
          this.snackBar.open('Las credenciales son incorrectas', 'Cerrar', { duration: 5000 });
        }
      },
      error: () => {
        this.waitingLoginResponse.set(false);
        this.snackBar.open('Error al contactar al servidor de autenticación', 'Cerrar', { duration: 5000 });
      }
    });
  }
}
