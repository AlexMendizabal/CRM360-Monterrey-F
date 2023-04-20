export interface ReenvioXml {
  numNfe: number;
  pedido: number;
  enviado: number;
  dtEnvio: string;
  dtFaturamento: string;
  idEmpresa: number;
  dsEmpresa: string;
  empresa: string;
  codCliente: number;
  nomeFantasia: string;
  nomeVendedor: string;
  idVendedorCliente: number;
  idVendedorNF: number;
  contatos: {
    email1: string;
    email2: string;
    email3: string;
  };
}
