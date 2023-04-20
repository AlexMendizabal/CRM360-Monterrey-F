import { IComercialAknaContatos } from './../../contatos/models/contatos';
import { IComercialAknaMensagens } from './../../mensagens/models/mensagens';
import { ComercialAknaMensagensService } from './../../mensagens/mensagens.service';
import { TitleService } from './../../../../../shared/services/core/title.service';
import { ComercialAknaAcoesService } from './../acoes.service';
import { IAcoes } from './../models/acoes';
import { DetailPanelService } from './../../../../../shared/templates/detail-panel/detal-panel.service';
import { utilsBr } from 'js-brasil';
import { ConfirmModalService } from 'src/app/shared/modules/confirm-modal/confirm-modal.service';
//Services
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
//Bootstrap
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
//Angular
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
} from '@angular/forms';
//interfaces
//rxjs
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { HttpResponse } from '@angular/common/http';

@Component({
  selector: 'comercial-akna-acoes-formulario',
  templateUrl: './formulario.component.html',
  styleUrls: ['./formulario.component.scss'],
})
export class ComercialAknaAcoesFormularioComponent implements OnInit {
  noResult: boolean;
  $activatedRouteSubscription: Subscription;
  breadCrumbTree: Array<any> = [];
  form: FormGroup;
  appTitle: string;
  modalRef: BsModalRef;
  formData: Array<FormData> = [];
  bsConfig: Partial<BsDatepickerConfig>;

  //loading
  loading = false;
  // loadingMoeda: boolean;
  loadingNavBar = false;
  loadingMensagens = false;
  loadingContatos = false;

  //Interfaces
  acoes: IAcoes[] = [];
  mensagens: IComercialAknaMensagens[] = [];
  contatos: IComercialAknaContatos[] = [];
  // tipoMoeda = [];

  constructor(
    private formBuilder: FormBuilder,
    private pnotify: PNotifyService,
    private activatedRoute: ActivatedRoute,
    private acoesService: ComercialAknaAcoesService,
    private titleService: TitleService,
    private atividadesService: AtividadesService,
    private mensagemService: ComercialAknaMensagensService,
    private router: Router
  ) {}
  public MASKS = utilsBr.MASKS;

  ngOnInit(): void {
    this.registrarAcesso();
    this.setBreadCrumb();
    this.setFormBuilder();
    this.getMensagens();
    this.onActivatedRoute();
  }

  registrarAcesso(): void {
    this.atividadesService.registrarAcesso().subscribe();
  }

  onActivatedRoute() {
    const _params = this.activatedRoute.snapshot.params;
    if (!_params.hasOwnProperty('id')) return;
  }

  setBreadCrumb(): void {
    const id = this.activatedRoute.snapshot.params.idSubModulo;
    this.appTitle = 'Cadastro';
    this.titleService.setTitle(this.appTitle);
    this.breadCrumbTree = [
      {
        descricao: 'Home',
        routerLink: '/comercial/home',
      },
      {
        descricao: 'Akna',
        routerLink: `/comercial/akna/${id}`,
      },
      {
        descricao: 'Ações',
        routerLink: `../`,
      },
      {
        descricao: this.appTitle,
      },
    ];
  }

  //formulario
  setFormBuilder(): void {
    this.form = this.formBuilder.group({
      TITULO: [null, [Validators.required]],
      CONTATO: [null, [Validators.required]],
      DS_OBSE: [null],
    });
  }

  postAcoes() {
    this.loadingNavBar = true;
    this.acoesService
      .postAcoes(this.form.value)
      .pipe(
        finalize(() => {
          this.loadingNavBar = false;
        })
      )
      .subscribe({
        next: (response: any) => {
          if (response.status === 200) {
            this.form.reset();
            this.pnotify.success();
            this.router.navigate(['../'], {
              relativeTo: this.activatedRoute,
            });
          } else {
            this.pnotify.error();
          }
        },
        error: (error: any) => {
          this.pnotify.error();
        }
      });
  }

  getMensagens(params?) {
    this.loading = true;
    this.mensagemService
      .getMensagens(params)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.loadingNavBar = false;
        })
      )
      .subscribe({
        next: (response: HttpResponse<IComercialAknaMensagens[]>) => {
          if (response.status === 200) {
            this.mensagens = response.body;
            this.loading = false;
          } else {
            this.noResult = true;
            this.mensagens = [];
            this.router.navigate['../'];
          }
        },
        error: (error) => {
          this.pnotify.error();
          this.noResult = true;
        }
      });
  }

  // Validação de formulário
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
}
