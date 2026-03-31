export interface IMaterial {
  ID_CODIGOMATERIAL: number;
  CODIGOMATERIAL: string;
  DESCRICAO: string;
  id_unidad:number;
  SIGLAS_UNI: string;
  id_lista: number;
  cantidad: number;
  PESO: number;
  id_tipo_cliente: number;
  lista_cliente:number;
  descuento: number;
  descuento_permitido: number;
  pesoEspecifico:number;
  precio: number;
  preciobruto: number;
  descuenttoneladao:number;
  totalbs:number;
  valorTotal: number;
  valorTotalBruto: number;
  almacen:string;
  stock:number;
  modoEntrega:number;
}

