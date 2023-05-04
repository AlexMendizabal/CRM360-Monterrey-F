export interface IGrupo {
  codGrupo: number;
  nomeGrupo: string;
  codSituacao: number;
  situacao?: string;
  inSituacao?: string;
  codUsuario?: number;
  nomeUsuario?: string;
  materiais?: Array<any>;
}
