export interface IComercialGestaoLiberacoes {
  idAprovacao?: number; 
  nomeVendedor: string; 
  matrVendedor: number; 
  gerenciaVendedor: string;
  idMotivoSolic: number; 
  descMotivoSolic: string; 
  tipoData: string;
  dataLancamento: string;
  statusItem: number; //Status do Item (Ativo/Inativo) 
  dtSolic:string; // Data da Solicitação 
  descSolic:string; // Descrição da solicitação 
  codCli:number;
  razaoSocialCli:string;
  cnpjCli:string;
  dtInicial: string;
  dtFinal: string;
  dtAprov: string;
  descObs: string;
  matrUsuarioCad:number;
  dtPedido: string;
  nfPedido:number;
  formaPagtoPedido: string;
  enderecoPedido: string;
  depositoPedido: string;
  empresaPedido: string;
  situaPedido: string;
  numPedido: string;
  valorPedido: number;
  pesoPedido: number;
  linhaPredominante: string;
  descUsuarioCad: string;
  dtInclusao: string; // Data de Cadastro do Item
}
