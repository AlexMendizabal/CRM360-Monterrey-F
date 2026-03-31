import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  private http = inject(HttpClient);
  private readonly API = '/api';

  modulos = signal<any[]>([]);
  modulosLoaded = signal(false);
  modulosError = signal(false);

  atividades = signal<any[]>([]);
  atividadesLoaded = signal(false);
  atividadesError = signal(false);

  currentModulo = signal<any>(null);

  /** Carga los módulos del menú superior */
  loadModulos(matricula: string) {
    this.modulosLoaded.set(false);
    this.modulosError.set(false);

    this.http.get<any>(`${this.API}/core/modulos`, {
      params: { matricula },
      observe: 'response'
    }).subscribe({
      next: (res) => {
        this.modulosLoaded.set(true);
        if (res.status === 200 && res.body?.data) {
          this.modulos.set(res.body.data);
          if (res.body.data.length > 0) {
            this.setModulo(res.body.data[0]);
          }
        }
      },
      error: () => {
        this.modulosLoaded.set(true);
        this.modulosError.set(true);
      }
    });
  }

  /** Establece el módulo activo y carga las actividades del sidebar */
  setModulo(modulo: any) {
    this.currentModulo.set(modulo);
    this.loadAtividades(modulo.id);
  }

  /** Carga las actividades (botones del sidebar) para un módulo */
  loadAtividades(moduloId: number) {
    this.atividadesLoaded.set(false);
    this.atividadesError.set(false);
    this.atividades.set([]);

    const userStr = localStorage.getItem('currentUser');
    if (!userStr) return;

    const user = JSON.parse(userStr);
    const matricula = user?.info?.matricula || user?.matricula;
    if (!matricula) return;

    this.http.get<any>(`${this.API}/core/atividades`, {
      params: {
        matricula,
        moduloId,
        exibeSidebar: 1,
        orderBy: 'nome',
        inPagina: 0
      },
      observe: 'response'
    }).subscribe({
      next: (res) => {
        this.atividadesLoaded.set(true);
        if (res.status === 200 && res.body?.data) {
          this.atividades.set(res.body.data);
        } else {
          this.atividades.set([]);
        }
      },
      error: () => {
        this.atividadesLoaded.set(true);
        this.atividadesError.set(true);
      }
    });
  }

  /** Reintenta cargar actividades del módulo actual */
  reloadAtividades() {
    const current = this.currentModulo();
    if (current) {
      this.loadAtividades(current.id);
    }
  }
}
