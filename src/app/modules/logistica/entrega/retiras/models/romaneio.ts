export interface ILogisticaEntregaFormacaoCargaRomaneio {
  ID_LOGI_MOTO: number;
  ID_LOGI_VEIC: number;
  ID_LOGI_ROMA: number;
  CD_EMPR: number;
  PLAC: string;
  NM_MOTO: string;
  CPF: string;
  IN_STAT: string;
  DT_INCL: string;
  DS_OBSE?: string;
  TP_EMPR: string;
}