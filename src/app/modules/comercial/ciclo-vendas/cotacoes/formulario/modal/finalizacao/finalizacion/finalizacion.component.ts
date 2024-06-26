import { Component, OnInit, AfterViewChecked, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { Location } from '@angular/common';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
// ngx-bootstrap
import { BsModalRef } from 'ngx-bootstrap/modal';

// Services
import { AuthService } from 'src/app/shared/services/core/auth.service';
import { ComercialCicloVendasCotacoesService } from '../../../../cotacoes.service';
import { ComercialCicloVendasCotacoesFormularioService } from '../../../formulario.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';

// Interfaces
import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';
import { JsonResponse } from 'src/app/models/json-response';


@Component({
  selector: 'comercial-ciclo-vendas-cotacoes-formulario-modal-finalizacao-finalizacion',
  templateUrl: './finalizacion.component.html',
  styleUrls: ['./finalizacion.component.scss'],
})

export class ComercialCicloVendasCotacoesFormularioModalFinalizacaoFinalizacion
  implements OnInit, AfterViewChecked {
  items;
  checkoutForm;
  id_oferta;
  fecha;

  @Input('dataCotacao') dataCotacao: any;

  autorizacion: any = [];

  viewChecked = false;

  user = {
    idVendedor: 88,
    idEscritorio: 58,
  };

  deshabilitar = true;
  loaderFullScreen = true;

  tableConfig: Partial<CustomTableConfig> = {
    isFixed: true,
    border: false,
    small: false,
    hover: false,
    theme: {
      color: 'white',
    },
  };
  
  
  metasProgresso = {
    toneladas: {
      valor: 0,
      progresso: 0,
    },
    clientes: {
      valor: 0,
      progresso: 0,
    },
    extras: {
      valor: 0,
      progresso: 0,
    },
  };
  metasLoaded: boolean;
  metasEmpty: boolean;

  showMetas: boolean;
  form: FormGroup;
  comissaoMax = 0;
  comissaoMin = 0;
  comissaoLoaded: boolean;

  formObj = {};


  constructor(
    private location: Location,
    private bsModalRef: BsModalRef,
    private cotacoesService: ComercialCicloVendasCotacoesService,
    private formularioService: ComercialCicloVendasCotacoesFormularioService,
    private router: Router,
    private authService: AuthService,
    private pnotifyService: PNotifyService,
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder
  ) {
   
  }
  ngOnInit(): void {
    //this.confirmDuplicatas();
    this.checkoutForm = this.formBuilder.group({
      observacion: ['', Validators.required], 
    });
    console.log('con authorizacion',this.dataCotacao)
  }

  ngAfterViewChecked() {
    if (this.dataCotacao) {
      this.setViewChecked();
    }
  }

  setViewChecked(): void {
    this.loadComponentData();
  }

  loadComponentData(): void {
    this.getComissao();
  }

  onSubmit() {

    console.log('con authorizacion',this.dataCotacao)
    if (this.checkoutForm.value !== undefined && this.checkoutForm.value !== null && this.checkoutForm.value.observacion !=="") {
      
      this.id_oferta = this.dataCotacao.id_oferta;
      this.fecha = this.dataCotacao.fecha_inicial;
      const observacion_vendedor = this.checkoutForm.value;

      this.formObj = {
        descripcion_vend: this.checkoutForm.get('observacion').value,
        id_oferta: this.id_oferta,
        fecha_solicitud: this.fecha,
      };

      this.cotacoesService.autorizaciones(this.formObj)
        .pipe().subscribe(
          (response: any) => {
            console.log(response);
            this.pnotifyService.notice(
              'se envio una auntorización.'
            );
          }
        );
      this.onClose();
    }
    else {
      this.onClose();
    }
  }

  onClose(): void {
    this.formularioService.limparCarrinhoSubject.next(true);
    this.bsModalRef.hide();
    //location.reload();
    this.router.navigate([`/comercial/ciclo-vendas/23/cotacoes-pedidos/lista`]);
  }

  calcularTotais(field: string): number {
    let total = {
      quantidade: 0,
      valor: 0,
    };
    for (let index = 0; index < this.dataCotacao.carrinho.length; index++) {
      total.quantidade += this.dataCotacao.carrinho[index].quantidade;
      total.valor += this.dataCotacao.carrinho[index].valorTotal;
    }
    return total[field];
  }

  verificador(): boolean {
    const titulo_observacionElement = document.getElementById('titulo_observacio') as HTMLButtonElement;
    const finalizar = document.getElementById('finalizar') as HTMLButtonElement;
    const observacionElement = document.getElementById('observacion') as HTMLInputElement;
    this.dataCotacao.carrinho.forEach((data) => {
      if (data.percentualDesc > data.descuento_permitido) {
        this.deshabilitar = false;
        finalizar.disabled = !this.checkoutForm.get('observacion').value;
        return;
      }
    });
    if (this.deshabilitar) {
      observacionElement.value = '';
      observacionElement.disabled = true;
      observacionElement.hidden = true;
      titulo_observacionElement.disabled = this.deshabilitar;
      titulo_observacionElement.style.display = this.deshabilitar ? 'none' : 'block';
      finalizar.disabled = this.checkoutForm.get('observacion').value;
      return;
    }
  }

  onData(event: any): void {
    if (event.corrente && Object.entries(event.corrente).length > 0) {
      this.metasEmpty = false;
      this.metasProgresso.toneladas.valor = event.corrente.toneladas.percentual;
      this.metasProgresso.clientes.valor = event.corrente.clientes.percentual;
      this.metasProgresso.extras.valor = event.corrente.extras.percentual;
      this.getProgresso();
    } else {
      this.metasEmpty = true;
    }
  }

  getProgresso(): void {
    if (this.user.idVendedor !== null) {
      this.metasLoaded = false;

      this.cotacoesService
        .getProgressoCotacao(
          this.dataCotacao.codCotacao,
          this.dataCotacao.codEmpresa
        )
        .pipe(
          finalize(() => {
            this.metasLoaded = true;
          })
        )
        .subscribe((response: JsonResponse) => {
          if (response.success === true) {
            this.metasProgresso.toneladas.progresso = response.data.toneladas;
            this.metasProgresso.clientes.progresso = response.data.clientes;
            this.metasProgresso.extras.progresso = response.data.extras;
          }
        });
    }
  }

  getComissao(): void {
    if (this.viewChecked === false) {
      if (this.user.idVendedor !== null) {
        this.showMetas = true;
        const profile = this.dataCotacao.profile;
        this.loaderFullScreen = false;

        /* this.cotacoesService
            .getComissaoCotacao(
                this.dataCotacao.codCotacao,
                this.dataCotacao.codEmpresa
            )
            .pipe(
                finalize(() => {
                    this.comissaoLoaded = true;
                    this.viewChecked = true;
                    this.loaderFullScreen = false;
                })
            )
            .subscribe((response: JsonResponse) => {
                if (response.success === true) {

                    if (response.data.tipoVendedor == 'Representante') {
                        this.showMetas = false;
                    }
                    if (profile.coordenador === true || profile.gestor === true) {
                        this.showMetas = false;
                    }
                    this.comissaoMax = response.data.valorMaximoComissao;
                    this.comissaoMin = response.data.valorMinimoComissao;
                }
            }); */
      }
    }
  }

  confirmDuplicatas(): void {

    let codCotacao = this.dataCotacao.codCotacao;
    let codEmpresa = this.dataCotacao.codEmpresa;
    let codFormaPagamento = this.dataCotacao.codFormaPagamento;
    let valorProposta = this.dataCotacao.valorProposta;
    let valorIcmsSt = this.dataCotacao.valorIcmsSt;

    /* this.cotacoesService
        .postGerarDuplicatas({
            codCotacao,
            codEmpresa,
            codFormaPagamento,
            valorProposta,
            valorIcmsSt
        })
        .subscribe({
            next: (response: JsonResponse) => {
                if (response.success === true) {

                } else {
                    this.pnotifyService.notice(response.mensagem);
                }
            },
            error: (error: any) => {
                if (error['error'].hasOwnProperty('mensagem')) {
                    this.pnotifyService.error(error.error.mensagem);
                } else {
                    this.pnotifyService.error();
                }
            }
        }); */
  }

  classVariacaoPreco(variacaoPreco: number): string {
    let variacaoClass: string;

    if (variacaoPreco > 0) {
      variacaoClass = 'fas fa-caret-up text-success';
    } else if (variacaoPreco < 0) {
      variacaoClass = 'fas fa-caret-down text-danger';
    }

    return variacaoClass;
  }

  formatVariacaoPreco(variacaoPreco: number): string {
    let valor: string;

    if (variacaoPreco > 0) {
      valor = `+${variacaoPreco}%`;
    } else if (variacaoPreco < 0) {
      valor = `${variacaoPreco}%`;
    }

    return valor;
  }
}
