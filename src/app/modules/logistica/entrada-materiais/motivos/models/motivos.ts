export interface ILogisticaEntradaMateriaisMotivos {
  ID_LOGI_ENTR_MATE_MOTI: number;
  DS_LOGI_ENTR_MATE_MOTI: number;
  DS_LOGI_ENTR_MATE_CATE_MOTI: number;
  IN_STAT: number; //Status do Item (Ativo/Inativo)
  DS_OBSE: string;
  MATR_USUA_CADA:number;
  DS_USUA_CADA: string;
  DT_INCL: string; // Data de Cadastro do Item
}
