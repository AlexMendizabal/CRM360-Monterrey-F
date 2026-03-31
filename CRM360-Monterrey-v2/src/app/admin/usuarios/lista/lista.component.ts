import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AdminUsuariosService } from '../services/usuarios.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-admin-usuarios-lista',
  standalone: true,
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule,
    MatTableModule, MatPaginatorModule,
    MatButtonModule, MatIconModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatSnackBarModule,
    MatProgressSpinnerModule, MatTooltipModule
  ],
  templateUrl: './lista.html',
  styleUrl: './lista.scss'
})
export class AdminUsuariosListaComponent implements OnInit {
  private service = inject(AdminUsuariosService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  form: FormGroup = this.fb.group({
    nome: [''],
    matricula: [''],
    situacao: ['']
  });

  loading = true;
  data: any[] = [];
  displayedColumns: string[] = ['id', 'nome', 'matricula', 'perfil', 'situacao', 'acciones'];

  totalItems = 0;
  pageSize = 10;
  pageIndex = 0;

  ngOnInit() {
    this.getData();
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

    this.service.getUsuarios(params)
      .pipe(finalize(() => setTimeout(() => this.loading = false, 0)))
      .subscribe({
        next: (response: any) => {
          if (response.status === 200 && response.body?.data) {
            this.data = response.body.data;
            this.totalItems = response.body.total || this.data.length;
          } else {
            this.data = [];
            this.totalItems = 0;
            this.snackBar.open('No se encontraron usuarios.', 'Cerrar', { duration: 3000 });
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
