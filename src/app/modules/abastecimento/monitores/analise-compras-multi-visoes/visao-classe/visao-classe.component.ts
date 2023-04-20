import { Component, OnInit } from '@angular/core';

import { Subscription } from 'rxjs';

@Component({
  selector: 'visao-classe',
  templateUrl: './visao-classe.component.html',
  styleUrls: ['./visao-classe.component.scss']
})
export class AbastecimentoMonitoresAnaliseComprasMultiVisoesVisaoClasseComponent implements OnInit {

  noResult: boolean = false;
  ableInformationEstoque: boolean = false;

  $activatedRouteSubscription: Subscription;

  colsEst: number;

  /* Ordenação */
  reverse: boolean = false;
  key: string = 'NM_MATE';
  /* Ordenação */

  constructor() { }


  ngOnInit(): void {
    this.noResult=true;
  }

  abledInfomationEstoque(): void {
    this.colsEst = 3;
    this.ableInformationEstoque = !this.ableInformationEstoque;
  }

  /* Ordenação via API*/
  sort(key: string): void {

    // if(this.key != key) {
    //   this.reverse = true;
    // } else if( this.key == key ) {
    //   this.reverse = !this.reverse;
    // }

    // this.key = key;
    
    // if (this.reverse == false) {
    //   this.form.get('orderType').setValue("ASC");
    // } else if (this.reverse == true) {
    //   this.form.get('orderType').setValue("DESC");
    // }

    // this.form.get('orderBy').setValue(this.key);
    // this.onFilter(this.currentPage);
  }
  /* Ordenação via API*/

}
