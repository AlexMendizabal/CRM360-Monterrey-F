
export interface ILogisticaEntradaMateriaisFichaConformidade {
  ID_LOGI_ENMA_FHNC: number
  ID_LOGI_ENMA_FHNC_TIPO: number;
  DS_UNID_MEDI: string;
  NM_TIPO: string;
  IN_STAT: number; //Status do Item (Ativo/Inativo)
  DS_OBSE: string;
  NM_MATE: string;
  NM_FORN: string;
  DS_LOTE: string;
  IN_CONC: number;
  NR_NOTA_FISC: number;
  MATR_USUA_CADA:number;
  DS_USUA_CADA: string;
  DT_INCL: string; // Data de Cadastro do Item
  IN_RESP: string;
}
