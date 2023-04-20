import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
  FormArray,
  AbstractControl
} from '@angular/forms';
import { take, switchMap, finalize } from 'rxjs/operators';
import { EMPTY, Observable } from 'rxjs';

// ng-brazil
import { MASKS } from 'ng-brazil';

// Interfaces
import { IFormCanDeactivate } from 'src/app/guards/iform-candeactivate';

// Services
import { ComercialCadastrosTransportadoraService } from '../transportadoras.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { TitleService } from 'src/app/shared/services/core/title.service';
import { EstadosService } from 'src/app/shared/services/requests/estados.service';
import { CidadesService } from 'src/app/shared/services/requests/cidades.service';
import { ConfirmModalService } from 'src/app/shared/modules/confirm-modal/confirm-modal.service';

// Interfaces
import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';

@Component({
  selector: 'comercial-cadastros-transportadora-formulario',
  templateUrl: './formulario.component.html',
  styleUrls: ['./formulario.component.scss']
})
export class ComercialCadastrosTransportadoraFormularioComponent
  implements OnInit, IFormCanDeactivate {
  public MASKS = MASKS;

  loaderFullScreen = true;
  loaderNavbar: boolean;

  appTitle: string;
  breadCrumbTree: Array<Breadcrumb> = [];

  codTransportadora: number;

  form: FormGroup;
  formChanged = false;
  submittingForm: boolean;

  estados: any = [];
  cidades: any = [];
  filteredCidades: any = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private location: Location,
    private formBuilder: FormBuilder,
    private transportadoraService: ComercialCadastrosTransportadoraService,
    private pnotifyService: PNotifyService,
    private atividadesService: AtividadesService,
    private titleService: TitleService,
    private estadosService: EstadosService,
    private cidadesService: CidadesService,
    private confirmModalService: ConfirmModalService
  ) {
    this.pnotifyService.getPNotify();
  }

  ngOnInit(): void {
    this.registrarAcesso();
    this.setBreadCrumb();
    this.getFormFields();
    this.setFormBuilder();
    this.titleService.setTitle('Cadastro de transportadora');
  }

  registrarAcesso(): void {
    this.atividadesService.registrarAcesso().subscribe();
  }

  setBreadCrumb(): void {
    this.activatedRoute.params.subscribe((params: any) => {
      if (params['id']) {
        this.appTitle = 'Editar transportadora';
      } else {
        this.appTitle = 'Nova transportadora';
      }

      this.breadCrumbTree = [
        {
          descricao: 'Home',
          routerLink: '/comercial/home'
        },
        {
          descricao: 'Cadastros',
          routerLink: `/comercial/cadastros/${params['idSubModulo']}`
        },
        {
          descricao: 'Transportadoras',
          routerLink: `/comercial/cadastros/${params['idSubModulo']}/transportadoras/lista`
        },
        {
          descricao: this.appTitle
        }
      ];
    });
  }

  getFormFields(): void {
    this.estados = this.estadosService.getEstados();
    this.cidades = this.cidadesService.getCidades();
    this.loaderFullScreen = false;
  }

  setFormBuilder(): void {
    if (this.activatedRoute.snapshot.data['detalhes']['success'] === true) {
      const detalhes = this.activatedRoute.snapshot.data['detalhes']['data'];
      this.codTransportadora = detalhes['id'];

      this.form = this.formBuilder.group({
        id: [detalhes['id']],
        tipoPessoa: [detalhes['tipoPessoa']],
        cpf: [detalhes['cpf']],
        rg: [detalhes['rg'], [Validators.maxLength(20)]],
        cnpj: [detalhes['cnpj']],
        inscricaoEstadual: [
          detalhes['inscricaoEstadual'],
          [Validators.maxLength(20)]
        ],
        nome: [
          detalhes['nome'],
          [Validators.required, Validators.maxLength(33)]
        ],
        endereco: this.formBuilder.group({
          logradouro: [
            detalhes['endereco']['logradouro'],
            [Validators.required, Validators.maxLength(38)]
          ],
          cidade: [detalhes['endereco']['cidade'], [Validators.required]],
          uf: [detalhes['endereco']['uf'], [Validators.required]]
        }),
        veiculo: this.formBuilder.group({
          placa: [detalhes['veiculo']['placa']],
          uf: [detalhes['veiculo']['uf']]
        }),
        freteConta: [detalhes['freteConta']],
        consideraEntregue: [detalhes['consideraEntregue']],
        recebeCotacaoFrete: [detalhes['recebeCotacaoFrete']],
        autorizaDownloadXml: [detalhes['autorizaDownloadXml']],
        contatos: this.formBuilder.array([])
      });

      this.setFormContatos(detalhes['contatos']);
    } else {
      this.pnotifyService.error();
      this.location.back();
    }
  }

  get contatos(): FormArray {
    return this.form.get('contatos') as FormArray;
  }

  setFormContatos(contatos: any): void {
    if (contatos.length > 0) {
      for (let i = 0; i < contatos.length; i++) {
        this.contatos.push(
          this.formBuilder.group({
            codSequencia: [contatos[i]['codSequencia']],
            nome: [
              contatos[i]['nome'],
              [Validators.required, Validators.maxLength(30)]
            ],
            tipo: [contatos[i]['tipo'], [Validators.required]],
            conteudo: [
              contatos[i]['conteudo'],
              [Validators.required, Validators.maxLength(70)]
            ]
          })
        );
      }
    }
  }

  onAddContato(): void {
    this.contatos.push(
      this.formBuilder.group({
        codSequencia: [null],
        nome: [null, [Validators.required, Validators.maxLength(30)]],
        tipo: ['Telefone', [Validators.required]],
        conteudo: [null, [Validators.required, Validators.maxLength(70)]]
      })
    );
  }

  onChangeTipoContato(index: number): void {
    const contatos = this.form.controls['contatos'] as FormArray;
    contatos.controls[index].get('conteudo').setValue(null);
  }

  showConteudo(index: number, tipo: string): boolean {
    const contatos = this.form.controls['contatos'] as FormArray;
    const tipoContato = contatos.controls[index].get('tipo').value;

    if (
      tipo === 'telefone' &&
      (tipoContato === 'Telefone' ||
        tipoContato === 'Celular' ||
        tipoContato === 'Fax')
    ) {
      contatos.controls[index].get('conteudo').clearValidators();
      contatos.controls[index]
        .get('conteudo')
        .setValidators([Validators.required]);
      contatos.controls[index].get('conteudo').updateValueAndValidity();

      return true;
    }

    if (
      tipo === 'email' &&
      (tipoContato === 'E-mail' || tipoContato === 'E-mail cotação')
    ) {
      contatos.controls[index].get('conteudo').clearValidators();
      contatos.controls[index]
        .get('conteudo')
        .setValidators([Validators.required, Validators.email]);
      contatos.controls[index].get('conteudo').updateValueAndValidity();

      return true;
    }

    return false;
  }

  onDeleteContato(index: number): void {
    const contatos = this.form.controls['contatos'] as FormArray;

    if (contatos.controls[index].get('codSequencia').value == null) {
      this.contatos.removeAt(index);
    } else {
      this.confirmDelete()
        .asObservable()
        .pipe(
          take(1),
          switchMap(result =>
            result
              ? this.deleteContato(
                  contatos.controls[index].get('codSequencia').value
                )
              : EMPTY
          ),
          finalize(() => {
            this.loaderFullScreen = false;
          })
        )
        .subscribe(
          (response: any) => {
            if (
              response.hasOwnProperty('success') &&
              response['success'] === true
            ) {
              this.pnotifyService.success(response['mensagem']);
              this.contatos.removeAt(index);
              this.formChanged = true;
            } else if (
              response.hasOwnProperty('success') &&
              response['success'] === false
            ) {
              this.pnotifyService.error(response['mensagem']);
            } else {
              this.pnotifyService.error();
            }
          },
          (error: any) => {
            this.pnotifyService.error();
          }
        );
    }
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

  deleteContato(id: number): Observable<any> {
    this.loaderFullScreen = true;
    return this.transportadoraService.deleteContato(this.codTransportadora, id);
  }

  setType(type: string): void {
    this.form.controls['tipoPessoa'].setValue(type);
  }

  onFieldError(field: string): string {
    if (this.onFieldInvalid(field)) {
      return 'is-invalid';
    }

    return '';
  }

  onNestedFieldError(formGroup: string, index: number, field: string): string {
    if (this.onNestedFieldInvalid(formGroup, index, field)) {
      return 'is-invalid';
    }

    return '';
  }

  onFieldInvalid(field: any): boolean {
    field = this.form.get(field);

    return field.status == 'INVALID' && field.touched;
  }

  onNestedFieldInvalid(formGroup: string, index: number, field: any): boolean {
    let nestedForm: any = this.form.controls[formGroup];
    field = nestedForm.controls[index].get(field);

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

  onNestedFieldRequired(
    formGroup: string,
    index: number,
    field: string
  ): string {
    let required = false;
    let formControl = new FormControl();
    let nestedForm: any = this.form.controls[formGroup];

    if (nestedForm.controls[index].get(field).validator) {
      let validationResult = nestedForm.controls[index]
        .get(field)
        .validator(formControl);
      required =
        validationResult !== null && validationResult.required === true;
    }

    if (required) {
      return 'is-required';
    }

    return '';
  }

  onChangeCidade(event: any): void {
    let enderecoControls: AbstractControl;
    enderecoControls = this.form.controls['endereco'];
    enderecoControls['controls']['uf'].setValue(event['sigla']);
  }

  onChangeEstado(): void {
    this.filteredCidades = this.cidades.filter(
      (value: any) => value['sigla'] == this.form.value['endereco']['uf']
    );
  }

  onSubmit(): void {
    if (this.form.pristine) {
      this.location.back();
    } else {
      if (this.form.valid) {
        this.loaderNavbar = true;
        this.submittingForm = true;

        this.transportadoraService
          .postTransportadora(this.form.value)
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
                response['success'] === true
              ) {
                this.form.reset();
                this.formChanged = false;
                this.pnotifyService.success(response['mensagem']);

                this.activatedRoute.params.subscribe((params: any) => {
                  let navigateTo: string;

                  if (params.hasOwnProperty('id')) {
                    navigateTo = '../../lista';
                  } else {
                    navigateTo = '../lista';
                  }

                  this.router.navigate([navigateTo], {
                    relativeTo: this.activatedRoute
                  });
                });
              } else if (
                response.hasOwnProperty('success') &&
                response['success'] === false
              ) {
                this.pnotifyService.error(response['mensagem']);
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
  }

  onCancel(): void {
    this.location.back();
  }

  onInput(): void {
    this.formChanged = true;
  }

  formCanDeactivate(): boolean {
    if (this.formChanged) {
      if (confirm('Informações não salvas serão perdidas. Deseja continuar?')) {
        return true;
      } else {
        return false;
      }
    }
    return true;
  }
}
