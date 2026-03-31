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
import { AdminSubmodulosService } from '../../services/admin-submodulos.service';
import { AdminModulosService } from '../../services/admin-modulos.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-admin-submodulos-lista',
  standalone: true,
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule,
    MatTableModule, MatPaginatorModule, MatCardModule,
    MatButtonModule, MatIconModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatSnackBarModule,
    MatProgressSpinnerModule, MatTooltipModule
  ],
  templateUrl: './lista.component.html',
  styleUrl: './lista.component.scss'
})
export class AdminSubmodulosListaComponent implements OnInit {
  private service = inject(AdminSubmodulosService);
  private modulosService = inject(AdminModulosService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  form: FormGroup = this.fb.group({
    id: [''],
    nome: [''],
    moduloId: [''],
    situacao: ['']
  });

  loading = true;
  data: any[] = [];
  modulos: any[] = [];
  displayedColumns: string[] = ['id', 'nome', 'modulo', 'icone', 'situacao', 'acciones'];

  totalItems = 0;
  pageSize = 10;
  pageIndex = 0;

  ngOnInit() {
    this.getModulos();
    this.getData();
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

  onFilter() {
    this.pageIndex = 0;
    this.getData();
  }

  onReset() {
    this.form.reset();
    this.pageIndex = 0;
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

    this.service.getSubModulos(params)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (response: any) => {
          if (response.status === 200 && response.body?.data) {
            this.data = response.body.data;
            this.totalItems = response.body.total || this.data.length;
          } else {
            this.data = [];
            this.totalItems = 0;
            this.snackBar.open('No se encontraron submódulos.', 'Cerrar', { duration: 3000 });
          }
        },
        error: () => {
          this.data = [];
          this.totalItems = 0;
          this.snackBar.open('Error de conexión con el servidor.', 'Cerrar', { duration: 3000 });
        }
      });
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
