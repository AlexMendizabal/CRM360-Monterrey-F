export interface ITenconologiaInformacaoDocumento {
  ID_TECN_INFO_CONT_DOCU: number; // ID do Documento
  ID_TECN_INFO_CONT: number; //ID do Contrato que será inserido o Documento
  NM_DOCU: string; //Nome do Documento
  LINK: string; // Link do Documento
  IN_STAT: string; // Status do Documento
  DT_CADA_DOCU: string; //Data de Cadastro do Documento
}
