import { ComercialGestaoTabelaPrecosService } from './../tabela-precos.service';
import { ConfirmModalService } from './../../../../../shared/modules/confirm-modal/confirm-modal.service';
import { JsonResponse } from './../../../../../models/json-response';
import { CustomTableConfig } from './../../../../../shared/templates/custom-table/models/config';
import { Component, Input, OnInit, Output, TemplateRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EstadosService } from 'src/app/shared/services/requests/estados.service';
import {
  FormGroup,
  FormBuilder,
  FormControl,
  FormArray,
  Validators,
} from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { Location } from '@angular/common';

// ng-brazil
import { MASKS } from 'ng-brazil';

// Interfaces
import { assocTabela, precos } from './../models/tabela-precos';

// Services
import { DateService } from './../../../../../shared/services/core/date.service';
import { PNotifyService } from './../../../../../shared/services/core/pnotify.service';

// Interfaces
import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';

// ngx-bootstrap
import { BsLocaleService, BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ptBrLocale } from 'ngx-bootstrap/locale';

defineLocale('pt-br', ptBrLocale);

@Component({
  selector: 'comercial-gestao-tabela-precos-formulario',
  templateUrl: './formulario.component.html',
  styleUrls: ['./formulario.component.scss'],
})
export class ComercialGestaoTabelaPrecosFormularioComponent implements OnInit {
  public MASKS = MASKS;
  loaderFullScreen = true;
  loaderNavbar: boolean;

  appTitle: string;
  action: string;

  modalValues: assocTabela[] = [];
  valorMaterialAlterado: number;
  breadCrumbTree: Array<Breadcrumb> = [];

  form: FormGroup;
  formFilter: FormGroup;
  formPrecos: FormGroup;

  formChanged = false;
  submittingForm = false;
  submitAssocGrupo = false;
  submittingFormPrecos = false;
  enableEditIndex: number;

  formPrecosIndex: number = null;

  dados: Array<any> = [];
  precosEstado: Array<precos> = [];
  assocPrecos: Array<precos> = [];
  unidades: Array<any> = [];
  editMode: boolean = false;
  codPreco: number;
  codGrupo: number;
  grupoNome: string;
  estados: [];
  materiaisAssoc: Array<any>;
  materiaisAssoc2: Array<any>;
  selection: Array<any>;

  dadosLoaded = false;
  dadosEmpty = false;

  toggleAll = false;
  searching = false;
  firstSearch = false;

  bsConfig: Partial<BsDatepickerConfig>;

  showGrupos = true;
  showMaterial = false;

  modalRef: BsModalRef;

  linhas: Array<any> = [];
  classes: Array<any> = [];

  limparGrupoPrincipal: boolean;

  tableConfigAssocGrupos: Partial<CustomTableConfig> = {
    fixedHeader: false,
    bodyHeight: 230,
    hover: false,
  };

  tableConfigPrecos: Partial<CustomTableConfig> = {
    fixedHeader: false,
    bodyHeight: 230,
    hover: false,
  };

  maxSize = 10;
  itemsPerPage = 300;
  currentPage = 1;
  totalItems = 0;

  constructor(
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private dateService: DateService,
    private localeService: BsLocaleService,
    private bsModalService: BsModalService,
    private pnotifyService: PNotifyService,
    private confirmModalService: ConfirmModalService,
    private estadosService: EstadosService,
    private location: Location,
    private tabelaPrecosService: ComercialGestaoTabelaPrecosService,
    private router: Router
  ) {
    this.localeService.use('pt-br');
    this.bsConfig = Object.assign(
      {},
      { containerClass: 'theme-dark-blue' },
      { adaptivePosition: true },
      { showWeekNumbers: false }
    );
    this.pnotifyService.getPNotify();
  }

  ngOnInit(): void {
    this.setFormBuilder();
    this.setFormFilter();
    this.setFormPrecos();
    this.setBreadCrumb();
    this.getUnidades();
    this.estados = this.estadosService.getEstados();
  }

  // customSearchFn(term: string, item: any) {
  //   term = term.toUpperCase();
  //   item.nomeMaterial = item.nomeMaterial.toUpperCase();
  //   if(item.nomeMaterial.startsWith(term)) {
  //     return item.nomeMaterial.indexOf(term) > -1;
  //   }
  // }

