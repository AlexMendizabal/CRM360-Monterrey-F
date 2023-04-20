import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { ContatosService } from 'src/app/shared/services/requests/contatos.service';

@Component({
  selector: 'logistica-gestao-associacao-usuario-empresa',
  templateUrl: './associacao-usuario-empresa.component.html',
  styleUrls: ['./associacao-usuario-empresa.component.scss']
})
export class LogisticaGestaoAssociacaoUsuarioEmpresaComponent implements OnInit {

  private readonly API = environment.API;
  usuarios: any = [];
  empresas: any = [];
  loadingNavBar = false;
  loadingEmpresas = false;
  loadingUsuarios = true;

  form: FormGroup;

  breadCrumbTree: any = [
    {
      descricao: 'Logistica'
    },
    {
      descricao: 'Associação: Usuário x Empresa'
    }
  ];

  constructor(
    private http: HttpClient,
    private formBuilder: FormBuilder,
    private pnotify: PNotifyService,
    private atividadesService: AtividadesService,
    private contatosService: ContatosService
  ) {
    this.form = this.formBuilder.group({
      usuario: [null, Validators.required],
      empresa: [null]
    });
  }

  ngOnInit() {

    this.atividadesService
      .registrarAcesso()
      .subscribe();

    this.getUsuarios();
  }

  getUsuarios() {
    this.usuarios = [];
    this.http
      .get(`${this.API}/core/mtcorp/usuarios`,
        {
          params: { "situacao": "1", "qtItensPagina": "1000000", "naoCarregaFoto": "1" },
          observe: "response"
        })
      .pipe(
        finalize(() => {
          this.loadingUsuarios = false;
        })
      )
      .subscribe(
        response => {
          if (response['status'] === 200) {
            this.usuarios = response['body']['usuarios'];
          }
        }
      );
  }

  getEmpresas() {
    this.empresas = [];
    this.loadingEmpresas = true;
    this.form.get("empresa").reset();
    let matricula = this.form.get("usuario").value;

    let empresasAtivas = [];

    if (!matricula) {
      this.loadingEmpresas = false;
      return;
    }

    this.http
      .get(`${this.API}/logistica/associacao-usuario-empresa/${matricula}`,
        {
          observe: "response"
        })
      .pipe(
        finalize(() => {
          this.form.get("empresa").setValue(empresasAtivas)
          this.loadingEmpresas = false;
        })
      )
      .subscribe(
        data => {
          if (data.status === 200) {
            this.empresas = data["body"];

            this.empresas.forEach(element => {
              if (element.acesso == 1)
                empresasAtivas.push(element.idEmpresa);
            });
          }
        },
        error => {
          this.pnotify.error(error["error"].toString());
        }
      );
  }

  salvar() {
    this.loadingNavBar = true;
    let matricula = this.form.get("usuario").value;

    let empresasSelecionadas = this.form.get("empresa").value;

    this.http.put(`${this.API}/logistica/associacao-usuario-empresa/${matricula}`,
      {
        "empresas": empresasSelecionadas
      },
      { observe: "response" },
    )
      .pipe(
        finalize(() => {
          this.loadingNavBar = false;
        })
      )
      .subscribe(
        data => {
          if (data["status"] == 200) {
            this.pnotify.success(data["body"].toString());
          } else {
            this.pnotify.notice(data["body"].toString());
          }
        },
        error => {
          if (error["status"] == 500) {
            this.pnotify.error("Ocorreu erro durante a requisição");
          } else {
            this.pnotify.error(error["error"].toString());
          }
        }
      );
  }

}
