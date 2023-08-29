export interface IMateriaisMaisComprados {
  quantidade: number;
  valor: number;
}

export interface IMateriaisModel {
  checked: number;
  codClasse: number;
  codContrato: number;
  codDeposito: number;
  codEmpresa: number;
  codLinha: number;
 /*  codMaterial: number; */
  codNcm: number;
  codSituacao: string;
  descNcm: string;
  disponibilidade: number;
  estoqueAtual: number;
  estoqueDisponivel: number;
  fatorMultiplo: number;
  maisComprados?: IMateriaisMaisComprados;
  materialAssociado: number;
  medida1: number;
  medida2: number;
  nomeClasse: string;
  nomeContrato: string;
  nomeDeposito: string;
  nomeEmpresa: string;
  nomeLinha: string;
  nomeMaterial: string;
  nomeSituacao: string;
  percentualIcms: number;
  percentualIpi: number;
  pesoEspecifico: number;
  qtdeMaximaConsumoContrato: number;
  unidade: string;
  valor: number;
  valorIcms: number;
  valorIcmsSt: number;
  valorIpi: number;
  valorMaterialBarra: number;
  valorMaterialContrato: number;
  valorMaterialPreco: number;
  valorServicoApsContrato: number;
  valorServicoContrato: number;
  valorUnit: number;
  qtdeItem: number;
  quantidade: number;
  quantidadeItem: number;
  controladoPorLote: number;
  sequenciaLote: number;
  id_linea: number;
  nombre_linea:string;
  largo_material:any;
}
