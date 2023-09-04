import { Injectable } from "@angular/core";

import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class ComercialComissoesVendedoresInternosProgramacaoPagamentosService{

    private readonly API = `http://23.254.204.187/api/comercial/comissoes/vendedores-internos/`

    constructor(protected http: HttpClient) {}
}
