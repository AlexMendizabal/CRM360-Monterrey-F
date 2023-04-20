import { DateService } from './../../../../../shared/services/core/date.service';
import { IContato } from './../../../../servicos/contatos/models/contato';
import { ComercialClientesService } from 'src/app/modules/comercial/services/clientes.service';
import { ConfirmModalService } from './../../../../../shared/modules/confirm-modal/confirm-modal.service';
import { ContatoService } from './../../../../servicos/contatos/services/contato.service';
import { ComercialGestaoLiberacoesService } from './../services/liberacoes.service';
import { finalize, switchMap, take } from 'rxjs/operators';
import { IComercialGestaoLiberacoes } from './../models/liberacoes';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';

import { TitleService } from 'src/app/shared/services/core/title.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
//Bootstrap
import { utilsBr } from 'js-brasil';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
//Angular
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, TemplateRef } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
  AbstractControl,
} from '@angular/forms';

import { Location } from '@angular/common';
//rxjs
import { EMPTY, Subscription } from 'rxjs';
import { MASKS } from 'ng-brazil';

@Component({
  selector: 'comercial-gestao-liberacoes-detalhes',
  templateUrl: './detalhes.component.html',
  styleUrls: ['./detalhes.component.scss'],
})
export class ComercialGestaoLiberacoesDetalhesComponent implements OnInit {
  noResult: boolean;
  noContato = true;
  noDetalhes = true;
  activatedRouteSubscription: Subscription;
  breadCrumbTree: Array<any> = [];
  form: FormGroup;
  appTitle: string;
  modalRef: BsModalRef;
  formData: Array<FormData> = [];
  bsConfig: Partial<BsDatepickerConfig>;
  cliente: any;
  solicitacao: any;
  _materiaisSemEstoqueEmpty = false;
  profile: any = [];
  viewDetailsSolicitante = 1;
  showPermissionDenied = false;
  //loading
  loaderFullScreen = false;
  loadingNavBar = false;
  loaderNavbar;
  loadingDetalhes: boolean;

  // loadingMoeda: boolean;
  contato: IContato;

  //Interfaces

  constructor(
    private formBuilder: FormBuilder,
    private location: Location,
    private pnotify: PNotifyService,
    private router: Router,
    private liberacoesService: ComercialGestaoLiberacoesService,
    private activatedRoute: ActivatedRoute,
    private modalService: BsModalService,
    private contatosService: ContatoService,
    private clientesService: ComercialClientesService,
    private confirmModalService: ConfirmModalService,
    private titleService: TitleService,
    private atividadesService: AtividadesService,
    private dateService: DateService,
    private pnotifyService: PNotifyService
  ) {}

  public MASKS = MASKS;

  ngOnInit(): void {
    this.registrarAcesso();
    this.onActivatedRoute();
    this.setBreadCrumb();
    this.getPerfil();
    this.setFormBuilder();
  }

  registrarAcesso(): void {
    this.atividadesService.registrarAcesso().subscribe();
  }

  onActivatedRoute() {
    const _params = this.activatedRoute.snapshot.params;
    /* const _data = this.activatedRoute.snapshot.data.detalhes.data['0']; */
    /* this.solicitacao = this.activatedRoute.snapshot.data.detalhes.data['0']; */

    if (!_params.hasOwnProperty('id')) return this.getSolicitacoes();
    this.getSolicitacoes({
      nrPedido: _params['id'],
      empresa: _params['empresa'],
    });
  }

  setBreadCrumb(): void {
    const id = this.activatedRoute.snapshot.params.idSubModulo;
    this.appTitle = 'Detalhes';
    this.titleService.setTitle(this.appTitle);
    this.breadCrumbTree = [
      {
        descricao: 'Home',
        routerLink: '/comercial/home',
      },
      {
        descricao: 'Gestão',
        routerLink: `/comercial/gestao/${id}`,
      },
      {
        descricao: 'Liberações Comerciais',
        routerLink: `/comercial/gestao/${id}/liberacoes/lista`,
      },
      {
        descricao: this.appTitle,
      },
    ];
  }

  detailsSolicitante(params?) {
    if (this.viewDetailsSolicitante == 1) {
      this.viewDetailsSolicitante = 0;
    } else {
      this.viewDetailsSolicitante = 1;
    }
  }

  setFormBuilder(): void {
    this.form = this.formBuilder.group({
      descObs: [null, [Validators.minLength(3), Validators.required]],
      excluiPedido: null,
    });
  }

  getSolicitacoes(params?) {
    this.loaderFullScreen = true;

    this.liberacoesService
      .getDetalhes(params.nrPedido, params.empresa)
      .pipe(
        finalize(() => {
          this.loaderFullScreen = false;
        })
      )
      .subscribe({
        next: (response: any) => {
          if (response.success == true) {
            this.solicitacao = response.data['0'];
            this.materiaisSemEstoqueEmpty();
            this.noResult = false;
            if (this.solicitacao.totais[0].comentario != '') {
              this.form.controls.descObs.setValue(
                this.solicitacao.totais[0].comentario
              );
              this.form.controls.descObs.updateValueAndValidity();
            }
          } else {
            this.noResult = true;
          }
        },
        error: (error) => {
          this.pnotify.error();
          this.noResult = true;
        }
      });
  }

