import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { Component, OnInit } from '@angular/core';

import { finalize, take, elementAt } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';
import { TitleService } from 'src/app/shared/services/core/title.service';
import { RouterService } from 'src/app/shared/services/core/router.service';
import { Subtitles } from 'src/app/shared/modules/subtitles/subtitles';

import { AbastecimentoCadastroMediaVendasService } from '../media-vendas.service';

@Component({
  selector: 'abastecimento-cadastros-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.scss']
})
export class AbastecimentoCadastrosMediaVendasListaComponent implements OnInit {
  loaderFullScreen: boolean = true;
  loading: boolean = false;
  loaderNavBar: boolean = false;
  loadingDetalhesLog: boolean = false;
  loadingLogs: boolean = false;
  noResult: boolean = false;
  noResultLogs: boolean = false;

  form: FormGroup;
  
  mediaVendas: any = [];
  dadosLogs: any = [];
  linhas: any = [];
  classes: any = [];

  $activatedRouteSubscription: Subscription;

  situacao: any = [
    {
      id: 0,
      name: "Não cadastrado"
    },
    {
      id: 1,
      name: "Cadastrado"
    }
  ];

  /* Paginação */
  itemsPerPage: number = 15;
  totalItems: number = 15;
  currentPage: number = 1;
  begin: number = 0;
  end: number = 15;
  /* Paginação */

  currentPageA: number = 1;
  beginA: number = 0;
  endA: number = 15;

  tableConfig: Partial<CustomTableConfig> = {
    subtitleBorder: true
  };

  subtitles: Array<Subtitles> = [
    {
      text: 'Com cadastro',
      color: 'green'
    },
    {
      text: 'Sem cadastro',
      color: 'red'
    },
  ];

  /* Ordenação */
  reverse: boolean = false;
  key: string = 'Linha';
  /* Ordenação */

  /* Ordenação modal */
  reverseA: boolean = false;
  keyA: string = 'DS_LINH';

  breadCrumbTree: any;

  constructor( 
    private pnotify: PNotifyService,
    private formBuilder: FormBuilder,
    private atividadesService: AtividadesService,
    private titleService: TitleService,
    private routerService: RouterService,
    private router: Router,
    private activatedRoute : ActivatedRoute,
    private service: AbastecimentoCadastroMediaVendasService
    ) { 
      this.form = this.formBuilder.group({
        linhas: [null],
        classes: [null],
        situacao: [null]
      });
    }

  ngOnInit(): void {
    this.disabledForms();
    setTimeout(() => {
      this.loaderFullScreen = false;
    }, 1000);
    this.onBreadCumbTree();
    this.registrarAcesso();
    this.checkRouterParams();
    this.getLinhas();
    this.titleService.setTitle('Média de Vendas');
  }

  disabledForms(): void {
    this.form.get('situacao').setValue(1);
    this.form.get('classes').disable();
  }

  onBreadCumbTree(): void {
    this.activatedRoute.params.subscribe((params: any) =>{
      this.breadCrumbTree = [
        {
          descricao: 'Home',
          routerLink: '/abastecimento/home'
        },
        {
          descricao: 'Cadastros',
          routerLink: `/abastecimento/cadastros/${params['idSubModulo']}`
        },
        {
          descricao: 'Média de vendas'
        }
      ];
    })
  }

  checkRouterParams(): void {
    this.$activatedRouteSubscription = this.activatedRoute.queryParams.subscribe(
      (queryParams: any) => {
        if (Object.keys(queryParams).length > 0) {
          let _response = this.routerService.getBase64UrlParams(queryParams);
          this.search(_response);
          this.setFormValues(_response);
        }
      }
    );
    this.$activatedRouteSubscription.unsubscribe();
  }

  registrarAcesso(): void {
    this.atividadesService.registrarAcesso().subscribe();
  }

  getLinhas(): void {
    this.service
      .getLinhas()
      .pipe(
        finalize(() => (this.loaderNavBar = false))
      )
      .subscribe((res: any) => {
        if(Object.keys(res).length > 0){
          this.linhas = res["body"];
        }
      },
      error => {
        this.pnotify.error("Erro ao carregar Linhas")
      });
  }

  getClasses(): void {
    this.classes = [];
    this.loaderNavBar = true;

    let descricaoLinhas = this.form.get('linhas').value;

    this.service
      .getClasses(descricaoLinhas)
      .pipe(
        finalize(() => this.loaderNavBar = false)
      )
      .subscribe((res: any) => {
        if(Object.keys(res).length > 0){
          if(res.status == 200) {
            this.form.get('classes').reset();
            this.form.get('classes').enable();
            this.classes = res["body"];
          } else if (res.status == 204) {
            this.form.get('classes').reset();
            this.form.get('classes').disable();
            this.pnotify.error("Não há dados");
          }
        }
      },
      error => {
        this.form.get('classes').reset();
        this.form.get('classes').disable();
      }
    )
  }

