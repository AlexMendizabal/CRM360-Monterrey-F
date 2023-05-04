import { Injectable } from '@angular/core';

// services
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ComercialAknaService {
  private readonly API = environment.API;

  constructor(private http: HttpClient) {}
}
