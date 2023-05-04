export interface IMateriaisContrato {
  codAssociacao: number;
  codLinha: number;
  codMaterial: number;
  codclasse: number;
  nomeMaterial: string;
  quantidade: number;
  valor: number;
  unidade: string;
}

export interface IContrato {
  codContrato: number;
  codLinha: number;
  codClasse: number;
  codSituacao: number;
  codStatus: number;
  nomeContrato: string;
  motivo: string;
  codCliente: number;
  dataInicial: string;
  dataFinal: string;
  nomeUsuario: string;
  quantidade: number;
  materiais?: IMateriaisContrato[];
  total?: number;
}
