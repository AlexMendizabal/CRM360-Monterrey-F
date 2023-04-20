export interface IAssociacao {
  codAssociacao: number;
  descLegenda: string;
  ordemExibicao: string;
  cor: any;
  codSituacao: number;
  situacao?: string;
  codUsuario?: number;
  nomeUsuario?: string;
  situacoesAssociadas?: Array<any>;
}
