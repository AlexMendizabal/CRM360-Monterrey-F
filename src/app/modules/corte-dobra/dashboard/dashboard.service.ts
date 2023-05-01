import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { delay, take, map, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { DateService } from 'src/app/shared/services/core/date.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CorteDobraDashboardService {

  //abre Analitico Transportes
  eventAnaliticoTransporte = new EventEmitter<any>();
  private AnaliticoTransporte: boolean = false;


  private readonly API_URL_MT: string = `https://crm360.monterrey.com.bo/api`;

  //API_URL: string = 'https://crm360.monterrey.com.bo';
  //API_URL_MT:string = '/api/';

  constructor(
    protected http: HttpClient,
    private dateService: DateService
    ) { }

    //**envia evento de transporte.component para analitico.component
    getAnaliticoTransporte(){
      return this.AnaliticoTransporte;
    }

    setAnaliticoTransporte(val:boolean){
      this.AnaliticoTransporte = val;
      this.eventAnaliticoTransporte.emit(val);
    }
    //**

  parametros = {unidade: "03", periodo:"1"};
 

  // getPerfil(idUsuario: number) {
  //   return this.http.get(`${this.API_URL}/perfil`).pipe(
  //     take(1),
  //     delay(1000)
  //   );
  // }

  getOcorrenciasAnalitico(parametros): Observable<any>{
    let unidade = parametros["unidade"];
    let periodo = parametros["periodo"];
    let categoria = parametros["categoria"];

    return this.http.get(`${this.API_URL_MT}/corteDobra/ocorrenciasAnalitico`, {
      params: {
        "emp": unidade,
        "id":periodo,
        "categoria": categoria
        },
      observe: "response"
      })
    .pipe(
      tap(),
      delay(1000)
    );

  }

  getOcorrencias(parametros){
    let unidade = parametros["unidade"];
    let periodo = parametros["periodo"];
    return this.http.get(`${this.API_URL_MT}/corteDobra/ocorrencias`, {
      params: {
        "emp": unidade,
        "id":periodo
        },
        observe: "response"
      })
      .pipe(
      take(1),
      delay(1000)
    );
  }

  getPedidosAbertos(parametros): Observable<any>{
    let unidade = parametros["unidade"];
    let periodo = parametros["periodo"];
    return this.http.get(`${this.API_URL_MT}/corteDobra/pedidosAbertos`, {
      params: {
        "emp": unidade,
        "id":periodo
        },
        observe: "response"
      })
      .pipe(
      take(1),
      delay(1000)
    );
  }

  getPedidosEntregas(parametros): Observable<any>{
    let unidade = parametros["unidade"];
    let periodo = parametros["periodo"];
    return this.http.get(`${this.API_URL_MT}/corteDobra/pedidosEntregas`,{
      params: {
        "emp": unidade,
        "id":periodo
        },
        observe: "response"
      })
      .pipe(
      take(1),
      delay(1000)
    );
  }

  getPedidosFaturados(parametros): Observable<any>{
    let unidade = parametros["unidade"];
    let periodo = parametros["periodo"];
    return this.http.get(`${this.API_URL_MT}/corteDobra/pedidosFaturados`,{ 
      params: {
        "emp": unidade,
        "id":periodo
        },
        observe: "response"
      })
      .pipe(
      take(1),
      delay(1000)
    );
  }

  getPedidosPlanilhados(parametros): Observable<any>{
    let unidade = parametros["unidade"];
    let periodo = parametros["periodo"];
    return this.http.get(`${this.API_URL_MT}/corteDobra/pedidosPlanilhados`,{
      params: {
        "emp": unidade,
        "id":periodo
        },
        observe: "response"
      })
      .pipe(
      take(1),
      delay(1000)
    );
  }

  getPedidosProduzidos(parametros): Observable<any>{
    let unidade = parametros["unidade"];
    let periodo = parametros["periodo"];
    return this.http.get(`${this.API_URL_MT}/corteDobra/pedidosProduzidos`,{
      params: {
        "emp": unidade,
        "id":periodo
        },
        observe: "response"
      })
      .pipe(
      take(1),
      delay(1000)
    );
  }

  getTaxaOcupacao(parametros): Observable<any>{
    let unidade = parametros["unidade"];
    let periodo = parametros["periodo"];
    let projeto;

    let d           = new Date();
    let dtInicial = new Date(d.getFullYear(),d.getMonth(), 1);
    let dtFinal   = new Date(d.getFullYear(),d.getMonth() + 1,0);
    
    let dataInicial = this.dateService.convert2PhpDate(new Date(dtInicial));
    let dataFinal = this.dateService.convert2PhpDate(new Date(dtFinal));

    if(unidade == 3 ){
      projeto = "C&D Rio das Pedras";
    } else if (unidade == 46){
      projeto = "C&D Cajamar";
    } else if (unidade == 72){
      projeto = "C&D Praia Grande";
    }else if (unidade == '03,46,72'){
      projeto = "C&D Rio das Pedras,C&D Cajamar,C&D Praia Grande";
    }
console.log(projeto)
    return this.http.get(`${this.API_URL_MT}/logistica/indicadores/taxa-ocupacao`, {
      params: {
        "dataInicial": dataInicial,
        "dataFinal": dataFinal,
        "projeto": projeto
      },
      observe:"response"
    });
  }

  getTaxaOcupacaoAnalitico(parametros): Observable<any>{
    let unidade = parametros["unidade"];
    let periodo = parametros["periodo"];
    let projeto;

    let d           = new Date();
    let dtInicial = new Date(d.getFullYear(),d.getMonth(), 1);
    let dtFinal   = new Date(d.getFullYear(),d.getMonth() + 1,0);
    
    // let dataInicial = this.dateService.convert2PhpDate(new Date(dtInicial));
    // let dataFinal = this.dateService.convert2PhpDate(new Date(dtFinal));

    let dataInicial = dtInicial.getDate() + "-" + (dtInicial.getMonth() + 1) + "-" + dtInicial.getFullYear();
    let dataFinal = dtFinal.getDate() + "-" + (dtFinal.getMonth() + 1) + "-" + dtFinal.getFullYear();

    if(unidade == 3 ){
      projeto = "C&D Rio das Pedras";
    } else if (unidade == 46){
      projeto = "C&D Cajamar";
    } else if (unidade == 72){
      projeto = "C&D Praia Grande";
    }else if (unidade == 999){
      //unidade = "Todas as Unidade";
    }

    return this.http.get(`${this.API_URL_MT}/logistica/indicadores/romaneios/lista`, {
      params: {
        "dataInicial": dataInicial,
        "dataFinal": dataFinal,
        "projeto": projeto,
        "modalidade": ""
      },
      observe: "response"
    });
  }


}
