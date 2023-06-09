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
import { ComercialCadastrosAssociacaoLinhasService } from '../associacao-linhas.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { TitleService } from 'src/app/shared/services/core/title.service';
import { ComercialService } from 'src/app/modules/comercial/comercial.service';
import { ConfirmModalService } from 'src/app/shared/modules/confirm-modal/confirm-modal.service';

// Interfaces
import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';
import { ILinha } from '../models/associacao-linhas';
import { JsonResponse } from 'src/app/models/json-response';
import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';

@Component({
  selector: 'comercial-cadastros-associacao-linhas-formulario',
  templateUrl: './formulario.component.html',
  styleUrls: ['./formulario.component.scss'],
})
export class ComercialCadastrosAssociacaoLinhasFormularioComponent
  implements OnInit, IFormCanDeactivate {
  public MASKS = MASKS;

  loaderFullScreen = true;
  loaderNavbar: boolean;

  appTitle: string;
  breadCrumbTree: Array<Breadcrumb> = [];

  tableConfigAssocSetores: Partial<CustomTableConfig> = {
    fixedHeader: false,
    bodyHeight: 230,
    hover: false,
  };

  tableConfigSetores: Partial<CustomTableConfig> = {
    fixedHeader: false,
    bodyHeight: 243,
  };

  codLinha: number = null;

  form: FormGroup;
  formChanged = false;
  submittingForm: boolean;

  showSetores = true;

  formSetores: FormGroup;

  linhas: Array<any> = [];
  classes: Array<any> = [];
  filteredClasses: Array<any> = [];
  setores: Array<any> = [];
  setoresLoader: boolean;
  setoresFilter: Array<any> = [];

  toggleAll = false;
  searching = false;
  firstSearch = false;
  setoresFilterLoaded = false;
  setoresLista: Array<any> = [];
  setoresListaLoaded = false;
  setoresListaEmpty = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private location: Location,
    private formBuilder: FormBuilder,
    private setoresLinhaService: ComercialCadastrosAssociacaoLinhasService,
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
    this.setFormBuilder();
    this.getSetores();
    this.getSetoresFilter();
    this.setFormSetores();
    this.titleService.setTitle('Cadastro de linha de setores');
  }

  registrarAcesso(): void {
    this.atividadesService.registrarAcesso().subscribe();
  }

  setBreadCrumb(): void {
    this.activatedRoute.params.subscribe((params: any) => {
      if (params.id) {
        this.appTitle = 'Editar Linha';
      } else {
        this.appTitle = 'Nova Linha';
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
          descricao: 'Linhas',
          routerLink: `/comercial/cadastros/${params.idSubModulo}/associacao-linhas/lista`,
        },
        {
          descricao: this.appTitle,
        },
      ];
    });
  }

  setFormBuilder(): void {
    const resolver = this.activatedRoute.snapshot.data.detalhes;
    console.log(resolver);
    if (resolver.body.success === true) {
      const detalhes: ILinha = resolver.body.data[0];
      const setoresAssociados: ILinha = resolver.body.data;

      this.form = this.formBuilder.group({
        ID_LINH: [detalhes.ID_LINH],
        NM_LINH: [{ value: [detalhes.NM_LINH], disabled: true }, [Validators.required]],
        assocSetores: this.formBuilder.array([]),
      });
      this.setSetores(setoresAssociados);
    } else {
      this.pnotifyService.error();
      this.location.back();
    }
  }

  setFormSetores(): void {
    this.formSetores = this.formBuilder.group({
      ID_SETO_ATIV: [null],
    });
  }

  setSetores(setores: any): void {
    if (setores.length > 0) {
      for (let i = 0; i < setores.length; i++) {
        this.onAddSetor(setores[i]);
      }
    }
  }

  get assocSetores(): FormArray {
    return this.form.get('assocSetores') as FormArray;
  }

  getSetoresFilter(params?) {
    this.setoresFilterLoaded = true;

    this.setoresLinhaService
      .getSetoresFilter()
      .pipe(
        finalize(() => {
          this.setoresFilterLoaded = false;
        })
      )
      .subscribe((response) => {
        if (response.status === 200) {
          this.setoresFilter = response.body['data'];
        }
      });
  }

  onAddSetor(setor: any, manipulateForm?: boolean): void {
    if (this.checkSetorExists(setor) === false) {
      this.assocSetores.push(
        this.formBuilder.group({
          ID_SETO_ATIV: [setor.ID_SETO_ATIV],
          DESCRICAO: [setor.DESCRICAO],
          ID: [setor.ID],
        })
      );

      if (this.form.value.assocSetores.length > 9) {
        if (this.tableConfigAssocSetores.fixedHeader === false) {
          this.showSetores = false;
          this.tableConfigAssocSetores.fixedHeader = true;

          setTimeout(() => {
            this.showSetores = true;
          }, 1);
        }

        if (manipulateForm) {
          this.form.markAsTouched();
          this.form.markAsDirty();
        }
      }
    }
  }

  checkSetorExists(setor: any): boolean {
    return this.form.value.assocSetores.some((el: any) => {
      return el.ID_SETO_ATIV === setor.ID_SETO_ATIV;
    });
  }

  onLimparAssociacoes(): void {
    const assocSetores = this.form.get('assocSetores') as FormArray;
    assocSetores.clear();
  }

  onDeleteSetor(index: number): void {
    this.confirmDelete().subscribe((response: boolean) =>
      response ? this.deleteSetor(index) : null
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

  deleteSetor(index: number) {
    this.assocSetores.removeAt(index);
    this.form.markAsTouched();
    this.form.markAsDirty();
  }

  getSetores(): void {
    this.setoresLinhaService
      .getSetores()
      .pipe(
        finalize(() => {
          this.loaderFullScreen = false;
          this.setoresLoader = false;
        })
      )
      .subscribe({
        next: (response: any) => {
          this.loaderFullScreen = false;
          if (response.status === 200) {
            this.setores = response.body['data'];
          }
        },
        error: (error: any) => {
          if (error.error.hasOwnProperty('mensagem')) {
            this.pnotifyService.error(error.error.mensagem);
          } else {
            this.pnotifyService.error();
          }
        }
      });
  }

  onFilterSetores(): void {
    if (this.formSetores.valid) {
      this.loaderNavbar = true;
      this.searching = true;
      this.setoresLista = [];
      this.setoresListaLoaded = false;
      this.setoresListaEmpty = false;
      let params;

      if (this.formSetores.value.ID_SETO_ATIV) {
        params = { ID_SETO_ATIV: this.formSetores.value.ID_SETO_ATIV};
      } else {
        params = { ID_SETO_ATIV: ''};
      }
      this.setoresLinhaService
        .getSetores(params)
        .pipe(
          finalize(() => {
            this.firstSearch = true;
            this.searching = false;
            this.loaderNavbar = false;
            this.setoresListaLoaded = true;
          })
        )
        .subscribe({
          next: (response: JsonResponse) => {
            if (
              response.hasOwnProperty('success') &&
              response.success === true
            ) {
              this.setoresLista = response.data.map(function (el: any) {
                var o = Object.assign({}, el);
                o.checked = 0;
                return o;
              });
              if (this.setoresLista.length > 9) {
                this.tableConfigSetores.fixedHeader = true;
              } else {
                this.tableConfigSetores.fixedHeader = false;
              }
            } else if (
              response.hasOwnProperty('success') &&
              response.success === false &&
              response.hasOwnProperty('mensagem')
            ) {
              this.pnotifyService.error(response.mensagem);
              this.setoresListaEmpty = true;
            } else {
              this.pnotifyService.error();
              this.setoresListaEmpty = true;
            }
          },
          error: (error: any) => {
            if (error['error'].hasOwnProperty('mensagem')) {
              this.pnotifyService.error(error.error.mensagem);
            } else {
                if(this.formSetores.value.ID_SETO_ATIV){
                  this.pnotifyService.notice('Setor pesquisado não está disponivel para associação');
                }else{
                  this.pnotifyService.error()
                }
            }
          }
        });
    }
  }

  onToggleAll() {
    this.toggleAll = !this.toggleAll;

    for (let index = 0; index < this.setoresLista.length; index++) {
      this.setoresLista[index].checked = this.toggleAll === true ? 1 : 0;
    }
  }

  onCheckSetor(index: number, setor: any): void {
    this.setoresLista[index].checked = setor.checked == 0 ? 1 : 0;
  }

  onAssociarSetores(): void {
    this.toggleAll = false;

    for (let index = 0; index < this.setoresLista.length; index++) {
      if (this.setoresLista[index].checked === 1) {
        const setor = {
          ID_SETO_ATIV: this.setoresLista[index].ID_SETO_ATIV,
          DESCRICAO: this.setoresLista[index].DESCRICAO,
        };

        this.onAddSetor(setor, true);
        this.setoresLista[index].checked = 0;
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
    if (this.form.valid) {
      if (this.form.value.assocSetores.length > 0) {
        this.loaderNavbar = true;
        this.submittingForm = true;

        this.setoresLinhaService
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
        this.pnotifyService.notice('Associe pelo menos um setor.');
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
