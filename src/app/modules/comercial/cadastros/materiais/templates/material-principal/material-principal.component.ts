import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  SimpleChange,
  SimpleChanges,
  OnChanges,
} from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';

// Services
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { ComercialService } from 'src/app/modules/comercial/comercial.service';

// Interfaces
import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';
import { JsonResponse } from 'src/app/models/json-response';

@Component({
  selector: 'comercial-cadastros-materiais-templates-material-principal',
  templateUrl: './material-principal.component.html',
  styleUrls: ['./material-principal.component.scss'],
})
export class ComercialCadastrosMateriaisTemplatesMaterialPrincipalComponent
  implements OnInit, OnChanges {
  @Input('linhas') linhas: any[] = [];
  @Input('classes') classes: any[] = [];

  @Input('limparMaterialSelecionado') limparMaterialSelecionado: boolean;

  @Output('loaderNavbar') loaderNavbar: EventEmitter<
    boolean
  > = new EventEmitter();
  @Output('materialPrincipal') materialPrincipal: EventEmitter<
    object
  > = new EventEmitter();

  tableConfigMateriais: Partial<CustomTableConfig> = {
    fixedHeader: false,
    bodyHeight: 243,
  };

  form: FormGroup;

  filteredClasses: Array<any> = [];
  materiais: Array<any> = [];
  materiaisLoader: boolean;

  searching = false;
  firstSearch = false;

  materiaisLista: Array<any> = [];
  materiaisListaLoaded = false;
  materiaisListaEmpty = false;

  codMaterialSelecionado: number = null;

  constructor(
    private formBuilder: FormBuilder,
    private pnotifyService: PNotifyService,
    private comercialService: ComercialService
  ) {
    this.pnotifyService.getPNotify();
  }

  ngOnInit(): void {
    this.setFormBuilder();
  }

  ngOnChanges(events: SimpleChanges): void {
    if (
      events.limparMaterialSelecionado &&
      events.limparMaterialSelecionado.currentValue === true
    ) {
      this.setMaterialSelecionado(null);
    }
  }

  setFormBuilder(): void {
    this.form = this.formBuilder.group({
      codLinha: [null, [Validators.required]],
      codClasse: [null, [Validators.required]],
      codMaterial: [null, [Validators.required]],
    });
  }

  onFilter(): void {
    if (this.form.valid) {
      this.loaderNavbar.emit(true);
      this.searching = true;
      this.materiaisLista = [];
      this.materiaisListaLoaded = false;
      this.materiaisListaEmpty = false;

      let params = {
        codClasse: this.form.value.codClasse,
      };

      if (this.form.value.codMaterial !== 0) {
        Object.assign(params, {
          codMaterial: this.form.value.codMaterial,
        });
      }

      this.comercialService
        .getMateriais(params)
        .pipe(
          finalize(() => {
            this.firstSearch = true;
            this.searching = false;
            this.loaderNavbar.emit(false);
            this.materiaisListaLoaded = true;
          })
        )
        .subscribe(
          (response: JsonResponse) => {
            if (
              response.hasOwnProperty('success') &&
              response.success === true
            ) {
              this.materiaisLista = response.data;

              if (this.materiaisLista.length > 9) {
                this.tableConfigMateriais.fixedHeader = true;
              } else {
                this.tableConfigMateriais.fixedHeader = false;
              }
            } else if (
              response.hasOwnProperty('success') &&
              response.success === false &&
              response.hasOwnProperty('mensagem')
            ) {
              this.pnotifyService.error(response.mensagem);
              this.materiaisListaEmpty = true;
            } else {
              this.pnotifyService.error();
              this.materiaisListaEmpty = true;
            }
          },
          (error: any) => {
            if (error['error'].hasOwnProperty('mensagem')) {
              this.pnotifyService.error(error.error.mensagem);
            } else {
              this.pnotifyService.error();
            }
          }
        );
    }
  }

  onCheckMaterial(material: any): void {
    this.setMaterialSelecionado(material.codigoMaterial);
    this.materialPrincipal.emit(material);
  }

  setMaterialSelecionado(codMaterial: number): void {
    this.codMaterialSelecionado = codMaterial;
  }

  onChangeLinha(codLinha: number) {
    this.form.controls.codClasse.reset();
    this.form.controls.codClasse.setValue(null);
    this.form.controls.codClasse.enable();
    this.form.controls.codClasse.setValidators([Validators.required]);
    this.form.controls.codClasse.updateValueAndValidity();

    this.form.controls.codMaterial.reset();
    this.form.controls.codMaterial.disable();
    this.form.controls.codMaterial.setValue(null);
    this.form.controls.codMaterial.updateValueAndValidity();

    this.filteredClasses = this.classes.filter(
      (value: any) => value.idLinha == codLinha
    );
  }

  onChangeClasse(codClasse: number) {
    this.form.controls.codMaterial.reset();
    this.form.controls.codMaterial.enable();
    this.form.controls.codMaterial.setValue(null);
    this.form.controls.codMaterial.updateValueAndValidity();

    this.getMateriais(codClasse);
  }

  getMateriais(codClasse: number): void {
    if (typeof codClasse !== 'undefined' && codClasse !== null) {
      this.materiaisLoader = true;
      this.materiais = [];

      this.comercialService
        .getMateriais({
          codClasse: codClasse,
        })
        .pipe(
          finalize(() => {
            this.materiaisLoader = false;
          })
        )
        .subscribe(
          (response: JsonResponse) => {
            if (response.success === true) {
              this.materiais = response.data;

              this.materiais.unshift({
                codigoMaterial: 0,
                codigoDescricaoMaterial: 'EXIBIR TODOS',
              });

              this.form.controls.codMaterial.setValue(0);
            } else {
              this.pnotifyService.error();
            }
          },
          (error: any) => {
            if (error['error'].hasOwnProperty('mensagem')) {
              this.pnotifyService.error(error.error.mensagem);
            } else {
              this.pnotifyService.error();
            }
          }
        );
    }
  }
}
