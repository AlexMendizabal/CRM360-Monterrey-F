export interface IGrupo {
  codGrupo: number;
  nomeGrupo: string;
  precoGrupo: number;
  codSituacao: number;
  situacao?: string;
  codUsuario?: number;
  nomeUsuario?: string;
  materiais?: Array<any>;
}
