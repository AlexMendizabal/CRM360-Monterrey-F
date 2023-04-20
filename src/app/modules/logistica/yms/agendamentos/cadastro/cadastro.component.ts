import { PdfService } from 'src/app/shared/services/core/pdf.service';
import { ILogisticaYmsTiposCircuito } from './../../tipos-circuito/models/tipos-circuito';
import { LogisticaYmsTiposCircuitoService } from './../../tipos-circuito/services/tipos-circuito.service';
import { ILogisticaFiliais } from './../../../cadastros/filiais/models/filiais';
import { LogisticaFiliaisService } from './../../../cadastros/filiais/services/filiais.service';
import { LogisticaTipoVeiculoService } from './../../../cadastros/tipo-veiculo/services/tipo-veiculo.service';
import { ILogisticaTipoVeiculo } from './../../../cadastros/tipo-veiculo/models/tipo-veiculo';
import { BsModalService } from 'ngx-bootstrap/modal';
import { LogisticaVeiculoService } from './../../../cadastros/veiculos/services/veiculo.service';
import { ILogisticaVeiculo } from './../../../cadastros/veiculos/models/veiculo';
import { LogisticaYmsCircuitosService } from './../../circuitos/services/circuitos.service';
//Services
import { TitleService } from 'src/app/shared/services/core/title.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
//Bootstrap
import { utilsBr } from 'js-brasil';
import { BsDatepickerConfig, BsModalRef, BsLocaleService } from 'ngx-bootstrap';
//Angular
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, TemplateRef } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
  FormArray,
} from '@angular/forms';
//rxjs
import { Subscription, forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { LogisticaYmsAgendamentosService } from '../services/agendamentos.service';
//interfaces
import { ILogisticaYmsAgendamentos } from '../models/agendamentos';
import { isNull } from 'util';
import { ILogisticaYmsCircuitos } from '../../circuitos/models/circuitos';

@Component({
  selector: 'logistica-yms-agendamentos-cadastro',
  templateUrl: './cadastro.component.html',
  styleUrls: ['./cadastro.component.scss'],
})
export class LogisticaYmsAgendamentosCadastroComponent
  implements OnInit {
  noResult: boolean;
  noCircuito:boolean = true;
  sobrepor = false;
  $activatedRouteSubscription: Subscription;
  breadCrumbTree: Array<any> = [];
  form: FormGroup;
  appTitle: string;
  index:number;
  modalRef: BsModalRef;
  formData: Array<FormData> = [];
  bsConfig: Partial<BsDatepickerConfig>;
  veiculos: Array<ILogisticaVeiculo>;
  tipoVeiculo: Array<ILogisticaTipoVeiculo>;
  tiposCircuito: Array<ILogisticaYmsTiposCircuito>;
  filiais: Array<ILogisticaFiliais>;
  //loading
  noVeiculos = true;
  loading = false;
  loadingNavBar = false;
  loadingCalculo:boolean = false;
  loadingMateriais:boolean = false;
  loadingTipoVeiculo:boolean;
  loadingTiposCircuito:boolean;
  loadingFiliais: boolean;

  circuitos= [
    {
      id:1,
      descricao: 'Portaria',
      icone:'fas fa-portrait',
      check: 1
    },
    {
      id:2,
      descricao: 'Balança',
      icone:'fas fa-balance-scale-left',
      check: 0

    },
    {
      id:3,
      descricao: 'Estacionamento',
      icone:'fas fa-sign',
      check: 0
    },
    {
      id:4,
      descricao: 'Galpão 2',
      icone:'fas fa-warehouse',
      check: 0

    },
    {
      id:5,
      descricao: 'Galpão 27',
      icone:'fas fa-warehouse',
      check: 0
    },    {
      id:6,
      descricao: 'Balança',
      icone:'fas fa-balance-scale-left',
      check: 0

    },
    {
      id:7,
      descricao: 'Finalizado',
      icone:'fas fa-check',
      check: 0
    }
  ]
  /* Pagination */
  itemsPerPage = 10;
  totalItems = 10;
  totalItemsMaterial = 10;
  currentPage = 1;
  begin = 0;
  end = 10;
  /* Pagination */

  constructor(
    private formBuilder: FormBuilder,
    private pnotify: PNotifyService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private localeService: BsLocaleService,
    private agendamentosService: LogisticaYmsAgendamentosService,
    private titleService: TitleService,
    private pdfService: PdfService,
    private modalService: BsModalService,
    private atividadesService: AtividadesService,
    private veiculoService: LogisticaVeiculoService,
    private tipoVeiculoService: LogisticaTipoVeiculoService,
    private filiaisService: LogisticaFiliaisService,
    private tiposCircuitoService: LogisticaYmsTiposCircuitoService
  ) {
    this.localeService.use('pt-br');
    this.bsConfig = Object.assign(
      {},
      { containerClass: 'theme-dark-blue' },
      { adaptivePosition: true },
      { showWeekNumbers: false }
    );
  }
  public MASKS = utilsBr.MASKS;

  ngOnInit(): void {
    this.registrarAcesso();
    this.setBreadCrumb();
    this.setFormBuilder();
    this.onActivatedRoute();
    this.getTipoVeiculo();
    this.getFiliais();
    this.getTiposCircuito();
  }

  registrarAcesso(): void {
    this.atividadesService.registrarAcesso().subscribe();
  }

  onActivatedRoute() {
    const _params = this.activatedRoute.snapshot.params;
    if (_params.hasOwnProperty('id')){
      this.getAgendamento(_params['id']); 
    } else{
      this.onAddMaterial();
    }
  }

  
  getLinkAddTipoVeiculo(): string {    
    return `/logistica/cadastros/veiculos/${this.form.value.ID_LOGI_VEIC}`;
  }

  onReloadTipoVeiculo(): void {
    if (this.loadingTipoVeiculo === false) {
      this.getTipoVeiculo(this.form.value.ID_LOGI_VEIC);
    }
  }

  onSobrepor(){
    this.sobrepor == true ? false : true;
  }


  onVeiculo(veiculo){
    this.form.patchValue(veiculo);
    this.form.controls.NM_TRAN.reset()
    this.form.controls.NM_TRAN.updateValueAndValidity()
    this.form.controls.NM_MOTO.reset()
    this.form.controls.NM_MOTO.updateValueAndValidity()

    if(!veiculo.ID_LOGI_VEIC_TIPO){
      this.pnotify.notice('Esse Veículo não possui um tipo cadastrado!')
    }

    if(!veiculo.ID_LOGI_TRAN){
      this.form.controls.NM_TRAN.enable()
      this.form.controls.NM_TRAN.markAsTouched()
    }

    if(!veiculo.ID_LOGI_MOTO){
      this.form.controls.NM_MOTO.enable()
      this.form.controls.NM_MOTO.markAsTouched()
    }
  }

  onTransportadora(transportadora){
    this.form.patchValue(transportadora);
  }

  onMotorista(motorista){
    this.form.patchValue(motorista);
  }

  onMaterial(material){
    const fg = this.form.get('materiais') as FormArray;
    // fg.controls[this.index].patchValue(material);
    fg.controls[this.index].get('NM_MATE').patchValue(material.NM_MATE);
    fg.controls[this.index].get('UUID_MATE').patchValue(material.ID);
    fg.controls[this.index].get('ID_MATE').patchValue(material.ID_MATE);
  }

  openModal(template: TemplateRef<any>, index?) {
    this.index = index;
    this.modalRef = this.modalService.show(template, {
      animated: false,
      class: 'modal-xl',
    });
  }

  hideModal() {
    this.modalRef.hide();
  }

  onSearchTime(){
    const newData = new Date();

    if(this.form.valid == false){
      this.pnotify.notice('Preencha o formulário');
      return;
    }

    if(this.form.get('DT_INIC_PREV').value < newData){
      this.pnotify.notice('Favor inserir uma data maior que a data atual');
      this.form.controls.DT_INIC_PREV.markAsTouched();
      return;
    }

    if(this.formMateriais.valid ==false){
      this.pnotify.notice('Informe os dados dos materiais');
      return;
    }


    //Fazer a consulta dos horários disponiveis //

  }

  onDownload(params?) {
    this.pnotify.notice('Documento PDF será gerado em breve!')
    const _id = params['ID_LOGI_YMS_AGEN'];
    this.pdfService.download('agendamento-pdf', `Agendamento - ${_id}`);
  }

  onPrint(){
    
    window.print();
  }
  

  getAgendamento(id: number) {
    this.loading = true;
    this.agendamentosService
      .getAgendamento(id)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.loadingNavBar = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            const data : ILogisticaYmsAgendamentos = response.body['data'][0]
            this.form.patchValue(data) 
            this.noResult = false;
          } else {
            this.noResult = true;
          }
        },
        (error) => {
          this.pnotify.error();
          this.noResult = true;
        }
      );
  }

  getFiliais() {
    this.loadingFiliais = true;
    this.filiaisService
      .getFiliais({ IN_STAT: '1', IN_PAGI: '0' })
      .pipe(
        finalize(() => {
          this.loadingFiliais = false;
        })
      )
      .subscribe((response) => {
        if (response.status === 200) {
          this.filiais = response.body['data'];
        }else{
          this.pnotify.notice('Nenhum registro encontrado!')
        }
      }),
      (error) => {
        this.filiais = [];
        const message = error.error.message
        message ? this.pnotify.error(message): this.pnotify.error();
      };
  }

  getTiposCircuito() {
    this.loadingTiposCircuito = true;
    this.tiposCircuitoService
      .getTiposCircuito({ IN_STAT: '1', IN_PAGI: '0' })
      .pipe(
        finalize(() => {
          this.loadingTiposCircuito = false;
        })
      )
      .subscribe((response) => {
        if (response.status === 200) {
          this.tiposCircuito = response.body['data'];
        }else{
          this.pnotify.notice('Nenhum registro encontrado!')
        }
      }),
      (error: any) => {
        this.tiposCircuito= [];
        const message = error.error.message
        message ? this.pnotify.error(message): this.pnotify.error();
      }
  }


  setBreadCrumb(): void {
    const id = this.activatedRoute.snapshot.params.idSubModulo;
    this.appTitle = 'Cadastro';
    this.titleService.setTitle(this.appTitle);
    this.breadCrumbTree = [
      {
        descricao: 'Home',
        routerLink: '/logistica/home',
      },
      {
        descricao: 'YMS',
        routerLink: `/logistica/yms/${id}`,
      },
      {
        descricao: 'Agendamentos',
        routerLink: `../`,
      },
      {
        descricao: this.appTitle,
      },
    ];
  }

  getTipoVeiculo(params?) {
    this.loadingTipoVeiculo = true;
    this.tipoVeiculoService
      .getTipoVeiculos({...params, IN_STAT: '1' })
      .pipe(
        finalize(() => {
          this.loadingTipoVeiculo = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            this.tipoVeiculo = response.body['data'];
          } else {
            this.tipoVeiculo = []
          }
        },
        (error: any) => {
          const message = error.error.message
          message ? this.pnotify.error(message): this.pnotify.error();
        }
      );
  }


  //formulario
  setFormBuilder(): void {

    this.form = this.formBuilder.group({
      ID_LOGI_YMS_AGEN: [null],
      ID_LOGI_YMS_ETAP: [null],
      PLAC:[{value:null, disabled:true }, [Validators.required]],
      ID_LOGI_VEIC_TIPO: [null],
      ID_LOGI_VEIC:[null],
      NM_MOTO:[{value:null, disabled:true }, [Validators.required]],
      NM_TRAN:[{value:null, disabled:true }, [Validators.required]],
      NM_VEIC_TIPO:[{value:null, disabled:true }, [Validators.required]],
      DS_AGEN: [null, [Validators.required]],
      IN_STAT: [isNull],
      DT_INIC_PREV: [null, [Validators.required]],
      DS_OBSE: [null],
      ID_LOGI_FILI: [null, [Validators.required]],
      ID_LOGI_YMS_CIRC_TIPO: [null, [Validators.required]],
      materiais: this.formBuilder.array([]),
    });
  }

  get formMateriais() {
    return this.form.get('materiais') as FormArray;
  }

  onAddMaterial(index?:number) {
    this.formMateriais.push(
      this.formBuilder.group({
        UUID_MATE:[null],
        NR_NOTA_FISC:[null, [Validators.required]],
        NR_PEDI:[null,[Validators.required]],
        ID_LOGI_ENMA_NOFI_MATE:[null],
        DS_UNID_MEDI: ['TON', [Validators.required]],
        TT_MATE: [null, [Validators.required, Validators.min(0.01)]],
        NM_MATE: [{value: null , disabled: true}, [Validators.required]],
      })
    );
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

  postAgendamentos() {
    this.loadingNavBar = true;
    this.agendamentosService
      .postAgendamentos(this.form.value)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.loadingNavBar = false;
        })
      )
      .subscribe(
        (response: any) => {
          if (response.status === 200) {
            const id = response.body['data'];
            console.log(id)
            this.form.get('ID_LOGI_YMS_AGEN').setValue(id);
            this.postMateriais(id);
            this.pnotify.success();
            // this.router.navigate(['../'], {
            //   relativeTo: this.activatedRoute,
            // });
          } else {
            this.pnotify.error();
          }
        },
        (error: any) => {
          const message = error.error.message
          message ? this.pnotify.error(message): this.pnotify.error();
        }
      );
  }

  onNestedFieldError(formGroup: string, index: number, field: string) {
    if (this.onNestedFieldInvalid(formGroup, index, field)) {
      return 'is-invalid';
    }

    return '';
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

  onDeleteMaterial(index: number) {
    if (this.formMateriais.length === 1) {
      this.pnotify.notice('Informe ao menos um material.');
      return
    }
    let materiais = this.formMateriais.at(index).value;
    materiais = {...materiais,'IN_STAT':'0'}
    if(!materiais['ID_LOGI_AGEN_MATE']){
      this.formMateriais.removeAt(index);
      return;
    }
    this.loadingNavBar= true;
    this.agendamentosService
      .postMateriais(materiais)
        .pipe(
          finalize(() => {
            this.loadingNavBar= false;
          })
        )
        .subscribe(
          (response) => {
            if (response.status === 200) {
              this.formMateriais.removeAt(index);
              this.pnotify.success();
            } else {
              this.pnotify.error();
            }
          },
          (error) => {
            this.pnotify.error();
          }
        );
  }
  

  async postMateriais(id:number){
    let request = [];
    const materiais = this.formMateriais.getRawValue();
    if (!materiais){
      return
    }
    const promise = () => {
      materiais.forEach(material => {
        const params = {...material,'ID_LOGI_YMS_AGEN':id}
        request.push(this.agendamentosService
          .postMateriais(params)
      )});
    }
    await Promise.resolve(promise());
    forkJoin(request)
    .pipe(
      finalize(() => {
        this.loading = false;
        this.loadingNavBar = false;
      })
    )
    .subscribe(
      (responses: Array<any>) => {
        responses.forEach(response => {
          if(response.status === 200 ){
            this.pnotify.success('Material, salvo com sucesso!');
            this.router.navigate(['../'], {
              relativeTo: this.activatedRoute,
            });
          } else{
            this.pnotify.error();
          }
        });
      },
      (error: any) => {
        try {
          this.pnotify.error(error.error.message);
        } catch (error) {
          this.pnotify.error();
        }
      }
    )
  }

  onSetTime(event){
    console.log(event)
  }
}
