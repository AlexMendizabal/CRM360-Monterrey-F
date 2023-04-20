
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
  FormArray
} from '@angular/forms';
import { Subscription } from 'rxjs';

import { environment } from 'src/environments/environment';


// Interfaces
import { IFormCanDeactivate } from 'src/app/guards/iform-candeactivate';

// Services
import { AuthService } from 'src/app/shared/services/core/auth.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { ComercialClientesCadastroService } from '../../cadastro.service';
import { ComercialClientesService } from 'src/app/modules/comercial/services/clientes.service';
import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';
import { finalize } from 'rxjs/operators';
import { JsonResponse } from 'src/app/models/json-response';
import { ComercialGestaoContratosComerciaisService } from 'src/app/modules/comercial/gestao/contratos-comerciais/contratos-comerciais.service';
import { ConfirmModalService } from 'src/app/shared/modules/confirm-modal/confirm-modal.service';

@Component({
  selector: 'comercial-clientes-cadastro-anexos-formulario',
  templateUrl: './formulario.component.html',
  styleUrls: ['./formulario.component.scss']
})
export class ComercialClientesCadastroAnexosFormularioComponent
  implements OnInit, OnDestroy, IFormCanDeactivate {
  private API = `https://crm360.monterrey.com.bo/api/comercial/clientes/cadastro/upload/anexo`;
  private user = this.authService.getCurrentUser();

  urlAnexo: Array<any> = [];

  private subscriptionCancel: Subscription;
  private subscriptionSubmit: Subscription;

  // public uploader: FileUploader = new FileUploader({ url: this.API });

  loaderFullScreen: boolean = true;

  codCliente: number;
  tipoCliente: string;

  itemFile: any;
  formData: Array<FormData> = [];
  form: FormGroup;
  formChanged: boolean = false;
  possuiSituacaoCadastral: boolean = false;
  possuiSintegra: boolean = false;
  possuiSerasa: boolean = false;
  possuiImpostos: boolean = false;
  possuiContratoSocial: boolean = false;
  possuiOutros: boolean = false;
  possuiIdentificacao: boolean = false;
  possuiComprovanteEndereco: boolean = false;
    
  tableConfigAnexos: Partial<CustomTableConfig> = {
    fixedHeader: false,
    bodyHeight: 230,
    hover: false,
  };

  showAnexos: boolean = false;
  tiposAnexo: any = [];

  tiposAnexoF: any = [
    {
      id: 2,
      descricao: 'Identificação (CNH ou RG)',
      tipoAnexo: 'Identificacao'
    },
    {
      id: 4,
      descricao: 'Comprovante de endereço',
      tipoAnexo: 'Comprovante'
    }
  ];

  

  tiposAnexoJ: any = [
    {
      id: 1,
      descricao: 'Contrato social',
      tipoAnexo: 'ContratoSocial'
    }
    ,
    {
      id: 2,
      descricao: 'Situação Cadastral',
      tipoAnexo: 'SituacaoCadastral'
    },
    {
      id: 3,
      descricao: 'Sintegra',
      tipoAnexo: 'Sintegra'
    }, 
    {
      id: 4,
      descricao: 'Serasa',
      tipoAnexo: 'Serasa'
    },
    {
      id: 5,
      descricao: 'Impostos',
      tipoAnexo: 'Impostos'
    },
    {
      id: 6,
      descricao: 'Outros',
      tipoAnexo: 'Outros'
    }
  ];
  loaderNavbar: boolean;
  submittingForm: boolean;
  showVisual: boolean;
  visualizar: boolean;

  constructor(
    private confirmModalService: ConfirmModalService,
    private contratosComerciaisService: ComercialGestaoContratosComerciaisService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private cadastroService: ComercialClientesCadastroService,
    private clientesService: ComercialClientesService,
    private pnotifyService: PNotifyService,
    private location: Location
  ) {
    this.pnotifyService.getPNotify();
  }

  ngOnInit() {
    this.activatedRoute.parent.parent.params.subscribe(params => {
      this.clientesService
        .getAnexos(params['id'])
        .subscribe((response: any) => {
          
          this.codCliente = params['id'];
          console.log(response);
          if (response['success'] === true && response['data'].length > 0) {
            this.tipoCliente = response['data'][0]['tipoCliente'];
            this.setFormValidators(response['data']);                     
          } else {
            this.tipoCliente = response['tipoCliente'];
            this.clientesService.getDetalhes(this.codCliente).subscribe((response: any) => {
              
              this.tipoCliente = response['data']['tipoPessoa'];          
              this.setFormValidators(null);                                                                       
            });
          }
        });
    });

    this.cancelSubscription();
    this.submitSubscription();
  }

  ngOnDestroy() {
    this.subscriptionCancel.unsubscribe();
    this.subscriptionSubmit.unsubscribe();
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

  setFormValidators(anexos: any) {

    if (anexos != null) {
      if (this.tipoCliente == 'F') {
        for (let i = 0; i < anexos.length; i++) {
          if (anexos[i]['idTipo'] == 2) {
            this.possuiIdentificacao = true;
          } else if (anexos[i]['idTipo'] == 4) {
            this.possuiComprovanteEndereco = true;
          }
        }

        if (this.possuiIdentificacao && this.possuiComprovanteEndereco) {
          this.handleAnexosUploaded();
        } else {
          for (let i = 0; i < this.tiposAnexoF.length; i++) {
            if (this.possuiIdentificacao && this.tiposAnexoF[i]['id'] == 2) {
              this.tiposAnexoF.splice(i, 1);
            }

            if (
              this.possuiComprovanteEndereco &&
              this.tiposAnexoF[i]['id'] == 4
            ) {
              this.tiposAnexoF.splice(i, 1);
            }
          }

          this.tiposAnexo = this.tiposAnexoF;
          this.setFormBuilder();
        }                    
      } else if (this.tipoCliente == 'J') {                         
        for (let i = 0; i < anexos.length; i++) {

          if (anexos[i]['idTipo'] == 1) {
            this.possuiContratoSocial = true;
          } else if (anexos[i]['idTipo'] == 2){
            this.possuiSituacaoCadastral = true;
          } else if (anexos[i]['idTipo'] == 3){
            this.possuiSintegra = true;
          } else if (anexos[i]['idTipo'] == 4){
            this.possuiSerasa = true;
          } else if (anexos[i]['idTipo'] == 5){
            this.possuiImpostos = true;
          } else if (anexos[i]['idTipo'] == 6){
            this.possuiOutros = true;
          }
        }


        if (this.possuiSituacaoCadastral && 
          this.possuiContratoSocial &&
          this.possuiImpostos &&
          this.possuiSintegra &&
          this.possuiSerasa &&
          this.possuiOutros) {
          this.handleAnexosUploaded();
        } else {
          // for (let i = 0; i < this.tiposAnexoJ.length; i++) {
           
          //   if (
          //     this.possuiContratoSocial &&
          //     this.tiposAnexoJ[i]['id'] == 1
          //   ) {
          //     this.tiposAnexoJ.splice(i, 1);
          //   }

          //   if (
          //     this.possuiSituacaoCadastral &&
          //     this.tiposAnexoJ[i]['id'] == 2
          //   ) {
          //     this.tiposAnexoJ.splice(i, 1);
          //   }

          //   if (
          //     this.possuiSintegra &&
          //     this.tiposAnexoJ[i]['id'] == 3
          //   ) {
          //     this.tiposAnexoJ.splice(i, 1);
          //   }

          //   if (
          //     this.possuiSerasa &&
          //     this.tiposAnexoJ[i]['id'] == 4
          //   ) {
          //     this.tiposAnexoJ.splice(i, 1);
          //   }

          //   if (
          //     this.possuiImpostos &&
          //     this.tiposAnexoJ[i]['id'] == 5
          //   ) {
          //     this.tiposAnexoJ.splice(i, 1);
          //   }

          //   if (
          //     this.possuiOutros &&
          //     this.tiposAnexoJ[i]['id'] == 6
          //   ) {
          //     this.tiposAnexoJ.splice(i, 1);
          //   }
          // }

          this.tiposAnexo = this.tiposAnexoJ;
          this.setFormBuilder();
        }   

        
      }
    } else {
      if (this.tipoCliente == 'F') {
        this.tiposAnexo = this.tiposAnexoF;
      } else if (this.tipoCliente == 'J') {
        this.tiposAnexo = this.tiposAnexoJ;
      }

      this.setFormBuilder();
    }
  }

  handleAnexosUploaded() {

    this.pnotifyService.notice('O cliente já possui os anexos necessários.');

    this.location.back();
  }

  setFormBuilder() {
    this.form = this.formBuilder.group({
      tipoAnexo: ['', [Validators.required]],
      tipoCliente: this.tipoCliente,
      codCliente: this.codCliente, 
      anexos: this.formBuilder.array([])
    });

    this.loaderFullScreen = false;
  }

  formCanDeactivate() {
    if (this.formChanged) {
      if (confirm('Informações não salvas serão perdidas. Deseja continuar?')) {
        return true;
      } else {
        return false;
      }
    }
    return true;
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

  onChange() {
    this.formChanged = true;
  }

  onCancel() {
    this.location.back();
  }

  handleUploadError() {
    this.pnotifyService.error('Erro no upload do anexo. Tente novamente!');
    this.cadastroService.onNotifyLoaded(false);
  }
 
  // Formulário Preenchido para edição ou novo formulário
  
  getAnexos(codCliente: number) {
    this.loaderNavbar = true;
    this.showAnexos = false;
    this.clientesService
      .getAnexos(codCliente)
      .pipe(
        finalize(() => {
          this.loaderNavbar = false;
          this.showAnexos = true;
        })
      )
      .subscribe({
        next: (response: JsonResponse) => {
          if (response.hasOwnProperty('success') && response.success === true) {
            this.setAnexos(response.data);
            this.urlAnexo = response.data;
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

  setAnexos(anexos: any): void {
    if (anexos.length > 0) {
      for (let i = 0; i < anexos.length; i++) {
        this.onAddAnexos(anexos[i], true);
      }
    }
  }

  get anexos(): FormArray {
    return this.form.get('anexos') as FormArray;
  }

  onAddAnexos(anexo: any, manipulateForm?: boolean): void {
    if (this.checkAnexoExists(anexo) === false) {
      this.anexos.push(
        this.formBuilder.group({
          codAnexo: [anexo.codAnexo],
          nomeAnexo: [anexo.nomeAnexo],
          linkAnexo: [anexo.linkAnexo],
          urlAnexo: [anexo.urlAnexo],
        })
      );
      console.log(this.anexos);

      if (manipulateForm) {
        this.form.markAsTouched();
        this.form.markAsDirty();
      }
    }
  }

  checkAnexoExists(anexo: any): boolean {
    return this.form.value.anexos.some((el: any) => {
      return el.codAnexo === anexo.codAnexo || el.nomeAnexo == anexo.nomeAnexo;
    });
  }

  appendFile(files: File): any {
    const reader = new FileReader();
    reader.readAsDataURL(files[0]);
    reader.onload = () => {
        const fd = new FormData();
        fd.append('file', files[0]);
        this.formData.push(fd);    
        this.anexos.push(      
          this.formBuilder.group({
            nomeAnexo: [files[0]['name']],
            linkAnexo: [reader.result]
          })
        );        
        console.log(this.anexos);
        
        if (this.showAnexos === false) {
          this.showAnexos = true;
        }
    };      
  }

  onPostAnexos(data: any): void {
    

    /* const id = this.form.value.codMaterial; */
    this.formData.forEach((item) => {
        data = data;
       this.clientesService       
        .uploadAnexo(data)
        .pipe(
          finalize(() => {
            this.cadastroService.onNotifyLoaded(false);
          })
        )
        .subscribe({
        next: (response: JsonResponse) => {
          if (response.hasOwnProperty('success')) {          
          this.pnotifyService.success();
          this.location.back();
          }
        },
       error: (error: any) => {
          if (error['error'].hasOwnProperty('mensagem')) {
            this.pnotifyService.error(error.error.mensagem);
          } else {
            this.pnotifyService.error();
          }
      }});
    });
  }

  onDeleteAnexo(codAnexo: number, index: number): void {
    this.confirmDelete().subscribe((r: boolean) => {
      if (codAnexo) {
        this.loaderNavbar = true;
        this.clientesService
          .deleteAnexo(codAnexo)
          .pipe(
            finalize(() => {
              this.loaderNavbar = false;
            })
          )
          .subscribe({
            next: (response: JsonResponse) => {
              if (
                response.hasOwnProperty('success') &&
                response.success === true
              ) {
                r ? this.deleteDocumento(index) : null;
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
            error: (error: any) => {
              if (error['error'].hasOwnProperty('mensagem')) {
                this.pnotifyService.error(error.error.mensagem);
              } else {
                this.pnotifyService.error();
              }
            }
          });
      } else {
        r ? this.deleteDocumento(index) : null;
        this.formData.splice(index, 1);
      }
    });
  }

  deleteDocumento(index: number): void {
    this.anexos.removeAt(index);
    this.form.markAsTouched();
    this.form.markAsDirty();
  }

  onSubmit() {
    if (this.form.valid && this.formData.length > 0) {
      this.cadastroService.onNotifyLoaded(true);

      let tipoAnexo: string;

      for (let i = 0; i < this.tiposAnexo.length; i++) {
        if (this.tiposAnexo[i]['id'] == this.form.value['tipoAnexo']) {
          tipoAnexo = this.tiposAnexo[i]['tipoAnexo'];
        }
      }
      
      this.onPostAnexos(this.form.value);

    } else {
      this.pnotifyService.notice('Há campos faltando.');
    }
  }


  
  navegarAnexo(anexo) {
    this.router
      .navigate([], {
        relativeTo: this.activatedRoute,
      })
      .then((result) => {
        window.open(`${anexo.value.urlAnexo}`, '_blank');
      });
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



}
