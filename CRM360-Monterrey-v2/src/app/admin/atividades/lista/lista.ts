import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AdminAtividadesService } from '../services/admin-atividades.service';
import { AdminModulosService } from '../../services/admin-modulos.service';
import { AdminSubmodulosService } from '../../services/admin-submodulos.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-admin-atividades-lista',
  standalone: true,
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule,
    MatTableModule, MatPaginatorModule, MatCardModule,
    MatButtonModule, MatIconModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatSnackBarModule,
    MatProgressSpinnerModule, MatTooltipModule
  ],
  templateUrl: './lista.html',
  styleUrl: './lista.scss'
})
export class AdminAtividadesListaComponent implements OnInit {
  private service = inject(AdminAtividadesService);
  private modulosService = inject(AdminModulosService);
  private submodulosService = inject(AdminSubmodulosService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  form: FormGroup = this.fb.group({
    nome: [''],
    moduloId: [''],
    submoduloId: [''],
    tipoAtividadeId: [''],
    situacao: ['']
  });

  loading = true;
  data: any[] = [];
  modulos: any[] = [];
  submodulos: any[] = [];
  tipoAtividades: any[] = [];

  displayedColumns: string[] = ['id', 'nome', 'moduloNome', 'submoduloNome', 'tipoAtividadeNome', 'icone', 'situacao', 'acciones'];

  // Pagination — default 10 para carga ligera
  totalItems = 0;
  pageSize = 10;
  pageIndex = 0;

  ngOnInit() {
    this.loadModulos();
    this.loadSubmodulos();
    this.loadTipoAtividades();
    this.getData();
  }

  onFilter() {
    this.pageIndex = 0;
    this.getData();
  }

  onReset() {
    this.form.reset();
    this.pageIndex = 0;
    this.submodulos = [];
    this.loadSubmodulos();
    this.getData();
  }

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.getData();
  }

  getData() {
    this.loading = true;

    const params = this.cleanParams({
      ...this.form.value,
      pagina: this.pageIndex + 1,
      registrosPorPagina: this.pageSize
    });

    this.service.getAtividades(params)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (response: any) => {
          if (response.status === 200 && response.body?.data) {
            this.data = response.body.data;
            this.totalItems = response.body.total || this.data.length;
          } else {
            this.data = [];
            this.totalItems = 0;
            this.snackBar.open('No se encontraron actividades.', 'Cerrar', { duration: 3000 });
          }
        },
        error: () => {
          this.data = [];
          this.totalItems = 0;
          this.snackBar.open('Error de conexión con el servidor.', 'Cerrar', { duration: 3000 });
        }
      });
  }

  loadModulos() {
    this.modulosService.getModulos().subscribe({
      next: (res: any) => {
        if (res.status === 200 && res.body?.data) this.modulos = res.body.data;
      }
    });
  }

  loadSubmodulos(params: any = {}) {
    this.submodulosService.getSubModulos(params).subscribe({
      next: (res: any) => {
        if (res.status === 200 && res.body?.data) this.submodulos = res.body.data;
      }
    });
  }

  loadTipoAtividades() {
    this.service.getTipoAtividade().subscribe({
      next: (res: any) => {
        if (res.status === 200 && res.body?.data) this.tipoAtividades = res.body.data;
      }
    });
  }

  onModuloChange(moduloId: any) {
    this.form.get('submoduloId')?.setValue('');
    if (moduloId) {
      this.loadSubmodulos({ moduloId });
    } else {
      this.loadSubmodulos();
    }
  }

  private cleanParams(obj: any): any {
    return Object.keys(obj).reduce((acc: any, key) => {
      if (obj[key] !== null && obj[key] !== '' && obj[key] !== undefined) {
        acc[key] = obj[key];
      }
      return acc;
    }, {});
  }
}
