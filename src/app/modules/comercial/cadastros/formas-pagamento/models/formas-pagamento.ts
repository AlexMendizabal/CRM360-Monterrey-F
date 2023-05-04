export interface FormasPagamento {
  codFormaPagamento: number;
  descricao: number;
  codFormaPagamentoERP: number;
  codTipoPerc?: number;
  codValorPerc?: number;
  qtdeParcela?: number;
  codTipoDia?: number;
  qtdeDias?: any;
  codSituacao?: number;
  situacao?: string;
  editavel?: number;
  percentualAcrescimo?: number;
  percentualDesconto?: number;
}
