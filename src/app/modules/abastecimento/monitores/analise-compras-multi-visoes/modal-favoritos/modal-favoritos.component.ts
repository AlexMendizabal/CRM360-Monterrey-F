import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'abastecimento-analise-compras-multi-visoes-modal-favoritos',
  templateUrl: './modal-favoritos.component.html',
  styleUrls: ['./modal-favoritos.component.scss']
})
export class AbastecimentoMonitoresAnaliseComprasMultiVisoesModalFavoritosComponent implements OnInit {
  ableDetailFavorite: boolean = false;

  formModal: FormGroup;

  dataModal: any = [
    { NAME_FAVO: 'Visão Master', LINK_FAVO: `http://${window.location.hostname}/#/abastecimento/monitores/90/analise-compras-multi-visoes?q=eyJJTkZPX1BSSU4iOjEsIklORk9fQUdSVSI6MSwiSU5GT19WT0xVIjpbMV0sIklORk9fQURJQyI6WzFdLCJkYXRhSW5pY2lhbCI6IjE4LTA4LTIwMjAiLCJkYXRhRmluYWwiOiIxOC0xMS0yMDIwIiwibGluaGEiOiI2NEQ1N0VDRC05NDRDLTREMDQtQUI3Qi0yM0JEOEJBMDk5NUUiLCJwYXJhbURhdGEiOjIsInNpdHVhY2FvIjoxLCJxdEl0ZW5zUGFnaW5hIjoxNSwicGFnaW5hIjoxfQ==` },
    { NAME_FAVO: 'Visão Standart', LINK_FAVO: `http://${window.location.hostname}/#/abastecimento/monitores/90/analise-compras-multi-visoes?q=eyJJTkZPX1BSSU4iOjEsIklORk9fQUdSVSI6MSwiSU5GT19WT0xVIjpbMV0sIklORk9fQURJQyI6WzFdLCJkYXRhSW5pY2lhbCI6IjE4LTA4LTIwMjAiLCJkYXRhRmluYWwiOiIxOC0xMS0yMDIwIiwibGluaGEiOiI2NEQ1N0VDRC05NDRDLTREMDQtQUI3Qi0yM0JEOEJBMDk5NUUiLCJwYXJhbURhdGEiOjIsInNpdHVhY2FvIjoxLCJxdEl0ZW5zUGFnaW5hIjoxNSwicGFnaW5hIjoxfQ==` }
  ];

  constructor(
    private formBuilder: FormBuilder,
  ) {
    this.formModal = this.formBuilder.group({
      NAME_FAVO: [null, Validators.required],
      LINK_FAVO: [null, Validators.required],
    });
   }

  ngOnInit(): void {
  }

  onDetailFavorite(i: any): void {
    i.select = !i.select;
    this.ableDetailFavorite = !this.ableDetailFavorite;
  }

  OnSaveFavorite(): void {
    console.log(this.formModal.value);
  }

  onClose(): void {
    this.dataModal.forEach(e => {
      e.select = false;
    });
    this.ableDetailFavorite = !this.ableDetailFavorite;
  }

  onFieldErrorModal(field: string): string {
    if (this.onFieldInvalidModal(field)) {
      return 'is-invalid';
    }
    return '';
  }

  onFieldInvalidModal(field: any): any {
    field = this.formModal.get(field);
    return field.status == 'INVALID' && field.touched;
  }

  onFieldRequiredModal(field: string): any {
    let required = false;
    let formControl = new FormControl();

    if (this.formModal.controls[field].validator) {
      let validationResult = this.formModal.controls[field].validator(formControl);
      required =
        validationResult !== null && validationResult.required === true;
    }

    if (required) {
      return 'is-required';
    }
  }

}
