export interface ICalculoModel {
  index: number;
  tipoCalculo: number;
  tonelada: number;
  qtde: number;
  valorUnitario: number;
  valorItem: number;
  aliquotaIpi: number;
  valorIpi: number;
  aliquotaIcms: number;
  valorIcms: number;
  valorIcmsSt: number;
  valorTotal: number;
  valorBaseIcmsSt: number;
  aliquotaReducaoIcms: number;
  tipoLancamento: number;
  unidade: string;
  medida: number;
  nrPedidoCliente: string;
  codItemPedidoCliente: string;
  codProdutoCliente: string;
  totalMaterial:number;
  pesoEspecifico:number;
  valorTotalBruto:number;
  presentacionSeleccionado:number;
  calculo: number;
  descuentoAplicado: number;
}
