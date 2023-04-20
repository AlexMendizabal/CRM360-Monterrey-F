import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';

import { finalize } from 'rxjs/operators';

import { LogisticaMotoristaService } from './../../../motoristas/services/motorista.service';

@Component({
  selector: 'logistica-veiculos-modais-motoristas',
  templateUrl: './motoristas.component.html',
  styleUrls: ['./motoristas.component.scss']
})
export class LogisticaVeiculosModaisMotoristasComponent implements OnInit {

  @Output() select: EventEmitter<any> = new EventEmitter();
  @Output() close: EventEmitter<any> = new EventEmitter();

  loading = false;

  /* Pagination */
  itemsPerPage = 100;
  totalItems = 10;
  currentPage = 1;
  /* Pagination */

  motoristas = [];

  form: FormGroup;
  
  constructor(
    private formBuilder: FormBuilder,
    private motoristasServices: LogisticaMotoristaService
  ) { }

  ngOnInit(): void {
    this.setFormBuilder();
  }

  //formulario
  setFormBuilder(): void {

    this.form = this.formBuilder.group({
      buscarPor: ['NM_MOTO'],
      pesquisa: [null, Validators.required],
      PAGI: 1,
      TT_REGI_PAGI: 100
    });
  }

  getMotoristas() {
    
    const buscarPor = this.form.get('buscarPor').value ?? '';
    const pesquisa = this.form.get('pesquisa').value ?? '';

    let params = {}

    if(buscarPor){
      params[buscarPor] = pesquisa;
    }

    params['PAGI'] = this.form.get('PAGI').value;
    params['TT_REGI_PAGI'] = 100;

    this.loading = true;

    this.motoristasServices
      .getMotoristas(params)
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            this.motoristas = response.body['data'];
            this.totalItems = response.body['total'];
          } else {
            this.motoristas = [];
          }
        },
        (error) => {
        }
      );
  }

  onPageChanged(event) {
    this.form.get('PAGI').setValue(event.page);
    this.getMotoristas();
  }

  onSelect(motorista){
    this.select.emit(motorista);
    this.onClose();
  }

  onClose(){
    this.close.emit(true);
  }

}
