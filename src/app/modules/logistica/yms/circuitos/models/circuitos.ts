export interface ILogisticaYmsCircuitos {
  UUID_LOGI_YMS_CIRC: number;
  UUID_LOGI_YMS_ETAP_TIPO: number;
  NM_CIRC_TIPO: string;
  NM_ETAP_TIPO: string;
  UUID_LOGI_FILI: number;
  NM_FILI: string;
  NM_CIRC: string;
  IN_STAT: number; //Status (Ativo/Inativo)
  DS_OBSE: string;
  NR_MATR: number;
  NM_USUA: string;
  DT_INCL: string; // Data de Cadastro
  DT_ATUA: string;
  IN_PAGI: number;
}
