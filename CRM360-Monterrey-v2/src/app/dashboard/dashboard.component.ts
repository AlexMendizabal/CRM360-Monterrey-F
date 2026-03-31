import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MatCardModule, MatButtonModule],
  template: `
    <div style="max-width: 800px; margin: 20px auto;">
        <h2>Tablero Principal (Dashboard)</h2>
        <p>Has ingresado al sistema a través de la autenticación de la Fase 2.</p>
        
        <mat-card appearance="outlined">
          <mat-card-header>
            <mat-card-title>Sección Interna - Fase 3</mat-card-title>
          </mat-card-header>
          <mat-card-content class="pt-3">
            <p>El menú de la izquierda forma parte del <strong>LayoutComponent</strong> y los módulos que migremos (Ej: <em>'comercial'</em> o <em>'admin'</em>) se inyectarán aquí adentro.</p>
          </mat-card-content>
        </mat-card>
    </div>
  `
})
export class DashboardComponent {}
