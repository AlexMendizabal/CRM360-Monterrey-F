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

// Services
import { ComercialCadastrosCampanhasService } from '../campanhas.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { TitleService } from 'src/app/shared/services/core/title.service';
import { ConfirmModalService } from 'src/app/shared/modules/confirm-modal/confirm-modal.service';

import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';
import { JsonResponse } from 'src/app/models/json-response';
import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';

@Component({
  selector: 'formulario',
  templateUrl: './formulario.component.html',
  styleUrls: ['./formulario.component.scss']
})
export class FormularioComponent implements OnInit {
  loaderFullScreen = false;
  loaderNavbar: boolean;
  appTitle: string;
  action: string;
  codGrupos: number = null;
  breadCrumbTree: Array<Breadcrumb> = [];

  submittingForm: boolean;
  formChanged = false;

  campanias = [
    { descripcion: 'materiales', descuento: '5%', cantidadMin: 1020, fechaInicio: '9-jul', fechaFin: '9-ago', codigoItems: 'MT-01', descripcion2: 'Lista de motivo', observacion: 'lista', acciones: 'EDITAR - APROBAR', estado: 'APROBADO' },
    { descripcion: 'materiales', descuento: '7%', cantidadMin: 550, fechaInicio: '14-jul', fechaFin: '24-jul', codigoItems: 'MT-02', descripcion2: 'Lista de motivo', observacion: 'lista', acciones: 'EDITAR - APROBAR', estado: 'RECHAZADO' },
    { descripcion: 'materiales', descuento: '10%', cantidadMin: 1020, fechaInicio: '20-jul', fechaFin: '21-jul', codigoItems: 'MT-03', descripcion2: 'Lista de motivo', observacion: 'lista', acciones: 'EDITAR - APROBAR', estado: 'RECHAZADO' }
  ];

  pages = [1, 2, 3];

  selectClient() {
    // Lógica para seleccionar cliente
  }

  createCampaign() {
    // Lógica para crear campaña
  }

  search() {
    // Lógica para buscar materiales
  }

  prevPage() {
    // Lógica para ir a la página anterior
  }

  nextPage() {
    // Lógica para ir a la siguiente página
  }

  goToPage(page: number) {
    // Lógica para ir a una página específica
  }

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private location: Location,
    private formBuilder: FormBuilder,
    private pnotifyService: PNotifyService,
    private atividadesService: AtividadesService,
    private titleService: TitleService,
    private confirmModalService: ConfirmModalService
  ) {
    this.pnotifyService.getPNotify();
  }

  ngOnInit(): void {
    this.registrarAcesso();
    this.setBreadCrumb();
    this.titleService.setTitle('Registro de Campañas');
  }

  registrarAcesso(): void {
    this.atividadesService.registrarAcesso().subscribe();
  }


  setBreadCrumb(): void {
    this.activatedRoute.params.subscribe((params: any) => {
      if (params.id) {
        this.appTitle = 'Editar Campaña';
        this.action = 'update';
      } else {
        this.appTitle = 'Nuevo Campaña';
        this.action = 'create';
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
          descricao: 'Campañas',
          routerLink: `/comercial/cadastros/${params.idSubModulo}/campanhas/lista`,
        },
        {
          descricao: this.appTitle,
        },
      ];
    });
  }

  onCancel(): void {
    this.location.back();
  }
  onSubmit(): void {

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
