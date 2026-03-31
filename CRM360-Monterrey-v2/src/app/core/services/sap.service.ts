import { Injectable, inject, signal, DestroyRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { interval } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export type SapStatus = 'checking' | 'connected' | 'disconnected';

@Injectable({
  providedIn: 'root'
})
export class SapService {
  private http = inject(HttpClient);
  private destroyRef = inject(DestroyRef);
  private readonly API = '/api/sap';

  sapStatus = signal<SapStatus>('checking');

  /** Arranca la verificación inicial y el polling cada 120s */
  startPolling() {
    this.verificarConexion(true);

    interval(120_000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.verificarConexion(false));
  }

  verificarConexion(showLoading: boolean) {
    if (showLoading) {
      this.sapStatus.set('checking');
    }

    this.http.post<any>(`${this.API}/verificar_conexion_sap`, null).subscribe({
      next: (response: any) => {
        this.sapStatus.set(response?.success === true ? 'connected' : 'disconnected');
      },
      error: () => {
        this.sapStatus.set('disconnected');
      }
    });
  }
}
