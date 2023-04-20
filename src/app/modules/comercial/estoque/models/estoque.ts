export interface Estoque {
  id: number;
  descricao: string;
  medida: string;
  pedCompra: number;
  estoqueAtual: number;
  estoqueSuspenso: number;
  estoqueComprometido: number;
  estoqueDisponivel: number;
  linha: string;
  classe: string;
  pedido: number;
}
