import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { take, retry } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class NotificacionesService {
  private http = inject(HttpClient);
  private readonly API = '/api/core/notificaciones';

  notificaciones = signal<any[]>([]);
  count = computed(() => this.notificaciones().length);

  load(): void {
    this.http.get<any>(this.API)
      .pipe(take(1), retry(2))
      .subscribe({
        next: (response: any) => {
          if (response?.responseCode === 200) {
            this.notificaciones.set(response.content || []);
          }
        },
        error: () => {
          // Silenciar error — las notificaciones son secundarias
        }
      });
  }

  updateNotificacion(id: number): void {
    this.http.post<any>(`${this.API}/update`, { id })
      .pipe(take(1), retry(2))
      .subscribe({
        next: (response: any) => {
          if (response?.responseCode === 200) {
            this.load(); // Recargar lista
          }
        }
      });
  }

  leerTodas(): void {
    const items: any[] = this.notificaciones();
    if (items.length === 0) return;

    this.http.post<any>(`${this.API}/leerNotificaciones`, items)
      .pipe(take(1), retry(2))
      .subscribe({
        next: (response: any) => {
          if (response?.responseCode === 200) {
            this.load();
          }
        }
      });
  }
}
