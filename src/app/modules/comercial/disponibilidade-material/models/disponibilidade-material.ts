export interface DisponibilidadeMaterial {
  codigo: number;
  codMaterial: number;
  nomeMaterial: string;
  codDeposito: number;
  nomeDeposito: string;
  codEmpresa: number;
  nomeEmpresa: string;
  codCliente: number;
  nomeCliente: string;
  razaoSocial: string;
  qtdeMinima: number;
  qtdeMaxima: number;
  unidadeMedida: string;
  codEmailEnviado: number;
  emailEnviado: string;
  dataInicialParametrizacao: string;
  dataFinalParametrizacao: string;
  dataAtualizacao: string;
  codUsuarioAtualizacao: number;
  nomeUsuarioAtualizacao: string;
  codUsuarioRequisicao: number;
  nomeUsuarioRequisicao: string;
  codSituacao: number;
  situacao: string;
}
