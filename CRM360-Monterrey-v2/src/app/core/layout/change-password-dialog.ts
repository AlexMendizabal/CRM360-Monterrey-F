import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ChangePasswordService } from '../services/change-password.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-change-password-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <h2 mat-dialog-title>Cambiar la contraseña</h2>

    <mat-dialog-content>
      <form [formGroup]="form" class="password-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Contraseña actual</mat-label>
          <input matInput [type]="hideCurrentPw ? 'password' : 'text'" formControlName="senha" autocomplete="current-password">
          <button mat-icon-button matSuffix type="button" (click)="hideCurrentPw = !hideCurrentPw">
            <mat-icon>{{ hideCurrentPw ? 'visibility_off' : 'visibility' }}</mat-icon>
          </button>
          @if (form.controls['senha'].hasError('required') && form.controls['senha'].touched) {
            <mat-error>Contraseña actual es obligatoria</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nueva contraseña</mat-label>
          <input matInput [type]="hideNewPw ? 'password' : 'text'" formControlName="novaSenha" autocomplete="new-password">
          <button mat-icon-button matSuffix type="button" (click)="hideNewPw = !hideNewPw">
            <mat-icon>{{ hideNewPw ? 'visibility_off' : 'visibility' }}</mat-icon>
          </button>
          @if (form.controls['novaSenha'].hasError('required') && form.controls['novaSenha'].touched) {
            <mat-error>Nueva contraseña es obligatoria</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Repita la nueva contraseña</mat-label>
          <input matInput [type]="hideConfirmPw ? 'password' : 'text'" formControlName="confirmarNovaSenha" autocomplete="new-password">
          <button mat-icon-button matSuffix type="button" (click)="hideConfirmPw = !hideConfirmPw">
            <mat-icon>{{ hideConfirmPw ? 'visibility_off' : 'visibility' }}</mat-icon>
          </button>
          @if (form.controls['confirmarNovaSenha'].hasError('required') && form.controls['confirmarNovaSenha'].touched) {
            <mat-error>Confirmar contraseña es obligatoria</mat-error>
          }
        </mat-form-field>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-flat-button color="primary" (click)="onConfirm()" [disabled]="!form.valid || loading">
        @if (loading) {
          <mat-spinner diameter="20" class="inline-spinner"></mat-spinner>
        } @else {
          Cambiar contraseña
        }
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .password-form {
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-width: 350px;
      padding-top: 8px;
    }
    .full-width {
      width: 100%;
    }
    .inline-spinner {
      display: inline-block;
    }
  `]
})
export class ChangePasswordDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<ChangePasswordDialogComponent>);
  private changePasswordService = inject(ChangePasswordService);

  hideCurrentPw = true;
  hideNewPw = true;
  hideConfirmPw = true;
  loading = false;

  form = this.fb.group({
    senha: ['', Validators.required],
    novaSenha: ['', Validators.required],
    confirmarNovaSenha: ['', Validators.required]
  });

  onConfirm() {
    if (!this.form.valid) return;
    this.loading = true;

    this.changePasswordService.changePassword(this.form.getRawValue() as any)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (response) => {
          if (response.status === 200) {
            this.dialogRef.close(true);
          }
        },
        error: (err) => {
          // Manejo de error visual se puede agregar después
          console.error('Error al cambiar contraseña:', err);
        }
      });
  }
}
