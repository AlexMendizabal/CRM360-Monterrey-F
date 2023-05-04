import { array } from '@amcharts/amcharts4/core';

export interface descricaoTabela {
  codPreco: number;
  nomePreco: string;
  dataInicialVigencia: string;
  dataFinalVigencia: string;
  codSituacao: number;
  nomeUsuario: string;
  dataCadastro: string;
  grupos?: assocTabela[];
}

export interface assocTabela {
  codGrupo: number;
  nomeGrupo: string;
  precos?: precos[];
}

export interface precos {
  codPreco: number;
  codEmpresa: number;
  nomeEmpresa: string;
  ufDestino: string;
  valorMaterial: number;
}
