export interface ILinha {
  ID_LINH: number;
  NM_LINH: string;
  IN_STAT: number;
  ID_SETO_ATIV: number;
  DESCRICAO: string;
  situacao?: string;
  codUsuario?: number;
  nomeUsuario?: string;
  setores?: Array<any>;
}
