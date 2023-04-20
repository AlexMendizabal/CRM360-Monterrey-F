import { ILogisticaEntradaMateriaisDocumentos } from './../models/documentos';
import { HttpResponse } from '@angular/common/http';
import { ConfirmModalService } from 'src/app/shared/modules/confirm-modal/confirm-modal.service';
import { ActivatedRoute, Router } from '@angular/router';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { finalize, switchMap, take } from 'rxjs/operators';
import { forkJoin, EMPTY } from 'rxjs';
import { LogisticaEntradaMateriaisFichaConformidadeService } from './../services/ficha-conformidade.service';
import { FormGroup } from '@angular/forms';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'logistica-entrada-materiais-notas-fiscais-documentos',
  templateUrl: './documentos.component.html',
  styleUrls: ['./documentos.component.scss'],
})
export class LogisticaEntradaMateriaisFichasConformidadeDocumentosComponent implements OnInit {
  @Input() set fichaId(id: number){
    if(!id)
      return
    this.postDocumentos(id);
  };
  
  form: FormGroup;
  formData: Array<FormData> = [];
  documentos: Partial<ILogisticaEntradaMateriaisDocumentos>[] = [];
  loadingNavBar = false;
  loading = false;
  constructor(
      private fichaConformidadeService : LogisticaEntradaMateriaisFichaConformidadeService,
      private pnotify: PNotifyService,
      private activatedRoute: ActivatedRoute,
      private confirmModalService: ConfirmModalService,
    ) { 
  }
  
  ngOnInit(): void {
    const params = this.activatedRoute.snapshot.params;
    if(params.hasOwnProperty('id')){
      this.getDocumentos({
        ID_LOGI_ENMA_FHNC: params.id,
        IN_STAT: '1'
      });
    }
  }


  
  async postDocumentos(fichaId: number) {
    let requests = [];

    if (this.formData.length === 0) {
      return requests;
    }

    const promise = () => {
      this.formData.forEach((element) => {
        requests.push(this.fichaConformidadeService.postDocumento(element, fichaId));
      });
    }

    Promise.resolve(promise());

    forkJoin(requests)
      .subscribe(
        (responses: Array<HttpResponse<any>>)=>{
          responses.forEach(response => {
            if(response.status === 200){
              this.pnotify.success();
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

  putDocumento(documento: ILogisticaEntradaMateriaisDocumentos) {
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

          return this.fichaConformidadeService.putDocumento(documento);
        }),
        finalize(() => {
          this.loadingNavBar = false;
        })
      )
      .subscribe((response) => {
        this.pnotify.success('Documento atualizado com sucesso');
        this.getDocumentos({
          ID_LOGI_ENMA_FHNC: this.form.get('ID_LOGI_ENMA_FHNC').value,
          IN_STAT: '1',
        });
      });
  }

  getDocumentos(params?) {
    this.fichaConformidadeService.getDocumento(params).subscribe(
      (response) => {
        if (response.status === 200) {
          this.documentos = response.body['data'];
        } else {
          this.documentos = [];
        }
      },
      (error) => {
        this.documentos = [];
      }
    );
  }

  onRemove(documento: ILogisticaEntradaMateriaisDocumentos, index: number) {
    if(!documento.hasOwnProperty('ID_LOGI_ENMA_FHNC_DOCU')){
      this.formData = this.formData.filter((element:FormData) => {
        return (element.get('file'))['name'] != documento.NM_DOCU ;
      })
    }
    documento.IN_STAT = '0';
    this.documentos.splice(index, 1)
    if(documento.hasOwnProperty('ID_LOGI_ENMA_FHNC_DOCU')){
      this.putDocumento(documento);
    }
  }

  appendFile(files: FileList) {
    if (files.length === 0) return;
    const fd = new FormData();
    fd.append('file', files[0]);
    this.formData.push(fd);
    this.documentos.push({ NM_DOCU: files[0]['name']});
  }
}
