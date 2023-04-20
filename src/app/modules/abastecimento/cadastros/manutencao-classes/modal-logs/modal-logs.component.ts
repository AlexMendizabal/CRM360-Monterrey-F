import { Component, OnInit, Input } from '@angular/core';

import { PageChangedEvent } from 'ngx-bootstrap';

@Component({
  selector: 'abastecimento-cadastro-manutencao-classe-modal-logs',
  templateUrl: './modal-logs.component.html',
  styleUrls: ['./modal-logs.component.scss']
})
export class AbastecimentoCadastrosManutencaoClassesModalLogsComponent implements OnInit {
  @Input() item: any;

  modal: any = [];

  loadingLogs: boolean = false;
  noResultLogs: boolean = true;

  dataLogs: any = [];

  /* Ordenação principal*/
  reverse: boolean = false;
  key: string = 'NM_CLAS';
  /* Ordenação principal*/

  /* Paginação */
  itemsPerPage: number = 15;
  totalItems: number = 15;
  currentPage: number = 1;
  begin: number = 0;
  end: number = 15;
  /* Paginação */

  constructor() { }

  ngOnInit(): void {
    this.modal.NM_CLAS = this.item.NM_CLAS;
    this.modal.NM_SUB_LINH = this.item.NM_SUB_LINH;
    this.modal.NM_LINH = this.item.NM_LINH;
    this.modal.PER_INAT = this.item.PER_INAT;
  }

  /* Ordenação */
  sort(key: string): void {
    this.key = key;
    this.reverse = !this.reverse;
  }
  /* Ordenação */
  
  /* Paginação Tabela Principal*/
  onPageChanged(event: PageChangedEvent): void {
    this.begin = (event.page - 1) * event.itemsPerPage;
    this.end = event.page * event.itemsPerPage;
  }
  /* Paginação */

}
