import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';

import { AdminPerfilesService } from '../../services/admin-perfiles.service';
import { AdminAtividadesService } from '../../atividades/services/admin-atividades.service';
import { finalize, forkJoin } from 'rxjs';

@Component({
  selector: 'app-admin-perfiles-cadastro',
  standalone: true,
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule, FormsModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatSnackBarModule, MatProgressSpinnerModule, MatDividerModule,
    MatTableModule, MatCheckboxModule, MatTooltipModule
  ],
  templateUrl: './cadastro.component.html',
  styleUrl: './cadastro.component.scss'
})
export class AdminPerfilesCadastroComponent implements OnInit {
  private service = inject(AdminPerfilesService);
  private atividadesService = inject(AdminAtividadesService);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  form: FormGroup = this.fb.group({
    id: [null],
    nome: ['', Validators.required],
    sigla: ['', Validators.required],
    situacao: [1]
  });

  formAtividades: FormGroup = this.fb.group({
    buscarPor: ['nome'],
    pesquisa: ['', Validators.required]
  });

  loading = true;
  saving = false;
  isEditMode = false;

  // Activities
  atividadesAssociadas: any[] = [];
  atividadesAssociadasLoading = false;
  atividadesBusqueda: any[] = [];
  atividadesLoading = false;

  displayedColumnsAssoc: string[] = ['check', 'id', 'nome', 'acciones'];
  displayedColumnsSearch: string[] = ['check', 'descricao'];

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditMode = true;
      this.loadData(id);
    } else {
      this.loading = false;
    }
  }

  loadData(id: string) {
    this.loading = true;
    this.atividadesAssociadasLoading = true;

    forkJoin({
      perfil: this.service.getPerfiles({ id }),
      atividades: this.atividadesService.getAtividades({ perfilId: id, IN_STAT: '1', IN_PAGI: '0' })
    }).pipe(finalize(() => {
      this.loading = false;
      this.atividadesAssociadasLoading = false;
    })).subscribe({
      next: (response: any) => {
        if (response.perfil.status === 200 && response.perfil.body?.data?.[0]) {
          this.form.patchValue(response.perfil.body.data[0]);
        }
        if (response.atividades.status === 200 && response.atividades.body?.data) {
          this.atividadesAssociadas = response.atividades.body.data.map((item: any) => ({ ...item, checked: false }));
        }
      },
      error: () => {
        this.snackBar.open('Error al cargar el perfil.', 'Cerrar', { duration: 3000 });
        this.router.navigate(['../'], { relativeTo: this.route });
      }
    });
  }

  onSave() {
    if (!this.form.valid) return;

    this.saving = true;
    this.service.postPerfil(this.form.value)
      .pipe(finalize(() => this.saving = false))
      .subscribe({
        next: (response: any) => {
          this.snackBar.open('Perfil guardado correctamente.', 'OK', { duration: 3000 });
          
          if (!this.isEditMode && response.body?.data?.id) {
             // Redirect to edit mode if created so we can associate activities
             this.router.navigate(['../', response.body.data.id], { relativeTo: this.route });
          } else {
             this.loadData(this.form.value.id);
          }
        },
        error: (err: any) => {
          const msg = err.error?.message || 'Error al guardar el perfil.';
          this.snackBar.open(msg, 'Cerrar', { duration: 5000 });
        }
      });
  }

  // --- Activities Management ---

  buscarAtividades() {
    if (this.formAtividades.invalid) return;
    
    this.atividadesLoading = true;
    const buscarPor = this.formAtividades.value.buscarPor;
    const pesquisa = this.formAtividades.value.pesquisa;
    
    const params: any = {};
    if (buscarPor) {
      params[buscarPor] = pesquisa;
    }

    this.atividadesService.getAtividades(params)
      .pipe(finalize(() => this.atividadesLoading = false))
      .subscribe({
        next: (response: any) => {
          if (response.status === 200 && response.body?.data) {
            // Filter out already associated activities
            this.atividadesBusqueda = response.body.data
              .filter((atividade: any) => !this.atividadesAssociadas.some(assoc => assoc.id === atividade.id))
              .map((item: any) => ({ ...item, checked: false }));
          } else {
            this.atividadesBusqueda = [];
            this.snackBar.open('No se encontraron actividades.', 'Cerrar', { duration: 2000 });
          }
        },
        error: () => {
          this.atividadesBusqueda = [];
        }
      });
  }

  onAssociarAtividades() {
    const perfilId = this.form.value.id;
    if (!perfilId) {
       this.snackBar.open('Debes guardar el perfil antes de asociar actividades.', 'OK', { duration: 3000 });
       return;
    }

    const selected = this.atividadesBusqueda.filter(a => a.checked);
    if (selected.length === 0) return;

    selected.forEach(atividade => {
       atividade.loading = true;
       
       const params = {
         atividadeId: atividade.id,
         perfilId: perfilId,
         status: '1'
       };

       this.service.postAtividadesAssociadas(params).subscribe({
         next: (res: any) => {
           if (res.status === 200) {
             // Move to associated list
             this.atividadesAssociadas = [...this.atividadesAssociadas, { ...atividade, checked: false, loading: false }];
             this.atividadesBusqueda = this.atividadesBusqueda.filter(a => a.id !== atividade.id);
           }
         },
         error: () => {
           atividade.loading = false;
           this.snackBar.open(`Error al asociar la actividad ${atividade.id}.`, 'Cerrar', { duration: 3000 });
         }
       });
    });
  }

  onRemoverAssociacao(atividade?: any) {
    const perfilId = this.form.value.id;
    const itemsToRemove = atividade ? [atividade] : this.atividadesAssociadas.filter(a => a.checked);
    
    if (itemsToRemove.length === 0) {
      this.snackBar.open('Ninguna actividad seleccionada.', 'OK', { duration: 2000 });
      return;
    }

    if (!confirm('¿Desea eliminar la asociación de estas actividades?')) return;

    itemsToRemove.forEach(item => {
      item.loading = true;
      const params = {
        atividadeId: item.id,
        perfilId: perfilId,
        status: '0'
      };

      this.service.postAtividadesAssociadas(params).subscribe({
        next: (res: any) => {
          if (res.status === 200) {
            this.atividadesAssociadas = this.atividadesAssociadas.filter(a => a.id !== item.id);
            // Optionally, we could add it back to the search results if it matches the current search, but removing it is fine.
          }
        },
        error: () => {
          item.loading = false;
          this.snackBar.open(`Error al eliminar la actividad ${item.id}.`, 'Cerrar', { duration: 3000 });
        }
      });
    });
  }

  toggleAllBusqueda(checked: boolean) {
    this.atividadesBusqueda.forEach(a => a.checked = checked);
  }

  toggleAllAssociadas(checked: boolean) {
    this.atividadesAssociadas.forEach(a => a.checked = checked);
  }

  get allBusquedaChecked() {
    return this.atividadesBusqueda.length > 0 && this.atividadesBusqueda.every(a => a.checked);
  }

  get allAssociadasChecked() {
    return this.atividadesAssociadas.length > 0 && this.atividadesAssociadas.every(a => a.checked);
  }
}
