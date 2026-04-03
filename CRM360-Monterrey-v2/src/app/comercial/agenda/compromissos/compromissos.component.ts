import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
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
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { AgendaService } from '../agenda.service';
import { finalize, forkJoin, Subject, interval, takeUntil } from 'rxjs';

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: any[];
}

@Component({
  selector: 'app-comercial-agenda-compromissos',
  standalone: true,
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule, FormsModule,
    MatTableModule, MatPaginatorModule,
    MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatDatepickerModule, MatNativeDateModule,
    MatSnackBarModule, MatProgressSpinnerModule,
    MatTooltipModule, MatChipsModule, MatButtonToggleModule
  ],
  templateUrl: './compromissos.component.html',
  styleUrl: './compromissos.component.scss'
})
export class ComercialAgendaCompromissosComponent implements OnInit, OnDestroy {
  private agendaService = inject(AgendaService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);
  private destroy$ = new Subject<void>();

  form: FormGroup = this.fb.group({
    inicio: [this.defaultStart()],
    fim: [this.defaultEnd()],
    idVendedor: [''],
    idEscritorio: [''],
    statusnome: ['']
  });

  // View mode: 'lista' | 'calendario'
  viewMode: 'lista' | 'calendario' = 'lista';

  // Calendar state
  calendarDate: Date = new Date();
  calendarWeekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  calendarDays: CalendarDay[] = [];
  selectedDayEvents: any[] = [];
  selectedDay: Date | null = null;

  loading = true;
  loadingCatalogs = true;
  data: any[] = [];
  vendedores: any[] = [];
  escritorios: any[] = [];
  estados: any[] = [];

  displayedColumns = ['fecha', 'cliente', 'titulo', 'estado', 'vendedor', 'sucursal', 'acciones'];

  totalItems = 0;
  pageSize = 10;
  pageIndex = 0;

  // Status color legend
  leyendas = [
    { text: 'Por Supervisor', color: '#0453F1' },
    { text: 'Por Promotor', color: '#BC0BDF' },
    { text: 'Re-Agendado', color: '#D1CBD6' },
    { text: 'En Proceso', color: '#FF5208' },
    { text: 'Finalizado', color: '#21C710' },
  ];

  ngOnInit() {
    this.loadCatalogs();
    this.getData();

    // Auto-refresh every 60s
    interval(60_000).pipe(takeUntil(this.destroy$)).subscribe(() => this.getData());
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private defaultStart(): string {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
  }

  private defaultEnd(): string {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split('T')[0];
  }

  loadCatalogs() {
    this.loadingCatalogs = true;
    forkJoin({
      vendedores: this.agendaService.getVendedores(),
      escritorios: this.agendaService.getEscritorios(),
      estados: this.agendaService.getEstados()
    }).pipe(finalize(() => this.loadingCatalogs = false))
      .subscribe({
        next: (res: any) => {
          this.vendedores = res.vendedores?.data || res.vendedores?.result || [];
          this.escritorios = res.escritorios?.result || res.escritorios?.data || [];
          this.estados = res.estados?.result || res.estados?.data || [];
        },
        error: () => {} // Non-critical
      });
  }

  onFilter() {
    this.pageIndex = 0;
    this.getData();
  }

  onReset() {
    this.form.patchValue({ inicio: this.defaultStart(), fim: this.defaultEnd(), idVendedor: '', idEscritorio: '', statusnome: '' });
    this.pageIndex = 0;
    this.getData();
  }

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  getData() {
    this.loading = true;
    const raw = this.form.value;
    const params: any = {};
    if (raw.inicio) params['inicio'] = raw.inicio instanceof Date ? raw.inicio.toISOString().split('T')[0] : raw.inicio;
    if (raw.fim) params['fim'] = raw.fim instanceof Date ? raw.fim.toISOString().split('T')[0] : raw.fim;
    if (raw.idVendedor) params['idVendedor'] = raw.idVendedor;
    if (raw.idEscritorio) params['idEscritorio'] = raw.idEscritorio;
    if (raw.statusnome) params['statusnome'] = raw.statusnome;

    this.agendaService.getCompromissos(params)
      .pipe(finalize(() => setTimeout(() => this.loading = false, 0)))
      .subscribe({
        next: (response: any) => {
          this.data = response?.result || response?.data || [];
          this.totalItems = this.data.length;
          this.buildCalendar();
        },
        error: () => {
          this.snackBar.open('Error al cargar los compromisos.', 'Cerrar', { duration: 4000 });
          this.data = [];
        }
      });
  }

  // ─── Calendar ─────────────────────────────────────────────────
  get calendarMonthLabel(): string {
    return this.calendarDate.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
  }

  prevMonth() {
    const d = new Date(this.calendarDate);
    d.setMonth(d.getMonth() - 1);
    this.calendarDate = d;
    this.selectedDay = null;
    this.selectedDayEvents = [];
    this.form.patchValue({
      inicio: new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0],
      fim: new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split('T')[0]
    });
    this.getData();
  }

  nextMonth() {
    const d = new Date(this.calendarDate);
    d.setMonth(d.getMonth() + 1);
    this.calendarDate = d;
    this.selectedDay = null;
    this.selectedDayEvents = [];
    this.form.patchValue({
      inicio: new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0],
      fim: new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split('T')[0]
    });
    this.getData();
  }

  goToday() {
    this.calendarDate = new Date();
    this.selectedDay = null;
    this.selectedDayEvents = [];
    this.buildCalendar();
  }

  buildCalendar() {
    const year = this.calendarDate.getFullYear();
    const month = this.calendarDate.getMonth();
    const today = new Date();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPad = firstDay.getDay();
    const days: CalendarDay[] = [];

    for (let i = startPad - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      days.push({ date, isCurrentMonth: false, isToday: false, events: [] });
    }
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(year, month, d);
      days.push({ date, isCurrentMonth: true, isToday: date.toDateString() === today.toDateString(), events: this.getEventsForDay(date) });
    }
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false, isToday: false, events: [] });
    }
    this.calendarDays = days;
  }

  getEventsForDay(date: Date): any[] {
    return this.data.filter(item => {
      const start = item.start ? new Date(item.start) : null;
      return start && start.toDateString() === date.toDateString();
    });
  }

  getEventColor(event: any): string {
    const s = (event.statusnome || '').toLowerCase();
    if (s.includes('final')) return '#21C710';
    if (s.includes('proceso')) return '#FF5208';
    if (s.includes('reagend')) return '#D1CBD6';
    return event.color?.primary || '#0453F1';
  }

  onDayClick(day: CalendarDay) {
    if (day.events.length === 0) return;
    this.selectedDay = day.date;
    this.selectedDayEvents = day.events;
  }

  // ─── Table ────────────────────────────────────────────────────
  get paginatedData() {
    const start = this.pageIndex * this.pageSize;
    return this.data.slice(start, start + this.pageSize);
  }

  onView(item: any) {
    this.router.navigate(['../editar', item.id], { relativeTo: this.route });
  }

  onFinalizar(item: any) {
    this.router.navigate(['../finalizar', item.id], { relativeTo: this.route });
  }

  onReagendar(item: any) {
    this.router.navigate(['../reagendar', item.id], { relativeTo: this.route });
  }

  getEstadoClass(estado: string): string {
    if (!estado) return '';
    const e = estado.toLowerCase();
    if (e.includes('final')) return 'estado-finalizado';
    if (e.includes('proceso')) return 'estado-proceso';
    if (e.includes('reagend')) return 'estado-reagendado';
    return 'estado-registrado';
  }
}
