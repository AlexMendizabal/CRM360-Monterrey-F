import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';

import { finalize } from 'rxjs/operators';
import { Subscription } from 'rxjs';

import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { XlsxService } from 'src/app/shared/modules/xlsx/xlsx.service';
//Converte rota em base64
import { RouterService } from 'src/app/shared/services/core/router.service';

import { PageChangedEvent } from 'ngx-bootstrap/pagination/ngx-bootstrap-pagination';

import { SulFluminenseAuditoriaLotesService } from './auditoria-lotes.service';
import { DateService } from 'src/app/shared/services/core/date.service';
import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';

@Component({
  selector: 'auditoria-lotes',
  templateUrl: './auditoria-lotes.component.html',
  styleUrls: ['./auditoria-lotes.component.scss']
})
export class SulFluminenseEstoqueAvancadoAuditoriaLotesComponent implements OnInit {
  idSubModulo: any;

  form: FormGroup;

  breadCrumbTree: any;

  $subscription: Subscription;

  params: any = {};

  /* Ordenação */
  reverse: boolean = false;
  key: string = 'CODIGO_MATERIAL';
  /* Ordenação */

  /* Paginação */
  itemsPerPage: number = 15;
  begin: number = 0;
  end: number = 15;
  /* Paginação */

  carregando: boolean = false;
  carregandoNavBar: boolean = false;
  carregou: boolean = false;
  exibirFiltro: boolean = false;
  visualizaTabela: boolean = false;
  listaVazia: boolean = false;

  id_tipo: string;
  id_tipo_tabela: string;

  linhas: Array<any> = [];
  classes: Array<any> = [];
  materiais: Array<any> = [];
  listaAuditoria: Array<any> = [];
  listaAuditoriaExcel: Array<any> = [];

  tipoRelatorios = [
    { id_tipo: '5', nome: 'Lotes Conferidos' },
    { id_tipo: '4', nome: 'Auditoria de estoque' },
/*     { id_tipo: '3', nome: 'Estoque por lote' },
    { id_tipo: '2', nome: 'Estoque de faturamento' }, */
    { id_tipo: '1', nome: 'Materias em lote' }
  ];

  /* Config Table */
  tableConfig: Partial<CustomTableConfig> = {
    isFixed: true,
  };

  constructor(
    private rotaAtiva: ActivatedRoute,
    private formBuilder: FormBuilder,
    private serviceAuditoria: SulFluminenseAuditoriaLotesService,
    private pnotify: PNotifyService,
    private router: Router,
    private routerService: RouterService,
    private activatedRoute: ActivatedRoute,
    private xlsxService: XlsxService,
    private atividadesService: AtividadesService,
    private dateService: DateService
  ) {
    this.form = this.formBuilder.group({
      relatorio: [null, [Validators.required]],
      linhas: [null],
      classes: [null],
      materiais: [null],
      CD_LINH: [null],
      time: [new Date().getTime()]
    });
  }

  ngOnInit(): void {
    this.registrarAcesso();
    this.onBreadCumbTree();
    this.form.get('classes').disable();
    this.form.get('materiais').disable();
    this.getLinhas();
    this.onActivatedRoute();
  }

  registrarAcesso(): void {
    this.atividadesService.registrarAcesso().subscribe();
  }

  onActivatedRoute(): void {
    this.$subscription = this.activatedRoute.queryParams.subscribe(
      queryParams => {
        if (Object.keys(queryParams).length > 0) {
          let _response = this.routerService.getBase64UrlParams(queryParams);
          this.form.patchValue(_response);
          if(_response['relatorio'] == 5){
            this.getLotesConferidos();
            this.setValoresFormulario(this.getParams(_response));
          } else{
            this.getRelatorioAuditoriaLotes(this.getParams(_response));
            this.setValoresFormulario(this.getParams(_response));
          }
        }
      }
    );
    this.$subscription.unsubscribe();
  }

  setValoresFormulario(params: any): void {
    let relatorio = params['relatorio'];
    let linhas = params['linhas'];
    let classes = parseInt(params['classes']);
    let materiais = parseInt(params['materiais']);

    if (relatorio) {
      this.exibirFiltro = true;
    }

    this.form.get('relatorio').setValue(relatorio);
    this.form.get('linhas').setValue(linhas);

    if (linhas) {
      this.serviceAuditoria
        .getClasses(linhas)
        .pipe(
          finalize(() => {
            this.form.patchValue({
              classes: classes
            });
          })
        )
        .subscribe((res: any) => {
          if (Object.keys(res).length > 0) {
            this.classes = res['body'];
            this.form.get('classes').enable();
            this.setValorMaterial(linhas, classes, materiais);
          }
        });
    } else {
      this.form.get('classes').disable();
    }
  }

