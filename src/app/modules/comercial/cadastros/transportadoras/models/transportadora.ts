export interface Transportadora {
  codTransportadoraTid: number;
  nomeTransportadora: string;
  cnpj: number;
  ie: number;
  cpf: number;
  rg: number;
  tipoPessoa: string;
  logradouro: string;
  cidade: string;
  uf: string;
  fretePorConta: string;
  placaVeiculo: string;
  ufVeiculo: string;
  consideraComoEntregue: number;
  recebeCotacoesFrete: number;
  autorizaDownloadXml: number;
}
