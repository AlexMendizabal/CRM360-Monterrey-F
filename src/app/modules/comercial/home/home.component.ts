import { Component, OnInit, NgZone } from '@angular/core';
import { finalize } from 'rxjs/operators';

// Services
import { AuthService } from 'src/app/shared/services/core/auth.service';
import { ComercialService } from '../comercial.service';
import { ComercialAgendaService } from '../agenda/agenda.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { TitleService } from 'src/app/shared/services/core/title.service';

@Component({
  selector: 'comercial-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class ComercialHomeComponent implements OnInit {
  loaderNavbar = false;
  loaderFullScreen = true;

  user: any = [];
  adminProfile = false;
  profileLoaded = false;

  compromissos: any = [];
  compromissosLoaded = false;
  idVendedor: any;

  constructor(
    private authService: AuthService,
    private comercialService: ComercialService,
    private agendaService: ComercialAgendaService,
    private pnotifyService: PNotifyService,
    private titleService: TitleService
  ) {
    this.pnotifyService.getPNotify();
  }

  ngOnInit() {
    this.user = this.authService.getCurrentUser().info;
    if(this.user.idVendedor > 0 && this.user.idVendedor != 88){
      this.idVendedor= this.user.idVendedor;
    }else{
      this.idVendedor= '';
    }
   // console.log(this.user.idVendedor);
    this.getPerfil();
    this.getCompromissos(this.idVendedor);
    this.titleService.setTitle('Home');
  }

  getPerfil() {
    this.comercialService
      .getPerfil()
      .pipe(
        finalize(() => {
          this.loaderFullScreen = false;
          this.profileLoaded = true;
        })
      )
      .subscribe((response: any) => {
        if (response.responseCode === 200) {
          if (
            response.result.coordenador === true ||
            response.result.gestor === true
          ) {
            this.adminProfile = true;
          }
        }
      });
  }

  getCompromissos(idVendedor) {
    const d = new Date();
    const today = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;

    const params = {
      inicio: today,
      fim: today,
      idVendedor: idVendedor
    };

    this.agendaService
      .getCompromissos(params)
      .pipe(
        finalize(() => {
          this.compromissosLoaded = true;
        })
      )

      .subscribe({
        next: (response: any) => {
          if (response['responseCode'] === 200) {
            this.compromissos = response['result'];
            console.log(this.compromissos);

          }
        },
        error: (error: any) => {
          this.pnotifyService.notice(
            'Ocurrio un problema al cargar las citas.'
          );
        }

      });
      //console.log(this.agendaService);
  }

  handleDiaCompromisso(data: string) {
    const d = new Date(data);
    let hours: any = d.getHours();
    let minutes: any = d.getMinutes();

    hours = d.getHours() > 9 ? d.getHours() : `0${d.getHours()}`;
    minutes = d.getMinutes() > 9 ? d.getMinutes() : `0${d.getMinutes()}`;

    return `${hours}:${minutes}`;
  }
}
