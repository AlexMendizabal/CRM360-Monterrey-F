export interface ILogisticaYmsAssociacaoEtapas {
  ID_LOGI_YMS_ETAP :number;
  ID_LOGI_YMS_CHEC:number;
  NM_CHEC: string;
  NM_ETAP: string;
  IN_STAT: number; //Status (Ativo/Inativo)
  DS_OBSE: string;
  NR_MATR: number;
  NM_USUA: string;
  DT_INCL: string; // Data de Cadastro
  DT_ATUA: string;
}
