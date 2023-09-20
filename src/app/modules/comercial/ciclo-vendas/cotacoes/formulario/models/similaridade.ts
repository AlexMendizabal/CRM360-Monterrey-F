// Interfaces
import { IMateriaisModel } from './materiais';

export interface ISimilaridadeModel extends IMateriaisModel {
  codMaterialSimilaridade: number;
  nomeMaterialSimilaridade: string;
  codMaterialComplemento: number;
  nomeMaterialComplemento: string;
  pathImage: string;
  onCarrinho: boolean;
  id_linea: number;
  nombre_linea:string;
  largo_material:any;
}
