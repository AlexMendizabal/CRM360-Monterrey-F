import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { finalize } from 'rxjs/operators';
import { PdfService } from 'src/app/shared/services/core/pdf.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { LogisticaEstoquePainelInventarioInventarioRelatorioService } from './relatorio.service';

@Component({
  selector: 'relatorio',
  templateUrl: './relatorio.component.html',
  styleUrls: ['./relatorio.component.scss'],
})
export class LogisticaEstoquePainelInventarioInventarioRelatorioComponent
  implements OnInit {
  idInventario: number = this.activatedRoute.snapshot.params['id'];
  currentUser: any = JSON.parse(localStorage.getItem('currentUser'));
  matriculaAuditor: any = this.currentUser['info']['matricula'];
  spinnerFullScreen: boolean = true;
  resultTotalInventario: number;
  resultadoDiferenca: number;
  resultadoContagem: number;
  totalContagem: number;
  qtPecaContagem: number;
  qtPesoContagem: number;
  inventarioRotativoTotal: any;
  listas: any = [];
  listaInfo: any = [];
  infoLinha: any = '';
  infoClasse: any = '';
  loaderNavbar: boolean = false;
  breadCrumbTree: any = [
    {
      descricao: 'Lista',
      routerLink: '/logistica/estoque/painel-inventario/lista',
    },
    {
      descricao: 'Relatório',
    },
  ];

  constructor(
    private pdfService: PdfService,
    private notice: PNotifyService,
    private activatedRoute: ActivatedRoute,
    private relatorioService: LogisticaEstoquePainelInventarioInventarioRelatorioService,
    private atividadesService: AtividadesService
  ) {}

  ngOnInit() {
    this.getLista();
    this.getInfoInventario();
    this.getInfoInventarioRotativoGeral();
    this.atividadesService.registrarAcesso().subscribe();
  }

  getLista() {
    let infoMateriais = [];

    if (this.activatedRoute.snapshot.params['id'] > 0) {
      this.idInventario = this.activatedRoute.snapshot.params['id'];
      this.relatorioService
        .getLista(this.idInventario)
        .pipe(finalize(() => (this.spinnerFullScreen = false)))
        .subscribe(
          (response: any) => {
            if (Object.keys(response).length > 0) {
              this.listas = response['materiais'];
              /* this.infoLinha = this.listas[0].dsLinha.trim();
              this.infoClasse = this.listas[0].dsClasse; */

              this.listas.forEach((element) => {
                element.totalContagem =
                  element.qtPecaContagem * element.pesoPeca +
                  parseFloat(element.qtPesoContagem);

                this.getInfoInventarioRotativo(element.cdMaterial).subscribe(
                  (response: any) => {
                    if (response.status == 204)
                      element.somaInventarioRotativo = 0;
                    else
                      element.somaInventarioRotativo = parseFloat(
                        response.body.saldoEstoque
                      );
                    element.resultadoInventario =
                      parseFloat(element.saldoEstoque) +
                      element.somaInventarioRotativo;
                  }
                );
              });
            }
          },
          (error) => {
            this.notice.notice(
              'Não há materiais cadastrados para esse inventário.'
            );
          }
        );
    }
  }

  getInfoInventario() {
    this.relatorioService
      .getInfoInventario(this.idInventario)
      .subscribe((response: any) => {
        this.listaInfo = response;
        this.resultadoDiferenca =
          parseFloat(this.listaInfo.saldoEstoque) -
          parseFloat(this.listaInfo.qtPesoEstoque);
      });
  }

  getInfoInventarioRotativo(cdMaterial) {
    return this.relatorioService.getInfoInventarioRotativo(
      this.idInventario,
      cdMaterial
    );
  }

  getInfoInventarioRotativoGeral() {
    return this.relatorioService
      .getInfoInventarioRotativoGeral(this.idInventario)
      .subscribe((response: any) => {
        this.inventarioRotativoTotal = parseFloat(response.saldoEstoque);
        this.resultTotalInventario =
          parseFloat(this.listaInfo.saldoEstoque) +
          parseFloat(this.inventarioRotativoTotal);
      });
  }

  onDownload() {
    this.loaderNavbar = true;
    setTimeout(() => {
      this.pdfService.download(
        'download',
        `${this.idInventario}_ResultadoInventario`
      );
      this.loaderNavbar = false;
    }, 1000);
  }
}
