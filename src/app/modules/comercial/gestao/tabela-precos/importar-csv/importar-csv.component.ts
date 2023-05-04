import { Component, OnInit, TemplateRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { JsonResponse } from 'src/app/models/json-response';
import { ComercialService } from '../../../comercial.service';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';


// Interfaces
import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';
import { PNotifyService } from '../../../../../shared/services/core/pnotify.service';

import { ComercialGestaoTabelaPrecosService } from '../tabela-precos.service';
import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';
import { isBreakOrContinueStatement } from 'typescript';

@Component({
  selector: 'comercial-gestao-tabela-precos-importar-csv',
  templateUrl: './importar-csv.component.html',
  styleUrls: ['./importar-csv.component.scss']
})
export class ComercialGestaoTabelaPrecosImportarCsvComponent implements OnInit {

  appTitle: string = 'Importar CSV';
  breadCrumbTree: Array<Breadcrumb> = [];
  loaderFullScreen = true;
  loaderNavbar: boolean;
  fileReaded;
  nomePreco = '';
  rows = [];
  headers: any;
  content;
  row: any;
  dados: any;
  empresas = [];
  codPreco: any;
  elementsAdded = [];
  fileValue;

  tableConfigAssocGrupos: Partial<CustomTableConfig> = {
    fixedHeader: false,
    bodyHeight: 230,
    hover: false,
  };

  tableConfigPrecos: Partial<CustomTableConfig> = {
    fixedHeader: false,
    bodyHeight: 230,
    hover: false,
  };

  constructor(
    private activatedRoute: ActivatedRoute,
    private comercialService: ComercialService,
    private tabelaPrecosService: ComercialGestaoTabelaPrecosService,
    private pnotifyService: PNotifyService,
    private bsModalService: BsModalService,
  ) { }


  ngOnInit(): void {
    this.setBreadCrumb();
    this.getTotalItems();
    this.getEmpresas();
    this.loaderFullScreen = false;
  }

  // pega os valores dos depositos
  getEmpresas(){
    this.comercialService.getDepositos(null)
    .subscribe({
      next: (response: any) => {
          response.result.forEach(element => {
            if(element.idDeposito == 1 ||
              element.idDeposito == 2 ||
              element.idDeposito == 18 ||
              element.idDeposito == 79 ||
              element.idDeposito == 77 ||
              element.idDeposito == 55){
                this.empresas.push({codDeposito: element.idDeposito, nomeDeposito: element.nomeDeposito});
              }
          });      }
    });
  }

  // limpa os
  clearValues(){
    this.content = null;
    this.headers = null;
    this.row = null;
    this.rows = null;
  }

  // popula o CSV de modelo com todos os dados referente ao codigo do preco
  populateModel(){
    var arr = [];
    arr.push(new Array('ID GRUPO','ID DEPOSITO','UF DESTINO','VALOR'));
    this.dados.assocGrupos.forEach(element => {
      let codGrupo = element.codGrupo;
      element.precos.forEach(element2 => {
        arr.push( new Array(codGrupo,element2.codEmpresa, element2.ufDestino.toUpperCase(),element2.valorMaterial));
      });
    });
    this.rows = arr;
  }

  // pega todos os itens referente ao codigo de preco
  getTotalItems(){
    this.tabelaPrecosService
      .getDetalhes(this.codPreco)
      .subscribe({
        next: (response: JsonResponse) => {
          if (response.hasOwnProperty('success') && response.success === true) {
            this.dados = response.data;
            this.nomePreco = this.dados.nomePreco;
            this.populateModel();
          }
        },
        error: (error: any) => {
          if (error.error.hasOwnProperty('mensagem')) {
            this.pnotifyService.error(error.error.mensagem);
          } else {
            this.pnotifyService.error();
          }
        }
      });
  }

  setBreadCrumb(): void {
    this.activatedRoute.params.subscribe((params: any) => {
      this.codPreco = params.id;
      this.breadCrumbTree = [
        {
          descricao: 'Home',
          routerLink: '/comercial/home',
        },
        {
          descricao: 'Gestão',
          routerLink: `/comercial/gestao/${params.idSubModulo}`,
        },
        {
          descricao: 'Tabela de Preços',
          routerLink: `/comercial/gestao/${params.idSubModulo}/tabela-precos/lista`,
        },
        {
          descricao: this.appTitle,
        },
      ];
    });
  }

  //cria arquivo de dowload separado por ponto e virgulas
  downloadModel() {
    let csvContent = "data:text/csv;charset=utf-8," + this.rows.map(e => e.join(";")).join("\n");
    var encodedUri = encodeURI(csvContent);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "modelo-tabela-preco.csv");
    document.body.appendChild(link);
    link.click();
  }

  changeListener(fileInput){
    //le arquivo csv
    this.fileReaded = fileInput.target.files[0];
    let filename = fileInput.target.files[0].name;
    let fileExtension = filename.substring(filename.lastIndexOf('.')+1, filename.length) || filename;
    if(fileExtension == 'csv'){
    let reader: FileReader = new FileReader();
    reader.readAsText(this.fileReaded);

      reader.onload = (e) => {
      let csvuploaded = reader.result.toString();
      let allTextLines = csvuploaded.split(/\r|\n|\r/);


        // headers = linhas de titulos
        this.headers = allTextLines[0].split(';');
        this.content = [];

          for (let i = 1; i < allTextLines.length; i++) {
            // divide por ponto e virgula
            let data = allTextLines[i].split(';');
            if (data.length === this.headers.length) {
              let tarr = [];
              for (let j = 0; j < this.headers.length; j++) {
                tarr.push(data[j]);
              }
            // log em cada row para ver output
            // console.log(tarr);
            this.content.push(tarr);
            this.checkLines();
          }
        }
      }
    } else {
      this.pnotifyService.error('É necessário subir um arquivo do tipo CSV!');
    }
    //reseta o input caso o usuario queira subir o mesmo arquivo
    fileInput.target.value = null;
  }

  // checa em todas as linhas se o item ja está cadastrado ou não
  checkLines(){
    if(this.content.length > 0){
      for(let i = 0; i < this.content.length; i++){
        if(this.content[i] != undefined && this.content[i][2].length == 2){
        this.content[i][4] = 'SEM CADASTRO';
          this.dados.assocGrupos.forEach(element => {
            if(element.codGrupo == this.content[i][0]){
              element.precos.forEach(element2 => {
                if(element2.codEmpresa == this.content[i][1]
                  && element2.ufDestino.toUpperCase() == this.content[i][2]){
                    this.content[i][4] = 'OK';
                  }
              });
            }
          });
        } else {
          this.loaderNavbar = false;
          this.pnotifyService.error('Não foi encontrado nenhum item no arquivo CSV para exportação ou o modelo está incorreto.');
          this.content = [];
          break;
        }
      }
      } else {
        this.loaderNavbar = false;
        this.pnotifyService.error('Não foi encontrado nenhum item no arquivo CSV para exportação ou o modelo está incorreto.');
      }
  }

  //mostra os itens que foram atualizados e os novos itens cadastrados
  loadModal(template: TemplateRef<any>){
    this.bsModalService.show(template);
  }

  closeModal(){
    this.bsModalService.hide(0);
  }

  // atualiza os dados já existentes e carrega os novos dados no objeto
  updateValues(template: TemplateRef<any>) {
  this.elementsAdded = [];
  this.loaderNavbar = true;
    if(this.content){
      for(let i = 0; i <= this.content.length; i++){
        if(this.content[i] != undefined){
          this.dados.assocGrupos.forEach(element => {
            if(element.codGrupo == this.content[i][0]){
              element.precos.forEach(element2 => {
                    var last = element.precos.at(-1);
                    if(element2.ufDestino.toUpperCase() == this.content[i][2]
                    && element2.codEmpresa == this.content[i][1]
                    && this.content[i][4] == 'OK'){
                      element2.valorMaterial = parseFloat(this.content[i][3]);
                      this.elementsAdded.push({
                        codGrupo: element.codGrupo,
                        codEmpresa: element2.codEmpresa,
                        ufDestino: element2.ufDestino.toUpperCase(),
                        valorMaterial: parseFloat(element2.valorMaterial)});

                    } else if(element.codGrupo == this.content[i][0]
                    && this.content[i][4] == 'SEM CADASTRO'
                    && element2 == last ) {
                      let nomeEmpresa;
                      this.empresas.forEach(element => {
                        if(this.content[i][1] == element.codEmpresa){
                          nomeEmpresa = element.nomeDeposito;
                        }
                      });
                      element.precos.push({
                        codAssociacao: null,
                        codEmpresa: parseInt(this.content[i][1]),
                        nomeEmpresa: nomeEmpresa,
                        ufDestino: this.content[i][2],
                        valorMaterial: parseFloat(this.content[i][3])

                      });
                      this.elementsAdded.push({
                        codGrupo: element.codGrupo,
                        codEmpresa: parseInt(this.content[i][1]),
                        ufDestino: this.content[i][2].toUpperCase(),
                        valorMaterial: parseFloat(this.content[i][3])});
                    }
              });
            }
          });
        }
      }
      //salva os dados
      this.saveDados(template);
      } else {
        this.loaderNavbar = false;
        this.pnotifyService.error('Não foi encontrado nenhum arquivo CSV para exportação.');

      }
  }

    saveDados(template){
      if(this.elementsAdded.length > 0){
      this.dados.dataInicialVigencia = new Date();
      this.tabelaPrecosService.saveTabelaPrecos(this.dados, 'update')
         .subscribe({
          next: (response: any) => {
          if (response.hasOwnProperty('success') && response.success === true) {
            this.loaderNavbar = false;
            this.loadModal(template);
            this.pnotifyService.success(response.mensagem);
            this.headers = null;
            this.content = null;

          } else if (
            response.hasOwnProperty('success') &&
            response.success === false
          ) {
            this.pnotifyService.error(response.mensagem);
          } else {
            this.pnotifyService.error();
          }
        }, error: (error) => {
          this.pnotifyService.error(error.message);
          this.loaderNavbar = false;
        }
        });
    } else {
      this.clearValues();
      this.loaderNavbar = false;
      this.pnotifyService.error('Nenhum item foi adicionado, cheque se os dados estão corretos e se a tabela está de acordo com a tabela de modelo.');
    }
  }

}
