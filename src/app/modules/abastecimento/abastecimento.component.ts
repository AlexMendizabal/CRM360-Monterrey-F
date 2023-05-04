import { Component, OnInit } from '@angular/core';

import { TitleService } from 'src/app/shared/services/core/title.service';

@Component({
  selector: 'abastecimento',
  templateUrl: './abastecimento.component.html',
  styleUrls: ['./abastecimento.component.scss']
})
export class AbastecimentoComponent implements OnInit {
  constructor(
    private titleService: TitleService,
  ) {}

  ngOnInit() {
    this.titleService.setTitle('Abastecimento');
  }
}
