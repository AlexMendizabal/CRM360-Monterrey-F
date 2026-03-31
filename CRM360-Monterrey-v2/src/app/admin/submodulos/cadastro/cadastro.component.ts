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
import { AdminSubmodulosService } from '../../services/admin-submodulos.service';
import { AdminModulosService } from '../../services/admin-modulos.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-admin-submodulos-cadastro',
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
export class AdminSubmodulosCadastroComponent implements OnInit {
  private service = inject(AdminSubmodulosService);
  private modulosService = inject(AdminModulosService);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  form: FormGroup = this.fb.group({
    id: [null],
    nome: ['', Validators.required],
    moduloId: ['', Validators.required],
    icone: ['', Validators.required],
    status: [1]
  });

  loading = true;
  saving = false;
  isEditMode = false;
  
  modulos: any[] = [];
  iconPreview = '';

  ngOnInit() {
    this.getModulos();

    // Listen to changes in the icone field to show preview
    this.form.get('icone')?.valueChanges.subscribe(val => {
      this.iconPreview = val || '';
    });

    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditMode = true;
      this.loadData(id);
    } else {
      this.loading = false;
    }
  }

  getModulos() {
    this.modulosService.getModulos({ inPagina: 0, orderBy: 'nome' }).subscribe({
      next: (res: any) => {
        if (res.status === 200 && res.body?.data) {
          this.modulos = res.body.data;
        }
      }
    });
  }

  loadData(id: string) {
    this.service.getSubModulos({ id })
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (response: any) => {
          if (response.status === 200 && response.body?.data?.length > 0) {
            this.form.patchValue(response.body.data[0]);
          } else {
            this.snackBar.open('Submódulo no encontrado.', 'Cerrar', { duration: 3000 });
            setTimeout(() => this.onCancel(), 0);
          }
        },
        error: () => {
          this.snackBar.open('Error al cargar el submódulo.', 'Cerrar', { duration: 3000 });
          setTimeout(() => this.onCancel(), 0);
        }
      });
  }

  onCancel() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  onSave() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    const payload = this.form.value;

    this.service.postSubModulo(payload)
      .pipe(finalize(() => this.saving = false))
      .subscribe({
        next: (response: any) => {
          if (response.status === 200) {
            this.snackBar.open('Submódulo guardado correctamente.', 'OK', { duration: 3000 });
            this.router.navigate(['../'], { relativeTo: this.route });
          } else {
            this.snackBar.open('Ocurrió un error al guardar.', 'Cerrar', { duration: 3000 });
          }
        },
        error: (err: any) => {
          const msg = err.error?.message || 'Error al conectar con el servidor.';
          this.snackBar.open(msg, 'Cerrar', { duration: 4000 });
        }
      });
  }
}