  setFormValues(queryParams: any): void {
    let linhas = queryParams["linhas"];
    let classes = queryParams["classes"];
    let situacao = queryParams["situacao"];

    if (Object.keys(linhas).length > 0) {
      this.loaderNavBar = true;
      this.service
        .getClasses(linhas)
        .pipe(
          finalize(() => this.loaderNavBar = false)
        )
        .subscribe((res: any) => {
          if(Object.keys(res).length > 0){
            if(res.status == 200) {
              this.form.get('classes').enable();
              this.classes = res["body"];
            } else if (res.status == 204) {
              this.form.get('classes').reset();
              this.form.get('classes').disable();
              this.pnotify.error("Não há dados");
            }
          }
        },
        error => {
          this.form.get('classes').reset();
          this.form.get('classes').disable();
          this.pnotify.error("Erro ao carregar Classes")
        }
      )
    } else {
      this.form.get('classes').disable();
    }

    this.form.patchValue({
      linhas: linhas,
      classes: classes,
      situacao: situacao
    });
  }

  onSearch(item: any): void {
    this.router.navigate([`../edita`],{
      relativeTo: this.activatedRoute,
      queryParams: this.routerService.setBase64UrlParams(item)
    });
  }

  openModal(item: any): void {
    //console.log(item);

    let params = {
      linha: item.Linha,
      classe: item.CodigoClasse
    }

    this.getLogs(params);
  }

  onNew(): void {
    this.router.navigate([`../cadastro`], {
      relativeTo: this.activatedRoute
    });
  }

  onFilter(): void {
    this.setRouterParams({
      linhas:
        this.form.value['linhas'] === null ||
        this.form.value['linhas'] === undefined
        ? ''
        : this.form.value['linhas'],
      classes:
        this.form.value['classes'] === null ||
        this.form.value['classes'] === undefined
        ? ''
        : this.form.value['classes'],
      situacao:
        this.form.value['situacao'] === null ||
        this.form.value['situacao'] === undefined
          ? ''
          : this.form.value['situacao'],
    });
  }

  setRouterParams(params: any): void {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: this.routerService.setBase64UrlParams(params)
    });
    this.search(params);
  }

  search(params: any): void{    
    this.loaderNavBar = true;
    this.loading = false;
    
    this.mediaVendas = [];
    this.service
    .getMediaVendas(params)
    .pipe(
      finalize(() => this.loaderNavBar = false)
      )
      .subscribe(res => {
        if(Object.keys(res).length > 0) {
          if(res.status == 200){
            this.loading = true;
            this.noResult = false;
            this.mediaVendas = res["body"];
            this.loadingDetalhesLog = true;
          } else if (res.status == 204){
            this.noResult = true;
            this.pnotify.notice("Não há itens a serem exibidos");
            this.loadingDetalhesLog = true;
          }
        }
      },
      error => {
        this.noResult = true;
        this.pnotify.error("Erro ao carregar Média de vendas")
      }
    );
  }

  getLogs(params: any): void {   
    this.loadingLogs = false;
    this.loaderNavBar = true;
    this.loadingDetalhesLog = false;
    
    this.dadosLogs = [];
    this.service
    .getMediaVendasLogs(params)
    .pipe(
      finalize(() => this.loaderNavBar = false)
      )
      .subscribe(res => {
        if(Object.keys(res).length > 0) {
          if(res.status == 200){
            this.loadingDetalhesLog = true;
            this.loadingLogs = true;
            this.noResultLogs = false;
            this.dadosLogs = res["body"];
          } else if (res.status == 204){
            this.loadingDetalhesLog = true;
            this.loadingLogs = false;
            this.noResultLogs = true;
            this.pnotify.notice("Não há itens a serem exibidos");
          }
        }
      },
      error => {
        this.loadingDetalhesLog = true;
        this.noResultLogs = true;
        this.pnotify.error("Erro ao carregar Média de vendas")
      }
    );
  }
  
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

  /* Paginação Modal*/
  onPageChangedA(event: PageChangedEvent): void {
    this.beginA = (event.page - 1) * event.itemsPerPage;
    this.endA = event.page * event.itemsPerPage;
  }

  sortA(keyA: string): void {
    this.keyA = keyA;
    this.reverseA = !this.reverseA;
  }
}
