import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import {
  FormGroup,
  FormBuilder,
  Validators,
  AbstractControl,
  FormArray,
} from '@angular/forms';
import { finalize } from 'rxjs/operators';

// ng-brazil
import { MASKS } from 'ng-brazil';

// Interfaces
import { IFormCanDeactivate } from 'src/app/guards/iform-candeactivate';

// Services
import { ComercialCadastrosPropostasAssociacaoSituacoesPropostaService } from '../associacao-situacoes-proposta.service';
import { ComercialCadastrosSituacaoPropostaService } from '../../../situacao-proposta/situacao-proposta.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { TitleService } from 'src/app/shared/services/core/title.service';
import { ComercialService } from 'src/app/modules/comercial/comercial.service';
import { ConfirmModalService } from 'src/app/shared/modules/confirm-modal/confirm-modal.service';

// Interfaces
import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';
import { IAssociacao } from '../models/associacao-situacoes-proposta';
import { JsonResponse } from 'src/app/models/json-response';
import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';

@Component({
  selector:
    'comercial-cadastros-propostas-associacao-situacoes-proposta-formulario',
  templateUrl: './formulario.component.html',
  styleUrls: ['./formulario.component.scss'],
})
export class ComercialCadastrosPropostasAssociacaoSituacoesPropostaFormularioComponent
  implements OnInit, IFormCanDeactivate {
  public MASKS = MASKS;

  loaderFullScreen = true;
  loaderNavbar: boolean;

  appTitle: string;
  breadCrumbTree: Array<Breadcrumb> = [];

  tableConfigAssocSituacoes: Partial<CustomTableConfig> = {
    fixedHeader: false,
    bodyHeight: 230,
    hover: false,
  };

  tableConfigSituacoes: Partial<CustomTableConfig> = {
    fixedHeader: false,
    bodyHeight: 243,
  };

  colors = [
    {
      hex: '#FFFF01',
      descricao: 'Amarelo',
    },
    {
      hex: '#0033FF',
      descricao: 'Azul',
    },
    {
      hex: '#FB6602',
      descricao: 'Laranja',
    },
    {
      hex: '#FF0087',
      descricao: 'Rosa',
    },
    {
      hex: '#610069',
      descricao: 'Roxo',
    },
    {
      hex: '#FA1100',
      descricao: 'Vermelho',
    },
  ];

  codClasse: number = null;

  form: FormGroup;
  formChanged = false;
  submittingForm: boolean;

  showSituacoes = true;

  /* formSituacoes: FormGroup; */

  situacoes: Array<any>;

  linhas: Array<any> = [];
  classes: Array<any> = [];
  filteredClasses: Array<any> = [];
  materiais: Array<any> = [];
  materiaisLoader: boolean;

  toggleAll = false;
  searching = false;
  firstSearch = false;

  situacoesLista: Array<any> = [];
  situacoesListaLoaded = false;
  situacoesListaEmpty = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private location: Location,
    private formBuilder: FormBuilder,
    private associacaoSituacoesPropostaService: ComercialCadastrosPropostasAssociacaoSituacoesPropostaService,
    private situacoesPropostaService: ComercialCadastrosSituacaoPropostaService,
    private pnotifyService: PNotifyService,
    private atividadesService: AtividadesService,
    private titleService: TitleService,
    private comercialService: ComercialService,
    private confirmModalService: ConfirmModalService
  ) {
    this.pnotifyService.getPNotify();
  }

  ngOnInit(): void {
    this.registrarAcesso();
    this.setBreadCrumb();
    this.getFilterValues();
    this.setFormBuilder();
    /* this.setFormMateriais(); */
    this.titleService.setTitle('Associação de Situações das propostas');
  }

  registrarAcesso(): void {
    this.atividadesService.registrarAcesso().subscribe();
  }

  setBreadCrumb(): void {
    this.activatedRoute.params.subscribe((params: any) => {
      if (params.id) {
        this.appTitle = 'Editar associação';
      } else {
        this.appTitle = 'Nova associação';
      }

      this.breadCrumbTree = [
        {
          descricao: 'Home',
          routerLink: '/comercial/home',
        },
        {
          descricao: 'Cadastros',
          routerLink: `/comercial/cadastros/${params.idSubModulo}`,
        },
        {
          descricao: 'Associação de situações',
          routerLink: `/comercial/cadastros/${params.idSubModulo}/propostas/associacao-situacoes-proposta/lista`,
        },
        {
          descricao: this.appTitle,
        },
      ];
    });
  }

  getFilterValues(): void {
    this.searching = true;
    this.situacoesListaEmpty = false;
    this.situacoes = [];
    this.situacoesLista = [];

    this.situacoesPropostaService
      .getListaSituacaoProposta()
      .pipe(
        finalize(() => {
          this.loaderFullScreen = false;
          this.searching = false;
          this.situacoesListaLoaded = true;
        })
      )
      .subscribe({
        next: (response: JsonResponse) => {
          if (response.hasOwnProperty('success') && response.success === true) {
            this.situacoes = response.data;
            /* this.situacoesLista = response.data; */
            this.situacoesLista = response.data.map(function (el: any) {
              var o = Object.assign({}, el);
              o.checked = 0;
              return o;
            });
          } else if (
            response.hasOwnProperty('success') &&
            response.success === false &&
            response.hasOwnProperty('mensagem')
          ) {
            this.pnotifyService.error(response.mensagem);
            this.situacoesListaEmpty = true;
          } else {
            this.pnotifyService.error();
          }
        },
        error: (error: any) => {
          if (error['error'].hasOwnProperty('mensagem')) {
            this.pnotifyService.error(error.error.mensagem);
          } else {
            this.pnotifyService.error();
          }
        }
      });
  }

  setFormBuilder(): void {
    const resolver = this.activatedRoute.snapshot.data.detalhes;

    if (resolver.success === true) {
      const detalhes: IAssociacao = resolver.data;

      this.form = this.formBuilder.group({
        codAssociacao: [detalhes.codAssociacao],
        descLegenda: [detalhes.descLegenda, [Validators.required]],
        ordemExibicao: [detalhes.ordemExibicao, [Validators.required]],
        cor: [detalhes.cor],
        codSituacao: [detalhes.codSituacao, [Validators.required]],
        assocSituacoes: this.formBuilder.array([]),
      });

      this.setSituacoes(detalhes.situacoesAssociadas);
    } else {
      this.pnotifyService.error();
      this.location.back();
    }
  }

  onColorChange(color: any): void {
    this.form.controls.cor.setValue(color.hex);
  }

  /* buscaMate(): void {
    let codMaterial = this.form.getRawValue().codMaterial;

    if (typeof codMaterial !== 'undefined' && codMaterial !== null) {
      this.loaderNavbar = true;

      this.comercialService
        .getMateriais({
          codMaterial: codMaterial,
        })
        .pipe(
          finalize(() => {
            this.loaderNavbar = false;
          })
        )
        .subscribe(
          (response: JsonResponse) => {
            if (
              response.hasOwnProperty('success') &&
              response.success === true
            ) {
              this.form.controls.nomeMaterial.setValue(
                response.data[0].descricao
              );
              this.form.controls.nomeMaterial.setValidators([
                Validators.required,
              ]);
              this.form.controls.nomeMaterial.updateValueAndValidity();
            } else if (
              response.hasOwnProperty('success') &&
              response.success === false &&
              response.hasOwnProperty('mensagem')
            ) {
              this.pnotifyService.error(response.mensagem);
            } else {
              this.pnotifyService.error();
            }
          },
          (error: any) => {
            if (error['error'].hasOwnProperty('mensagem')) {
              this.pnotifyService.error(error.error.mensagem);
            } else {
              this.pnotifyService.error();
            }
          }
        );
    }
  } */

  setSituacoes(situacoes: any): void {
    if (situacoes.length > 0) {
      for (let i = 0; i < situacoes.length; i++) {
        this.onAddSituacao(situacoes[i]);
      }
    }
  }

  get assocSituacoes(): FormArray {
    return this.form.get('assocSituacoes') as FormArray;
  }

  onAddSituacao(situacaoProposta: any, manipulateForm?: boolean): void {
    if (this.checkSituacaoExists(situacaoProposta) === false) {
      this.assocSituacoes.push(
        this.formBuilder.group({
          codSituacaoProposta: [situacaoProposta.codSituacaoProposta],
          descSituacaoProposta: [situacaoProposta.descSituacaoProposta],
        })
      );

      if (this.form.value.assocSituacoes.length > 9) {
        if (this.tableConfigAssocSituacoes.fixedHeader === false) {
          this.showSituacoes = false;
          this.tableConfigAssocSituacoes.fixedHeader = true;

          setTimeout(() => {
            this.showSituacoes = true;
          }, 1);
        }
      }

      if (manipulateForm) {
        this.form.markAsTouched();
        this.form.markAsDirty();
      }
    }
  }

  checkSituacaoExists(situacaoProposta: any): boolean {
    return this.form.value.assocSituacoes.some((el: any) => {
      return el.codSituacaoProposta === situacaoProposta.codSituacaoProposta;
    });
  }

  onLimparAssociacoes(): void {
    const assocSituacoes = this.form.get('assocSituacoes') as FormArray;
    assocSituacoes.clear();
  }

  onDeleteSituacao(index: number): void {
    this.confirmDelete().subscribe((response: boolean) =>
      response ? this.deleteSituacao(index) : null
    );
  }

  confirmDelete(): any {
    return this.confirmModalService.showConfirm(
      'delete',
      'Confirmar exclusão',
      'Deseja realmente prosseguir com a exclusão do registro?',
      'Cancelar',
      'Confirmar'
    );
  }

  deleteSituacao(index: number) {
    this.assocSituacoes.removeAt(index);
    this.form.markAsTouched();
    this.form.markAsDirty();
  }

  onToggleAll() {
    this.toggleAll = !this.toggleAll;

    for (let index = 0; index < this.situacoesLista.length; index++) {
      this.situacoesLista[index].checked = this.toggleAll === true ? 1 : 0;
    }
  }

  onCheckSituacao(index: number, situacao: any): void {
    this.situacoesLista[index].checked = situacao.checked == 0 ? 1 : 0;
  }

  onAssociarSituacoes(): void {
    this.toggleAll = false;

    for (let index = 0; index < this.situacoesLista.length; index++) {
      if (this.situacoesLista[index].checked === 1) {
        const situacao = {
          codSituacaoProposta: this.situacoesLista[index].codSituacaoProposta,
          descSituacaoProposta: this.situacoesLista[index].situacaoProposta,
        };

        this.onAddSituacao(situacao, true);
        this.situacoesLista[index].checked = 0;
      }
    }
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

  onSubmit(): void {
    if (this.form.pristine) {
      this.location.back();
    } else {
      if (this.form.valid) {
        if (this.form.value.assocSituacoes.length > 0) {
          this.loaderNavbar = true;
          this.submittingForm = true;

          this.associacaoSituacoesPropostaService
            .save(this.form.value)
            .pipe(
              finalize(() => {
                this.loaderNavbar = false;
                this.submittingForm = false;
              })
            )
            .subscribe({
              next: (response: any) => {
                if (
                  response.hasOwnProperty('success') &&
                  response.success === true
                ) {
                  this.form.reset();
                  this.formChanged = false;
                  this.pnotifyService.success(response.mensagem);

                  this.activatedRoute.params.subscribe((params: any) => {
                    let navigateTo: string;

                    if (params.hasOwnProperty('id')) {
                      navigateTo = '../../lista';
                    } else {
                      navigateTo = '../lista';
                    }

                    this.router.navigate([navigateTo], {
                      relativeTo: this.activatedRoute,
                    });
                  });
                } else if (
                  response.hasOwnProperty('success') &&
                  response.success === false
                ) {
                  this.pnotifyService.error(response.mensagem);
                } else {
                  this.pnotifyService.error();
                }
              },
              error: (error: any) => {
                this.pnotifyService.error();
              }
            });
        } else {
          this.pnotifyService.notice('Associe pelo menos uma situação.');
        }
      }
    }
  }

  onCancel(): void {
    this.location.back();
  }

  onInput(): void {
    this.formChanged = true;
  }

  formCanDeactivate(): boolean {
    if (this.formChanged) {
      if (confirm('Este cliente no forma parte de tu cartera?')) {
        return true;
      } else {
        return false;
      }
    }
    return true;
  }
}
