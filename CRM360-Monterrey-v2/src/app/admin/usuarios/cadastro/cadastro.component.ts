import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-usuarios-cadastro',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, RouterModule],
  template: `
    <div class="p-4">
      <h2 class="mat-headline-5 mb-4">Registro de Usuario</h2>
      <mat-card appearance="outlined">
        <mat-card-content class="pt-4 text-center">
          <p>Este formulario de Registro/Edición será migrado a Reactivo (Material Forms) en el próximo paso.</p>
          <button mat-flat-button color="accent" routerLink="/admin/usuarios">Volver a la Lista</button>
        </mat-card-content>
      </mat-card>
    </div>
  `
})
export class AdminUsuariosCadastroComponent {}
