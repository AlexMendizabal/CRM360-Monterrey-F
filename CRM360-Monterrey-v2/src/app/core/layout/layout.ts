import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AuthService } from '../services/auth.service';
import { NavigationService } from './services/navigation.service';
import { SapService } from '../services/sap.service';
import { NotificacionesService } from '../services/notificaciones.service';
import { ChangePasswordDialogComponent } from './change-password-dialog';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatDividerModule,
    MatBadgeModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatDialogModule
  ],
  templateUrl: './layout.html',
  styleUrls: ['./layout.scss']
})
export class LayoutComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private dialog = inject(MatDialog);

  public nav = inject(NavigationService);
  public sap = inject(SapService);
  public notif = inject(NotificacionesService);

  userName = 'Usuario';
  userMatricula = '';
  userTipoAcceso = '';

  // Sidebar state
  sidebarExpanded = signal(false);
  menuLocked = signal(false);
  private isMouseActive = false;
  private hoverTimeout: any;

  ngOnInit() {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      const user = JSON.parse(userStr);
      const info = user.info || user;

      this.userName = info.nomeAbreviado?.trim() || info.nomeCompleto?.trim() || 'Usuario';
      this.userMatricula = info.matricula || '';
      this.userTipoAcceso = info.tipoAcesso || '';

      if (info.matricula) {
        this.nav.loadModulos(info.matricula);
      }
    }

    // Inicializar SAP polling y notificaciones
    this.sap.startPolling();
    this.notif.load();
  }

  // ─── Topbar ────────────────────────────────────────────

  checkTipoAcceso(): boolean {
    return this.userTipoAcceso !== 'Externo';
  }

  onSelectModulo(modulo: any) {
    this.nav.setModulo(modulo);
    if (modulo.rota) {
      this.router.navigate(['/' + this.cleanRoute(modulo.rota)]);
    }
  }

  onNotificacionClick(notificacion: any) {
    this.notif.updateNotificacion(notificacion.id);
  }

  onLeerTodasNotificaciones() {
    this.notif.leerTodas();
  }

  openChangePasswordDialog() {
    this.dialog.open(ChangePasswordDialogComponent, {
      width: '450px',
      disableClose: true
    });
  }

  onLogout() {
    if (confirm('¿Estás seguro de que quieres salir de CRM360?')) {
      this.authService.logout();
      this.router.navigate(['/login']);
    }
  }

  // ─── Sidebar ───────────────────────────────────────────

  toggleLockMenu() {
    const locked = !this.menuLocked();
    this.menuLocked.set(locked);

    if (locked) {
      this.sidebarExpanded.set(true);
    } else {
      this.sidebarExpanded.set(false);
    }
  }

  toggleMenuIcon(): string {
    return this.menuLocked() ? 'close' : 'menu';
  }

  mouseEnterMenu() {
    this.isMouseActive = true;
    this.hoverTimeout = setTimeout(() => {
      if (this.isMouseActive) {
        this.sidebarExpanded.set(true);
      }
    }, 600);
  }

  mouseLeaveMenu() {
    this.isMouseActive = false;
    clearTimeout(this.hoverTimeout);
    if (!this.menuLocked()) {
      this.sidebarExpanded.set(false);
    }
  }

  onHideMenu() {
    if (!this.menuLocked()) {
      this.sidebarExpanded.set(false);
      this.isMouseActive = false;
    }
  }

  // ─── Helpers ───────────────────────────────────────────

  cleanRoute(route: string): string {
    if (!route) return '';
    return route.replace(/^\/+|\/+$/g, '');
  }
}