  getDetalhes() {
    const _params = this.solicitacao;
    this.noDetalhes = true;
    this.loadingDetalhes = true;

    this.clientesService
      .getDetalhes(_params['codCliente'])
      .pipe(
        finalize(() => {
          this.loadingDetalhes = false;
        })
      )
      .subscribe({
        next: (response: any) => {
          if (response.success == true) {
            this.cliente = response.data;
            this.noDetalhes = false;
          } else {
            this.noDetalhes = true;
            this.cliente = [];
          }
        },
        error: (error) => {
          this.noDetalhes = true;
          this.pnotify.error();
        }
      });
  }

  getPerfil() {
    this.liberacoesService
      .getPermissoesAcesso()

      .subscribe({
        next: (response: any) => {
          if (response.success === true) {
            this.profile = response.data;
          }
        },
        error: (error: any) => {
          this.showPermissionDenied = true;
        }
      });
  }

  materiaisSemEstoqueEmpty() {
    if (this.solicitacao.materiaisSemEstoque.length == 0) {
      this._materiaisSemEstoqueEmpty = true;
    } else {
      this._materiaisSemEstoqueEmpty = false;
    }
  }

  openModal(template: TemplateRef<any>) {
    this.getDetalhes();
    this.modalRef = this.modalService.show(template, {
      animated: false,
      class: 'modal-lg',
      backdrop: 'static',
    });
  }
  hideModal() {
    this.modalRef.hide();
  }

  setParams(solicitacao): Object {
    let params: any = {};

    let exclui;

    if (this.form.value.excluiPedido == true) {
      exclui = 1;
    } else {
      exclui = 0;
    }

    params.descObs = this.form.value.descObs;
    params.excluiPedido = exclui;
    params.empresa = solicitacao.codEmpresa;
    params.nrPedido = solicitacao.nrPedido;

    return params;
  }

  requestSuccess(solicitacao: any) {
    const stat = 1;

    this.confirmChange(stat)
      .asObservable()
      .pipe(
        take(1),
        switchMap((result) => {
          if (!result) return EMPTY;

          this.loaderNavbar = true;

          return this.liberacoesService.aprovaLiberacao(
            this.setParams(solicitacao)
          );
        }),
        finalize(() => {
          this.loaderNavbar = false;
        })
      )
      .subscribe(
        (success: any) => {
          this.pnotify.success();
          this.router.navigate(['/comercial/gestao/${id}/liberacoes/lista'], {
            relativeTo: this.activatedRoute,
          });
        },
        (error: any) => {
          this.pnotify.error('Erro ao aprovar a solicitação');
        }
      );
  }

  requestFail(solicitacao: any) {
    const stat = 2;

    this.confirmChange(stat)
      .asObservable()
      .pipe(
        take(1),
        switchMap((result) => {
          if (!result) return EMPTY;

          this.loaderNavbar = true;
          return this.liberacoesService.reprovaLiberacao(
            this.setParams(solicitacao)
          );
        }),
        finalize(() => {
          this.loaderNavbar = false;
        })
      )
      .subscribe(
        (success: any) => {
          this.pnotify.success();
          this.router.navigate(['/comercial/gestao/${id}/liberacoes/lista'], {
            relativeTo: this.activatedRoute,
          });
        },
        (error: any) => {
          this.pnotify.error('Erro ao reprovar a solicitação');
        }
      );
  }

  confirmChange(stat): any {
    if (stat == 1)
      return this.confirmModalService.showConfirm(
        null,
        'Confirmar Aprovação',
        'Deseja realmente aprovar a solicitação?',
        'Cancelar',
        'Confirmar'
      );

    return this.confirmModalService.showConfirm(
      null,
      'Confirmar Reprovação',
      'Deseja realmente reprovar a solicitação?',
      'Cancelar',
      'Confirmar'
    );
  }

  onVoltar(): void {
    this.location.back();
  }

  onFieldError(field: string): string {
    if (this.onFieldInvalid(field)) {
      return 'is-invalid';
    }

    return '';
  }

  onFieldInvalid(field: any): boolean {
    field = this.form.get(field);

    return field.status == 'INVALID' && field.touched;
  }

  onFieldRequired(
    abstractControl: AbstractControl,
    abstractControlField?: string
  ): string {
    if (abstractControl.validator) {
      const validator = abstractControl.validator({} as AbstractControl);
      if (validator && validator.required) {
        return 'is-required';
      }
    }

    if (abstractControlField) {
      for (const controlName in abstractControl['controls']) {
        if (abstractControl['controls'][controlName]) {
          if (
            this.onFieldRequired(abstractControl['controls'][controlName]) &&
            controlName == abstractControlField
          ) {
            return 'is-required';
          }
        }
      }
    }

    return '';
  }

  classVariacaoPreco(variacaoPreco: number): string {
    let variacaoClass: string;

    if (variacaoPreco > 0) {
      variacaoClass = 'fas fa-caret-up text-success';
    } else if (variacaoPreco < 0) {
      variacaoClass = 'fas fa-caret-down text-danger';
    }

    return variacaoClass;
  }

  formatVariacaoPreco(variacaoPreco: number): string {
    let valor: string;

    if (variacaoPreco > 0) {
      valor = `+${variacaoPreco}%`;
    } else if (variacaoPreco < 0) {
      valor = `${variacaoPreco}%`;
    }

    return valor;
  }
}
