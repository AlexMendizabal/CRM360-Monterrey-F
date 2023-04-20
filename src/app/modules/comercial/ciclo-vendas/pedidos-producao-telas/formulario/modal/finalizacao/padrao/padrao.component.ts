import { ComercialCicloVendasPedidosProducaoTelasService } from './../../../../pedidos-producao-telas.service';
import { Component, OnInit, AfterViewChecked, Input } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

// ngx-bootstrap
import { BsModalRef } from 'ngx-bootstrap/modal';

// Services
import { AuthService } from 'src/app/shared/services/core/auth.service';
import { ComercialCicloVendasPedidosProducaoTelasFormularioService } from '../../../formulario.service';

// Interfaces
import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';
import { JsonResponse } from 'src/app/models/json-response';

@Component({
  selector:
    'comercial-ciclo-vendas-pedidos-producao-telas-formulario-modal-finalizacao-padrao',
  templateUrl: './padrao.component.html',
  styleUrls: ['./padrao.component.scss'],
})
export class ComercialCicloVendasPedidosProducaoTelasFormularioModalFinalizacaoPadraoComponent
  implements OnInit, AfterViewChecked {
  @Input('dataCotacao') dataCotacao: any;

  viewChecked = false;

  user = {
    idVendedor: 88,
    idEscritorio: 58,
  };

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

  comissao = 0;
  comissaoLoaded: boolean;

  constructor(
    private router: Router,
    private bsModalRef: BsModalRef,
    private authService: AuthService,
    private cotacoesService: ComercialCicloVendasPedidosProducaoTelasService,
    private formularioService: ComercialCicloVendasPedidosProducaoTelasFormularioService
  ) {}

  ngOnInit(): void {
    // this.user = this.authService.getCurrentUser().info;
  }

  ngAfterViewChecked() {
    if (this.dataCotacao) {
      this.setViewChecked();
    }
  }

  setViewChecked(): void {
    this.loadComponentData();
    this.viewChecked = true;
  }

  loadComponentData(): void {
    this.getComissao();
  }

  onClose(): void {
    this.formularioService.limparCarrinhoSubject.next(true);

    this.bsModalRef.hide();

    setTimeout(() => {
      this.router.navigate(['/comercial/ciclo-vendas/cotacoes-pedidos/lista']);
    }, 100);
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
        this.cotacoesService
          .getComissaoCotacao(
            this.dataCotacao.codCotacao,
            this.dataCotacao.codEmpresa
          )
          .pipe(
            finalize(() => {
              this.comissaoLoaded = true;
            })
          )
          .subscribe((response: JsonResponse) => {
            if (response.success === true) {
              this.comissao = response.data.valorComissao;
            }
          });
      }
    }
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
