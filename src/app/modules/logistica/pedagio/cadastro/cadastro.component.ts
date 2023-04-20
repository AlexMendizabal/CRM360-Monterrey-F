//angular
import { Component, OnInit } from '@angular/core';

//services
import { XlsxService } from 'src/app/shared/services/core/xlsx.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { ConfirmModalService } from 'src/app/shared/modules/confirm-modal/confirm-modal.service';
import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';
import { LogisticaPedagioService } from '../services/pedagio.service';

//rxjs
import { finalize, delay } from 'rxjs/operators';

@Component({
  selector: 'logistica-pedagio-cadastro',
  templateUrl: './cadastro.component.html',
  styleUrls: ['./cadastro.component.scss']
})
export class LogisticaPedagioCadastroComponent implements OnInit {

  appTitle: string = "Cadastro";
  breadCrumbTree: any = [];

  checkAll = false;
  files = [];
  headers = [];
  save = false;
  loading = false;
  loadingNavBar = false;
  count = 0;
  blocked = false;

  tableConfig: Partial<CustomTableConfig> = {
    subtitleBorder: true
  };

  constructor(
    private xlsxService: XlsxService,
    private pnotifyService: PNotifyService,
    private confirmModalService: ConfirmModalService,
    private LogisticaPedagioService: LogisticaPedagioService
  ) { }

  ngOnInit(): void {
    this.fileSubscription();
    this.setBreadCrumb();
  }

  setBreadCrumb() {
    this.breadCrumbTree = [
      {
        descricao: 'Logistica'
      },
      {
        descricao: 'Pedágio',
        routerLink: './../'
      },
      {
        descricao: this.appTitle
      }
    ];
  }

  fileSubscription() {
    this.xlsxService
      .fileLoaded
      .subscribe(
        (files: Array<any>) => {

          this.files = [];

          this.loading = false;
          const header = files[0];
          const expectedHeader = ["Data", "Unidade", "Nº da Ficha", "Tipo", "Valor"];

          if (JSON.stringify(header) !== JSON.stringify(expectedHeader)) {
            this.pnotifyService.error('Arquivo inválido.')
            return;
          }

          files.shift();

          files.map((file) => {
            if (Number.isInteger(file[0])) {
              file[0] = new Date(Math.floor((file[0] - 25569 + 0.125) * 86400 * 1000));
              this.files.push(file)
            } else {
              if (file.length === 0)
                return

              const _current = file[0].toString().trim();

              if (!/^\d{2}\/\d{2}\/\d{4}$/g.test(_current)) {
                this.pnotifyService.error('Há data inválida no arquivo.')
                throw new Error(`Invalid date: ${_current}`);
              }

              const [day, month, year] = _current.split('/');

              const date = new Date(year, month, day);

              file[0] = date;

              this.files.push(file)
            }
          })

        }
      )
  }

  getFile($event) {

    const files: FileList = $event.target.files;

    if (files.length === 0)
      return

    this.loading = true;
    this.xlsxService
      .getFile($event)

  }

  deleteElement(index) {
    const type = 'delete';
    const title = 'Confirmar remoção do registro?';
    const message = 'Deseja realmente excluir o registro? Ele será excluído somente desta listagem.';
    const cancelTxt = 'Cancelar';
    const okTxt = 'Confirmar';

    this.confirmModalService
      .showConfirm(type, title, message, cancelTxt, okTxt)
      .subscribe(
        (success: any) => {
          if (success) {
            this.files.splice(index, 1);
            this.pnotifyService.success();
          }
        },
        (error: any) => {
          this.pnotifyService.error();
        }
      );

  }

  deleteAllElements() {
    const type = 'delete';
    const title = 'Confirmar remoção de todos os registros?';
    const message = 'Deseja realmente excluir todos os registros?';
    const cancelTxt = 'Cancelar';
    const okTxt = 'Confirmar';

    this.confirmModalService
      .showConfirm(type, title, message, cancelTxt, okTxt)
      .subscribe(
        (success: any) => {
          if (success) {
            this.files = [];
            this.pnotifyService.success();
          }
        },
        (error: any) => {
          this.pnotifyService.error();
        }
      );
  }

  onToggleCheck(file) {
    file["checked"] = !file["checked"];

    let count = 0;
    let checkAll = true;

    this.files.forEach(element => {
      if (element['checked']) {
        count++
      } else {
        checkAll = false
      }
    });

    this.count = count;
    this.checkAll = checkAll;
  }

  onToggleCheckAll() {
    this.checkAll = !this.checkAll;

    this.files.forEach(element => {
      element.checked = this.checkAll;
    });

    this.count = this.checkAll ? this.files.length : 0;

  }

  onSave() {
    this.loading = true;

    let params = [];

    this.files.map((file, index) => {
      if (file["checked"]) {
        params.push(file);
        this.files[index]['status'] == 1;
      } else {
        this.files[index]['status'] == 0;
      }
    })

    this.LogisticaPedagioService
      .post(params)
      .pipe(
        delay(500),
        finalize(() => {
          this.loading = false
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {

            let items = response.body["data"];

            items.map((item) => {
              const current = item["data"];
              this.files.map((element, index) => {
                if ((element[1] == current[1]) && (element[2] == current[2])) {
                  this.files[index]['status'] = 2;
                  this.blocked = true;
                }
              })

            })
          }
        },
        (error) => {
          this.pnotifyService.error();
          this.save = false;
        }
      );
  }

}
