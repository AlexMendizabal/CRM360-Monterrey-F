export interface ITecnologiaInformacaoContrato {
  ID_TECN_INFO_CONT: number; //ID do Contrato
  ID_TECN_INFO_CONT_REFE: number; //ID do contrato pai
  DS_CONT: string; //Descrição do Contrato
  IN_STAT: string; //Status do Contrato (Ativo/Inativo)
  IN_VL_VARI: number;
  DT_INCL: Date; // Data de Cadastro do Contrato
  DT_INIC: Date; // Data de Inicio do Contrato
  DT_VENC: Date; // Data de Fim de Contrato
  PRAZ_CANC: Date; // Prazo de Cancelamento
  VL_CONT: number; //Valor do Contrato
  MULT_CANC: number; // Multa de Cancelamento
  ID_TECN_INFO_CONT_TIPO: number; //ID para vinculo de Tipo de Contrato
  DS_DOCU: string; // Descrição do Documento
  NM_USUA_CADA: string;
  IN_SELE: boolean; // Seleção do Item no Modal
  QT_DOCU: number; //Quantidade de Documento no Contrato
  DS_OBSE: string; // Observação do registro
  NM_CONT_TIPO: string; //Nome do tipo de contrato
  NM_USUA: string; //Usuário de cadastro do contrato
  DS_STAT_VENC: string; //Descrição do status de vencimento do contrato
  ID_MOED: number;
  SG_MOED: string;
  PREF_MOED: string;
  IN_ITEM_COMP: number;
  NM_MOED: string;
  INTE_REAJ: number;
  ID_INDI: string;
  CD_EMPR: number[];
}
