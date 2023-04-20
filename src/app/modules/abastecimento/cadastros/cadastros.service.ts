import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AbastecimentoCadastrosService {

  private readonly BASE_URL = environment.API;

  constructor(
    private httpClient: HttpClient
    ) { }

}
