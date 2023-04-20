import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute,  } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { LogisticaSenhasService } from '../services/senhas.service';

@Component({
  selector: 'logistica-senhas-cadastro',
  templateUrl: './cadastro.component.html',
  styleUrls: ['./cadastro.component.scss']
})
export class LogisticaSenhasCadastroComponent implements OnInit {

  form: FormGroup;

  appTitle: string = "Cadastro";
  breadCrumbTree: any = [];

  /*loading*/
  loading = true;
  loadingNavBar = false;
  /*loading*/

  constructor(
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private location: Location,
    private atividadesService: AtividadesService,
    private pnotify: PNotifyService,
    private senhasService: LogisticaSenhasService
    ) { }

  ngOnInit(): void {
    this.buildForm();
    this.registraAcesso()
    this.setBreadCrumb();
    this.onActivatedRoute();
  }

  ngOnDestroy() {
  }
  
  onActivatedRoute() {
    const params = this.activatedRoute.snapshot.params;
    
    if(!params.hasOwnProperty("id")){
      this.loading = false;
      return
    }

    this.loading = true;

    this.getSenhas({"ID_LOGI_SENH": params.id});

  }

  buildForm() {
    this.form = this.formBuilder.group({
      ID_LOGI_SENH: [null],
      DS_SENH: [null],
      DS_USUA: [null],
      DS_APLC: [null],
      IN_STAT: [1],
      DS_OBSE: [null]
    })
  }

  registraAcesso() {
    this.atividadesService.registrarAcesso().subscribe();
  }

  setBreadCrumb() {
    this.breadCrumbTree = [
      {
        descricao: 'Logistica'
      },
      {
        descricao: 'Lista de senhas',
        routerLink: './../'
      },
      {
        descricao: this.appTitle
      }
    ];
  }

  getSenhas(params){
    if (!this.loading)
      this.loadingNavBar = true;

    this.senhasService
      .getSenhas(params)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.loadingNavBar = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            const senha = response.body['data'][0];
            this.form.patchValue(senha);
          } else {
            this.pnotify.notice('Nenhum resultado para sua consulta.')
          }
        },
        error => {
          try{
            this.pnotify.error(error.error.message);
          }catch{
            this.pnotify.error();
          }
        }
      )
  }

  postSenha(params){

    this.loadingNavBar = true;

    this.senhasService
      .postSenha(params)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.loadingNavBar = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            this.pnotify.success(response.body["message"])
            this.location.back();
          } else {
            this.pnotify.notice('Nenhum resultado para sua consulta.')
          }
        },
        error => {
          try{
            this.pnotify.error(error.error.message);
          }catch{
            this.pnotify.error();
          }
        }
      )
  }

    // Validação de formulário
    onFieldError(field: string) {
      if (this.onFieldInvalid(field)) {
        return 'is-invalid';
      }
      return '';
    }
  
    onFieldInvalid(field: any) {
      field = this.form.get(field);
      return field.status == 'INVALID' && field.touched;
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
    // Validação de formulário

}
