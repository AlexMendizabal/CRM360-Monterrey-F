import { LogisticaVeiculoService } from './../../../../cadastros/veiculos/services/veiculo.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';

import { finalize } from 'rxjs/operators';

@Component({
  selector: 'logistica-yms-agendamentos-modais-veiculos',
  templateUrl: './veiculos.component.html',
  styleUrls: ['./veiculos.component.scss']
})
export class LogisticaYmsAgendamentosModaisVeiculosComponent implements OnInit {

  @Output() select: EventEmitter<any> = new EventEmitter();
  @Output() close: EventEmitter<any> = new EventEmitter();

  loading = false;
  noVeiculos = true;
  /* Pagination */
  itemsPerPage = 100;
  totalItems = 10;
  currentPage = 1;
  /* Pagination */

  veiculos = [];

  form: FormGroup;
  
  constructor(
    private formBuilder: FormBuilder,
    private veiculoService: LogisticaVeiculoService,
  ) { }

  ngOnInit(): void {
    this.setFormBuilder();
  }

  //formulario
  setFormBuilder(): void {

    this.form = this.formBuilder.group({
      buscarPor: ['PLAC'],
      pesquisa: [null, Validators.required],
      ID_LOGI_VEIC:[null],
      PLAC:[null],
      NM_MOTO:[null],
      NM_TRAN:[null],
      NM_VEIC_TIPO:[null],
      PAGI: 1,
      IN_STAT: ['1'],
      TT_REGI_PAGI: [this.itemsPerPage],
    });
  }

  getVeiculos() {
    
    const buscarPor = this.form.get('buscarPor').value ?? '';
    const pesquisa = this.form.get('pesquisa').value ?? '';

    let params = {}

    if(buscarPor){
      params[buscarPor] = pesquisa;
    }

    params['PAGI'] = this.form.get('PAGI').value;
    params['TT_REGI_PAGI'] = 100;

    this.loading = true;

    this.veiculoService
      .getVeiculos(params)
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            this.veiculos = response.body['data'];
            this.totalItems = response.body['total'];
            this.noVeiculos=false;
          } else {
            this.veiculos = [];
            this.noVeiculos=true;
          }
        },
        (error) => {
        }
      );
  }

  onPageChanged(event) {
    this.form.get('PAGI').setValue(event.page);
    this.getVeiculos();
  }

  onSelect(veiculo){
    this.select.emit(veiculo);
    this.onClose();
  }

  onClose(){
    this.close.emit(true);
  }

}
