import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
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
  selector: 'comercial-cadastros-materiais-templates-associacoes',
  templateUrl: './associacoes.component.html',
  styleUrls: ['./associacoes.component.scss'],
})
export class ComercialCadastrosMateriaisTemplatesAssociacoesComponent
  implements OnInit, OnChanges
{
  @Input('linhas') linhas: any[] = [];
  @Input('classes') classes: any[] = [];
  @Input('grupos') grupos: any[] = [];

  @Input('linhaSelecionada') linhaSelecionada: number = null;
  @Input('classeSelecionada') classeSelecionada: number = null;

  @Output('loaderNavbar') loaderNavbar: EventEmitter<boolean> =
    new EventEmitter();
  @Output('materialAssociado') materialAssociado: EventEmitter<object> =
    new EventEmitter();

  tableConfigMateriais: Partial<CustomTableConfig> = {
    fixedHeader: false,
    bodyHeight: 243,
  };

  form: FormGroup;

  filteredClasses: Array<any> = [];
  filteredGrupos: Array<any> = [];
  materiais: Array<any> = [];
  materiaisLoader: boolean;

  toggleAll = false;
  searching = false;
  firstSearch = false;

  materiaisLista: Array<any> = [];
  materiaisListaLoaded = false;
  materiaisListaEmpty = false;

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
    if (events.linhas && events.linhas.currentValue.length > 0) {
      this.onChangeLinha(this.form.value.codLinha, false);
    }

    if (events.classes && events.classes.currentValue.length > 0) {
      this.onChangeClasse(this.form.value.codClasse);
    }

    if (
      events.linhaSelecionada &&
      events.linhaSelecionada.currentValue !== null &&
      !events.linhaSelecionada.firstChange
    ) {
      //this.setLinhaSelecionada(events.linhaSelecionada.currentValue);
    }

    if (
      events.classeSelecionada &&
      events.classeSelecionada.currentValue !== null &&
      !events.classeSelecionada.firstChange
    ) {
      //this.setClasseSelecionada(events.classeSelecionada.currentValue);
    }
  }

  setFormBuilder(): void {
    this.form = this.formBuilder.group({
      codLinha: [this.linhaSelecionada /* , [Validators.required] */],
      codClasse: [this.classeSelecionada /* , [Validators.required] */],
      codGrupo: [null /* , [Validators.required] */],
      codMaterial: [null, [Validators.required]],
    });
  }

  onFilter(): void {
    /* if (this.form.valid) { */
    this.loaderNavbar.emit(true);
    this.searching = true;
    this.materiaisLista = [];
    this.materiaisListaLoaded = false;
    this.materiaisListaEmpty = false;

    /*  let params = {
        codClasse: this.form.value.codGrupo,
      };

      if (this.form.value.codMaterial !== 0) {
        Object.assign(params, {
          codMaterial: this.form.value.codMaterial,
        });
      } */
    let params = {
      codMaterial: this.form.value.codMaterial,
    };

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
          if (response.hasOwnProperty('success') && response.success === true) {
            this.materiaisLista = response.data.map(function (el: any) {
              var o = Object.assign({}, el);
              o.checked = 0;
              return o;
            });

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
    /* } */
  }

  onToggleAll() {
    this.toggleAll = !this.toggleAll;

    for (let index = 0; index < this.materiaisLista.length; index++) {
      this.materiaisLista[index].checked = this.toggleAll === true ? 1 : 0;
    }
  }

  onCheckMaterial(index: number, material: any): void {
    this.materiaisLista[index].checked = material.checked == 0 ? 1 : 0;
  }

  onAssociarMateriais(): void {
    this.toggleAll = false;

    for (let index = 0; index < this.materiaisLista.length; index++) {
      if (this.materiaisLista[index].checked === 1) {
        const material = {
          codClasse: this.materiaisLista[index].codClasse,
          codMaterial: this.materiaisLista[index].id_material,
          nomeMaterial: this.materiaisLista[index].descricao,
        };

        this.materialAssociado.emit(material);
        this.materiaisLista[index].checked = 0;
      }
    }
  }

  onChangeLinha(codLinha: number, resetClasse = true) {
    if (resetClasse) {
      this.form.controls.codClasse.reset();
      this.form.controls.codClasse.setValue(null);
      this.form.controls.codGrupo.reset();
    }

    this.form.controls.codClasse.enable();
    this.form.controls.codClasse.setValidators([Validators.required]);
    this.form.controls.codClasse.updateValueAndValidity();

    this.comercialService.getLinhasId(codLinha).subscribe({
      next: (response: any) => {
        if (response.responseCode == 200) {
          this.grupos = response.result;
        } else {
          this.grupos = [];
        }
        this.grupos.unshift({
          id_linha: 0,
          descricao: 'TODOS',
        });
      },
    });

    this.form.controls.codMaterial.reset();
    this.form.controls.codMaterial.disable();
    this.form.controls.codMaterial.setValue(null);
    this.form.controls.codMaterial.updateValueAndValidity();

    this.filteredClasses = this.classes.filter(
      (value: any) => value.idClasseMt == codLinha
    );
  }

  onChangeGrupo(codClasse: number) {
    this.form.controls.codGrupo.reset();
    /*  this.form.controls.codGrupo.disable(); */
    this.comercialService.getSublineasId(codClasse).subscribe({
      next: (response: any) => {
        if (response.responseCode == 200) {
          this.classes = response.result;
        }
        this.classes.unshift({
          ID: 0,
          NM_SUB_LINH: 'TODOS',
        });
      },
      error: (error: any) => {
        /* this.handleSearchError('Ocurrió un error al cargar los datos.'); */
      },
    });
    this.form.controls.codGrupo.setValue(null);
    this.form.controls.codGrupo.updateValueAndValidity();
    this.filteredGrupos = this.grupos.filter(
      (value: any) => value.id_grupo == codClasse
    );
  }

  onChangeClasse(codGrupo: number) {
    this.form.controls.codMaterial.reset();
    this.form.controls.codMaterial.enable();
    this.form.controls.codMaterial.setValue(null);
    this.form.controls.codMaterial.updateValueAndValidity();

    this.getMateriais(codGrupo);
  }

  getMateriais(codClasse: number): void {
    /* if (typeof codClasse !== 'undefined' && codClasse !== null) {
      this.materiaisLoader = true;
      this.materiais = [];

      this.comercialService
        .getMateriais({
          codClasse: codClasse,
          situacao: '1'
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
    } */

    if (codClasse === null || codClasse === undefined) {
      const params = {
        id_familia: '',
        id_grupo: '',
        id_linea: '',
      };
      this.getMateriales(params);
    } else {
      if (typeof codClasse !== 'undefined' && codClasse !== null) {
        this.materiaisLoader = true;

        const params = {
          id_familia: this.form.controls.codLinha.value,
          id_grupo: this.form.controls.codClasse.value,
          id_linea: this.form.controls.codGrupo.value,
        };
        this.getMateriales(params);
      }
    }
  }
  getMateriales(params) {
    /* console.log('ingreso' + params); */
    this.materiaisLoader = true;

    this.comercialService
      .getMaterialesLista(params)
      .pipe(
        finalize(() => {
          this.materiaisLoader = false;
        })
      )
      .subscribe({
        next: (response: any) => {
          if (response.responseCode == 200) {
            this.materiais = response.result;

            this.form.controls.codMaterial.enable();
            this.form.controls.codMaterial.setValue(0);
            this.form.controls.codMaterial.updateValueAndValidity();
          } else if (
            response.hasOwnProperty('success') &&
            response.success === false &&
            response.hasOwnProperty('mensagem')
          ) {
            this.pnotifyService.notice('Nenhum material encontrado!');
            this.form.controls.codMaterial.disable();
            this.form.controls.codMaterial.setValue(null);
            this.form.controls.codMaterial.updateValueAndValidity();
          } else {
            this.pnotifyService.error(response.mensagem);
          }
        },
        error: (error: any) => {
          if (error['error'].hasOwnProperty('mensagem')) {
            this.pnotifyService.error(error.error.mensagem);
          } else {
            this.pnotifyService.error();
          }
        },
      });
  }

  setLinhaSelecionada(codLinha: number): void {
    this.form.controls.codLinha.setValue(codLinha);
    this.onChangeLinha(codLinha, false);
  }

  setClasseSelecionada(codClasse: number): void {
    this.form.controls.codClasse.setValue(codClasse);
    this.onChangeClasse(codClasse);
    this.materiaisLista = [];
  }
}