  changeFn(val) {

    this.materiaisAssoc.forEach(element => {
      if (element['codMaterial'] == val) {
        this.showMaterial = true;
        this.materiaisAssoc2 = [element];

      }
    });
  }

  enableEdition(i, item) {
    this.editMode = true;
    this.enableEditIndex = i;
    this.valorMaterialAlterado = item.valorMaterial;

  }

  setBreadCrumb(): void {
    this.activatedRoute.params.subscribe((params: any) => {
      if (params.id) {
        this.appTitle = 'Editar tabela de preços';
        this.action = 'update';
        this.submittingForm = true;
        this.submitAssocGrupo = true;
      } else {
        this.appTitle = 'Nova tabela de preços';
        this.action = 'create';
      }

      this.breadCrumbTree = [
        {
          descricao: 'Home',
          routerLink: '/comercial/home',
        },
        {
          descricao: 'Gestão',
          routerLink: `/comercial/gestao/${params.idSubModulo}`,
        },
        {
          descricao: 'Tabela de Preços',
          routerLink: `/comercial/gestao/${params.idSubModulo}/tabela-precos/lista`,
        },
        {
          descricao: this.appTitle,
        },
      ];
    });
  }

  // Formulário Preenchido para edição ou novo formulário
  setFormBuilder() {
    const resolver = this.activatedRoute.snapshot.data.detalhes;

    if (resolver) {
      const detalhes: any = resolver.data;

      this.form = this.formBuilder.group({
        codPreco: [detalhes.codPreco],
        nomePreco: [detalhes.nomePreco, [Validators.required]],
        /* codSituacao: [detalhes.codSituacao], */

        dataInicialVigencia: detalhes.dataInicialVigencia
          ? [
            this.dateService.convertStringToDate(
              detalhes.dataInicialVigencia,
              'usa'
            ),
            [Validators.required],
          ]
          : [this.dateService.getToday(), [Validators.required]],

        dataFinalVigencia: detalhes.dataFinalVigencia
          ? [
            this.dateService.convertStringToDate(
              detalhes.dataFinalVigencia,
              'usa'
            ),
          ]
          : '',

        faixaDescontoComercial: detalhes.faixaDescontoComercial
          ? [detalhes.faixaDescontoComercial]
          : 0,

        faixaDescontoGerencial: detalhes.faixaDescontoGerencial
          ? [detalhes.faixaDescontoGerencial]
          : 0,

        assocGrupos: this.formBuilder.array([]),
      });
      this.loaderFullScreen = false;
      this.setGrupos(detalhes.assocGrupos);
    } else {
      this.pnotifyService.error();
      this.location.back();
      this.loaderFullScreen = false;

      this.form.get('dataInicialVigencia').setValue(null);
      this.form.get('dataFinalVigencia').setValue(null);
    }
  }

  setFormFilter() {
    this.formFilter = this.formBuilder.group({
      grupo: '',
      situacao: '',
    });
  }

  setFormPrecos() {
    this.formPrecos = this.formBuilder.group({
      codAssociacao: [null],
      codEmpresa: [null],
      nomeEmpresa: [null],
      ufDestino: [null],
      valorMaterial: [null],
      percentual: [null]
    });
  }


