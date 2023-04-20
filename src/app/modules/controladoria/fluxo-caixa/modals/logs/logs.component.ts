import { Component, OnInit,ViewChild,
  ElementRef,
  OnDestroy, } from '@angular/core';

  import { BsModalRef, BsModalService } from 'ngx-bootstrap';
  import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';
  import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
  import { PageChangedEvent } from 'ngx-bootstrap/pagination';
  import { DetailPanelService } from 'src/app/shared/templates/detail-panel/detal-panel.service';
  import { Subscription } from 'rxjs';  
import { ControladoriaFluxoCaixaService } from '../../services/fluxo-caixa.service';

@Component({
  selector: 'controladoria-fluxo-caixa-logs',
  templateUrl: './logs.component.html',
  styleUrls: ['./logs.component.scss']
})
export class ControladoriaFluxoCaixaLogsComponent implements OnInit, OnDestroy {
  @ViewChild('template', { static: false }) template: ElementRef;
  spinnerFullScreen: boolean = false;
  dados: any = [];
  items = [];
  noResult = false;
  dadosEmpty = false;
  log: any = {};
  $serviceSubscription: Subscription;
  $serviceModalSubscription: Subscription;

  appTitle = 'Detalhes';

  modalRef: BsModalRef;
  config = {
    animated: false,
    ignoreBackdropClick: true,
    class: 'modal-xxl',
  };

  /* Painel de detalhes */
  $showDetailPanelSubscription: Subscription;
  showDetailPanel = false;
  detailPanel = 'modal';

  tableLogConfig: Partial<CustomTableConfig> = {
    hover: true,
  };

  /* Paginação */
  itemsPerPage: number = 10;
  totalItems: number;
  currentPage: number = 1;
  begin: number = 0;
  end: number = 10;

  constructor(
    private modalService: BsModalService,
    private service: ControladoriaFluxoCaixaService,
    private notice: PNotifyService,
    private detailPanelService: DetailPanelService
  ) {}

  ngOnInit(): void {
    this.openModal();
    this.onDetailPanel();
  }

  ngOnDestroy() {
    this.$serviceSubscription.unsubscribe();
    this.$serviceModalSubscription.unsubscribe();
  }

  openModal(): void {
    this.$serviceModalSubscription = this.service
      .getStateModal()
      .subscribe((response) => {
        console.log(response)
        this.dados = response;
        this.modalRef = this.modalService.show(this.template, this.config);
        this.showDetailPanel = false;
        this.getLog();
      });
  }

  getLog() {
    this.items = [];
    this.spinnerFullScreen = true;
    let param = {
      COD_LANCAMENTO: this.dados['COD_LANCAMENTO'],
    };
    this.service.getLog(param).subscribe((response) => {
      if (response.status === 204) {
        this.notice.notice('Não existe log registrado.');
        this.spinnerFullScreen = false;
      } else {
        this.items = response.body['data'];
        this.totalItems = response.body['data'].length;
        this.dadosEmpty = false;
        this.noResult = true;
        this.spinnerFullScreen = false;
      }
    });
  }

  /* Paginação */
  onPageChanged(event: PageChangedEvent): void {
    this.begin = (event.page - 1) * event.itemsPerPage;
    this.end = event.page * event.itemsPerPage;
  }
  /* Paginação */

  onDetailPanel(): void {
    this.$showDetailPanelSubscription = this.detailPanelService.config.subscribe(
      (event: any) => {
        if (this.detailPanel !== 'modal') return;

        this.showDetailPanel = event.showing;
        if (!this.showDetailPanel)
          this.items.map((item) => (item.selected = false));
      }
    );

    this.$serviceSubscription = this.service
      .getDetailPanel()
      .subscribe((event) => {
        this.detailPanel = event;
        this.detailPanelService.loadedFinished(false);
      });
  }

  openTab(log) {
    console.log(log);
    this.items.map((item) => (item.selected = false));
    this.log = log;
    this.log.selected = true;
    this.service.setDetailPanel('modal');
  }
}
