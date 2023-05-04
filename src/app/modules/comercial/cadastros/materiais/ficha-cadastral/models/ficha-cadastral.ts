import { IAnexo } from '../models/anexo';

export interface FichaCadastral {
  codFichaCadastral: number;
  codMaterial: number;
  nomeMaterial: string;
  descMaterial: string;
  codSituacao: number;
  situacao?: string;
  codUsuario?: number;
  nomeUsuario?: string;
  anexos?: Partial<IAnexo>;
}
