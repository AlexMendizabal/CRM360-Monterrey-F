//rxjs
import { finalize } from 'rxjs/operators';
import { BsDatepickerConfig } from 'ngx-bootstrap';
//services
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { TitleService } from 'src/app/shared/services/core/title.service';
import { RouterService } from 'src/app/shared/services/core/router.service';
import { TecnologiaInformacaoEstoqueTipoProdutosService } from '../../tipo-produto/services/tipo-produto.service';
import { TecnologiaInformacaoEstoqueModeloService } from '../services/modelo.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
//angular
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  AbstractControl,
  Validators,
  FormControl,
} from '@angular/forms';
//interfaces
import { ITecnologiaInformacaoTipoProduto } from '../../tipo-produto/models/tipoProduto';
import { ITecnologiaInformacaoEstoqueModelo } from './../models/modelo';

import { Subscription } from 'rxjs';

@Component({
  selector: 'tecnologia-informacao-estoque-produtos-modelo-cadastro',
  templateUrl: './cadastro.component.html',
  styleUrls: ['./cadastro.component.scss'],
})
export class TecnologiaInformacaoEstoqueModeloCadastroComponent
  implements OnInit, OnDestroy {
  noResult: boolean;
  loading = false;
  loadingNavBar = false;
  breadCrumbTree: Array<any> = [];
  form: FormGroup;
  appTitle: string;
  bsConfig: Partial<BsDatepickerConfig>;
  loadingTipoProduto: boolean;
  modelos: Array<ITecnologiaInformacaoEstoqueModelo>;
  $activatedRouteSubscription: Subscription;
  tipoProduto: ITecnologiaInformacaoTipoProduto[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private pnotify: PNotifyService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private routerService: RouterService,
    private titleService: TitleService,
    private atividadesService: AtividadesService,
    private modeloService: TecnologiaInformacaoEstoqueModeloService,
    private tipoProdutoService: TecnologiaInformacaoEstoqueTipoProdutosService
  ) {}

  ngOnInit(): void {
    this.registrarAcesso();
    this.setBreadCrumb();
    this.setFormBuilder();
    this.onActivatedRoute();
    this.getTiposProduto();
  }

  registrarAcesso(): void {
    this.atividadesService.registrarAcesso().subscribe();
  }

  setBreadCrumb(): void {
    this.appTitle = 'Cadastro';
    const id = this.activatedRoute.snapshot.params.idSubModulo;
    this.titleService.setTitle(this.appTitle);
    this.breadCrumbTree = [
      {
        descricao: 'Home',
        routerLink: '/tecnologia-informacao/home',
      },
      {
        descricao: 'Estoque',
        routerLink: `/tecnologia-informacao/estoque/${id}`,
      },
      {
        descricao: 'Modelos',
        routerLink: `./../`,
      },
      {
        descricao: this.appTitle,
      },
    ];
  }

  //Consumir informações que estão na rota para editar
  ngOnDestroy() {
    this.$activatedRouteSubscription.unsubscribe();
  }

  getTiposProduto() {
    this.loadingTipoProduto = true;
    this.tipoProdutoService
      .getTiposProduto({ IN_STAT: '1', IN_PAGI: '0' })
      .pipe(
        finalize(() => {
          this.loadingTipoProduto = false;
        })
      )
      .subscribe((response) => {
        if (response.status === 200) {
          this.tipoProduto = response.body['data'];
        }
      });
  }

  onActivatedRoute() {
    this.$activatedRouteSubscription = this.activatedRoute.params
      .subscribe(
        response => {
          if(response.hasOwnProperty('id')){
            this.getModelo(response.id);
          }
        }
      )
  }

  //formulario
  setFormBuilder(): void {
    this.form = this.formBuilder.group({
      ID_TEIN_ESTO_PRTP: [null, [Validators.required]],
      ID_TEIN_ESTO_PRMO: [null],
      DS_OBSE: [null],
      NM_MODE: [null, [Validators.required]],
      IN_STAT: ['1', [Validators.required]],
    });
  }

  // Validação de formulário
  onFieldError(field: string) {
    if (this.onFieldInvalid(field)) {
      return 'is-invalid';
    }
    return '';
  }

  onFieldInvalid(field: any) {
    field = this.form.get(field);
    return field.status == 'INVALID' && field.touched;
  }

  onFieldRequired(field: string) {
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

  getModelo(id){
    this.loading = true;
    this.modeloService
      .getModelo(id)
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe(
        response => {

          if (response.status != 200){
            this.pnotify.error();
            return
          }
          let modelo = response.body["data"];
          this.form.patchValue(modelo);

        },
        error => {
          try {
            this.pnotify.error(error.error.message);
          } catch (error) {
            this.pnotify.error();
          }
        }
      )
  }
  postModelo() {
    this.loadingNavBar = true;
    this.modeloService
      .postModelo(this.form.value)
      .pipe(
        finalize(() => {
          this.loadingNavBar = false;
        })
      )
      .subscribe(
        (response: any) => {
          if (response.status === 200) {
            this.form.reset();
            this.pnotify.success();
            this.router.navigate(['../'], {
              relativeTo: this.activatedRoute,
            });
          } else {
            this.pnotify.error();
          }
        },
        (error: any) => {
          this.pnotify.error();
        }
      );
  }
}
