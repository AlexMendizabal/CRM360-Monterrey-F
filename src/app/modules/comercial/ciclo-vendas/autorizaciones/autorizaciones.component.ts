import {Component, Injectable, OnInit} from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import {TitleService} from '../../../../shared/services/core/title.service';



@Component({
  // tslint:disable-next-line:component-selector
  selector: 'autorizaciones',
  templateUrl: './autorizaciones.component.html',
  styleUrls: ['./autorizaciones.component.scss']
})

@Injectable({
  providedIn: 'root',
})
export class AutorizacionesComponent implements OnInit {
  private readonly API = `http://127.0.0.1:8000/comercial/ciclo-vendas/autorizaciones`;
  constructor(
    protected http: HttpClient,
    private titleService: TitleService
  ) { }
  ngOnInit(): void {
    this.titleService.setTitle('Autorizaciones');
  }

}


