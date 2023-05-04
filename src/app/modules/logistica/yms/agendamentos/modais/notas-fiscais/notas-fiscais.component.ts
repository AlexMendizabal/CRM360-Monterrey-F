import { LogisticaEntradaMateriaisNotasFiscaisService } from './../../../../entrada-materiais/notas-fiscais/services/notas-fiscais.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';

import { finalize } from 'rxjs/operators';

@Component({
  selector: 'logistica-yms-agendamentos-modais-notas-fiscais',
  templateUrl: './notas-fiscais.component.html',
  styleUrls: ['./notas-fiscais.component.scss']
})
export class LogisticaYmsAgendamentosModaisNotasFiscaisComponent implements OnInit {

  @Output() select: EventEmitter<any> = new EventEmitter();
  @Output() close: EventEmitter<any> = new EventEmitter();

  loading = false;
  noNotasFiscais = true;
  /* Pagination */
  itemsPerPage = 100;
  totalItems = 10;
  currentPage = 1;
  /* Pagination */

  notasFiscais = [];

  form: FormGroup;
  
  constructor(
    private formBuilder: FormBuilder,
    private notasFiscaisService: LogisticaEntradaMateriaisNotasFiscaisService,
  ) { }

  ngOnInit(): void {
    this.setFormBuilder();
  }

  //formulario
  setFormBuilder(): void {

    this.form = this.formBuilder.group({
      buscarPor: ['NR_NOTA_FISC'],
      pesquisa: [null, Validators.required],
      ID_MATE: [null],
      NR_NOTA_FISC: [null],
      NM_MATE: [null],
      DS_LOTE: [null],
      TT_MATE_ORIG: [null],
      NM_FORN: [null],
      NM_EMPR: [null],
      DS_UNID_MEDI: [null],
      PAGI: 1,
      IN_STAT: ['1'],
      TT_REGI_PAGI: [this.itemsPerPage],
    });
  }

  getNotasFiscais() {
    
    const buscarPor = this.form.get('buscarPor').value ?? '';
    const pesquisa = this.form.get('pesquisa').value ?? '';

    let params = {}

    if(buscarPor){
      params[buscarPor] = pesquisa;
    }

    params['PAGI'] = this.form.get('PAGI').value;
    params['TT_REGI_PAGI'] = 100;

    this.loading = true;

    this.notasFiscaisService
      .getNotasFiscais(params)
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            this.notasFiscais = response['body']['data'];
            this.totalItems = response.body['total'];
            this.noNotasFiscais=false;
          } else {
            this.notasFiscais = [];
            this.noNotasFiscais=true;
          }
        },
        (error) => {
        }
      );
  }

  onPageChanged(event) {
    this.form.get('PAGI').setValue(event.page);
    this.getNotasFiscais();
  }

  onSelect(nota){
    this.select.emit(nota);
    this.onClose();
  }

  onClose(){
    this.close.emit(true);
  }

}
