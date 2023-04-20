export interface IMateriaisCombo {
  codAssociacao: number;
  codLinha: number;
  codMaterial: number;
  codclasse: number;
  nomeMaterial: string;
  quantidade: number;
  unidade: string;
}

export interface ICombo {
  codCombo: number;
  codLinha: number;
  codClasse: number;
  codMaterial: number;
  codSituacao: number;
  nomeMaterial: string;
  nomeUsuario: string;
  quantidade: number;
  materiais?: IMateriaisCombo[];
  total?: number;
}
