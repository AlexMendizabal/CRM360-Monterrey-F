export interface ISimilaridade {
  codSimilaridade: number;
  codLinha?: number;
  codClasse?: number;
  codGrupos?: number;
  codMaterial: number;
  nomeMaterial: string;
  codSituacao: number;
  situacao?: string;
  codUsuario?: number;
  nomeUsuario?: string;
  materiais?: Array<any>;
}
