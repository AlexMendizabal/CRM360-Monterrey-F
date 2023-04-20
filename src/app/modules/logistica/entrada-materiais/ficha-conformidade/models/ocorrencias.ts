
export interface ILogisticaEntradaMateriaisOcorrencias {
  ID_LOGI_ENMA_FHNC: number
  ID_LOGI_ENMA_FHNC_OCOR: number
  ID_LOGI_ENMA_FHNC_OCPR: number;
  IN_CONC: boolean;
  IN_STAT: number; //Status do Item (Ativo/Inativo)
  DS_OBSE: string;
  MATR_USUA_CADA:number;
  DS_USUA_CADA: string;
  DT_INCL: string; // Data de Cadastro do Item
}
