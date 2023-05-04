import { Component, OnInit, TemplateRef, ViewChild, OnDestroy } from '@angular/core';

import { finalize } from 'rxjs/operators';
import { Subscription } from 'rxjs';

import { PdfService } from 'src/app/shared/services/core/pdf.service';
import { XlsxService } from 'src/app/shared/services/core/xlsx.service';
import { LogisticaEntregaRomaneiosService } from '../../services/romaneios.service';
/* import { LogisticaEntregaRelatoriosService } from '../../services/relatorios.service'; */
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';

import { ILogisticaEntregaRomaneio } from './../../models/romaneio';

import { BsModalService, BsModalRef } from 'ngx-bootstrap';

@Component({
  selector: 'logistica-entrega-romaneios-capa-romaneio',
  templateUrl: './capa-romaneio.component.html',
  styleUrls: ['./capa-romaneio.component.scss']
})
export class LogisticaEntregaRomaneiosCapaRomaneioComponent implements OnInit, OnDestroy {

  @ViewChild('template', { static: false }) template: TemplateRef<any>;

  romaneio: ILogisticaEntregaRomaneio;
  pedidos: Array<any> = [];
  materiais: Array<any> = [];

  loadingPedidos: boolean = true;

  $subscription: Subscription;

  modalRef: BsModalRef;

  constructor(
    private romaneiosService: LogisticaEntregaRomaneiosService,
    /* private relatoriosService: LogisticaEntregaRelatoriosService, */
    private pnotify: PNotifyService,
    private xlsxService: XlsxService,
    private modalService: BsModalService,
    private pdfService: PdfService
  ) { }

  ngOnInit(): void {
    this.getLogos();
    this.onSubscriptions();
  }

  ngOnDestroy(){
    this.$subscription?.unsubscribe();
    if(this.modalRef !== undefined)
      this.modalRef.hide();
  }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {
      animated: false,
      class: 'modal-xxl',
      backdrop: 'static'
    });
  }

  onSubscriptions(){
    this.$subscription = this.romaneiosService
      .onDownloadEmmiter()
      .subscribe(
        (romaneio: ILogisticaEntregaRomaneio) => {
          this.romaneio = romaneio;

          let params = {
            CD_ROMA: romaneio.CD_ROMA,
            CD_FILI: romaneio.CD_FILI,
            ROMA_PEDI_IN_STAT: 1,
            TP_PEDI: 'FATURAMENTO',
            ORDE_BY: ' ENTR_NR_SQNC ',
            ORDE_TYPE: ' ASC '
          }

          this.pedidos = [];

          this.getPedidos(params);
          this.openModal(this.template)
        }
      )
  }

  onDownload(){
    const txt = document.querySelector('textarea');

    if(!txt?.value)
      txt?.classList.add('d-none');

    this.pdfService.download('capaRomaneio', this.getNomeDownload());

    txt?.classList.remove('d-none');
  }

  getNomeDownload(){
    const d = (new Date());
    const timestamp = `${d.getFullYear()}_${d.getMonth()}_${d.getDate()}_${d.getHours()}_${d.getMinutes()}_${d.getSeconds()}`;
    return `romaneio__${this.romaneio?.CD_ROMA}__${timestamp}`;
  }

  onPrint(){
    const txt = document.querySelector('textarea');

    if(!txt?.value)
      txt?.classList.add('d-none');

    window.print();

    txt?.classList.remove('d-none');
  }

  getPedidos(params) {

    this.loadingPedidos = true;

    this.romaneiosService
      .getPedidos(params)
      .pipe(
        finalize(() => {
          this.loadingPedidos = false;
        })
      )
      .subscribe(
        (response) => {

          if (response.status !== 200) {
            return;
          }

          this.pedidos = response.body['data'];

          this.pedidos.map(pedido => this.getMateriais(pedido));

        },
        (error) => {
        }
      )
  }

  getMateriais(pedido){

    if(pedido.hasOwnProperty("MATE"))
      return

    pedido.materialLoading = true;

    const _params = {
      "CD_PEDI": pedido["CD_PEDI"],
      "CD_EMPR": pedido["CD_EMPR"],
    }

    this.romaneiosService
      .getMateriais(_params)
      .pipe(
        finalize(() => {
          pedido.materialLoading = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status !== 200) {
            return;
          }
          pedido["MATE"] = response.body['data'];
        },
        (error) => {

        }
      )
  }

  getLogos() : Array<string>{

    return [
      "/assets/images/logo/clientes/monterrey_mtcorp_com_br_colorido.png",
      //"/assets/images/logo/clientes/logo_steellog_fundo_transparente.png"
    ];

  }

  onExcel(){

    const params = {
      "CD_ROMA": this.romaneio["CD_ROMA"]
    }

    this.pnotify.success('Seu relatório será gerado em instantes.');

    this.romaneiosService
      .getRelatorios(params)
      .pipe(
        finalize(() => {
        })
      )
      .subscribe(
        (response) => {
          if (response.status !== 200) {
            return;
          }

          this.xlsxService.export({ "data": response.body['data'], "filename": this.getNomeDownload()})
        },
        (error) => {

        }
      )
  }

}
