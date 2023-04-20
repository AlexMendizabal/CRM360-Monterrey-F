import { DateService } from 'src/app/shared/services/core/date.service';
import { object } from '@amcharts/amcharts4/core';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { Custos } from './../models/PainelCustos';
import { ComercialCadastroPainelCustosService } from './../painel-custos.service';
import { CustomTableConfig } from './../../../../../shared/templates/custom-table/models/config';
import { finalize } from 'rxjs/operators';


import { Router, ActivatedRoute } from '@angular/router';

import { DetailPanelService } from 'src/app/shared/templates/detail-panel/detal-panel.service';

import { FormGroup, FormBuilder} from '@angular/forms';
import { Component} from '@angular/core';


@Component({
  selector: 'lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.scss'],
  providers: [DetailPanelService],
})
export class ComercialCadastroPainelCustosListaComponent

{
  breadCrumbTree: any = [];
  form: FormGroup;
  listas: Array<Custos> = [];
  details: any = [];
  showDetailPanel = false;
  dadosEmptyDetalhes = false;
  dadosfiltro = false;
  loaderFullScreen: boolean = false;
  loaderNavbar: boolean = false;
  dados: Array<Custos> = [];

  

  appTitle = 'Painel de Custos';


  /* Paginação */
  itemsPerPage: number = 10;
  totalItems: number;
  currentPage: number = 1;
  begin: number = 0;
  end: number = this.itemsPerPage;

  orderBy = 'id';
  orderType = 'DESC';

  /* Config Table */
  tableConfig: Partial<CustomTableConfig> = {
    subtitleBorder: true,
  };

  constructor(
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private servicePainelCustos: ComercialCadastroPainelCustosService,
    private router: Router,
    private pnotifyService: PNotifyService,
    private dateService: DateService,
  ){
    this.form = this.formBuilder.group({
      ID_ITEM: [null],
      NM_ITEM: [null],
      NM_LINH: [null],
      NM_FAMI: [null],
      IN_STAT: "",
      registros: 10,
    });
  }
  ngOnInit(): void {
    this.setBreadCrumb();
  }

  onPageChanged(event: PageChangedEvent) {
    this.begin = (event.page - 1) * event.itemsPerPage;
    this.end = event.page * event.itemsPerPage;
  }

  setBreadCrumb() {
    const id = this.activatedRoute.snapshot.params.idSubModulo;
    this.breadCrumbTree = [
      {
        descricao: 'Home',
        routerLink: `/comercial/home`,
      },
      {
        descricao: 'Cadastros',
        routerLink: `/comercial/cadastros/${id}`,
      },
      {
        descricao: this.appTitle,
      },
    ];
  }
  showdetailPanel(custo: Custos): void {
    this.loaderFullScreen = true;
    this.showDetailPanel = true;
    this.servicePainelCustos.getdetail(custo).pipe(
      finalize(() => {
        this.loaderFullScreen = false;
      })
    ).subscribe(object => this.details[0] = object);
  }

  CloseshowdetailPanel(){
    this.showDetailPanel = false;
  }

  onEdit(custo: Custos): void{
    this.router.navigate(['../editar', custo.ID_ITEM], {
      relativeTo: this.activatedRoute,
    });
  }

  onFilter(): void {
    if (this.form.value['registros']) {
      this.itemsPerPage = this.form.value['registros'];
      this.end = this.form.value['registros'];
    }
      this.loaderFullScreen = true;
      this.currentPage = 1;
      this.dadosfiltro = true;
      this.servicePainelCustos.getlista(this.getParams()).pipe(
          finalize(() => {
            this.loaderFullScreen = false;
          })
        ).subscribe({
          next: response => {
            if (response.status == 200) {
              this.listas = response.body;
              this.totalItems = response.body.length
              console.log(this.totalItems);
            }
            else{
              this.pnotifyService.error('Erro ao carregar');
            }
          }
        });
  }

  getParams() {
    let _params = {};

    let _obj = this.form.value;

    for (let prop in _obj) {
      if (_obj[prop]) {
        if (_obj[prop] instanceof Date)
          _params[prop] = this.dateService.convertToUrlDate(_obj[prop]);
        else _params[prop] = _obj[prop];
      }
    }
    return _params;
  }

  altersituacao(custo: Custos): void{
    if(custo.IN_STAT == 0){
      custo.IN_STAT = 1
      this.servicePainelCustos.putalteracao(custo).subscribe((success: any) => {
        this.pnotifyService.success();
      },
      (error: any) => {
        this.pnotifyService.error();
      });
    }
    else{
      custo.IN_STAT = 0
      this.servicePainelCustos.putalteracao(custo).subscribe((success: any) => {
        this.pnotifyService.success();
      },
      (error: any) => {
        this.pnotifyService.error();
      });
    }
  }
}