  setValorMaterial(linhas: any, classes: any, materiais: any): void {
    if (this.form.get('classes').status == 'VALID') {
      this.serviceAuditoria
        .getMateriais(linhas, classes)
        .pipe(
          finalize(() => {
            this.form.patchValue({
              materiais: materiais
            });
          })
        )
        .subscribe((res: any) => {
          if (Object.keys(res).length > 0) {
            this.materiais = res['body'].result;
            this.form.get('materiais').enable();
          }
        });
    } else {
      this.form.get('materiais').disable();
    }
  }

  onBreadCumbTree(): void {
    this.rotaAtiva.params.subscribe((params: any) => {
      this.idSubModulo = params['idSubModulo'];
      this.breadCrumbTree = [
        {
          descricao: 'Home',
          routerLink: '/sul-fluminense/home'
        },
        {
          descricao: 'Estoque Avançado',
          routerLink: `/sul-fluminense/estoque-avancado/${this.idSubModulo}`
        },
        {
          descricao: 'Painel de auditoria Estoque Avançado'
        }
      ];
    });
  }

  onFilter(): void {
    this.exibirFiltro = true;
    this.form.get('time').setValue(new Date().getTime());

    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: this.routerService.setBase64UrlParams(this.getParam())
    });

    if(this.form.value['relatorio'] == 5){
      this.getLotesConferidos();
    } else
    this.getRelatorioAuditoriaLotes(this.getParam());
  }

  getParams(params: any): any {
    let relatorio = params['relatorio'];
    let linhas = params['linhas'];
    let classes = params['classes'];
    let materiais = params['materiais'];

    return {
      relatorio: relatorio,
      linhas: linhas,
      classes: classes,
      materiais: materiais
    };
  }

  AtivaFiltro(): void {
    this.exibirFiltro = !this.exibirFiltro;
  }

  getLinhas(): void {
    this.carregandoNavBar = true;

    this.serviceAuditoria
      .getLinhas()
      .pipe()
      .subscribe((res: any) => {
        if (Object.keys(res).length > 0) {
          if (res.status == 200) {
            this.carregandoNavBar = false;
            this.linhas = res['body'];
          } else if (res.status == 204) {
            this.pnotify.notice('Não há dados');
          }
        } else {
          this.pnotify.error('Erro ao carregar dados');
        }
      });
  }

  getClasses(): void {
    this.classes = [];
    this.carregandoNavBar = true;

    if (this.form.get('linhas').value != undefined) {
      if(this.form.value['relatorio'] != 5){
        this.form.get('classes').setValidators([Validators.required]);
        this.form.get('materiais').setValidators([Validators.required]);
      }

      let descricaoLinhas = this.form.get('linhas').value;
      this.serviceAuditoria.getClasses(descricaoLinhas).subscribe(
        (res: any) => {
          if (Object.keys(res).length > 0) {
            if (res.status == 200) {
              this.carregandoNavBar = false;
              this.classes = res['body'];
            }
            this.form.get('classes').reset();
            this.form.get('classes').enable();
          }
        },
        error => {
          this.pnotify.error('Erro ao carregar filtro Classes');
        }
      );
    } else {
      this.form.get('classes').setValidators([Validators.nullValidator]);
      this.form.get('materiais').setValidators([Validators.nullValidator]);
      this.form.get('classes').reset();
      this.form.get('materiais').reset();
      this.form.get('classes').disable();
      this.form.get('materiais').disable();
    }
  }

  getMateriais(): void {
    this.materiais = [];
    this.carregandoNavBar = true;

    if (
      this.form.get('classes').value !== undefined &&
      this.form.get('classes').status === 'VALID'
    ) {
      let descricaoLinhas = this.form.get('linhas').value;
      let idClasses = this.form.get('classes').value;
      this.serviceAuditoria.getMateriais(descricaoLinhas, idClasses).subscribe(
        (response: any) => {
          if (Object.keys(response).length > 0) {
            if (response['body'].responseCode === 200) {
              this.materiais = response['body'].result;
              this.form.get('materiais').reset();
              this.form.get('materiais').enable();
            } else if (response['body'].responseCode === 204) {
              this.materiais = [];
              this.pnotify.notice(
                'Não há materiais cadastrados para essa classe'
              );
            }
          }
          this.carregandoNavBar = false;
        },
        error => {
          this.pnotify.error('Erro ao carregar filtro Materias');
        }
      );
    } else {
      this.form.get('materiais').reset();
      this.form.get('materiais').disable();
    }
  }

  getRelatorioAuditoriaLotes(params: any): void {
    this.begin = 0;
    this.end = 15;
    this.id_tipo_tabela = params['relatorio'];
    this.visualizaTabela = false;
    this.carregando = true;
    this.carregandoNavBar = false;

    this.serviceAuditoria
      .getRelatorioAuditoriaLotes(params)
      .pipe(
        finalize(() => {
          this.carregando = false;
        })
      )
      .subscribe(res => {
        if (res['status'] == 200) {
          this.visualizaTabela = true;
          this.listaVazia = false;
          this.listaAuditoria = res['body']['data'];
          this.listaAuditoriaExcel = res['body']['data'];
        } else if (res['status'] == 204) {
          this.pnotify.notice('Não há dados a serem exibidos.');
          this.listaVazia = true;
        } else {
          this.pnotify.error('Erro ao carregar dados');
        }
      });
  }

  setTooltip($event: any): void {
    this.id_tipo = $event.id_tipo;
  }

  exportarExcel(): void {
    /* Remove a coluna NF_EMISSAO_CLARION da lista */
    this.listaAuditoriaExcel.forEach(
      element => {
        delete element['DATA_ENTRADA_CLARION'],
        delete element['ID_CLASSE'],
        delete element['ID_LINHA']
      }
    );

    /* Chama o serviço para exportar dados em documento excel */
    this.xlsxService.exportFile(this.listaAuditoriaExcel, 'relatório');
  }

  /* Ordenação */
  sort(key: string): void {
    this.key = key;
    this.reverse = !this.reverse;
  }
  /* Ordenação */

  /* Paginação */
  onPageChanged(event: PageChangedEvent): void {
    this.begin = (event.page - 1) * event.itemsPerPage;
    this.end = event.page * event.itemsPerPage;
  }
  /* Paginação */

  /* VALIDAÇÕES DO FILTRO */
  onFieldError(field: string): string {
    if (this.onFieldInvalid(field)) {
      return 'is-invalid';
    }
    return '';
  }

  onFieldInvalid(field: any): any {
    field = this.form.get(field);
    return field.status == 'INVALID' && field.touched;
  }

  onFieldRequired(field: string): any {
    let required = false;
    let formControl = new FormControl();

    if (this.form.controls[field].validator) {
      let validationResult = this.form.controls[field].validator(formControl);
      required =
        validationResult !== null && validationResult.required === true;
    }

    if (required) {
      return 'is-required';
    }
  }

  getParam() {
    let _params = {};
    let _obj = this.form.value;

    for (let prop in _obj) {
      if (_obj[prop]) {
        if (_obj[prop] instanceof Date)
          _params[prop] = this.dateService
            .convertToBrazilianDate(_obj[prop])
            .substring(0, 10);
        else _params[prop] = _obj[prop];
      }
    }

    return _params;
  }

  getLotesConferidos(){
    this.carregando = true;
    this.id_tipo_tabela = this.form.value['relatorio']
    this.serviceAuditoria
    .getLotesConferidos(this.getParam())
    .pipe(
      finalize(() =>{
        this.carregando = false;
        this.visualizaTabela = true;
      })
    )
    .subscribe(response => {
      if (response.status === 204) {
        this.pnotify.notice('Não há lotes conferidos.');
      } else {
        this.listaAuditoria = response.body['data'];
        this.listaAuditoriaExcel = response.body['data'];
      }
    });
  }

  getReset(){
    this.form.get('classes').setValidators([Validators.nullValidator]);
    this.form.get('materiais').setValidators([Validators.nullValidator]);
    this.form.get('linhas').reset();
    this.form.get('classes').reset();
    this.form.get('materiais').reset();
    this.form.get('classes').disable();
    this.form.get('materiais').disable();
  }
}
