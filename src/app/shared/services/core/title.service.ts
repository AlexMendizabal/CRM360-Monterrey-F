import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';

// Services
import { ModulosService } from '../requests/modulos.service';

// Pipes
import { UpperCasePipe } from '../../pipes/upper-case.pipe';

@Injectable({
  providedIn: 'root'
})
export class TitleService {
  constructor(
    private title: Title,
    private modulosService: ModulosService,
    private upperCase: UpperCasePipe
  ) {}

  setTitle(newTitle: string): void {
    if (newTitle.length > 0) {
      const currenteModule = this.modulosService.getCurrentModule();
      let moduleName = '';

      if (
        currenteModule !== null &&
        typeof currenteModule['nome'] !== 'undefined'
      ) {
        moduleName = `${currenteModule['nome']} -`;
      }

      this.title.setTitle(
        `${this.upperCase.transform(newTitle)} | ${this.upperCase.transform(
          moduleName
        )} MTCORP`
      );
    }
  }

  resetTitle(): void {
    this.title.setTitle('MTCORP');
  }
}
