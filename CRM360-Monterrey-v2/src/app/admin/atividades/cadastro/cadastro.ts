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
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AdminAtividadesService } from '../services/admin-atividades.service';
import { AdminModulosService } from '../../services/admin-modulos.service';
import { AdminSubmodulosService } from '../../services/admin-submodulos.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-admin-atividades-cadastro',
  standalone: true,
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatCheckboxModule, MatSnackBarModule, MatProgressSpinnerModule,
    MatDividerModule, MatTooltipModule
  ],
  templateUrl: './cadastro.html',
  styleUrl: './cadastro.scss'
})
export class AdminAtividadesCadastroComponent implements OnInit {
  private service = inject(AdminAtividadesService);
  private modulosService = inject(AdminModulosService);
  private submodulosService = inject(AdminSubmodulosService);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  form: FormGroup = this.fb.group({
    id: [null],
    icone: ['', Validators.required],
    nome: ['', Validators.required],
    moduloId: ['', Validators.required],
    submoduloId: ['', Validators.required],
    tipoAtividadeId: ['', Validators.required],
    rota: [''],
    url: [''],
    exibeSidebar: [false],
    exibeNovaAba: [false],
    descricao: ['', Validators.required],
    situacao: [1]
  });

  loading = true;
  saving = false;
  isEditMode = false;

  modulos: any[] = [];
  submodulos: any[] = [];
  tiposAtividade: any[] = [];

  // Referencia de íconos para el usuario
  iconReferences = [
    { name: 'Font Awesome 5 (Free)', url: 'https://fontawesome.com/v5/search?m=free', description: 'Íconos usados en CRM360 v1 — usa clases como "fas fa-home"' },
    { name: 'Font Awesome 6 (Free)', url: 'https://fontawesome.com/search?m=free', description: 'Versión más reciente con más íconos disponibles' },
    { name: 'Material Icons', url: 'https://fonts.google.com/icons', description: 'Íconos de Google Material Design — usa nombres como "home", "settings"' },
    { name: 'Iconify', url: 'https://icon-sets.iconify.design/', description: 'Buscador unificado de múltiples librerías de íconos' }
  ];

  ngOnInit() {
    this.loadModulos();
    this.loadSubmodulos();
    this.loadTiposAtividade();

    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditMode = true;
      this.loadAtividade(id);
    } else {
      this.loading = false;
    }
  }

  loadAtividade(id: string) {
    this.loading = true;
    this.service.getAtividades({ id })
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (response: any) => {
          if (response.status === 200 && response.body?.data?.[0]) {
            const data = response.body.data[0];
            this.form.patchValue(data);
            if (data.rota_origem) {
              this.form.get('rota')?.setValue(data.rota_origem);
            }
            // Cargar submódulos filtrados por el módulo actual
            if (data.moduloId) {
              this.loadSubmodulos({ moduloId: data.moduloId });
            }
          }
        },
        error: () => {
          this.snackBar.open('Error al cargar la actividad.', 'Cerrar', { duration: 3000 });
          this.router.navigate(['../'], { relativeTo: this.route });
        }
      });
  }

  loadModulos() {
    this.modulosService.getModulos().subscribe({
      next: (res: any) => {
        if (res.status === 200 && res.body?.data) {
          this.modulos = res.body.data;
        }
      }
    });
  }

  loadSubmodulos(params: any = {}) {
    this.submodulosService.getSubModulos(params).subscribe({
      next: (res: any) => {
        if (res.status === 200 && res.body?.data) {
          this.submodulos = res.body.data;
        }
      }
    });
  }

  loadTiposAtividade() {
    this.service.getTipoAtividade().subscribe({
      next: (res: any) => {
        if (res.status === 200 && res.body?.data) {
          this.tiposAtividade = res.body.data;
        }
      }
    });
  }

  onModuloChange(moduloId: any) {
    if (moduloId) {
      this.loadSubmodulos({ moduloId });
    } else {
      this.loadSubmodulos();
    }
    this.form.get('submoduloId')?.setValue('');
  }

  onSave() {
    if (!this.form.valid) return;

    this.saving = true;
    const params = {
      ...this.form.value,
      exibeSidebar: this.form.value.exibeSidebar ? 1 : 0,
      exibeNovaAba: this.form.value.exibeNovaAba ? 1 : 0
    };

    this.service.postAtividade(params)
      .pipe(finalize(() => this.saving = false))
      .subscribe({
        next: () => {
          this.snackBar.open('Actividad guardada correctamente.', 'OK', { duration: 3000 });
          this.router.navigate(['../'], { relativeTo: this.route });
        },
        error: (err: any) => {
          const msg = err.error?.message || 'Error al guardar la actividad.';
          this.snackBar.open(msg, 'Cerrar', { duration: 5000 });
        }
      });
  }
}
