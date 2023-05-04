import { Component, Input, OnInit } from '@angular/core';

import { PageChangedEvent } from 'ngx-bootstrap';

@Component({
  selector: 'abastecimento-cadastro-manutencao-classe-modal-materiais-status',
  templateUrl: './modal-materiais-status.component.html',
  styleUrls: ['./modal-materiais-status.component.scss']
})
export class AbastecimentoCadastrosManutencaoClassesModalMateriaisStatusComponent implements OnInit {
  @Input() item: any;

  noResultModal: boolean = false;
  noResultDetalhes: boolean = false;
  compressedTable: boolean = false;
  loadingDetalhesModal: boolean = false;

  modal: any = [];
  dataModal: any = [
    {NM_TIPO_MATE:"DISTRIBUIDORA", ID_MATE:12345, NM_MATE: "CA-50", TT_VOLU_VEND:125.58, TT_ESTO_ATUA:526.58, TT_CART: 154, TT_PLAN_CORT: 45.68},
    {NM_TIPO_MATE:"DISTRIBUIDORA", ID_MATE:12345, NM_MATE: "CA-60", TT_VOLU_VEND:125.58, TT_ESTO_ATUA:526.58, TT_CART: 154, TT_PLAN_CORT: 45.68},
    {NM_TIPO_MATE:"DISTRIBUIDORA", ID_MATE:12345, NM_MATE: "CA-25", TT_VOLU_VEND:125.58, TT_ESTO_ATUA:526.58, TT_CART: 154, TT_PLAN_CORT: 45.68},
  ];
  dataDetail: any = [
    {NM_EMPR:"MANETONI - TIETE", NM_DEPO:"TIETE", VOLU_VEND: 125.58, VOLU_CART:125.58, PLAN_CORT:526.58},
    {NM_EMPR:"MANETONI - TAIPAS", NM_DEPO:"TAIPAS", VOLU_VEND: 125.58, VOLU_CART:125.58, PLAN_CORT:526.58},
  ];

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

  onDetail(item: any): void {
    item.select = !item.select;
    this.compressedTable = !this.compressedTable;
  }

  onCloseDetail(): void {
    this.dataModal.forEach(e => {
      e.select = false;
    });
    this.compressedTable = false;
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
