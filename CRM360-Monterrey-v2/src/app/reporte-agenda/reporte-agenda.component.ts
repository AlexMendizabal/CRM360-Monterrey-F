import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { ReporteAgendaService } from './reporte-agenda.service';
import { finalize, forkJoin } from 'rxjs';

@Component({
  selector: 'app-reporte-agenda',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatTableModule, MatPaginatorModule,
    MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatDatepickerModule, MatNativeDateModule,
    MatSnackBarModule, MatProgressSpinnerModule,
    MatTooltipModule, MatChipsModule
  ],
  templateUrl: './reporte-agenda.component.html',
  styleUrl: './reporte-agenda.component.scss'
})
export class ReporteAgendaComponent implements OnInit {
  private service = inject(ReporteAgendaService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  form: FormGroup = this.fb.group({
    fechaInicial: [null, Validators.required],
    fechaFinal: [null, Validators.required],
    id_vendedor: [''],
    sucursal: [''],
    titulo: [''],
    estado: ['']
  });

  loading = false;
  loadingCatalogs = true;
  data: any[] = [];
  paginatedData: any[] = [];

  vendedores: any[] = [];
  escritorios: any[] = [];
  titulos: any[] = [];
  estados: any[] = [];

  totalItems = 0;
  pageSize = 10;
  pageIndex = 0;

  displayedColumns = ['vendedor', 'sucursal', 'cliente', 'titulo', 'estado', 'fecha', 'obs_final'];

  ngOnInit() {
    this.loadCatalogs();
  }

  loadCatalogs() {
    this.loadingCatalogs = true;
    forkJoin({
      vendedores: this.service.getVendedores(),
      escritorios: this.service.getEscritorios(),
      titulos: this.service.getTitulosAgenda(),
      estados: this.service.getEstados()
    }).pipe(finalize(() => this.loadingCatalogs = false))
      .subscribe({
        next: (res: any) => {
          this.vendedores = res.vendedores?.data || res.vendedores?.result || [];
          this.escritorios = res.escritorios?.result || res.escritorios?.data || [];
          this.titulos = res.titulos?.data || [];
          this.estados = res.estados?.result || res.estados?.data || [];
        },
        error: () => {
          // Catalog load failure is non-critical, continue silently
        }
      });
  }

  onBuscar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.snackBar.open('Por favor, selecciona un rango de fechas.', 'OK', { duration: 3000 });
      return;
    }

    this.loading = true;
    this.pageIndex = 0;
    const payload = this.cleanParams(this.form.value);

    this.service.getReporte(payload)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (response: any) => {
          const raw = response.body?.result || response.body?.data || [];
          this.data = raw;
          this.totalItems = this.data.length;
          this.updatePage();
        },
        error: () => {
          this.snackBar.open('Error al obtener el reporte.', 'Cerrar', { duration: 4000 });
          this.data = [];
          this.paginatedData = [];
        }
      });
  }

  onReset() {
    this.form.reset();
    this.data = [];
    this.paginatedData = [];
    this.totalItems = 0;
  }

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePage();
  }

  updatePage() {
    const start = this.pageIndex * this.pageSize;
    this.paginatedData = this.data.slice(start, start + this.pageSize);
  }

  exportToCSV() {
    if (this.data.length === 0) {
      this.snackBar.open('No hay datos para exportar.', 'OK', { duration: 2000 });
      return;
    }

    const headers = ['Vendedor', 'Sucursal', 'Cliente', 'Título', 'Estado', 'Fecha', 'Observación Final'];
    const rows = this.data.map(r => [
      r.vendedor, r.sucursal, r.cliente,
      r.motivo || r.titulo,
      r.Estado || r.estado,
      r.fecha, r.obs_final
    ].map(v => `"${(v ?? '').toString().replace(/"/g, '""')}"`).join(','));

    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${new Date().toISOString().split('T')[0]}_reporte_agenda.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  private cleanParams(obj: any): any {
    return Object.keys(obj).reduce((acc: any, key) => {
      const v = obj[key];
      if (v !== null && v !== '' && v !== undefined) {
        // convert Date objects to ISO date string
        acc[key] = v instanceof Date ? v.toISOString().split('T')[0] : v;
      }
      return acc;
    }, {});
  }
}
