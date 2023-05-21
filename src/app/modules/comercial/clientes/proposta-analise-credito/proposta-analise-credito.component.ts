import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
  FormArray
} from '@angular/forms';
import { Location } from '@angular/common';

// ngx-bootstrap
import { BsLocaleService, BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { ptBrLocale } from 'ngx-bootstrap/locale';
defineLocale('pt-br', ptBrLocale);

// ng-brazil
import { utilsBr } from 'js-brasil';

// Interfaces
import { IFormCanDeactivate } from 'src/app/guards/iform-candeactivate';
import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';

// Services
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { PdfService } from 'src/app/shared/services/core/pdf.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { TitleService } from 'src/app/shared/services/core/title.service';

@Component({
  selector: 'comercia-clientes-proposta-analise-credito',
  templateUrl: './proposta-analise-credito.component.html',
  styleUrls: ['./proposta-analise-credito.component.scss']
})
export class ComercialClientesPropostaAnaliseCreditoComponent
  implements OnInit, IFormCanDeactivate {
  public MASKS = utilsBr.MASKS;

  loaderNavbar: boolean = false;

  breadCrumbTree: Array<Breadcrumb> = [];

  codCliente: number;

  tipoVisao: string = 'formulario';
  dataFicha: any = [];

  form: FormGroup;
  formChanged: boolean = false;

  bsConfig: Partial<BsDatepickerConfig>;

  constructor(
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private localeService: BsLocaleService,
    private pnotifyService: PNotifyService,
    private pdfService: PdfService,
    private location: Location,
    private atividadesService: AtividadesService,
    private titleService: TitleService
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

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      this.codCliente = params['id'];

      this.registrarAcesso();
      this.setBreadCrumb(this.codCliente);
      this.titleService.setTitle('Proposta para análise de crédito');

      if (this.activatedRoute.snapshot.data['data']['responseCode'] === 200) {
        this.setFormBuilder(
          this.activatedRoute.snapshot.data['data']['result']
        );
      } else {
        this.pnotifyService.error();
        this.location.back();
      }
    });
  }

  registrarAcesso() {
    this.atividadesService.registrarAcesso().subscribe();
  }

  setBreadCrumb(id: number) {
    this.breadCrumbTree = [
      {
        descricao: 'Home',
        routerLink: '/comercial/home'
      },
      {
        descricao: 'Busqueda de clientes',
        routerLink: '/comercial/clientes/lista'
      },
      {
        descricao: 'Detalhes',
        routerLink: `/comercial/clientes/detalhes/${id}`
      },
      {
        descricao: 'Proposta para análise de crédito'
      }
    ];
  }

  setFormBuilder(data: any) {
    this.form = this.formBuilder.group({
      razaoSocial: [
        { value: data['razaoSocial'], disabled: true },
        [Validators.required]
      ],
      dataSolicitacao: [new Date(), [Validators.required]],
      codCliente: [
        { value: data['codCliente'], disabled: true },
        [Validators.required]
      ],
      codClienteDBA: [{ value: data['codClienteDBA'], disabled: true }],
      setorAtividade: [
        { value: data['setorAtividade'], disabled: true },
        [Validators.required]
      ],
      dataUltimaVisita: [null],
      instalacoes: [null],
      numFuncionarios: [null],
      limiteCreditoAtual: [data['limiteCredito']],
      limiteCreditoSolicitado: [null, [Validators.required]],
      condicaoPagto: [null, [Validators.required]],
      nomeVendedor: [
        { value: data['nomeVendedor'], disabled: true },
        [Validators.required]
      ],
      telefoneVendedor: [
        { value: data['telefoneVendedor'], disabled: true },
        [Validators.required]
      ],
      gestorVendas: [null, [Validators.required]],
      nomeEscritorio: [
        { value: data['nomeEscritorio'], disabled: true },
        [Validators.required]
      ],
      fornecedores: this.formBuilder.array([]),
      clientes: this.formBuilder.array([]),
      vendasConcentradas: [null],
      bancos: this.formBuilder.array([]),
      previsaoCompraTon: [null],
      previsaoCompraValor: [null],
      faturamentoMedio: [null],
      parecerVendedor: [null, [Validators.required]]
    });

    this.setFormFornecedoresClientesBancos();
  }

  setFormFornecedoresClientesBancos() {
    this.onAddFornecedor();
    this.onAddBanco();
  }

  get fornecedores() {
    return this.form.get('fornecedores') as FormArray;
  }

  get clientes() {
    return this.form.get('clientes') as FormArray;
  }

  get bancos() {
    return this.form.get('bancos') as FormArray;
  }

  onAddFornecedor() {
    this.fornecedores.push(
      this.formBuilder.group({
        nome: [null, [Validators.required]],
        telefone: [null]
      })
    );
  }

  onAddCliente() {
    this.clientes.push(
      this.formBuilder.group({
        nome: [null]
      })
    );
  }

  onAddBanco() {
    this.bancos.push(
      this.formBuilder.group({
        nome: [null, [Validators.required]],
        agencia: [null, [Validators.required]],
        contaCorrente: [null, [Validators.required]],
        telefone: [null, [Validators.required]]
      })
    );
  }

  onDeleteFornecedor(index: number) {
    if (this.fornecedores.length > 1) {
      this.fornecedores.removeAt(index);
    } else {
      this.pnotifyService.notice('Informe ao menos um fornecedor.');
    }
  }

  onDeleteCliente(index: number) {
    this.clientes.removeAt(index);
  }

  onDeleteBanco(index: number) {
    if (this.bancos.length > 1) {
      this.bancos.removeAt(index);
    } else {
      this.pnotifyService.notice('Informe ao menos um banco.');
    }
  }

  onFieldError(field: string) {
    if (this.onFieldInvalid(field)) {
      return 'is-invalid';
    }

    return '';
  }

  onNestedFieldError(formGroup: string, index: number, field: string) {
    if (this.onNestedFieldInvalid(formGroup, index, field)) {
      return 'is-invalid';
    }

    return '';
  }

  onFieldInvalid(field: any) {
    field = this.form.get(field);

    return field.status == 'INVALID' && field.touched;
  }

  onNestedFieldInvalid(formGroup: string, index: number, field: any) {
    let nestedForm: any = this.form.controls[formGroup];
    field = nestedForm.controls[index].get(field);

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

  onNestedFieldRequired(formGroup: string, index: number, field: string) {
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
  }

  onInput() {
    this.formChanged = true;
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

  onSubmit() {
    if (this.form.valid) {
      this.loaderNavbar = true;
      setTimeout(() => {
        const formData = this.form.getRawValue();

        let dataSolicitacao = `${(formData[
          'dataSolicitacao'
        ] as Date).getDate()}/${(formData[
          'dataSolicitacao'
        ] as Date).getMonth() + 1}/${(formData[
          'dataSolicitacao'
        ] as Date).getFullYear()}`;

        let dataUltimaVisita: string;
        if (formData['dataUltimaVisita'] != null) {
          dataUltimaVisita = `${(formData[
            'dataUltimaVisita'
          ] as Date).getDate()}/${(formData[
            'dataUltimaVisita'
          ] as Date).getMonth() + 1}/${(formData[
            'dataUltimaVisita'
          ] as Date).getFullYear()}`;
        }

        this.tipoVisao = 'ficha';
        this.dataFicha = {
          razaoSocial: formData['razaoSocial'],
          dataSolicitacao: dataSolicitacao,
          codCliente: formData['codCliente'],
          codClienteDBA: formData['codClienteDBA'],
          setorAtividade: formData['setorAtividade'],
          dataUltimaVisita: dataUltimaVisita,
          instalacoes: formData['instalacoes'],
          numFuncionarios: formData['numFuncionarios'],
          limiteCreditoAtual: formData['limiteCreditoAtual'],
          limiteCreditoSolicitado: formData['limiteCreditoSolicitado'],
          condicaoPagto: formData['condicaoPagto'],
          nomeVendedor: formData['nomeVendedor'],
          telefoneVendedor: formData['telefoneVendedor'],
          gestorVendas: formData['gestorVendas'],
          nomeEscritorio: formData['nomeEscritorio'],
          fornecedores: formData['fornecedores'],
          clientes: formData['clientes'],
          bancos: formData['bancos'],
          vendasConcentradas: formData['vendasConcentradas'],
          previsaoCompraTon: formData['previsaoCompraTon'],
          previsaoCompraValor: formData['previsaoCompraValor'],
          faturamentoMedio: formData['faturamentoMedio'],
          parecerVendedor: formData['parecerVendedor']
        };

        this.formChanged = false;
        this.loaderNavbar = false;
      }, 1000);
    }
  }

  onCancel() {
    this.loaderNavbar = true;
    setTimeout(() => {
      this.tipoVisao = 'formulario';
      this.loaderNavbar = false;
    }, 1000);
  }

  onDownload() {
    this.loaderNavbar = true;
    this.pdfService.download(
      'impressao-ficha-pac',
      `${this.codCliente}_PropostaAnaliseCredito`
    );

    setTimeout(() => {
      this.loaderNavbar = false;
    }, 500);
  }
}
