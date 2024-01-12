export interface IMateriaisCrossSell {
  codAssociacao: number;
  codLinha: number;
  codMaterial: number;
  codclasse: number;
  codGrupos?: number;
  nomeMaterial: string;
  unidade: string;
}

export interface ICrossSell {
  codCrossSell: number;
  codLinha?: number;
  codClasse?: number;
  codGrupos?: number;
  codMaterial: number;
  nomeMaterial: string;
  maisVendidos?: number;
  codSituacao?: number;
  codUsuario?: number;
  nomeUsuario?: string;
  materiais?: Array<IMateriaisCrossSell>;
  total?: number;
}
