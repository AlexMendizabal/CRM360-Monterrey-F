import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class EstadosService {
  estados: any = [
    {
      sigla: 'AC',
      descricao: 'Acre',
    },
    {
      sigla: 'AL',
      descricao: 'Alagoas',
    },
    {
      sigla: 'AP',
      descricao: 'Amapá',
    },
    {
      sigla: 'AM',
      descricao: 'Amazonas',
    },
    {
      sigla: 'BA',
      descricao: 'Bahia',
    },
    {
      sigla: 'CE',
      descricao: 'Ceará',
    },
    {
      sigla: 'DF',
      descricao: 'Distrito Federal',
    },
    {
      sigla: 'ES',
      descricao: 'Espírito Santo',
    },
    {
      sigla: 'GO',
      descricao: 'Goiás',
    },
    {
      sigla: 'MA',
      descricao: 'Maranhão',
    },
    {
      sigla: 'MT',
      descricao: 'Mato Grosso',
    },
    {
      sigla: 'MS',
      descricao: 'Mato Grosso do Sul',
    },
    {
      sigla: 'MG',
      descricao: 'Minas Gerais',
    },
    {
      sigla: 'PA',
      descricao: 'Pará',
    },
    {
      sigla: 'PB',
      descricao: 'Paraíba',
    },
    {
      sigla: 'PR',
      descricao: 'Paraná',
    },
    {
      sigla: 'PE',
      descricao: 'Pernambuco',
    },
    {
      sigla: 'PI',
      descricao: 'Piauí',
    },
    {
      sigla: 'RJ',
      descricao: 'Rio de Janeiro',
    },
    {
      sigla: 'RN',
      descricao: 'Rio Grande do Norte',
    },
    {
      sigla: 'RS',
      descricao: 'Rio Grande do Sul',
    },
    {
      sigla: 'RO',
      descricao: 'Rondônia',
    },
    {
      sigla: 'RR',
      descricao: 'Roraima',
    },
    {
      sigla: 'SC',
      descricao: 'Santa Catarina',
    },
    {
      sigla: 'SP',
      descricao: 'São Paulo',
    },
    {
      sigla: 'SE',
      descricao: 'Sergipe',
    },
    {
      sigla: 'TO',
      descricao: 'Tocantins',
    },
  ];

  getEstados() {
    return this.estados;
  }
}
