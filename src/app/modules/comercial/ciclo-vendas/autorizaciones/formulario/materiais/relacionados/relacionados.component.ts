import { Component, OnInit, Input } from '@angular/core';
import { finalize } from 'rxjs/operators';

// Services
import { ComercialCicloVendasAutorizacionesService } from '../../../autorizaciones.service';
import { ComercialCicloVendasCotacoesFormularioService } from '../../formulario.service';

// Interfaces
import { ISimilaridadeModel } from '../../models/similaridade';
import { JsonResponse } from 'src/app/models/json-response';

@Component({
  selector: 'comercial-ciclo-vendas-cotacoes-formulario-materiais-relacionados',
  templateUrl: './relacionados.component.html',
  styleUrls: ['./relacionados.component.scss'],
})
export class ComercialCicloVendasCotacoesFormularioMateriaisRelacionadosComponent
  implements OnInit {
  @Input('codEmpresa') codEmpresa: number;
  @Input('materiais') materiais: Array<number>;
  @Input('codCliente') codCliente: number;
  @Input('codEndereco') codEndereco: number;
  @Input('codFormaPagamento') codFormaPagamento: number;
  @Input('freteConta') freteConta: number;


  materiaisRelacionados: Array<ISimilaridadeModel> = [];
  materiaisRelacionadosLoader: boolean;


  vendasGerais: Array<ISimilaridadeModel> = [];
  vendasGeraisLoader: boolean;

  vendasCliente: Array<ISimilaridadeModel> = [];
  vendasClienteLoader: boolean;

  show: boolean = true;

  itemsPerSlide = 4;
  noWrapSlides = true;

  constructor(
    private cotacoesService: ComercialCicloVendasAutorizacionesService,
    private formularioService: ComercialCicloVendasCotacoesFormularioService
  ) {}

  ngOnInit(): void {
    this.onSelectVendasGerais();
  }

  ngOnChanges(event: any): void {
    this.onSelectVendasGerais();
    // if (event.materiais) {
    //   const previousValue = event.materiais.previousValue || [];
    //   const currentValue = event.materiais.currentValue;


    //   /* const materiais = currentValue.filter(
    //     (codMaterial: number) => !previousValue.includes(codMaterial)
    //   ); */

    //   previousValue.includes(event.materiais.codMaterial);

    //   this.postVendasGerais(currentValue);

    // }
  }

  onSelectVendasGerais(){
    this.postVendasGerais(this.materiais);
  }

  onSelectVendasCliente(){
    this.postVendasCliente(this.materiais);
  }

  onSelectMateriaisRelacionados(){
    this.postMateriaisRelacionados(this.materiais);
  }

  postVendasGerais(materiais: any): void {

    this.materiaisRelacionadosLoader = true;
    this.vendasGerais = [];
    this.cotacoesService
      .postVendasGerais({
        codEmpresa: this.codEmpresa,
        codMaterial: materiais.codMaterial,
        codCliente: this.codCliente,
        codEndereco: this.codEndereco,
        codFormaPagamento: this.codFormaPagamento,
        freteConta: this.freteConta
      })
      .pipe(
        finalize(() => {
          this.materiaisRelacionadosLoader = false;
        })
      )
      .subscribe((response: JsonResponse) => {
        if (response.success === true) {
          const vendasGerais = response.data.map(
            (material: ISimilaridadeModel) => {
              let o = Object.assign({}, material);
              o.onCarrinho = false;
              return o;
            }
          );


          this.vendasGerais = [
            ...this.vendasGerais,
            ...vendasGerais,
          ];


          if (this.vendasGerais.length > this.itemsPerSlide) {
            this.noWrapSlides = false;
          }
        }
      });


  }

  postVendasCliente(materiais: any): void {

    this.materiaisRelacionadosLoader = true;
    this.vendasCliente = [];
    this.cotacoesService
      .postVendasCliente({
        codEmpresa: this.codEmpresa,
        codMaterial: materiais.codMaterial,
        codCliente: this.codCliente,
        codEndereco: this.codEndereco,
        codFormaPagamento: this.codFormaPagamento,
        freteConta: this.freteConta
      })
      .pipe(
        finalize(() => {
          this.materiaisRelacionadosLoader = false;
        })
      )
      .subscribe((response: JsonResponse) => {
        if (response.success === true) {
          const vendasCliente = response.data.map(
            (material: ISimilaridadeModel) => {
              let o = Object.assign({}, material);
              o.onCarrinho = false;
              return o;
            }
          );

          this.vendasCliente = [
            ...this.vendasCliente,
            ...vendasCliente,
          ];


          if (this.vendasCliente.length > this.itemsPerSlide) {
            this.noWrapSlides = false;
          }
        }
    });
  }

  postMateriaisRelacionados(materiais: any): void {

    this.materiaisRelacionadosLoader = true;
    this.materiaisRelacionados = [];
    this.cotacoesService
      .postMateriaisRelacionados({
        codEmpresa: this.codEmpresa,
        codMaterial: materiais.codMaterial,
        codCliente: this.codCliente,
        codEndereco: this.codEndereco,
        codFormaPagamento: this.codFormaPagamento,
        freteConta: this.freteConta
      })
      .pipe(
        finalize(() => {
          this.materiaisRelacionadosLoader = false;
        })
      )
      .subscribe((response: JsonResponse) => {
        if (response.success === true) {
          const materiaisRelacionados = response.data.map(
            (material: ISimilaridadeModel) => {
              let o = Object.assign({}, material);
              o.onCarrinho = false;
              return o;
            }
          );

          this.materiaisRelacionados = [
            ...this.materiaisRelacionados,
            ...materiaisRelacionados,
          ];


          if (this.materiaisRelacionados.length > this.itemsPerSlide) {
            this.noWrapSlides = false;
          }
        }
      });
  }

  onMaterial(material: ISimilaridadeModel): void {
    this.formularioService.materiaisSubject.next([material]);
    material.onCarrinho = true;
  }

  carouselRelacionadosClass(): string {
    return this.materiaisRelacionados.length <= this.itemsPerSlide
      ? 'no-controls'
      : 'px-5';
  }

  carouselGeraisClass(): string {
    return this.vendasGerais.length <= this.itemsPerSlide
      ? 'no-controls'
      : 'px-5';
  }

  carouselClienteClass(): string {
    return this.vendasCliente.length <= this.itemsPerSlide
      ? 'no-controls'
      : 'px-5';
  }

  onShow(){
    this.show = !this.show;
  }
}
