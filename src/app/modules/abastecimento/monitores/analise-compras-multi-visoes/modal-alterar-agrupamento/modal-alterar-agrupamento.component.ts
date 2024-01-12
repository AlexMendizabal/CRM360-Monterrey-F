import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';

import { PageChangedEvent } from 'ngx-bootstrap';

import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';

@Component({
  selector: 'abastecimento-analise-compras-multi-visoes-modal-alterar-agrupamento',
  templateUrl: './modal-alterar-agrupamento.component.html',
  styleUrls: ['./modal-alterar-agrupamento.component.scss']
})
export class AbastecimentoMonitoresAnaliseComprasMultiVisoesModalAlterarAgrupamentoComponent implements OnInit {
  @Input() item: any;

  loadingDetalhesModal: boolean = false;

  data: any = [];

  /* Ordenação */
  reverse: boolean = false;
  key: string = 'NM_MATE';
  /* Ordenação */

  /* Paginação */
  itemsPerPage: number = 15;
  totalItems: number = 15;
  currentPage: number = 1;
  begin: number = 0;
  end: number = 15;
  /* Paginação */

  form: FormGroup;
  tipoAgrupamentos: any = [
    {ID: 1, NAME: "Por empresa"},
  ]

  constructor(
    private formBuilder: FormBuilder,
    private pnotifyService: PNotifyService,
  ) {
    this.form = this.formBuilder.group({
      TP_AGRU: [null, Validators.required],
    });
  }

  ngOnInit(): void {
    //console.log(this.item);
  }

  onFilter(): void {
    this.loadingDetalhesModal = true;
    this.setData();
  }

  setData(): void {
    this.data = this.item;
  }

  exportarExcel(): void {
    this.pnotifyService.success("Exportado com sucesso");
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

  onFieldError(field: string): string {
    if (this.onFieldInvalid(field)) {
      return 'is-invalid';
    }
    return '';
  }

  onFieldInvalid(field: any): any {
    field = this.form.get(field);
    return field.status == 'INVALID' && field.touched;
  }

  onFieldRequired(field: string): string {
    let required = false;
    let formControl = new FormControl();

    if (this.form.controls[field].validator) {
      let validationResult = this.form.controls[field].validator(formControl);
      required =
        validationResult !== null && validationResult.required === true;
    }

    if (required) {
      return 'is-required';
    }
  }

}
