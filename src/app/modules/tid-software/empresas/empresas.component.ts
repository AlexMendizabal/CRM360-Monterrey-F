import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

// file-saver
import { saveAs } from 'file-saver/src/FileSaver';
import { TidSoftwareEmpresasService } from './empresas.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';

@Component({
  selector: 'tidSoftware-empresas',
  templateUrl: './empresas.component.html',
  styleUrls: ['./empresas.component.scss']
})
export class TidSoftwareEmpresasComponent implements OnInit {
  inscricao: Subscription;

  constructor(
    private empresaService: TidSoftwareEmpresasService,
    private activatedRoute: ActivatedRoute,
    private notice: PNotifyService
  ) {}

  ngOnInit(): void {
    this.validainscricao();
  }

  validainscricao() {
    this.inscricao = this.activatedRoute.params.subscribe(params => {
      let _params = {
        empresa: params['cdEmpresa'] == 0 ? '1' : params['cdEmpresa'],
        executavel: params['cdEmpresa'] == 0 ? 'MENUGC.EXE' : 'MENUTOKEN.EXE',
        parametro: params['cdEmpresa'] == 0 ? 'MENUGC' : 'MENU'
      };
      this.getUrlRDP(_params);
    });
  }

  getUrlRDP(params) {
    this.empresaService.getUrlRDP(params).subscribe(response => {
      if (response.body['responseCode'] === 403) {
        this.notice.notice(response.body['message']);
      } else {
        this.notice.success('Autenticação TID realizada com sucesso');
        const path = response['body']['link'];
        saveAs(path, 'tidSoftware.rdp');
      }
    });
  }

  ngOnDestroy() {
    this.inscricao.unsubscribe();
  }
}
