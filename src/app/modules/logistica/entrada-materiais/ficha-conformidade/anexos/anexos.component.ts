import { ILogisticaEntradaMateriaisAnexos } from './../models/anexos';
import { HttpResponse } from '@angular/common/http';
import { ConfirmModalService } from 'src/app/shared/modules/confirm-modal/confirm-modal.service';
import { ActivatedRoute, Router } from '@angular/router';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { finalize, switchMap, take } from 'rxjs/operators';
import { forkJoin, EMPTY, Observable } from 'rxjs';
import { LogisticaEntradaMateriaisFichaConformidadeService } from './../services/ficha-conformidade.service';
import { FormGroup } from '@angular/forms';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'logistica-entrada-materiais-notas-fiscais-anexos',
  templateUrl: './anexos.component.html',
  styleUrls: ['./anexos.component.scss'],
})
export class LogisticaEntradaMateriaisFichasConformidadeAnexosComponent implements OnInit {
  @Input() set fichaId(id: number){
    if(!id)
      return
    this.postDocumentos(id);
  };
  
  form: FormGroup;
  formData: Array<FormData> = [];
  anexos: Partial<ILogisticaEntradaMateriaisAnexos>[] = [];
  loadingNavBar = false;
  loading = false;
  constructor(
      private fichaConformidadeServie : LogisticaEntradaMateriaisFichaConformidadeService,
      private pnotify: PNotifyService,
      private activatedRoute: ActivatedRoute,
      private confirmModalService: ConfirmModalService,
      private router: Router,
    ) { 
  }
  
  ngOnInit(): void {
    this.getDocumentos();
  }


  
  async postDocumentos(fichaId: number) {
    let requests = [];

    if (this.formData.length === 0) {
      return requests;
    }

    const promise = () => {
      this.formData.forEach((element) => {
        requests.push(this.fichaConformidadeServie.postDocumento(element, fichaId));
      });
    }

    Promise.resolve(promise());

    forkJoin(requests)
      .subscribe(
        (responses: Array<HttpResponse<any>>)=>{
          responses.forEach(response => {
            if(response.status === 200){
              this.pnotify.success('Documento, salvo com sucesso!');
            } else {
              this.pnotify.error();
            }
          })
        }
        ,
      (error) => {
        this.pnotify.error();
      }
      )

    return requests;
  }

  putDocumento(anexo: ILogisticaEntradaMateriaisAnexos) {
    const [type, title, message, cancelTxt, okTxt] = [
      'inactivate',
      'Confirmar inativação',
      'Deseja realmente prosseguir com a inativação do registro?',
      'Cancelar',
      'Confirmar',
    ];

    this.confirmModalService
      .showConfirm(type, title, message, cancelTxt, okTxt)
      .pipe(
        take(1),
        switchMap((result) => {
          if (!result) return EMPTY;

          this.loadingNavBar = true;

          return this.fichaConformidadeServie.putDocumento(anexo);
        }),
        finalize(() => {
          this.loadingNavBar = false;
        })
      )
      .subscribe((response) => {
        this.pnotify.success('Documento removido com sucesso!');
        this.getDocumentos({
          ID_TECN_INFO_ITEM: this.form.get('ID_TECN_INFO_ITEM').value,
          IN_STAT: '1',
        });
      });
  }

  getDocumentos(params?) {
    this.fichaConformidadeServie.getDocumento(params).subscribe(
      (response) => {
        if (response.status === 200) {
          this.anexos = response.body['data'];
        } else {
          this.anexos = [];
        }
      },
      (error) => {
        this.anexos = [];
      }
    );
  }

  onRemove(anexo: ILogisticaEntradaMateriaisAnexos) {
    anexo.IN_STAT = '0';
    this.putDocumento(anexo);
  }

  appendFile(files: FileList) {
    if (files.length === 0) return;
    this.formData.slice
    const fd = new FormData();
    fd.append('file', files[0]);
    this.formData.push(fd);
    this.anexos.push({ NM_DOCU: files[0]['name']});
  }
}
