import { CorteDobraChartsService } from './../charts.service';
import { Component, OnInit, Input, EventEmitter, ElementRef, ViewChild, Output } from '@angular/core';
import { CorteDobraDashboardService } from '../dashboard.service';
import { ActivatedRoute } from '@angular/router';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { delay, finalize, map, tap, take} from 'rxjs/operators';
import { PageChangedEvent } from 'ngx-bootstrap/pagination/ngx-bootstrap-pagination';
import { Subscription } from 'rxjs';


@Component({
  selector: 'corte-dobra-dasboard-analitico',
  templateUrl: './analitico.component.html',
  styleUrls: ['./analitico.component.scss']
})
export class CorteDobraDashboardAnaliticoComponent implements OnInit {
    
  loading: boolean = false;
  isVisible: boolean = false;
  ocorrencia: boolean;
  transporte: boolean;
  noResult: boolean = true;
  items: any = [];
  itemsTaxa: any = [];
  unidade: any;
  periodo: any;
  tableData: any;
  
  subscription$: Subscription = new Subscription();
  
  
  
  /* Ordenação tabela */
  fieldOrder: string = "ficha";
  ascending: boolean = true;
  /* Ordenação tabela */
  
  /* Paginação */
  itemsPerPage: number = 10;
  totalItems: number = 10;
  currentPage: number = 1;
  begin: number = 0;
  end: number = 10;
  /* Paginação */

  AnaliticoTransporte: boolean = false;
  
  
  constructor(
    private corteDobraDashboardService: CorteDobraDashboardService,
    private activatedRoute: ActivatedRoute,
    private pnotify: PNotifyService,
    private chartService: CorteDobraChartsService,
    ) { }
    
    
    @ViewChild('scroll', { static: false }) scroll: ElementRef;

  ngOnInit() {

    this.corteDobraDashboardService.eventAnaliticoTransporte.subscribe(
      event =>this.setAnaliticoTransporte(event)
    );

    //carrega Analitico
    this.activatedRoute
      .queryParams
      .subscribe(
        parametros => {
          this.makeTable(parametros);
        });
  }

  makeTable(paramentros) {
    this.getOcorrenciasAnalitico(paramentros);
    this.getTransportesAnalitico(paramentros);
  }

  getOcorrenciasAnalitico(parametros) {
    this.subscription$ = this.chartService
    .eventClick
    .subscribe(
      data => {
        this.items = [];

        this.loading = false;
              this.isVisible= true;
              this.ocorrencia = true;
              this.transporte = false;
      
              let params = {
                "unidade": parametros["unidade"],
                "periodo": parametros["periodo"],
                "categoria": data["categoria"]
              };
      
              this.corteDobraDashboardService
              .getOcorrenciasAnalitico(params)
              .pipe(
                delay(1000),
                finalize(() => {
                this.loading = true;
                })
              )
              .subscribe(
                response => {
                    this.items = response["body"];
                    this.noResult = response["status"] === 200 ? false : true;
                  },
                error => this.noResult = true
              )
      }

    )
  }

  getTransportesAnalitico(parametros){
    this.subscription$ = this.corteDobraDashboardService
    .eventAnaliticoTransporte
    .subscribe(
      data => {
        this.items = [];
        this.loading = false;
        this.isVisible= true;
        this.ocorrencia = false;
        this.transporte = true;

        let params = {
          "unidade": parametros["unidade"],
          "periodo": parametros["periodo"],
          "categoria": data["categoria"]
        };

        this.corteDobraDashboardService
        .getTaxaOcupacaoAnalitico(params)
        .pipe(
          delay(1000),
          finalize(() => {
          this.loading = true;
          })
        )
        .subscribe(
          response => {
              this.items = response["body"];
              this.noResult = response["status"] === 200 ? false : true;
            },
          error => this.noResult = true
        )
      }
    )
  }

  ngOnDestroy(): void {
    this.subscription$.unsubscribe();    
  }  


  onClose(){
    this.isVisible = false;
  }
  

  /* Paginação */

  /* Paginação */
  onPageChanged(event: PageChangedEvent): void {
    this.begin = (event.page - 1) * event.itemsPerPage;
    this.end = event.page * event.itemsPerPage;
  }
  /* Paginação */

  /* Ordena a tabela */
  sortTable(parm): void {
    this.ascending = !this.ascending;

    this.items.sort((a, b) => a[parm] > b[parm]);

    if (this.ascending){
      this.items.sort((a, b) => a[parm].localeCompare(b[parm]));
    }else{
      this.items.sort((a, b) => b[parm].localeCompare(a[parm]));
    }
  }
  /* Ordena a tabela */

  scrollToBottom() {
    setTimeout(() => {
      this.scroll.nativeElement.scrollIntoView();
    }, 500);
  }

  setAnaliticoTransporte(visivel: boolean) {
    this.AnaliticoTransporte = visivel;
    //console.log( this.AnaliticoTransporte)
  }
  

}