export interface ITecnologiaInformacaoItem {
  ID_TECN_INFO_ITEM: number; //ID do Item
  ID_TECN_INFO_ITEM_REFE: number;
  CD_SITU: number;
  NM_ITEM: string; //Nome do Item
  NR_MATR: number;
  CD_CCU: number;
  DS_CONT: string;
  DS_OBSE: string;
  ID_TIPO_MOED: number;
  DS_TIPO_MOED: string;
  ID_TECN_INFO_ITEM_STAT: number; //Status do Item (Ativo/Inativo)
  DT_INCL: string; // Data de Cadastro do Item
  CD_ITEM: string; //Código/NºSérie do Item
  VL_ITEM: number; //Valor do Item
  ID_TEIN_ESTO_PROD: number; //ID do Produto
  NM_PROD: string;
  ID_TECN_INFO_CONT: number;
  DS_DOCU: string; // Descrição do Documento
  QT_DOCU: number; //Quantidade de Documento no item
  NM_USUA: string; // Nome do Usuario
  NM_CCU: string; //Nome do Centro de Custo
  NM_USUA_CADA: string;
  NR_MATR_CADA: number;
  ID_TECN_INFO_ITEM_DOCU: number;
  CD_STAT_USUA: number;
  DS_STAT_USUA: string;
  DS_COR_STAT_USUA: string;
}
