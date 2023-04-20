import { CNPJPipe } from './cnpj.pipe';
import { ModuleWithProviders, NgModule } from '@angular/core';

// Pipes
import { CapitalizeFirstPipe } from './capitalize-first.pipe';
import { NamePipe } from './name.pipe';
import { SafePipe } from './safe.pipe';
import { TitleCasePipe } from './title-case.pipe';
import { UpperCasePipe } from './upper-case.pipe';
import { CEPPipe } from './cep.pipe';
import { HifenPipe } from './hifen.pipe';
import { ExpressionTranslatorPipe } from './expression-translator.pipe';

@NgModule({
  declarations: [
    CapitalizeFirstPipe,
    NamePipe,
    SafePipe,
    TitleCasePipe,
    UpperCasePipe,
    CNPJPipe,
    CEPPipe,
    HifenPipe,
    ExpressionTranslatorPipe
  ],
  imports: [],
  exports: [
    CapitalizeFirstPipe,
    NamePipe,
    SafePipe,
    TitleCasePipe,
    UpperCasePipe,
    CNPJPipe,
    CEPPipe,
    HifenPipe,
    ExpressionTranslatorPipe
  ],
  providers: [
    CapitalizeFirstPipe,
    NamePipe,
    SafePipe,
    TitleCasePipe,
    UpperCasePipe,
    CNPJPipe,
    CEPPipe,
    HifenPipe,
    ExpressionTranslatorPipe
  ]
})
export class PipesModule {
  static forRoot(): ModuleWithProviders<PipesModule> {
    return {
        ngModule: PipesModule
    };
}
}
