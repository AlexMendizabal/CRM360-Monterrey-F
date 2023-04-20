import { TipoLinhas } from './tipo-linhas';
export interface TipoComissionamento {
  codTipoComissionamento: number;
  dsTiposComissionamento: string;
  codSituacao: number;
  qtdeRegistros: number;
  situacao: string;
  codUsuario: string;
  nomeUsuario: string;
  dataCadastro: string;
  linhas: Array<TipoLinhas>;
}
