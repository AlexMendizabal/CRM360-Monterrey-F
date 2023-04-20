import { Component, OnInit } from '@angular/core';

import { TitleService } from 'src/app/shared/services/core/title.service';

@Component({
  selector: 'abastecimento-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class AbastecimentoHomeComponent implements OnInit {
  constructor(
    private titleService: TitleService,
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle('Home');      
  }
}
