import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-admin-home',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  template: `
    <div class="p-4">
      <h2 class="mat-headline-5 mb-4">
        <mat-icon color="primary" class="me-2 align-middle">admin_panel_settings</mat-icon> 
        Administración del Sistema
      </h2>
      
      <mat-card appearance="outlined">
        <mat-card-header>
          <mat-card-title>Panel Principal</mat-card-title>
          <mat-card-subtitle>Bienvenido al módulo de gestión y control</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content class="pt-4">
          <p>Utiliza el menú lateral para gestionar <strong>Usuarios</strong>, <strong>Perfiles</strong>, <strong>Módulos</strong> y otras entidades de configuración global.</p>
        </mat-card-content>
      </mat-card>
    </div>
  `
})
export class AdminHomeComponent {}
