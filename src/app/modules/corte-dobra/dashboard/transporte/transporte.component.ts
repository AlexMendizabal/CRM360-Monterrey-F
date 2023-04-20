import { finalize, delay } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { CorteDobraDashboardService } from './../dashboard.service';
import { CorteDobraChartsService } from './../charts.service';
import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';

@Component({
  selector: 'corte-dobra-dashboard-transporte',
  templateUrl: './transporte.component.html',
  styleUrls: ['./transporte.component.scss']
})
export class CorteDobraDashboardTransporteComponent implements OnInit {
  
  taxaOcupacao: number = 0;
  errorLoaded: boolean = false;
  taxaOcupacaoEvent: number = 0;

  loading: boolean = true;
  
  
  constructor(
    private corteDobraDashboardService: CorteDobraDashboardService,
    private chartService: CorteDobraChartsService,
    private activatedRoute: ActivatedRoute,
    private pnotify: PNotifyService
    ) { }
    
    ngOnInit() {
      this.activatedRoute
      .queryParams
      .subscribe(
        data => {
          if(Object.keys(data).length !== 0)
            this.makeValue(data)
        },
        error => {
          this.errorLoaded = false;
          this.pnotify.error("Erro ao carregar Faturamento");
        });
      }
      
      makeValue(data) {
     this.corteDobraDashboardService
        .getTaxaOcupacao(data)
        .pipe(
              finalize(() => this.loading = false),
              delay(1000)
            )
        .subscribe(
          (data: any) => {
            if(data.status == 200){
              this.taxaOcupacao = data["body"]["taxaOcupacao"]
            }
          }
        );
    }

    //Envia evento ao Analitico.component para abrir transporte Analitico
    onTransporteAnalitico(){
      this.corteDobraDashboardService.setAnaliticoTransporte(true);
    }

}
