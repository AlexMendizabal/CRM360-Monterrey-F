import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { AdminModulosService } from '../../services/admin-modulos.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-admin-modulos-cadastro',
  standalone: true,
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatSnackBarModule, MatProgressSpinnerModule, MatDividerModule
  ],
  templateUrl: './cadastro.component.html',
  styleUrl: './cadastro.component.scss'
})
export class AdminModulosCadastroComponent implements OnInit {
  private service = inject(AdminModulosService);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  form: FormGroup = this.fb.group({
    id: [null],
    icone: ['', Validators.required],
    nome: ['', Validators.required],
    rota: ['', Validators.required],
    situacao: [1]
  });

  loading = true;
  saving = false;
  isEditMode = false;

  // Icon reference links for the user
  iconReferences = [
    { name: 'Font Awesome 5 (Free)', url: 'https://fontawesome.com/v5/search?m=free', description: 'Usa clases como "fas fa-home"' },
    { name: 'Material Icons', url: 'https://fonts.google.com/icons', description: 'Usa nombres simples como "home"' }
  ];

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditMode = true;
      this.loadModulo(id);
    } else {
      this.loading = false;
    }
  }

  loadModulo(id: string) {
    this.loading = true;
    this.service.getModulos({ id })
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (response: any) => {
          if (response.status === 200 && response.body?.data?.[0]) {
            this.form.patchValue(response.body.data[0]);
          }
        },
        error: () => {
          this.snackBar.open('Error al cargar el módulo.', 'Cerrar', { duration: 3000 });
          this.router.navigate(['../'], { relativeTo: this.route });
        }
      });
  }

  onSave() {
    if (!this.form.valid) return;

    this.saving = true;
    this.service.postModulo(this.form.value)
      .pipe(finalize(() => this.saving = false))
      .subscribe({
        next: () => {
          this.snackBar.open('Módulo guardado correctamente.', 'OK', { duration: 3000 });
          this.router.navigate(['../'], { relativeTo: this.route });
        },
        error: (err: any) => {
          const msg = err.error?.message || 'Error al guardar el módulo.';
          this.snackBar.open(msg, 'Cerrar', { duration: 5000 });
        }
      });
  }

  get isFaIcon(): boolean {
    const icone = this.form.value.icone;
    return icone && icone.includes(' ');
  }
}
