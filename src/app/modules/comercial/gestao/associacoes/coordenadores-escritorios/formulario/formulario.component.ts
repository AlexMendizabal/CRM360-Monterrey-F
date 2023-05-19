import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';

// Interfaces
import { IFormCanDeactivate } from 'src/app/guards/iform-candeactivate';
import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';

// Services
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { ComercialGestaoAssociacoesCoordenadoresEscritoriosService } from '../coordenadores-escritorios.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { TitleService } from 'src/app/shared/services/core/title.service';

@Component({
  selector: 'comercial-gestao-associacoes-coordenadores-escritorios-formulario',
  templateUrl: './formulario.component.html',
  styleUrls: ['./formulario.component.scss']
})
export class ComercialGestaoAssociacoesCoordenadoresEscritoriosFormularioComponent
  implements OnInit, IFormCanDeactivate {
  loaderFullScreen = true;
  loaderNavbar = false;

  breadCrumbTree: Array<Breadcrumb> = [];

  form: FormGroup;
  formChanged = false;

  coordenadores: Array<any> = [];
  escritorios: Array<any> = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private location: Location,
    private coordenadoresEscritoriosService: ComercialGestaoAssociacoesCoordenadoresEscritoriosService,
    private formBuilder: FormBuilder,
    private pnotifyService: PNotifyService,
    private atividadesService: AtividadesService,
    private titleService: TitleService
  ) {
    this.pnotifyService.getPNotify();
  }

  ngOnInit() {
    this.registrarAcesso();
    this.setBreadCrumb();
    this.getFormFields();
    this.titleService.setTitle('Associação de coordenadores e escritórios');
  }

  registrarAcesso() {
    this.atividadesService.registrarAcesso().subscribe();
  }

  setBreadCrumb() {
    this.activatedRoute.params.subscribe((params: any) => {
      this.breadCrumbTree = [
        {
          descricao: 'Home',
          routerLink: '/comercial/home'
        },
        {
          descricao: 'Gestão',
          routerLink: `/comercial/gestao/${params['idSubModulo']}`
        },
        {
          descricao: 'Associação de coordenadores e escritórios'
        }
      ];
    });
  }

  getFormFields() {
    this.coordenadoresEscritoriosService
      .getListaCoordenadoresEscritorios()
      .subscribe({
        next: (response: any) => {
          if (response['responseCode'] === 200) {
            this.coordenadores = response['result']['coordenadores'];
            this.escritorios = response['result']['escritorios'];
            this.setFormBuilder();
          } else {
            this.pnotifyService.error();
            this.location.back();
          }
        },
        error: (error: any) => {
          this.pnotifyService.error();
          this.location.back();
        }
      });
  }

  setFormBuilder() {
    this.form = this.formBuilder.group({
      coordenador: [null, [Validators.required]],
      escritorios: [null, [Validators.required]]
    });

    this.loaderFullScreen = false;
  }

  onChange() {
    for (let i = 0; i < this.coordenadores.length; i++) {
      if (
        this.coordenadores[i]['matricula'] == this.form.value['coordenador']
      ) {
        if (this.coordenadores[i]['escritorios'][0] == null) {
          this.form.value['escritorios'] = null;
        } else {
          this.form
            .get('escritorios')
            .setValue(this.coordenadores[i]['escritorios']);
        }
        this.formChanged = true;
      }
    }
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
    if (this.form.value['coordenador']) {
      this.loaderNavbar = true;

      if (
        this.form.value['escritorios'] == null ||
        this.form.value['escritorios'] == ''
      )
        this.form.value['escritorios'] = {
          0: 0
        };

      this.coordenadoresEscritoriosService
        .putAssociacaoCoordenadorEscritorio(this.form.value)
        .subscribe((response: any) => {
          if (response['responseCode'] === 200) {
            this.pnotifyService.success();
            this.getFormFields();

            this.loaderNavbar = false;
            this.loaderFullScreen = true;
            this.formChanged = false;

            this.form.get('coordenador').setValue(null);
            this.form.get('escritorios').setValue(null);
          } else {
            this.pnotifyService.error();
            this.loaderNavbar = false;
          }
        });
    }
  }
}
