import { array } from '@amcharts/amcharts4/core';

export interface descricaoTabela {
  codTabela: number,
  nomeTabela: string,
  dataInicial: string,
  dataFinal: string;
  situacao: number,
  nomeUsuario: string,
  dataCadastro: string,
  vendedor?: dadosVendedores[],
  
};

export interface dadosVendedores{
  codVendedor: number,
  nomeVendedor: string,
  escritorio: number,
  kpi?: dadosKpis[]
}

export interface dadosKpis {
  codKpi: number,
  descKpi: string,
  porcGanho: number,
  meta: number,
  totalRealizado: number,
  porcAlcancado: number,
  potencialGanho: number,
  ganhoEfetivo: number,
};

export interface precos {
  codAssociacao: number,
  codEmpresa: number,
  nomeEmpresa: string,
  ufDestino: string;
  valorMaterial: number,
};

