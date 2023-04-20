export interface ITecnologiaInformacaoMovimentacoes {
  IN_STAT: number; //Status do Item (Ativo/Inativo)
  UUID_EMPR: number;
  ID_TEIN_ESTO_PRMA:number;
  ID_TECN_INFO_ESTO_MOVI_TIPO: number;
  ID_TEIN_ESTO_PROD: number;
  NR_NOTA_FISC: number;
  NM_MRCA: string;
  NM_TIPO: string;
  IN_CODI_SERI: string;
  DS_UNID_MEDI: string;
  NM_PROD: string;
  NM_USUA_CADA: string;
  CD_REFE: string;
  CD_PEDI: string;
  IN_ITEM_NUM_SERI: number;
  ID_TECN_INFO_MOVI: number; //ID do Item
  DT_INCL: string; // Data de Cadastro do Item
  NM_ITEM_TIPO: string;
  NM_MODE: string;
  CD_ITEM: number;
  TT_ESTO_ATUA: number;
  DS_OBSE: string;
  VL_UNIT: string;
}
