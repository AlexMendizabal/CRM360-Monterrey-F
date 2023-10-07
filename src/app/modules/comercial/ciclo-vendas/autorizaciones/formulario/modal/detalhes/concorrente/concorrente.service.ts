import { Injectable, EventEmitter } from '@angular/core';
import { finalize } from 'rxjs/operators';

// ngx-bootstrap
import { BsModalService } from 'ngx-bootstrap/modal';

// Components
import { ComercialCicloVendasCotacoesFormularioModalDetalhesConcorrenteComponent } from './concorrente.component';

// Services
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { ComercialCadastrosConcorrenteService } from 'src/app/modules/comercial/cadastros/concorrentes/concorrentes.service';

// Interfaces
import { JsonResponse } from 'src/app/models/json-response';

@Injectable({
  providedIn: 'root',
})
export class ComercialCicloVendasCotacoesFormularioModalDetalhesConcorrenteService {
  loaderNavbar: EventEmitter<boolean> = new EventEmitter();

  constructor(
    private modalService: BsModalService,
    private pnotifyService: PNotifyService,
    private concorrenteService: ComercialCadastrosConcorrenteService
  ) {
    this.pnotifyService.getPNotify();
  }

  showModal(codConcorrenteTid: number): void {
    this.loaderNavbar.emit(true);

    this.concorrenteService
      .getConcorrente(codConcorrenteTid)
      .pipe(
        finalize(() => {
          this.loaderNavbar.emit(false);
        })
      )
      .subscribe(
        (response: JsonResponse) => {
          if (response.success === true) {
            const modalConfig = {
              animated: false,
            };

            const initialState = {
              concorrente: response.data,
            };

            this.modalService.show(
              ComercialCicloVendasCotacoesFormularioModalDetalhesConcorrenteComponent,
              Object.assign({}, modalConfig, {
                initialState,
              })
            );
          } else {
            this.pnotifyService.error();
          }
        },
        (error: any) => {
          this.pnotifyService.error();
        }
      );
  }
}
