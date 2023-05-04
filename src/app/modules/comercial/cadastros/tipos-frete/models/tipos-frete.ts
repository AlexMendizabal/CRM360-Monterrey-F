export interface ITiposFrete {
  codigo: number;
  codTipoFrete: number;
  descricao: string;
  codSituacao: number;
  situacao: string;
  codUsuario?: string;
  nomeUsuario?: string;
  dataCadastro?: string;
}
