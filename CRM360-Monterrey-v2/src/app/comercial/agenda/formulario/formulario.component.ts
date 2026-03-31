import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { AgendaService } from '../agenda.service';
import { finalize, forkJoin } from 'rxjs';

@Component({
  selector: 'app-comercial-agenda-formulario',
  standalone: true,
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule,
    MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatDatepickerModule, MatNativeDateModule, MatCheckboxModule,
    MatSnackBarModule, MatProgressSpinnerModule, MatDividerModule
  ],
  templateUrl: './formulario.component.html',
  styleUrl: './formulario.component.scss'
})
export class ComercialAgendaFormularioComponent implements OnInit {
  private service = inject(AgendaService);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private sanitizer = inject(DomSanitizer);

  mapUrl: SafeResourceUrl | null = null;
  readonly GOOGLE_MAPS_KEY = ''; // Optional: add API key here

  action: 'novo' | 'editar' | 'finalizar' | 'reagendar' = 'novo';
  loading = true;
  saving = false;
  isAllDay = false;

  titulos: any[] = [];
  formasContato: any[] = [];
  motivosReagendamento: any[] = [];
  clientes: any[] = [];
  vendedores: any[] = [];

  form: FormGroup = this.fb.group({
    id: [null],
    codTitulo: ['', Validators.required],
    cliente: ['', Validators.required],
    promotor: [''],
    codFormaContato: [''],
    codOrigemContato: [''],
    inicioData: [new Date(), Validators.required],
    inicioHorario: [new Date()],
    terminoData: [new Date()],
    terminoHorario: [new Date()],
    diaInteiro: [false],
    direccion: [''],
    observacao: [''],
    motivoReagendamento: [''],
    Obsfinalizar: [''],
    cor: ['#0453F1']
  });

  get isNovo() { return this.action === 'novo'; }
  get isEditar() { return this.action === 'editar'; }
  get isFinalizar() { return this.action === 'finalizar'; }
  get isReagendar() { return this.action === 'reagendar'; }

  get pageTitle(): string {
    const titles: Record<string, string> = {
      novo: 'Nuevo Compromiso',
      editar: 'Editar Compromiso',
      finalizar: 'Finalizar Compromiso',
      reagendar: 'Re-agendar Compromiso'
    };
    return titles[this.action] || 'Compromiso';
  }

  ngOnInit() {
    this.loadCatalogs();
    this.detectAction();
  }

  detectAction() {
    const params = this.route.snapshot.params;
    const urlSegments = this.router.url.split('/');
    const actionSegment = urlSegments[urlSegments.length - 2];

    if (params['id']) {
      this.action = (['editar','finalizar','reagendar'].includes(actionSegment) ? actionSegment : 'editar') as any;
      this.loadData(params['id']);
    } else {
      this.action = 'novo';
      this.loading = false;
    }

    // Apply action-specific validators
    if (this.isFinalizar) {
      this.form.get('Obsfinalizar')!.setValidators(Validators.required);
      this.form.get('Obsfinalizar')!.updateValueAndValidity();
    }
    if (this.isReagendar) {
      this.form.get('motivoReagendamento')!.setValidators(Validators.required);
      this.form.get('motivoReagendamento')!.updateValueAndValidity();
    }

    // If codCliente passed via route param
    if (params['codCliente']) {
      this.form.patchValue({ cliente: params['codCliente'] });
    }
  }

  loadCatalogs() {
    forkJoin({
      titulos: this.service.getTitulosAgenda(),
      vendedores: this.service.getVendedores()
    }).subscribe({
      next: (res: any) => {
        this.titulos = res.titulos?.data || [];
        this.vendedores = res.vendedores?.data || res.vendedores?.result || [];
      },
      error: () => {}
    });
  }

  loadData(id: string) {
    this.loading = true;
    this.service.getCompromisso(id)
      .pipe(finalize(() => setTimeout(() => this.loading = false, 0)))
      .subscribe({
        next: (res: any) => {
          const d = res?.result || res?.data;
          if (!d) { this.goBack(); return; }
          this.form.patchValue({
            id: d.id,
            codTitulo: d.codTitulo,
            cliente: d.codClient,
            promotor: d.id_vendedor,
            codFormaContato: d.formContactId,
            codOrigemContato: d.typeContactId,
            inicioData: d.start ? new Date(d.start) : new Date(),
            inicioHorario: d.start ? new Date(d.start) : new Date(),
            terminoData: d.end ? new Date(d.end) : new Date(),
            terminoHorario: d.end ? new Date(d.end) : new Date(),
            diaInteiro: d.allDay || false,
            direccion: d.direccion,
            observacao: d.description,
            cor: d.color?.primary || '#0453F1'
          });
        },
        error: () => {
          this.snackBar.open('Error al cargar el compromiso.', 'Cerrar', { duration: 3000 });
          this.goBack();
        }
      });
  }

  toggleAllDay() {
    this.isAllDay = !this.isAllDay;
  }

  onSave() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    const raw = this.form.getRawValue();

    const payload: any = {
      id: raw.id,
      codTitulo: raw.codTitulo,
      cliente: raw.cliente,
      promotor: raw.promotor,
      codFormaContato: raw.codFormaContato,
      codOrigemContato: raw.codOrigemContato,
      start: this.buildDateTime(raw.inicioData, raw.inicioHorario),
      end: raw.diaInteiro ? this.buildDateTime(raw.inicioData, raw.inicioHorario) : this.buildDateTime(raw.terminoData, raw.terminoHorario),
      allDay: raw.diaInteiro,
      direccion: raw.direccion,
      description: raw.observacao,
      motivoReagendamento: raw.motivoReagendamento,
      Obsfinalizar: raw.Obsfinalizar,
      color: raw.cor
    };

    this.service.save(this.action, payload)
      .pipe(finalize(() => this.saving = false))
      .subscribe({
        next: (res: any) => {
          if (res?.success || res?.responseCode === 200 || res?.status === 200) {
            const msgs: Record<string, string> = {
              novo: 'Compromiso creado correctamente.',
              editar: 'Compromiso actualizado.',
              finalizar: 'Compromiso finalizado.',
              reagendar: 'Compromiso re-agendado.'
            };
            this.snackBar.open(msgs[this.action], 'OK', { duration: 3000 });
            this.goBack();
          } else {
            this.snackBar.open('Error al guardar el compromiso.', 'Cerrar', { duration: 4000 });
          }
        },
        error: (err: any) => {
          const msg = err.error?.message || 'Error al conectar con el servidor.';
          this.snackBar.open(msg, 'Cerrar', { duration: 4000 });
        }
      });
  }

  goBack() {
    this.router.navigate(['../compromissos'], { relativeTo: this.route });
  }

  updateMap() {
    const raw = this.form.getRawValue();
    let query = '';
    // Prefer lat/lng if available from loaded data
    if (raw.latitud_clie && raw.longitud_clie) {
      query = `${raw.latitud_clie},${raw.longitud_clie}`;
    } else if (raw.direccion) {
      query = encodeURIComponent(raw.direccion);
    } else {
      this.mapUrl = null;
      return;
    }
    const keyParam = this.GOOGLE_MAPS_KEY ? `&key=${this.GOOGLE_MAPS_KEY}` : '';
    const url = `https://www.google.com/maps?q=${query}&output=embed${keyParam}`;
    this.mapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  private buildDateTime(date: Date, time: Date): string | null {
    if (!date) return null;
    const d = new Date(date);
    if (time && !this.isAllDay) {
      d.setHours(time.getHours(), time.getMinutes(), 0);
    }
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}T${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:00`;
  }
}
