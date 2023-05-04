import {
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
  Input,
  SimpleChanges,
  OnChanges,
} from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { finalize, take, switchMap } from 'rxjs/operators';
import { forkJoin, Observable, EMPTY } from 'rxjs';

// ngx-bootstrap
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { BsLocaleService, BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { ptBrLocale } from 'ngx-bootstrap/locale';

defineLocale('pt-br', ptBrLocale);

// Services
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { ConfirmModalService } from 'src/app/shared/modules/confirm-modal/confirm-modal.service';
import { ComercialCadastrosOperadorComercialService } from '../operadores-comerciais.service';
import { ComercialCadastrosMotivoAssociacaoService } from '../../motivo-associacao/motivo-associacao.service';

// Interfaces
import { AssociacaoOperadorComercial } from '../models/associacao-operador-comercial';
import { MotivoAssociacao } from '../../motivo-associacao/models/motivo-associacao';
import { OperadorComercial } from '../models/operador-comercial';

@Component({
  selector: 'comercial-cadastros-operadores-comerciais-associacoes',
  templateUrl: './associacoes.component.html',
  styleUrls: ['./associacoes.component.scss'],
})
export class ComercialCadastrosOperadorComercialAssociacoesComponent
  implements OnInit, OnChanges
{
  @Input('codOperador') codOperador: number;
  @Input('showModal') showModal = false;
  @ViewChild('modalAssociacoes', {}) modalAssociacoes: TemplateRef<any>;
  @ViewChild('modalHistoricoAssociacoes', {})
  modalHistoricoAssociacoes: TemplateRef<any>;

  bsConfig: Partial<BsDatepickerConfig>;

  form: FormGroup;
  submittingForm: boolean;

  showLoader: boolean;

  associacoes: Array<AssociacaoOperadorComercial> = [];
  associacoesLoaded = false;
  associacoesEmpty = false;

  historicoAssociacoes: Array<any> = [];
  historicoAssociacoesLoaded = false;

  modalRef: BsModalRef;

  dependenciesLoaded = false;
  operadores: Array<OperadorComercial> = [];
  motivosAssociacao: Array<MotivoAssociacao> = [];

  constructor(
    private localeService: BsLocaleService,
    private formBuilder: FormBuilder,
    private modalService: BsModalService,
    private pnotifyService: PNotifyService,
    private confirmModalService: ConfirmModalService,
    private operadorComercialService: ComercialCadastrosOperadorComercialService,
    private motivosAssociacaoService: ComercialCadastrosMotivoAssociacaoService
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
    this.checkAssociacoes();
    this.setFormBuilder();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.showModal.currentValue === true) {
      this.onAdd();
    }
  }

  setFormBuilder(): void {
    this.form = this.formBuilder.group({
      operadores: [null, [Validators.required]],
      motivoAssociacao: [null, [Validators.required]],
      dataInicio: [null, [Validators.required]],
      dataTermino: [null],
    });
  }

  checkAssociacoes(): void {
    if (this.codOperador !== null) {
      this.getAssociacoesOperadores();
    }
  }

  getAssociacoesOperadores(): void {
    this.associacoes = [];
    this.associacoesEmpty = false;
    this.associacoesLoaded = false;
    this.historicoAssociacoes = [];
    this.historicoAssociacoesLoaded = false;

    this.operadorComercialService
      .getAssociacoesOperadores(this.codOperador)
      .pipe(
        finalize(() => {
          this.associacoesLoaded = true;
        })
      )
      .subscribe({
        next: (response: any) => {
          if (response.hasOwnProperty('success') && response.success === true) {
            this.associacoes = response.data;
          } else {
            this.associacoesEmpty = true;
          }
        },
        error: (error: any) => {
          this.associacoesEmpty = true;
        }
      });
  }

  onReloadAssociacoes(): void {
    this.getAssociacoesOperadores();
  }

  onAdd(): void {
    if (this.dependenciesLoaded === false) {
      this.getFormFields();
    } else {
      this.openModal(this.modalAssociacoes);
    }
  }

  getFormFields(): void {
    this.showLoader = true;
    this.operadores = [];
    this.motivosAssociacao = [];

    this.loadDepencencies()
      .pipe(
        finalize(() => {
          this.showLoader = false;
        })
      )
      .subscribe({
        next: (response: any) => {
          if (
            response[0].hasOwnProperty('success') &&
            response[0].success === true
          ) {
            if (
              response[1].hasOwnProperty('success') &&
              response[1].success === true
            ) {
              this.operadores = response[0].data;
              this.motivosAssociacao = response[1].data;
              this.dependenciesLoaded = true;
              this.openModal(this.modalAssociacoes);
            } else {
              this.pnotifyService.error('A operação não pode ser realizada.');
            }
          } else {
            this.pnotifyService.error('A operação não pode ser realizada.');
          }
        },
        error: (error: any) => {
          this.pnotifyService.error('A operação não pode ser realizada.');
        }
      });
  }

  loadDepencencies(): Observable<any> {
    const operadores =
      this.operadorComercialService.getListaOperadoresComerciais({
        codSituacao: 1,
      });
    const motivosAssociacao =
      this.motivosAssociacaoService.getListaMotivosAssociacao({
        codSituacao: 1,
      });

    return forkJoin([operadores, motivosAssociacao]).pipe(take(1));
  }

  onDelete(associacaoOperadorComercial: AssociacaoOperadorComercial): void {
    this.confirmDelete()
      .asObservable()
      .pipe(
        take(1),
        switchMap((result) =>
          result
            ? this.deleteAssociacaoOperador(associacaoOperadorComercial)
            : EMPTY
        ),
        finalize(() => {
          this.showLoader = false;
        })
      )
      .subscribe(
        (success: any) => {
          this.pnotifyService.success();
          this.onReloadAssociacoes();
        },
        (error: any) => {
          this.pnotifyService.error();
        }
      );
  }

  confirmDelete(): any {
    return this.confirmModalService.showConfirm(
      'inactivate',
      'Confirmar inativação',
      'Deseja realmente prosseguir com a inativação da associação?',
      'Cancelar',
      'Confirmar'
    );
  }

  deleteAssociacaoOperador(
    associacaoOperadorComercial: AssociacaoOperadorComercial
  ): Observable<any> {
    this.showLoader = true;

    return this.operadorComercialService.deleteAssociacaoOperador({
      codAssociacao: associacaoOperadorComercial.codAssociacao,
      codOperador: associacaoOperadorComercial.codOperador,
    });
  }

  openModal(template: TemplateRef<any>, customClass?: string): void {
    let config = {
      keyboard: false,
      ignoreBackdropClick: true,
    };

    if (customClass) {
      Object.assign(config, { class: customClass });
    }

    this.modalRef = this.modalService.show(template, config);
  }

  hideModal(): void {
    this.modalRef.hide();
    this.form.reset();
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
      this.submittingForm = true;

      this.operadorComercialService
        .postAssociacaoOperador(
          Object.assign(this.form.value, { codOperador: this.codOperador })
        )
        .pipe(
          finalize(() => {
            this.submittingForm = false;
          })
        )
        .subscribe({
          next: (response: any) => {
            if (
              response.hasOwnProperty('mensagem') &&
              response.hasOwnProperty('success') &&
              response.success === true
            ) {
              this.pnotifyService.success(response.mensagem);
              this.hideModal();
              this.getAssociacoesOperadores();
            } else if (
              response.hasOwnProperty('mensagem') &&
              response.hasOwnProperty('success') &&
              response.success === false
            ) {
              this.pnotifyService.notice(response.mensagem);
            } else {
              this.pnotifyService.error();
            }
          },
          error: (error: any) => {
            this.pnotifyService.error();
          }
        });
    }
  }

  onHistorico(): void {
    if (this.historicoAssociacoesLoaded === false) {
      this.showLoader = true;

      this.operadorComercialService
        .getHistoricoAssociacoes(this.codOperador)
        .pipe(
          finalize(() => {
            this.showLoader = false;
          })
        )
        .subscribe({
          next: (response: any) => {
            if (
              response.hasOwnProperty('mensagem') &&
              response.hasOwnProperty('success') &&
              response.success === true
            ) {
              this.historicoAssociacoes = response.data;
              this.historicoAssociacoesLoaded = true;
              this.openModal(this.modalHistoricoAssociacoes, 'modal-xxl');
            } else if (
              response.hasOwnProperty('mensagem') &&
              response.hasOwnProperty('success') &&
              response.success === false
            ) {
              this.pnotifyService.notice(response.mensagem);
            } else {
              this.pnotifyService.error();
            }
          },
          error: (error: any) => {
            this.pnotifyService.error();
          }
        });
    } else {
      this.openModal(this.modalHistoricoAssociacoes, 'modal-xxl');
    }
  }
}
