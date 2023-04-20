import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'corte-dobra-dashboard-filtro',
  templateUrl: './filtro.component.html',
  styleUrls: ['./filtro.component.scss']
})
export class CorteDobraDashboardFiltroComponent implements OnInit {
  dataLoaded: boolean = true;
  showDashboard: boolean = false;

  form: FormGroup;

  unidades: any = [
    { emp: '999', nome: 'Todas Unidades'},
    { emp: '03', nome: 'RIO DAS PEDRAS'},
    { emp: '46', nome: 'CAJAMAR'},
    { emp: '72', nome: 'PRAIA GRANDE'}

  ];
  periodos: any = [
    {id: '1', nome:'ÚLTIMOS 7 DIAS'},
    {id: '2', nome:'MÊS CORRENTE'},
    {id: '3', nome:'MÊS PASSADO'}
  ];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit() {

    this.form = this.formBuilder.group({
      unidade: [null, Validators.required],
      periodo: [null, Validators.required]
    })
  }
  
  onFilter(){
    let unidade =  this.form.get("unidade").value;
    let periodo = this.form.get("periodo").value;
    let todasUnidades = [];
    
    if(unidade == '999') {
      todasUnidades = this.unidades.filter(u => {
        if(u.emp !== '999')
          return u.emp;
      }).map(u => u.emp);
    } else
    todasUnidades = unidade;
    let params = todasUnidades.toString();
    this.router.navigate(["corte-dobra/dashboard"], {
      queryParams: {
        "unidade" : params,
        "periodo": periodo
      }
    });
   }
  
  onFieldRequired(field: string) {
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

  onFieldInvalid(field: any) {
    field = this.form.get(field);

    return field.status == 'INVALID' && field.touched;
  }

}
