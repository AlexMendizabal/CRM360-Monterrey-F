export interface ILogisticaEntradaMateriaisPainelAprovacoes {
  ID_LOGI_ENTR_MATE_APRO: number;
  NM_LOGI_ENTR_MATE_NOME_SOLI: string;
  MT_LOGI_ENTR_MATE_NOME_SOLI: number;
  ID_LOGI_ENTR_MATE_MOTI: number;
  DS_LOGI_ENTR_MATE_MOTI: string;
  IN_STAT: number; //Status do Item (Ativo/Inativo)
  DT_SOLI:string; // Data da Solicitação
  DS_SOLI:string; // Descrição da solicitação
  DT_INIC: string;
  DT_FINA: string;
  DT_APROV: string;
  DS_OBSE: string;
  MATR_USUA_CADA:number;
  DS_USUA_CADA: string;
  DT_INCL: string; // Data de Cadastro do Item
}
