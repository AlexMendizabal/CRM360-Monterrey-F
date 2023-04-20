import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable } from 'rxjs';

// Services
import { FormRulesService } from 'src/app/shared/services/core/form-rules.service';

@Injectable({
  providedIn: 'root'
})
export class ComercialClientesCadastroEnderecosRulesResolverGuard
  implements Resolve<any> {
  constructor(private formRulesService: FormRulesService) {}

  resolve(): Observable<any> {
    return this.formRulesService.getRules(2);
  }
}
