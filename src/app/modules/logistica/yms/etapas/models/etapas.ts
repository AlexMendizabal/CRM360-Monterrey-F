export interface ILogisticaYmsEtapas {
  UUID_LOGI_YMS_ETAP: number;
  UUID_LOGI_YMS_ETAP_TIPO: number;
  NM_ETAP: string;
  ID_LOGI_YMS_SETO: number;
  NM_ETAP_TIPO: string;
  NM_SETO: string;
  ID_LOGI_YMS_CIRC: number;
  NM_CIRC: string;
  IN_STAT: number; //Status (Ativo/Inativo)
  DS_OBSE: string;
  NR_MATR: number;
  NM_USUA: string;
  DT_INCL: string; // Data de Cadastro
  DT_ATUA: string;
  IN_PAGI: number;
}
