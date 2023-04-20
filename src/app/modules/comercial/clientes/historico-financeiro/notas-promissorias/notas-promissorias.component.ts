import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

// Services
import { ComercialClientesHistoricoFinanceiroService } from './../historico-financeiro.service';

// Interfaces
import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';

@Component({
  selector: 'comercial-clientes-historico-financeiro-notas-promissorias',
  templateUrl: './notas-promissorias.component.html',
  styleUrls: ['./notas-promissorias.component.scss']
})
export class ComercialClientesHistoricoFinanceiroNotasPromissoriasComponent
  implements OnInit {
  tableConfig: Partial<CustomTableConfig> = {
    subtitleBorder: true
  };

  notasPromissorias: any = [];
  notasPromissoriasLoaded: boolean = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private historicoFinanceiroService: ComercialClientesHistoricoFinanceiroService
  ) {}

  ngOnInit() {
    this.activatedRoute.parent.params.subscribe(params => {
      this.getNotasPromissorias(params['id']);
    });
  }

  getNotasPromissorias(id: any) {
    this.historicoFinanceiroService
      .getNotasPromissorias(id)
      .subscribe((response: any) => {
        if (response['responseCode'] === 200) {
          this.notasPromissorias = response['result'];
        }
        this.notasPromissoriasLoaded = true;
      });
  }

  classStatusBorder(status: string) {
    let borderClass = '';

    if (status == 'BAIXADA') {
      borderClass = 'border-success';
    } else if (status == 'QUITADA') {
      borderClass = 'border-primary';
    }

    return borderClass;
  }
}
