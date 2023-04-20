export interface ILogisticaEntradaMateriaisNotasFiscais {
  ID_LOGI_ENMA_NOFI                     : number;         // ID da NF
  NR_NOTA_FISC                          : number;         // Numero da NF
  NR_NOTA_FISC_REFE                     : number;         // Numero da NF DE REMESSA
  UUID_FORN                             : number;         // ID do fornecedor
  NM_FORN                               : string;         // Descrição do Fornecedor
  ID_LOGI_ENMA_NOFI_STAT                : number;         // ID do Status de Recebimento
  NM_STAT                               : number;         // Descrição do Status de Recebimento
  DS_LOTE                               : string;         // Descrição do lote
  ID_LOGI_ENMA_NFMA_LTDP                : number;         // ID do lote duplicado
  ID_LOGI_ENTR_MATE_MOTI                : number;         // ID do Motivo
  DS_LOGI_ENTR_MATE_UNID_MEDI           : string;         // Descrição do Motivo
  CD_MATE                               : number;         // Código do Material
  UUID_EMPR                             : number;         // ID do Empresa
  UUID_DEPO                             : number;         // ID do Deposito
  NM_EMPR                               : string;         // Descrição do Empresa
  QT_LOGI_ENTR_MATE                     : number;         // Quantidade Total de materiais na nota
  IN_STAT                               : number;         // Status do Item (Ativo/Inativo)
  DS_OBSE                               : string;         // Observação
  DS_MOTI                               : string;         // Descrição do motivo da alteração
  MATR_USUA_CADA                        : number;         // Matricula do Usuario que realizou o cadastro
  DS_USUA_CADA                          : string;         // Nome do Usuario que realizou o cadastro
  DT_INCL                               : string;         // Data de Cadastro do Item
  DT_INIC                               : string;         // Data de Inicio -Filtro
  DT_FINA                               : string;         // Data Final     -Filtro
  NR_MATR                               : number;         // Matricula
  DT_EMIS_NOTA_FISC                     : string;         // Data de emissão da NF
  NM_DEPO                               : string;         // Nome do Depósito
  // Variaveis dos Materiais  
  SEQU_MATE                             : number;         // Sequencia
  ID_MATE                               : number;         // ID do Material
  DS_LOGI_LOTE                          : string;         // Descrição do Lote
  NM_MATE                               : string;         // Descrição do Material
  DS_UNID_MEDI                          : string;         // Descrição da Unidade de Medida
  TT_MATE                               : number;         // Quantidade de Materiais
}       
