import { Component, OnInit, AfterViewChecked, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { Location } from '@angular/common';
// ngx-bootstrap
import { BsModalRef } from 'ngx-bootstrap/modal';

// Services
import { AuthService } from 'src/app/shared/services/core/auth.service';
import { ComercialCicloVendasAutorizacionesService } from '../../../../autorizaciones.service';
import { ComercialCicloVendasCotacoesFormularioService } from '../../../formulario.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';

// Interfaces
import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';
import { JsonResponse } from 'src/app/models/json-response';


@Component({
  selector:
    'comercial-ciclo-vendas-cotacoes-formulario-modal-finalizacao-padrao',
  templateUrl: './padrao.component.html',
  styleUrls: ['./padrao.component.scss'],
})
export class ComercialCicloVendasCotacoesFormularioModalFinalizacaoPadraoComponent
  implements OnInit, AfterViewChecked {
  @Input('dataCotacao') dataCotacao: any;


  viewChecked = false;

  user = {
    idVendedor: 55,
    idEscritorio: 88,
  };

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

  comissaoMax = 0;
  comissaoMin = 0;
  comissaoLoaded: boolean;

  constructor(
    private location: Location,
    private bsModalRef: BsModalRef,
    private cotacoesService: ComercialCicloVendasAutorizacionesService,
    private formularioService: ComercialCicloVendasCotacoesFormularioService,
    private router: Router,
    private authService: AuthService,
    private pnotifyService: PNotifyService,
    private activatedRoute: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.confirmDuplicatas();

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

  onClose(): void {
    let idSubModulo = this.dataCotacao.idSubModulo;
    let codCotacao = this.dataCotacao.codCotacao;
    let codEmpresa = this.dataCotacao.codEmpresa;
    this.formularioService.limparCarrinhoSubject.next(true);

    this.bsModalRef.hide();
    this.router.navigate([`/comercial/ciclo-vendas/${idSubModulo}/cotacoes-pedidos/lista/${codCotacao}/${codEmpresa}`]);

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

        this.cotacoesService
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

              if(response.data.tipoVendedor == 'Representante') {
                this.showMetas = false;
              }
              if (profile.coordenador === true || profile.gestor === true) {
                this.showMetas = false;
              }
              this.comissaoMax = response.data.valorMaximoComissao;
              this.comissaoMin = response.data.valorMinimoComissao;
            }
          });
      }
    }
  }

  confirmDuplicatas(): void {

    let codCotacao = this.dataCotacao.codCotacao;
    let codEmpresa = this.dataCotacao.codEmpresa;
    let codFormaPagamento = this.dataCotacao.codFormaPagamento;
    let valorProposta = this.dataCotacao.valorProposta;
    let valorIcmsSt = this.dataCotacao.valorIcmsSt;

    this.cotacoesService
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
      });
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
