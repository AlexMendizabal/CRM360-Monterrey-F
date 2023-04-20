import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { finalize } from 'rxjs/operators';

// Services
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { ComercialIntegracoesArcelorMittalClassesMateriaisService } from './classes-materiais.service';

// Interfaces
import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';

@Component({
  selector: 'comercial-integracoes-arcelor-mittal-classes-materiais',
  templateUrl: './classes-materiais.component.html',
  styleUrls: ['./classes-materiais.component.scss']
})
export class ComercialIntegracoesArcelorMittalClassesMateriaisComponent
  implements OnInit {
  loaderFullScreen = true;

  breadCrumbTree: Array<Breadcrumb> = [];

  classesMateriais: any = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private location: Location,
    private pnotifyService: PNotifyService,
    private classesMateriaisService: ComercialIntegracoesArcelorMittalClassesMateriaisService
  ) {
    this.pnotifyService.getPNotify();
  }

  ngOnInit(): void {
    this.setBreadCrumb();
    this.getLista();
  }

  setBreadCrumb(): void {
    this.activatedRoute.params.subscribe((params: any) => {
      this.breadCrumbTree = [
        {
          descricao: 'Home',
          routerLink: '/comercial/home'
        },
        {
          descricao: 'Integração com Arcelor Mittal',
          routerLink: `/comercial/integracoes/arcelor-mittal/${params['idSubModulo']}`
        },
        {
          descricao: 'Classe de materiais'
        }
      ];
    });
  }

  getLista(): void {
    this.classesMateriaisService
      .getLista()
      .pipe(
        finalize(() => {
          this.loaderFullScreen = false;
        })
      )
      .subscribe({
        next: (response: any) => {
          if (response['responseCode'] === 200) {
            this.classesMateriais = response['result'];
          } else {
            this.handleGetListaError();
          }
        },
        error: (error: any) => {
          this.handleGetListaError();
        }
      });
  }

  handleGetListaError(): void {
    this.pnotifyService.error();
    this.location.back();
  }
}
