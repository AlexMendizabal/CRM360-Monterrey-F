import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  FormGroup,
  FormBuilder,
  FormControl,
  Validators,
  FormArray,
} from '@angular/forms';
import { Location } from '@angular/common';
import { take, switchMap, finalize } from 'rxjs/operators';
import { Subscription, EMPTY } from 'rxjs';

// ng-brazil
import { MASKS } from 'ng-brazil';

// Interfaces
import { IFormCanDeactivate } from 'src/app/guards/iform-candeactivate';

// Services
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { ComercialClientesCadastroContatosFormularioService } from './formulario.service';
import { ComercialClientesCadastroService } from '../../cadastro.service';
import { ComercialClientesService } from 'src/app/modules/comercial/services/clientes.service';
import { ConfirmModalService } from 'src/app/shared/modules/confirm-modal/confirm-modal.service';

@Component({
  selector: 'comercial-clientes-cadastro-contatos-formulario',
  templateUrl: './formulario.component.html',
  styleUrls: ['./formulario.component.scss'],
})
export class ComercialClientesCadastroContatosFormularioComponent
  implements OnInit, AfterViewInit, OnDestroy, IFormCanDeactivate {
  public MASKS = MASKS;
  private subscriptionCancel: Subscription;
  private subscriptionSubmit: Subscription;

  loaderFullScreen: boolean = true;

  codCliente: number;

  form: FormGroup;
  formChanged: boolean = false;

  funcoes: any = [];
  setores: any = [];
  timesFutebol: any = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private formService: ComercialClientesCadastroContatosFormularioService,
    private cadastroService: ComercialClientesCadastroService,
    private location: Location,
    private clientesService: ComercialClientesService,
    private pnotifyService: PNotifyService,
    private confirmModalService: ConfirmModalService
  ) {
    this.pnotifyService.getPNotify();
  }

  ngOnInit() {
    this.cancelSubscription();
    this.submitSubscription();

    if (this.activatedRoute.snapshot.data.data.success === true) {
      this.getFormFields();
      this.setFormBuilder(this.activatedRoute.snapshot.data.data.data);
      console.log(this.activatedRoute.snapshot.data.data.data);
      this.activatedRoute.parent.parent.params.subscribe((params: any) => {
        this.codCliente = params.id;
      });
    } else {
      this.pnotifyService.error();
      this.location.back();
    }
  }

  ngAfterViewInit() {
    this.cadastroService.onNotifyLoaded(true);
  }

  ngOnDestroy() {
    this.subscriptionCancel.unsubscribe();
    this.subscriptionSubmit.unsubscribe();
  }

  getFormFields() {
    this.formService
      .loadDepencies()
      .pipe(
        finalize(() => {
          this.loaderFullScreen = false;
          this.cadastroService.onNotifyLoaded(false);
        })
      )
      .subscribe({
        next: (response: any) => {
          if (response[0]['responseCode'] === 200) {
            this.funcoes = response[0]['result'];
          } else {
            this.handleFormFieldsError();
          }

          if (response[1]['responseCode'] === 200) {
            this.setores = response[1]['result'];
          } else {
            this.handleFormFieldsError();
          }

          /* if (response[2]['responseCode'] === 200) {
            this.timesFutebol = response[2]['result'];
          } else {
            this.handleFormFieldsError();
          } */
        },
        error: (error: any) => {
          this.handleFormFieldsError();
        }
      });
  }

  handleFormFieldsError() {
    this.pnotifyService.error();
    this.location.back();
  }

  setFormBuilder(data: any) {
    this.form = this.formBuilder.group({
      id: [data['id']],
      idSeqTid: [data['idSeqTid']],
      nomeCompleto: [data['nomeCompleto'], [Validators.required]],
      genero: [data['idGenero'], [Validators.required]],
      funcao: [data['idFuncao'], [Validators.required]],
      setor: [data['idSetor'], [Validators.required]],
      celulares: this.formBuilder.array([]),
      telefones: this.formBuilder.array([]),
      emails: this.formBuilder.array([]),
      /* dataAniversario: [data['dataAniversario']],
      timeFutebol: [data['idTimeFutebol']],
      estadoCivil: [data['idEstadoCivil']],
      linkedin: [data['linkedin']],
      facebook: [data['facebook']],
      instagram: [data['instagram']],
      hobbies: [data['hobbies']],
      qtdeFilhos: [data['qtdeFilhos']],
      observacoes: [data['observacoes']],
      filhos: this.formBuilder.array([]), */
      tid: [data['tid']],
    });

    this.setFormMeiosContato(data['contatos']);
    // this.setFormFilhos(data['filhos']);
  }

  cancelSubscription() {
    this.subscriptionCancel = this.cadastroService.notifyCancelObservable$.subscribe(
      (response: any) => {
        if (response) {
          this.onCancel();
        }
      }
    );
  }

  submitSubscription() {
    this.subscriptionSubmit = this.cadastroService.notifySubmitObservable$.subscribe(
      (response: any) => {
        if (response) {
          this.onSubmit();
        }
      }
    );
  }

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

  onInput() {
    this.formChanged = true;
  }

  setFormMeiosContato(meiosContato: any) {
    if (meiosContato.length > 0 && meiosContato != null) {
      for (let i = 0; i < meiosContato.length; i++) {
        this.pushMeioContato(meiosContato[i]);
      }
    }
  }

  setFormFilhos(filhos: any) {
    if (filhos.length > 0 && filhos != null) {
      for (let i = 0; i < filhos.length; i++) {
        this.pushFilho(filhos[i]);
      }
    }
  }

  get celulares() {
    return this.form.get('celulares') as FormArray;
  }

  get telefones() {
    return this.form.get('telefones') as FormArray;
  }

  get emails() {
    return this.form.get('emails') as FormArray;
  }

  get filhos() {
    return this.form.get('filhos') as FormArray;
  }

  pushMeioContato(contato: any) {
    if (contato['tipo'] == 'Celular') {
      this.pushCelular(contato);
    } else if (contato['tipo'] == 'Telefone') {
      this.pushTelefone(contato);
    } else if (
      contato['tipo'] == 'Email' ||
      contato['tipo'] == 'E-Mail' ||
      contato['tipo'] == 'Email NFe' ||
      contato['tipo'] == 'E-mail NFe' ||
      contato['tipo'] == 'MalaDireta'
    ) {
      this.pushEmail(contato);
    }
  }

  pushCelular(contato: any) {
    let isWhatsApp = false;

    if (contato['idTipoContato'] == 1) {
      isWhatsApp = true;
    }

    this.celulares.push(
      this.formBuilder.group({
        id: [contato['id']],
        tipo: [contato['tipo']],
        contato: [contato['contato'].toString(), [Validators.required]],
        whatsapp: [isWhatsApp],
      })
    );
  }

  pushTelefone(contato: any) {
    this.telefones.push(
      this.formBuilder.group({
        id: [contato['id']],
        tipo: [contato['tipo']],
        contato: [contato['contato'].toString(), [Validators.required]],
      })
    );
  }

  pushEmail(contato: any) {
    let isEmailMarketing = false;
    let isEmailNFe = false;

    if (contato['tipo'] == 'MalaDireta') {
      isEmailMarketing = true;
    }

    if (contato['tipo'] == 'Email NFe' || contato['tipo'] == 'E-mail NFe') {
      isEmailNFe = true;
    }

    this.emails.push(
      this.formBuilder.group({
        id: [contato['id']],
        tipo: [contato['tipo']],
        contato: [contato['contato'], [Validators.required, Validators.email]],
        marketing: [isEmailMarketing],
        nfe: [isEmailNFe],
      })
    );
  }

  pushFilho(filho: any) {
    this.filhos.push(
      this.formBuilder.group({
        id: [filho['id']],
        nome: [filho['nome'], [Validators.required]],
        idade: [filho['idade'], [Validators.required]],
      })
    );
  }

  onAddMeioContato(tipo: string) {
    if (tipo == 'celular') {
      this.onAddCelular();
    } else if (tipo == 'telefone') {
      this.onAddTelefone();
    } else if (tipo == 'email') {
      this.onAddEmail();
    }
  }

  onAddCelular() {
    this.celulares.push(
      this.formBuilder.group({
        id: [null],
        tipo: ['Celular'],
        contato: [null, [Validators.required]],
        whatsapp: [false],
      })
    );
  }

  onAddTelefone() {
    this.telefones.push(
      this.formBuilder.group({
        id: [null],
        tipo: ['Telefone'],
        contato: [null, [Validators.required]],
      })
    );
  }

  onAddEmail() {
    this.emails.push(
      this.formBuilder.group({
        id: [null],
        tipo: ['E-Mail'],
        contato: [null, [Validators.required]],
        marketing: [false],
        nfe: [false],
      })
    );
  }

  onAddFilho() {
    this.filhos.push(
      this.formBuilder.group({
        id: [null],
        nome: [null, [Validators.required]],
        idade: [null, [Validators.required]],
      })
    );
  }

  onDeleteMeioContato(tipo: string, index: number) {
    if (tipo == 'celular') {
      this.onDeleteCelular(index);
    } else if (tipo == 'telefone') {
      this.onDeleteTelefone(index);
    } else if (tipo == 'email') {
      this.onDeleteEmail(index);
    }
  }

  onDeleteCelular(index: number) {
    if (this.celulares.controls[index].value['id'] == null) {
      this.celulares.removeAt(index);
    } else {
      this.confirmDelete()
        .asObservable()
        .pipe(
          take(1),
          switchMap((result) =>
            result
              ? this.deleteMeioContato(
                  this.celulares.controls[index].value['id']
                )
              : EMPTY
          )
        )
        .subscribe({
          next: (response) => {
            if (response['responseCode'] === 200) {
              this.celulares.removeAt(index);
              this.pnotifyService.success();
              this.cadastroService.onNotifyLoaded(false);
            }
          },
          error: (error) => {
            this.pnotifyService.error(
              'Erro ao excluir celular. Tente novamente!'
            );
            this.cadastroService.onNotifyLoaded(false);
          }
        });
    }
  }

  onDeleteTelefone(index: number) {
    if (this.telefones.controls[index].value['id'] == null) {
      this.telefones.removeAt(index);
    } else {
      this.confirmDelete()
        .asObservable()
        .pipe(
          take(1),
          switchMap((result) =>
            result
              ? this.deleteMeioContato(
                  this.telefones.controls[index].value['id']
                )
              : EMPTY
          )
        )
        .subscribe({
          next: (response) => {
            if (response['responseCode'] === 200) {
              this.telefones.removeAt(index);
              this.pnotifyService.success();
              this.cadastroService.onNotifyLoaded(false);
            }
          },
          error: (error) => {
            this.pnotifyService.error(
              'Erro ao excluir telefone. Tente novamente!'
            );
            this.cadastroService.onNotifyLoaded(false);
          }
        });
    }
  }

  onDeleteEmail(index: number) {
    if (this.emails.controls[index].value['id'] == null) {
      this.emails.removeAt(index);
    } else {
      this.confirmDelete()
        .asObservable()
        .pipe(
          take(1),
          switchMap((result) =>
            result
              ? this.deleteMeioContato(this.emails.controls[index].value['id'])
              : EMPTY
          )
        )
        .subscribe({
          next: (response) => {
            if (response['responseCode'] === 200) {
              this.emails.removeAt(index);
              this.pnotifyService.success();
              this.cadastroService.onNotifyLoaded(false);
            }
          },
          error: (error) => {
            this.pnotifyService.error(
              'Erro ao excluir e-mail. Tente novamente!'
            );
            this.cadastroService.onNotifyLoaded(false);
          }
        });
    }
  }

  onDeleteFilho(index: number) {
    if (this.filhos.controls[index].value['id'] == null) {
      this.filhos.removeAt(index);
    } else {
      this.confirmDelete()
        .asObservable()
        .pipe(
          take(1),
          switchMap((result) => (result ? this.deleteFilho(index) : EMPTY))
        )
        .subscribe({
          next: (success) => {
            this.pnotifyService.success();
            this.cadastroService.onNotifyLoaded(false);
          },
          error: (error) => {
            this.pnotifyService.error(
              'Erro ao excluir filho. Tente novamente!'
            );
            this.cadastroService.onNotifyLoaded(false);
          }
        });
    }
  }

  confirmDelete() {
    return this.confirmModalService.showConfirm(
      'delete',
      'Confirmar exclusão',
      'Deseja realmente prosseguir com a exclusão do registro?',
      'Cancelar',
      'Confirmar'
    );
  }

  deleteMeioContato(id: number) {
    this.cadastroService.onNotifyLoaded(false);
    return this.clientesService.deleteMeioContato(
      this.codCliente,
      this.form.value['id'],
      id
    );
  }

  deleteFilho(id: number) {
    this.cadastroService.onNotifyLoaded(false);
    return this.clientesService.deleteFilho(id);
  }

  checkValidatorsMeiosContato() {
    let validation = true;

    if (
      this.form.value['celulares'].length == 0 &&
      this.form.value['telefones'].length == 0 &&
      this.form.value['emails'].length == 0
    ) {
      validation = false;
    }

    return validation;
  }

  formCanDeactivate() {
    if (this.formChanged) {
      if (confirm('Este cliente no forma parte de tu cartera?')) {
        return true;
      } else {
        return false;
      }
    }
    return true;
  }

  onCancel() {
    this.location.back();
  }

  onSubmit() {
    if (!this.checkValidatorsMeiosContato()) {
      this.pnotifyService.notice('Informe ao menos um meio de contato.');
      return false;
    }

    if (this.form.pristine) {
      this.location.back();
    } else {
      if (this.form.valid) {
        this.cadastroService.onNotifyLoaded(true);

        let formObj = {
          codCliente: this.codCliente,
          id: this.form.value['id'],
          idSeqTid: this.form.value['idSeqTid'],
          nomeCompleto: this.form.value['nomeCompleto'],
          idSetor: this.form.value['setor'],
          idFuncao: this.form.value['funcao'],
          idGenero: this.form.value['genero'],
          contatos: [],
          /* dataAniversario: this.form.value['dataAniversario'],
          idTimeFutebol: this.form.value['timeFutebol'],
          idEstadoCivil: this.form.value['estadoCivil'],
          linkedin: this.form.value['linkedin'],
          facebook: this.form.value['facebook'],
          instagram: this.form.value['instagram'],
          hobbies: this.form.value['hobbies'],
          observacoes: this.form.value['observacoes'],
          filhos: this.form.value['filhos'] */
        };

        formObj['contatos'] = this.form.value['celulares'].concat(
          this.form.value['telefones'],
          this.form.value['emails']
        );

        this.clientesService.updateContato(formObj).subscribe({
          next: (response: any) => {
            console.log(response)
            if (response['responseCode'] === 200) {
              this.onSended();
              this.pnotifyService.success();
              this.cadastroService.onNotifyLoaded(false);
              this.formChanged = false;
              this.location.back();
            } else {
              this.handleSubmitError();
            }
          },
          error: (error: any) => {
            this.handleSubmitError();
          }
        });
      }
    }
  }

  handleSubmitError() {
    this.pnotifyService.error('Ocorreu um erro ao salvar o cadastro.');
    this.cadastroService.onNotifyLoaded(false);
  }

  onSended() {
    this.cadastroService.onNotifySended(true);
  }
}
