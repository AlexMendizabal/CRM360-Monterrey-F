import { array } from '@amcharts/amcharts4/core';

export interface descricaoTabela {
  codTabela: number,
  nomeTabela: string;
  dataInicialVigencia: string;
  dataFinalVigencia: string;
  codSituacao: number;
  nomeUsuario: string,
  dataCadastro: string,
  grupos?: assocTabela[];
};

export interface assocTabela {
  codGrupo: number,
  de: string,
  ate: string,
  valorComissao: string,
  valorFixo: string,
};

export interface precos {
  codAssociacao: number,
  codEmpresa: number,
  nomeEmpresa: string,
  ufDestino: string;
  valorMaterial: number,
};

