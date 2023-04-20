import { Injectable } from "@angular/core";

import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class ComercialComissoesVendedoresInternosProgramacaoPagamentosService{

    private readonly API = `https://crm360.monterrey.com.bo/api/comercial/comissoes/vendedores-internos/`

    constructor(protected http: HttpClient) {}
}
