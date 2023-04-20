import { array } from '@amcharts/amcharts4/core';

export interface representantes {
  codProgramacao: number,
  cnpj: string;
  razaoSocial: string;
  valorTotal: number;
  valorLiquido: number;
  retencoes: string,
};

export interface dadosBancarios {
  bancoRepresentante: string,
  tipoConta: string,
  agencia: number,
  titular: string,
  contaCorrente: number,
};


