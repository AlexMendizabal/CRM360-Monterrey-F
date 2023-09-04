import { ITecnologiaInformacaoTipoProduto } from './../models/tipoProduto';
import { RouterService } from 'src/app/shared/services/core/router.service';
import { TitleService } from 'src/app/shared/services/core/title.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { BsLocaleService, BsDatepickerConfig } from 'ngx-bootstrap';
import { finalize } from 'rxjs/operators';

import { TecnologiaInformacaoEstoqueTipoProdutosService } from '../services/tipo-produto.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
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

import { Subscription } from 'rxjs';
import { TryCatchStmt } from '@angular/compiler';

@Component({
  selector: 'tecnologia-informacao-estoque-tipo-produto-cadastro',
  templateUrl: './cadastro.component.html',
  styleUrls: ['./cadastro.component.scss'],
})
export class TecnologiaInformacaoEstoqueTipoProdutosCadastroComponent
  implements OnInit, OnDestroy {
  noResult: boolean;
  loading = false;
  loadingNavBar = false;
  breadCrumbTree: Array<any> = [];
  form: FormGroup;
  appTitle: string;
  bsConfig: Partial<BsDatepickerConfig>;

  tipoProdutos: Array<ITecnologiaInformacaoTipoProduto>;
  $activatedRouteSubscription: Subscription;

  constructor(
    private formBuilder: FormBuilder,
    private pnotify: PNotifyService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private routerService: RouterService,
    private titleService: TitleService,
    private atividadesService: AtividadesService,
    private tipoProdutoService: TecnologiaInformacaoEstoqueTipoProdutosService
  ) {}

  ngOnInit(): void {
    this.registrarAcesso();
    this.setBreadCrumb();
    this.setFormBuilder();
    this.onActivatedRoute();
  }

  registrarAcesso(): void {
    this.atividadesService.registrarAcesso().subscribe();
  }

  setBreadCrumb(): void {
    const id = this.activatedRoute.snapshot.params.idSubModulo;

    this.appTitle = 'Cadastro';
    this.titleService.setTitle(this.appTitle);
    this.breadCrumbTree = [
      {
        descricao: 'Home',
        routerLink: '/tecnologia-informacao/home',
      },
      {
        descricao: 'Inventario',
        routerLink: `/tecnologia-informacao/estoque/${id}`,
      },
      {
        descricao: 'Tipo de Produto',
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

  onActivatedRoute() {
    this.$activatedRouteSubscription = this.activatedRoute.params
      .subscribe(
        response => {
          if(response.hasOwnProperty('id')){
            this.getTipoProduto(response.id);
          }
        }
      )
  }


  //formulario
  setFormBuilder(): void {
    this.form = this.formBuilder.group({
      ID_TEIN_ESTO_PRTP: [null],
      NM_TIPO: [null, [Validators.required]],
      IN_STAT: ['1'],
      DS_OBSE: [null],
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
  getTipoProduto(id: number){
    this.loading = true;
    this.tipoProdutoService
      .getTipoProduto(id)
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
          let tipoProduto = response.body["data"];
          this.form.patchValue(tipoProduto);

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

  postTipoProduto() {
    this.loadingNavBar = true;
    this.tipoProdutoService
      .postTipoProduto(this.form.value)
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
          try {
            this.pnotify.error(error.error.message);
          } catch (error) {
            this.pnotify.error();
          }
        }
      );
  }
}
