import { LogisticaYmsAgendamentosService } from './../../services/agendamentos.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';

import { finalize } from 'rxjs/operators';

@Component({
  selector: 'logistica-yms-agendamentos-modais-materiais',
  templateUrl: './materiais.component.html',
  styleUrls: ['./materiais.component.scss']
})
export class LogisticaYmsAgendamentosModaisMateriaisComponent implements OnInit {

  @Output() select: EventEmitter<any> = new EventEmitter();
  @Output() close: EventEmitter<any> = new EventEmitter();

  loading = false;
  noMateriais = true;
  /* Pagination */
  itemsPerPage = 100;
  totalItems = 10;
  currentPage = 1;
  begin = 0;
  end = 100;
  /* Pagination */

  materiais = [];

  form: FormGroup;
  
  constructor(
    private formBuilder: FormBuilder,
    private agendamentosService: LogisticaYmsAgendamentosService,
  ) { }

  ngOnInit(): void {
    this.setFormBuilder();
  }

  //formulario
  setFormBuilder(): void {

    this.form = this.formBuilder.group({
      buscarPor: ['NM_MATE'],
      pesquisa: [null, Validators.required],
      ID_REFE_ERP:[null],
      NM_MATE:[null],
      NM_CLAS:[null],
      NM_LINH:[null],
      IN_STAT: ['1'],
      PAGI: 1,
      TT_REGI_PAGI: [this.itemsPerPage],
    });
  }

  getMateriais() {
    
    const buscarPor = this.form.get('buscarPor').value ?? '';
    const pesquisa = this.form.get('pesquisa').value ?? '';

    let params = {}

    if(buscarPor){
      params[buscarPor] = pesquisa;
    }

    params['PAGI'] = this.form.get('PAGI').value;
    params['TT_REGI_PAGI'] = 100;

    this.loading = true;

    this.agendamentosService
      .getMateriais(params)
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            this.materiais = response.body['result'];;
            this.totalItems = response.body['result'].length;
            this.noMateriais=false;
          } else {
            this.materiais = [];
            this.noMateriais=true;
          }
        },
        (error) => {
        }
      );
  }

  onPageChanged(event) {
    this.begin = (event.page - 1) * event.itemsPerPage;
    this.end = event.page * event.itemsPerPage;
  }

  onSelect(material){
    this.select.emit(material);
    this.onClose();
  }

  onClose(){
    this.close.emit(true);
  }

}