  onSubmitPrecos() {
    this.tabelaPrecosService
      .savePreco(this.formPrecos.getRawValue())
      .pipe(
        finalize(() => {
          this.loaderNavbar = false;
          this.submittingForm = false;
        })
      )
      .subscribe((response: any) => {
        if (response.hasOwnProperty('success') && response.success === true) {
          this.formPrecos.reset();
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
      });
  }

  onCancel(): void {
    this.location.back();
  }

  onInput(): void {
    this.formChanged = true;
  }

  // Ação de Edição ou novo Formulário
  onSubmit(): void {

    // if (this.action === 'update' && this.form.pristine) {
    //   this.location.back();
    // } else {
    if (this.checkFormValidation() && this.form.valid) {
      if (this.form.value.assocGrupos.length > 0) {
        this.loaderNavbar = true;
        this.submittingForm = true;
        this.tabelaPrecosService
          .saveTabelaPrecos(this.form.value, this.action)
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
        this.pnotifyService.notice('Associe pelo menos um material.');
      }
    } else {
      this.pnotifyService.notice('Selecione um material.');
    }
    // }
  }

  checkFormValidation(): boolean {
    let isValid = true;
    if (this.form.getRawValue().id === null) {
      isValid = false;
    }
    return isValid;
  }

  openModalPercent(template: TemplateRef<any>, index, item: any) {
    this.codGrupo = item.value.codGrupo;
    this.grupoNome = item.value.nomeGrupo;
    this.searchValoresGrupo(index);
    this.modalRef = this.bsModalService.show(template, index);

  }

  openModalMateriais(template: TemplateRef<any>, i: number, item: any) {
    this.showMaterial = false;
    this.loaderNavbar = true;
    const params = {
      codGrupo: item.value.codGrupo,
    };
    this.tabelaPrecosService
      .getDetailPanel(params)
      .pipe(
        finalize(() => {
          this.loaderNavbar = false;
        })
      )
      .subscribe({
        next: (response: JsonResponse) => {
          if (response.hasOwnProperty('success') && response.success === true) {
            this.materiaisAssoc = response.data;
            this.modalRef = this.bsModalService.show(template, item);

          } else if (
            response.hasOwnProperty('success') &&
            response.success === false
          ) {
            this.dadosEmpty = true;
          } else {
            this.pnotifyService.error();
            this.dadosEmpty = true;
          }
        },
        error: (error: any) => {
          this.dadosEmpty = true;

          if (error.error.hasOwnProperty('mensagem')) {
            this.pnotifyService.error(error.error.mensagem);
          } else {
            this.pnotifyService.error();
          }
        }
      });
  }

  openModal(template: TemplateRef<any>, index, item) {
    this.submittingFormPrecos = false;
    this.formPrecosIndex = null;
    this.codPreco = null;
    this.codGrupo = null;
    this.grupoNome = null;

    this.codPreco = this.form.value.codPreco;
    this.codGrupo = item.value.codGrupo;
    this.grupoNome = item.value.nomeGrupo;
    this.searchValoresGrupo(index);
    this.modalRef = this.bsModalService.show(template, index);
  }


  onUpdatePercentagem(percent) {
    percent = percent.split('%');
    this.confirmAdd().subscribe((response: boolean) => {
      if (response == true) {
        this.precosEstado.forEach(element => {
          element.valorMaterial = element.valorMaterial + element.valorMaterial * (parseFloat(percent[0]) / 100);
        });
      }
    });
  }

  onUpdateValor(item, index, valorMaterialAlterado) {

    item.valorMaterial = valorMaterialAlterado;
    let j;
    let i;
    for (i = 0; i < this.form.value.assocGrupos.length; i++) {
      j = 0;
      this.form.value.assocGrupos[i].precos.forEach(element => {
        if (item.codAssociacao == element.codAssociacao) {
          this.form.value.assocGrupos[i].precos[j].valorMaterial = item.valorMaterial;
        }
        j++;
      });
    }
  }

  searchValoresGrupo(index) {
    const valores = this.form.value.assocGrupos[index].precos;
    this.formPrecosIndex = index;

    this.precosEstado = [];
    if (valores.length > 0) {
      valores.forEach((element) => {
        this.onAddPreco(element, false, 'application');
      });
    }
  }

  // Ações do Grupo de Materiais (ESQUERDA TELA)
  setGrupos(grupos: assocTabela[]): void {
    if (grupos.length > 0) {
      for (let i = 0; i < grupos.length; i++) {
        this.onAddGrupo(grupos[i], false, 'application');
      }
    }
  }

  get assocGrupos(): FormArray {
    return this.form.get('assocGrupos') as FormArray;
  }

  /**
   * @source = 'application' || 'user'
   */
  onAddGrupo(
    grupo: assocTabela,
    manipulateForm: boolean,
    source: string
  ): void {
    if (this.checkGrupoExists(grupo) === false) {
      this.assocGrupos.push(
        this.formBuilder.group({
          codGrupo: [grupo.codGrupo],
          nomeGrupo: [grupo.nomeGrupo],
          precos:
            grupo.precos && grupo.precos.length > 0
              ? [grupo.precos]
              : this.formBuilder.array([]),
          source: [source],
        })
      );

      if (this.form.value.assocGrupos.length > 9) {
        ('');
        if (this.tableConfigAssocGrupos.fixedHeader === false) {
          this.showGrupos = false;
          this.tableConfigAssocGrupos.fixedHeader = true;

          setTimeout(() => {
            this.showGrupos = true;
          }, 1);
        }
      }

      if (manipulateForm) {
        this.form.markAsTouched();
        this.form.markAsDirty();
      }
    }
  }

  checkGrupoExists(grupo: assocTabela): boolean {
    return this.form.value.assocGrupos.some((el: any) => {
      return el.codGrupo === grupo.codGrupo;
    });
  }

  /**
   * @source = 'application' || 'user'
   */
  onAddPreco(preco: any, manipulateForm: boolean, source: string): void {
    if (preco) {
      if (this.checkPrecosExists(preco) === false) {
        this.precosEstado.push(preco);

        if (source === 'onAssociarPrecos') {
          let grupos = this.form.controls.assocGrupos.value;
          grupos = grupos.map((item: any) => {
            if (item.codGrupo == this.codGrupo) {
              let precosAux = item.precos.map(precoAux => {
                return {
                  codAssociacao: precoAux.codAssociacao,
                  codEmpresa: precoAux.codEmpresa,
                  nomeEmpresa: precoAux.nomeEmpresa,
                  percentual: precoAux.percentual,
                  ufDestino: precoAux.ufDestino,
                  valorMaterial: precoAux.valorMaterial,
                }
              });
              precosAux.push(preco);
              item.precos = precosAux;
            }
            return item;
          });
        }

        this.formPrecos.reset();
      }

      /* if (this.checkValorExists(preco) === false) {
        this.form.value.assocGrupos[this.formPrecosIndex].precos.push(preco);
      } */
    }

    if (manipulateForm) {
      this.form.markAsTouched();
      this.form.markAsDirty();
    }
  }

  onSaveValores() {
    this.editMode = false;
    if (this.precosEstado.length > 0) {
      this.submittingFormPrecos = true;
      this.precosEstado.forEach((element) => {
        if (this.checkValorExists(element) == false) {
          this.form.value.assocGrupos[this.formPrecosIndex].precos.push(
            element
          );
        }
      });
      this.precosEstado = [];
    }
    this.modalRef.hide();
  }

  checkValorExists(obj: any) {
    return this.form.value.assocGrupos[this.formPrecosIndex].precos.some(
      (el: any) => {
        return (
          el.codEmpresa === obj.codEmpresa && el.ufDestino === obj.ufDestino
        );
      }
    );
  }

  onDeleteValor(item: any, index: number) {
    item.codPreco = this.codPreco;
    item.codGrupo = this.codGrupo;
    this.loaderNavbar = true;

    this.confirmDelete().subscribe((response: boolean) => {
      if (response) {
        if (item.codAssociacao != null || item.codAssociacao != undefined) {
          this.tabelaPrecosService
            .deleteAssociacaoPreco(item)
            .pipe(
              finalize(() => {
                this.loaderNavbar = false;
              })
            )
            .subscribe({
              next: (response: JsonResponse) => {
                if (response.success) {
                  if (this.checkPrecosExists(item) == true) {
                    let indexPrecos =
                      this.form.value.assocGrupos[
                        this.formPrecosIndex
                      ].precos.indexOf(item);

                    this.form.value.assocGrupos[
                      this.formPrecosIndex
                    ].precos.splice(indexPrecos, 1);
                  }
                  this.precosEstado.splice(index, 1);
                } else {
                  this.pnotifyService.error();
                }
              },
              error: (error: any) => {
                if (
                  error.error.hasOwnProperty('mensagem') &&
                  (error.mensagem !== null || error.mensagem !== '')
                ) {
                  this.pnotifyService.error(error.error.mensagem);
                } else {
                  this.pnotifyService.error();
                }
              }
            });
        } else {
          if (this.checkPrecosExists(item) == true) {
            let indexPrecos =
              this.form.value.assocGrupos[this.formPrecosIndex].precos.indexOf(
                item
              );

            this.form.value.assocGrupos[this.formPrecosIndex].precos.splice(
              indexPrecos,
              1
            );
          }
          this.precosEstado.splice(index, 1);
          this.loaderNavbar = false;
        }
      }
      this.loaderNavbar = false;
    });
  }

  checkPrecosExists(preco: precos): boolean {
    let valorFound = this.precosEstado.filter(
      (xx) =>
        xx.codEmpresa == preco.codEmpresa && xx.ufDestino == preco.ufDestino
    );

    if (valorFound.length > 0) return true;
    else return false;
  }

  onAssociarPrecos(): void {
    const precos = this.formPrecos.getRawValue() as precos;
    precos.nomeEmpresa = this.searchEmpresa(precos.codEmpresa);
    this.precoAssociado(precos);
    this.submitAssocGrupo = true;
  }

  searchEmpresa(codEmpresa: number) {
    let empresaFound = this.unidades.filter((xx) => xx.idEmpresa == codEmpresa);
    return empresaFound[0]['nomeEmpresa'];
  }

  precoAssociado(preco: any): void {
    this.onAddPreco(preco, true, 'onAssociarPrecos');
  }

  onLimparGrupoPrincipal(): void {
    this.limparGrupoPrincipal = true;
    this.onInput();

    this.form.controls.codDescricao.setValue(null);
    this.form.controls.codSituacao.setValue(null);
    this.form.controls.dtInicioVigencia.setValue(null);
    this.form.controls.dtFimVigencia.setValue(null);

    setTimeout(() => {
      this.limparGrupoPrincipal = false;
    }, 100);
  }

  onDeleteGrupo(index: number, item: any): void {
    let codGrupo = item.value.codGrupo;
    let nomeGrupo = item.value.nomeGrupo;

    this.confirmDeleteGrupo(codGrupo, nomeGrupo).subscribe((response: boolean) =>
      response ? this.deleteGrupo(index, codGrupo) : null
    );

    // }
  }

  closeModal(modalRef: TemplateRef<any>) {
    if (this.submittingFormPrecos === false && this.precosEstado.length > 0) {
      this.confirmCancel().subscribe((response: boolean) =>
        response ? this.onCancelFormValores(modalRef) : null
      );
    } else {
      this.modalRef.hide();
    }
  }

  closeModalUpdate(modalRef: TemplateRef<any>) {
    this.modalRef.hide();
  }

  onCancelFormValores(modalRef: TemplateRef<any>) {
    this.precosEstado = [];
    this.modalRef.hide();
  }


  confirmAdd(): any {
    this.editMode = false;

    return this.confirmModalService.showConfirm(
      'cancelar',
      'Confirmar',
      'Ao confirmar, você estará alterando os valores, deseja mesmo continuar?',
      'Cancelar',
      'Confirmar'
    );
  }

  confirmCancel(): any {
    this.editMode = false;

    return this.confirmModalService.showConfirm(
      'cancelar',
      'Confirmar Cancelamento',
      'As informações que não foram salvas serão perdidas, deseja continuar ?',
      'Cancelar',
      'Confirmar'
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

  confirmDeleteGrupo(codGrupo: any, nomeGrupo: any): any {
    return this.confirmModalService.showConfirm(
      'delete',
      'Confirmar exclusão',
      'Deseja realmente prosseguir com a exclusão do grupo ' + codGrupo + ' - ' + nomeGrupo + ' ?',
      'Cancelar',
      'Confirmar'
    );
  }


  deleteGrupo(index: number, codGrupo: number) {
    if (this.form.value.assocGrupos[index].source === 'user') {
      this.assocGrupos.removeAt(index);
    } else if (this.form.value.assocGrupos[index].source === 'application') {
      this.loaderNavbar = true;

      this.activatedRoute.params.subscribe((params: any) => {
        this.tabelaPrecosService
          .deleteAssociacaoGrupo(this.form.value.codPreco, codGrupo)
          .pipe(
            finalize(() => {
              this.loaderNavbar = false;
            })
          )
          .subscribe({
            next: (response: JsonResponse) => {
              if (response.success) {
                this.assocGrupos.removeAt(index);
              } else {
                this.pnotifyService.error();
              }
            },
            error: (error: any) => {
              if (
                error.error.hasOwnProperty('mensagem') &&
                (error.mensagem !== null || error.mensagem !== '')
              ) {
                this.pnotifyService.error(error.error.mensagem);
              } else {
                this.pnotifyService.error();
              }
            }
          });
      });
    }
    this.form.markAsTouched();
    this.form.markAsDirty();
  }

  grupoAssociado(material: any): void {
    this.onAddGrupo(material, true, 'user');
  }

  onAssociarGrupos(): void {
    this.toggleAll = false;

    for (let index = 0; index < this.dados.length; index++) {
      if (this.dados[index].checked === 1) {
        const grupo = {
          codGrupo: this.dados[index].codGrupo,
          nomeGrupo: this.dados[index].nomeGrupo,
        };
        this.grupoAssociado(grupo);
        this.dados[index].checked = 0;
        this.submittingForm = true;
      }
    }
  }

  onFilter(): void {
    this.dados = [];
    this.dadosLoaded = false;
    this.dadosEmpty = false;
    this.searching = true;

    if (this.formFilter.valid) {
      this.search(this.formFilter.getRawValue());
    }
  }

  search(params): void {
    this.loaderNavbar = true;
    this.dados = [];
    this.dadosLoaded = false;
    this.dadosEmpty = false;

    this.tabelaPrecosService
      .getGrupos(params)
      .pipe(
        finalize(() => {
          this.loaderNavbar = false;
          this.dadosLoaded = true;
        })
      )
      .subscribe({
        next: (response: JsonResponse) => {
          if (response.success === true) {
            this.dados = response.data;
            this.totalItems = this.dados[0]['total'];
            this.searching = false;
          } else if (response.success === false) {
            this.dadosEmpty = true;
            this.dadosLoaded = true;
            this.searching = false;
            this.firstSearch = true;
          } else {
            this.pnotifyService.error();
            this.dadosEmpty = true;
            this.firstSearch = false;
          }
        },
        error: (error: any) => {
          this.dadosEmpty = false;
          this.searching = false;
          if (error.error.hasOwnProperty('mensagem')) {
            this.pnotifyService.error(error.error.mensagem);
          } else {
            this.pnotifyService.error();
          }
        }
      });
  }

  onToggleAll() {
    this.toggleAll = !this.toggleAll;

    for (let index = 0; index < this.dados.length; index++) {
      this.dados[index].checked = this.toggleAll === true ? 1 : 0;
    }
  }

  onCheckGrupo(index: number, grupo: any): void {
    this.dados[index].checked = grupo.checked === 1 ? 0 : 1;
  }

  getUnidades() {
    this.tabelaPrecosService.getEmpresas().subscribe({
      next: (response: any) => {
        if (response.responseCode === 200) {
          this.unidades = response.result;
          // this.setFormBuilder();
        } else {
          this.pnotifyService.error();
          this.location.back();
        }
      },
      error: (error: any) => {
        this.pnotifyService.error();
        this.location.back();
      }
    });
  }

  // Tratamento de erros
  onFieldError(field: string) {
    if (this.onFieldInvalid(field)) {
      return 'is-invalid';
    }

    return '';
  }

  onFieldInvalid(field: any) {
    field = this.form.get(field);

    if (field.errors != null) {
      if (field.errors.hasOwnProperty('required') && field.touched) {
        return 'required';
      }
    }

    return '';
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

  geetParams(params: any): any {
    let dataInicial = params['dataInicialVigencia'];
    let dataFinal = params['dataFimVigencia'];

    this.form.patchValue({
      dataInicialVigencia: dataInicial,
      dataFimVigencia: dataFinal,
    });

    if (dataInicial instanceof Date) {
      dataInicial = this.dateService.convertToUrlDate(dataInicial);
    }

    if (dataFinal instanceof Date) {
      dataFinal = this.dateService.convertToUrlDate(dataFinal);
    }

    return {
      dataInicial: dataInicial,
      dataFinal: dataFinal,
    };
  }
}
