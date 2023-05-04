import { finalize } from 'rxjs/operators';
import { Component, OnInit, Input } from '@angular/core';

// Services
import { DateService } from 'src/app/shared/services/core/date.service';
import { ComercialDashboardVendedorService } from '../../vendedor.service';

// Interfaces
import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';

@Component({
  selector: 'comercial-dashboard-vendedor-desempenho-linha',
  templateUrl: './linha.component.html',
  styleUrls: ['./linha.component.scss']
})
export class ComercialDashboardVendedorDesempenhoLinhaComponent
  implements OnInit {
  @Input('idVendedor') idVendedor: number;
  @Input('idEscritorio') idEscritorio: number;

  tableConfig: Partial<CustomTableConfig> = {
    small: false,
    hover: false
  };

  linhas: Array<any> = [];
  totais: Array<any> = [];
  pastLinhas: Array<any> = [];
  pastTotais: Array<any> = [];
  currLinhas: Array<any> = [];
  currTotais: Array<any> = [];

  linhasLoaded: boolean = false;
  linhasEmpty: boolean = false;

  pastMonth: string;
  currMonth: string;
  activeMonth: string;

  constructor(
    private dashboardService: ComercialDashboardVendedorService,
    private dateService: DateService
  ) {}

  ngOnInit() {
    this.renderMonthFilters();
    this.getListData(this.idEscritorio, this.idVendedor);
  }

  resetListData() {
    this.pastLinhas = [];
    this.pastTotais = [];
    this.currLinhas = [];
    this.currTotais = [];
    this.linhasLoaded = false;
    this.linhasEmpty = false;
  }

  getListData(escritorio: number, vendedor: number) {
    this.resetListData();

    this.dashboardService
      .getDesempenhoLinhas(escritorio, vendedor)
      .pipe(
        finalize(() => {
          this.linhasLoaded = true;
        })
      )
      .subscribe((response: any) => {
        this.renderList(response);
      });
  }

  renderList(response: any) {
    if (response['responseCode'] === 200) {
      if (
        response['result']['passado'] &&
        response['result']['passado']['analitico'].length > 0
      ) {
        this.pastLinhas = response['result']['passado']['analitico'];
        this.pastTotais = response['result']['passado']['total'];
      }

      if (
        response['result']['corrente'] &&
        response['result']['corrente']['analitico'].length > 0
      ) {
        this.currLinhas = response['result']['corrente']['analitico'];
        this.currTotais = response['result']['corrente']['total'];
        this.linhas = this.currLinhas;
        this.totais = this.currTotais;
      } else {
        this.handleEmpty();
      }
    } else {
      this.handleEmpty();
    }
  }

  getPerformanceSum(column: string): number {
    let sum = 0;

    if (this.linhas) {
      for (let i = 0; i < this.linhas.length; i++) {
        sum += this.linhas[i][column];
      }
    }

    return sum;
  }

  handleEmpty() {
    this.linhasEmpty = true;
  }

  renderMonthFilters() {
    const currDate = new Date();
    const pastDate = new Date();

    if (currDate.getDate() === 31) {
      pastDate.setDate(currDate.getDate() - 31);
    } else {
      pastDate.setDate(currDate.getDate() - 30);
    }

    this.currMonth = this.dateService.getFullMonth(currDate);
    this.pastMonth = this.dateService.getFullMonth(pastDate);
    this.activeMonth = this.currMonth;
  }

  setMonth(type: string, month: string) {
    this.activeMonth = month;

    this.linhasLoaded = false;
    this.linhasEmpty = false;

    this.linhas = [];

    if (type == 'past') {
      if (this.pastLinhas.length > 0) {
        this.linhas = this.pastLinhas;
        this.totais = this.pastTotais;
      } else {
        this.handleEmpty();
      }
    } else if (type == 'current') {
      if (this.currLinhas.length > 0) {
        this.linhas = this.currLinhas;
        this.totais = this.currTotais;
      } else {
        this.handleEmpty();
      }
    }

    setTimeout(() => {
      this.linhasLoaded = true;
    }, 1000);
  }
}
