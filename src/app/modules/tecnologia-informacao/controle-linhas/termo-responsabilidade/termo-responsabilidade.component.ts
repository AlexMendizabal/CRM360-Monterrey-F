import { DateService } from './../../../../shared/services/core/date.service';
import { PNotifyService } from './../../../../shared/services/core/pnotify.service';
import { TecnologiaInformacaoControleLinhaService } from './../controle-linhas.service';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormArray,
  FormControl
} from '@angular/forms';
import { Location } from '@angular/common';
import { PdfService } from './../../../../shared/services/core/pdf.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MASKS } from 'ng-brazil';

// Interfaces
import { ControleLinha } from '../models/controle-linha';

@Component({
  selector: 'termo-responsabilidade',
  templateUrl: './termo-responsabilidade.component.html',
  styleUrls: ['./termo-responsabilidade.component.scss']
})
export class TecnologiaInformacaoControleLinhaTermoResponsabilidadeComponent
  implements OnInit {
  constructor(
    private pdfService: PdfService,
    private activatedRoute: ActivatedRoute,
    private location: Location,
    private router: Router,
    private pnotifyService: PNotifyService,
    private formBuilder: FormBuilder,
    private dateService: DateService,
    private controleLinhasService: TecnologiaInformacaoControleLinhaService
  ) {}

  public MASKS = MASKS;

  loaderNavbar: boolean = false;
  tipoVisao: string = 'formulario';
  breadCrumbTree: Array<any> = [];
  appTitle: string;
  bairroEmpresa: Array<ControleLinha> = [];
  form: FormGroup;
  nomeUsuario: string;
  dataFicha: any = [];
  formChanged: boolean = false;
  loaderFullScreen = true;

  ngOnInit(): void {
    this.setBreadCrumb();
    this.setFormBuilder();
    this.getTermos();
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

  setBreadCrumb() {
    this.breadCrumbTree = [
      {
        descricao: 'Home',
        routerLink: '/tecnologia-informacao/home'
      },
      {
        descricao: 'Controle de Linhas',
        routerLink: `/tecnologia-informacao/controle-linhas/lista`
      },
      {
        descricao: 'Termo de Responsabilidade'
      }
    ];
  }

  get objetos() {
    return this.form.get('objetos') as FormArray;
  }

  onAddObjeto() {
    this.objetos.push(
      this.formBuilder.group({
        descricaoObj: [null, [Validators.required]],
        quantidadeObj: [null, [Validators.required]],
        valorObj: [null, [Validators.required]]
      })
    );
  }

  onDeleteObjeto(index: number) {
    if (this.objetos.length > 1) {
      this.objetos.removeAt(index);
    } else {
      this.pnotifyService.notice('Informe ao menos um Objeto.');
    }
  }

  setFormBuilder(): void {
    if (this.activatedRoute.snapshot.data.detalhes.success === true) {
      const detalhes: ControleLinha = this.activatedRoute.snapshot.data.detalhes
        .data;

      this.form = this.formBuilder.group({
        codLinha: [
          { value: detalhes['codLinha'], disabled: true },
          [Validators.required]
        ],
        cnpjEmpresa: [
          { value: detalhes['cnpjEmpresa'], disabled: true },
          [Validators.required]
        ],
        endEmpresa: [
          { value: detalhes['endEmpresa'], disabled: true },
          [Validators.required]
        ],
        bairroEmpresa: [
          { value: detalhes['bairroEmpresa'], disabled: true },
          [Validators.required]
        ],
        cidEmpresa: [
          { value: detalhes['cidEmpresa'], disabled: true },
          [Validators.required]
        ],
        estEmpresa: [
          { value: detalhes['estEmpresa'], disabled: true },
          [Validators.required]
        ],
        nomeEmpresa: [
          { value: detalhes['nomeEmpresa'], disabled: true },
          [Validators.required]
        ],
        codEmpresa: [
          { value: detalhes['codEmpresa'], disabled: true },
          [Validators.required]
        ],
        nomeUsuario: [
          { value: detalhes['nomeUsuario'], disabled: true },
          [Validators.required]
        ],
        rgUsuario: [
          { value: detalhes['rgUsuario'], disabled: true },
          [Validators.required]
        ],
        cpfUsuario: [
          { value: detalhes['cpfUsuario'], disabled: true },
          [Validators.required]
        ],
        endUsuario: [
          { value: detalhes['endUsuario'], disabled: true },
          [Validators.required]
        ],
        bairroUsuario: [
          { value: detalhes['bairroUsuario'], disabled: true },
          [Validators.required]
        ],
        cidUsuario: [
          { value: detalhes['cidUsuario'], disabled: true },
          [Validators.required]
        ],
        estUsuario: [
          { value: detalhes['estUsuario'], disabled: true },
          [Validators.required]
        ],

        objetos: this.formBuilder.array([])
      });
    } else {
      this.pnotifyService.error();
      this.location.back();
    }

    this.setFormObjetos();
  }
  setFormObjetos() {
    this.onAddObjeto();
  }

  onSubmit() {
    let dataHoje = new Date();
    let dataHojeC = this.dateService.getFullDate(dataHoje, null, false);

    if (this.form.valid) {
      this.loaderNavbar = true;
      setTimeout(() => {
        const formData = this.form.getRawValue();

        this.tipoVisao = 'ficha';
        this.dataFicha = {
          nomeEmpresa: formData['nomeEmpresa'],
          cnpjEmpresa: formData['cnpjEmpresa'],
          endEmpresa: formData['endEmpresa'],
          bairroEmpresa: formData['bairroEmpresa'],
          cidEmpresa: formData['cidEmpresa'],
          estEmpresa: formData['estEmpresa'],
          nomeUsuario: formData['nomeUsuario'],
          cpfUsuario: formData['cpfUsuario'],
          rgUsuario: formData['rgUsuario'],
          endUsuario: formData['endUsuario'],
          bairroUsuario: formData['bairroUsuario'],
          cidUsuario: formData['cidUsuario'],
          estUsuario: formData['estUsuario'],
          objetos: formData['objetos'],
          dataHoje: [dataHojeC]
        };

        this.formChanged = false;
        this.loaderNavbar = false;
      }, 1000);
    }
  }

  onDownload() {
    this.loaderNavbar = true;
    this.pdfService.download(
      'termo-responsabilidade',
      `termo-responsabilidade`
    );

    setTimeout(() => {
      this.loaderNavbar = false;
    }, 500);
  }

  onCancel() {
    this.loaderNavbar = true;
    setTimeout(() => {
      this.tipoVisao = 'formulario';
      this.loaderNavbar = false;
    }, 1000);
  }

  onNestedFieldError(formGroup: string, index: number, field: string) {
    if (this.onNestedFieldInvalid(formGroup, index, field)) {
      return 'is-invalid';
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

  onNestedFieldInvalid(formGroup: string, index: number, field: any) {
    let nestedForm: any = this.form.controls[formGroup];
    field = nestedForm.controls[index].get(field);

    return field.status == 'INVALID' && field.touched;
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

  getTermos() {
    this.activatedRoute.params.subscribe(response => {
      const matricula = response['id'];
      this.controleLinhasService.getTermos(matricula).subscribe(
        (response: any) => {
          this.form.patchValue(response['data']);
        },
        (error: any) => {
          if (error.error.hasOwnProperty('mensagem')) {
            this.pnotifyService.error(error.error.mensagem);
          } else {
            this.pnotifyService.error();
          }
        }
      );
    });
  }
}
