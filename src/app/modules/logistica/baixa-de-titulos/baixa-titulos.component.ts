import { Component, OnInit, ElementRef, OnDestroy } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { FormBuilder, FormGroup } from '@angular/forms';

import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';

import { saveAs } from 'file-saver/src/FileSaver';

import { environment } from 'src/environments/environment';
import { LogisticaBaixaTitulosService } from './services/baixa-titulos.service';
import { XlsxService } from 'src/app/shared/services/core/xlsx.service';
import { finalize } from 'rxjs/operators';
import { Subscription, forkJoin } from 'rxjs';


@Component({
  selector: 'baixa-titulos',
  templateUrl: './baixa-titulos.component.html',
  styleUrls: ['./baixa-titulos.component.scss']
})
export class LogisticaBaixaTitulosComponent implements OnInit, OnDestroy {

  loading = false;
  loadingNavBar = false;

  copyTextarea: ElementRef;
  file: any = [];
  form: FormGroup;
  document: boolean = true;
  routeId: number = 2;
  $xlsxSubscription: Subscription;

  breadCrumbTree: any = [
    {
      descricao: 'Logistica'
    },
    {
      descricao: 'Baixa de Títulos'
    }
  ];

  constructor(
    private pnotify: PNotifyService,
    private formBuilder: FormBuilder,
    private atividadesService: AtividadesService,
    private baixaTituloService: LogisticaBaixaTitulosService,
    private xlsxService: XlsxService
  ) {
    this.form = this.formBuilder.group({
      file: [null]
    })
  }

  ngOnInit() {
    this.atividadesService
      .registrarAcesso()
      .subscribe();
    this.onSubscription();
  }

  ngOnDestroy(): void {
    this.$xlsxSubscription.unsubscribe();
  }

  copiarParaAreaDeTransferencia() {
    const element = document.querySelector('textarea');
    element.select();
    document.execCommand('copy');
    this.pnotify.success('Copiado com sucesso!')
  }

  salvar() {
    const blob = new Blob([this.file], { type: "text/plain;charset=utf-8" });
    saveAs(blob, "titulo.ref");
    this.pnotify.success('Download iniciado com sucesso!');
  }

  onReset() {
    this.file = "";
    this.form.reset();
  }

  onInput(event: any) {
    this.loadingNavBar = true;
    this.file = undefined;
    this.xlsxService.getFile(event);
  }

  onSubscription() {
    this.$xlsxSubscription = this.xlsxService
      .fileLoaded
      .subscribe(
        response => {
          this.getTitulos(response)
        }
      )
  }

  getTitulos(args: Array<any>) {

    this.loadingNavBar = true;

    /* const _length = args.length
    const _interval = 50;
    const _n = Math.ceil(_length / _interval);

    let req = [];

    for (let i = 0; i <= _n; i++) {

      const current = args.slice((_interval * i) + 1, _interval * (i + 1))

      req.push(
        this.baixaTituloService
          .getTitulos(this.routeId, current)
      )
    } */

    this.file = "";

    //forkJoin(req)
    this.baixaTituloService
      .getTitulos(this.routeId, args)
      .pipe(
        finalize(() => {
          this.loadingNavBar = false
        })
      )
      .subscribe(
        response => {
          if (response.status === 200) {
            this.file = response.body['data']
          }
          /* response.forEach((element, index) => {
            if (element['status'] === 200) {
              this.file += element['body']['data'];
            } else if (element['status'] === 204) {
              //this.pnotify.notice(`Nenhum título localizado para o lote ${index}`);
            } else {
              this.pnotify.error(`Erro ao processar títulos para o lote ${index}`);
            }
          }); */
        },
        error => {
          this.pnotify.error();
        }
      )

    this.form.reset();
  }

  onTypeDocument(document) {
    this.document = document == 'Cte' ? true : false;
    this.routeId = document == 'Cte' ? 2 : 4;
  }

}