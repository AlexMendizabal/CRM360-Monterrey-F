import { Component, OnInit } from '@angular/core';

// Services
import { AuthService } from 'src/app/shared/services/core/auth.service';
import { TitleService } from 'src/app/shared/services/core/title.service';

@Component({
  selector: 'core-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class CoreHomeComponent implements OnInit {
  user: any = [];
  userName: string;

  constructor(
    private authService: AuthService,
    private titleService: TitleService
  ) {}

  ngOnInit() {
    this.titleService.setTitle('Seja bem-vindo(a)');
    this.getCurrentUser();
  }

  getCurrentUser() {
    this.user = this.authService.getCurrentUser()['info'];

    if (
      this.user['nomeAbreviado'].trim() != null ||
      this.user['nomeAbreviado'].trim() != ''
    ) {
      this.userName = `Seja bem-vindo(a) ${this.user['nomeAbreviado']}!`;
    } else if (
      this.user['nomeCompleto'].trim() != null ||
      this.user['nomeCompleto'].trim() != ''
    ) {
      this.userName = `Seja bem-vindo(a) ${this.user['nomeCompleto']}!`;
    }
  }
}
