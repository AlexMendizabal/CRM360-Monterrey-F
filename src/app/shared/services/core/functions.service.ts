import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FunctionsService {
  completaZeroEsquerda(valor: any, tamanho: number): string {
    if (valor === null) return null;

    valor = valor.toString();
    valor = valor.trim();

    if (valor.length < tamanho) {
      for (let i = valor.length; i < tamanho; i++) {
        valor = `0${valor}`;
      }
    }

    return valor;
  }
}
