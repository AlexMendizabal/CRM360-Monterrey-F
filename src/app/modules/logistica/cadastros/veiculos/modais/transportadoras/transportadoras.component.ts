import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';

import { finalize } from 'rxjs/operators';
import { LogisticaTransportadorasService } from '../../../transportadoras/services/transportadoras.service';

@Component({
  selector: 'logistica-veiculos-modais-transportadoras',
  templateUrl: './transportadoras.component.html',
  styleUrls: ['./transportadoras.component.scss']
})
export class LogisticaVeiculosModaisTransportadorasComponent implements OnInit {

  @Output() select: EventEmitter<any> = new EventEmitter();
  @Output() close: EventEmitter<any> = new EventEmitter();

  loading = false;

  /* Pagination */
  itemsPerPage = 100;
  totalItems = 10;
  currentPage = 1;
  /* Pagination */

  transportadoras = [];

  form: FormGroup;
  
  constructor(
    private formBuilder: FormBuilder,
    private transportadorasSerivices: LogisticaTransportadorasService
  ) { }

  ngOnInit(): void {
    this.setFormBuilder();
  }

  //formulario
  setFormBuilder(): void {

    this.form = this.formBuilder.group({
      buscarPor: ['NM_FANT'],
      pesquisa: [null, Validators.required],
      ID_LOGI_TRAN:[null],
      NM_FANT:[null],
      NR_CNPJ:[null],
      PAGI: 1,
      TT_REGI_PAGI: 100
    });
  }

  getTransportadoras() {
    
    const buscarPor = this.form.get('buscarPor').value ?? '';
    const pesquisa = this.form.get('pesquisa').value ?? '';

    let params = {}

    if(buscarPor){
      params[buscarPor] = pesquisa;
    }

    params['PAGI'] = this.form.get('PAGI').value;
    params['TT_REGI_PAGI'] = 100;

    this.loading = true;

    this.transportadorasSerivices
      .getTransportadoras(params)
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            this.transportadoras = response.body['data'];
            this.totalItems = response.body['total'];
          } else {
            this.transportadoras = [];
          }
        },
        (error) => {
        }
      );
  }

  onPageChanged(event) {
    this.form.get('PAGI').setValue(event.page);
    this.getTransportadoras();
  }

  onSelect(transportadora){
    this.select.emit(transportadora);
    this.onClose();
  }

  onClose(){
    this.close.emit(true);
  }

}
