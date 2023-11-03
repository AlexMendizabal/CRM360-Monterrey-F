import { Injectable } from "@angular/core";

import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class ComercialComissoesVendedoresInternosService{

    private readonly API = `http://23.254.204.187/api/comercial/comissoes/`

    constructor(protected http: HttpClient) {}
}
