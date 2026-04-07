import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { FormularioService } from '../../../formulario.service';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { JsonResponse } from 'src/app/models/json-response';
import { ColumnMode, SelectionType } from '@swimlane/ngx-datatable';
import { BehaviorSubject, throwError } from 'rxjs';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { catchError, timeout } from 'rxjs/operators';

@Component({
  selector: 'materiales',
  templateUrl: './materiales.component.html',
  styleUrls: ['./materiales.component.scss']
})
export class MaterialesComponent implements OnInit {
  @ViewChild(DatatableComponent) table: DatatableComponent;
  @Output() resetRequested = new EventEmitter<void>();
  @Output('scrollToCarrinho') scrollToCarrinho: EventEmitter<boolean> = new EventEmitter();
  materiales = [];
  crosssell = [];
  selected = [];
  temp = [];
  Crosstemp = [];
  Uptemp = [];
  SelectionType = SelectionType;
  ColumnMode = ColumnMode;
  loadingIndicator = true;
  reorderable = true;
  swapColumns = false;
  autoScroll = true;
  modalRef?: BsModalRef;
  selectedRow: any;

  columns = [
    { prop: 'CODIGOMATERIAL', name: 'Número de artículo', sortable: true },
    { prop: 'DESCRICAO', name: 'Descripción del artículo', sortable: true },
    { prop: 'STOCK', name: 'STOCKS', sortable: true },
    { prop: 'SIGLAS_UNI', name: 'UNIDAD', sortable: true },
    { prop: 'PESO', name: 'PESO', sortable: true },
  ];

  materiaisSubject: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  toggleAll = false;
  upsell = [];

  constructor(
    private pnotifyService: PNotifyService,
    private formularioService: FormularioService,
    private modalService: BsModalService
  ) { }

  ngOnInit(): void {
    this.listarMateriales();
  }

  listarMateriales() {
    this.formularioService.getMateriales()
      .pipe(
        timeout(55000), // 10 segundos
        catchError(err => {
          this.pnotifyService.error('Error al obtener los materiales');
          return throwError(err); // Retorna el error para que se maneje correctamente
        })
      )
      .subscribe({
        next: (response: JsonResponse) => {
          if (response.success) {
            this.materiales = response.data;
            this.temp = [...response.data];
          } else {
            this.pnotifyService.notice('No hay material!');
          }
        },
        error: (error: any) => {
          this.pnotifyService.error('Ocurrió un error inesperado');
        }
      });
  }

  listaCrossSell($id_material) {
    this.formularioService.getCrossSell($id_material)
      .pipe(
        timeout(55000), // 10 segundos
        catchError(err => {
          this.pnotifyService.error('Error al obtener los materiales Cross Sell');
          return throwError(err); // Retorna el error para que se maneje correctamente
        })
      )
      .subscribe({
        next: (response: JsonResponse) => {
          if (response.success) {
            this.crosssell = response.data;
            this.Crosstemp = [...response.data];
          } else {
            this.pnotifyService.notice('No hay material Cross Sell!');
          }
        },
        error: (error: any) => {
          this.pnotifyService.error('Ocurrió un error inesperado');
        }
      });
  }
  listaUpsell($id_material) {
    this.formularioService.getUpSell($id_material)
      .pipe(
        timeout(55000), // 10 segundos
        catchError(err => {
          this.pnotifyService.error('Error al obtener los materiales Cross Sell');
          return throwError(err); // Retorna el error para que se maneje correctamente
        })
      )
      .subscribe({
        next: (response: JsonResponse) => { 
          if (response.success) {
            this.upsell = response.data;
            this.Uptemp = [...response.data];
          } else {
            this.pnotifyService.notice('No hay material Cross Sell!');
          }
        },
        error: (error: any) => {
          this.pnotifyService.error('Ocurrió un error inesperado');
        }
      });
  }
  
  onSelect({ selected }) {

    this.selected.splice(0, this.selected.length);
    this.selected.push(...selected);
  }

  onActivate(event) {

  }

  updateFilter(event) {
    const val = event.target.value.toLowerCase();

    // filter our data
    const temp = this.temp.filter(function (d) {
      return d.CODIGOMATERIAL.toLowerCase().indexOf(val) !== -1 || d.DESCRICAO.toLowerCase().indexOf(val) !== -1 || !val;
    });


    // update the rows
    this.materiales = temp;
   
    // Whenever the filter changes, always go back to the first page
    this.table.offset = 0;
  }

  onToggleAll() {
    this.toggleAll = !this.toggleAll;

    for (let index = 0; index < this.selected.length; index++) {
      // @ts-ignore: Ignorar error TS2339
      if (this.selected[index].codigo_situacion == 'A') {
        this.selected[index].checked = this.toggleAll === true ? 1 : 0;
      }
    }

  }
  onAddMaterial(): void {
    console.log('🔵 [Modal] onAddMaterial CLICK - selected:', this.selected);
    console.log('🔵 [Modal] selected.length:', this.selected.length);
    let materiais = [];
    for (let index = 0; index < this.selected.length; index++) {
      console.log('🔵 [Modal] Pushing material:', this.selected[index]);
      materiais.push(this.selected[index]);
      this.selected[index].checked = 0;
      this.pnotifyService.success('Material agregado.');
    }

    /* for (let index = 0; index < this.upsell.length; index++) {
      if (this.upsell[index].checked === 1) {
        materiais.push(this.upsell[index]);
        this.upsell[index].checked = 0;


        this.pnotifyService.success('Material agregado.');
      }
    } */
    /*
        for (let index = 0; index < this.crosell.length; index++) {
          if (this.crosell[index].checked === 1) {
            materiais.push(this.crosell[index]);
            this.crosell[index].checked = 0;


            this.pnotifyService.success('Material agregado.');
          }
        }
     */

    if (materiais.length > 0) {
      console.log('🔵 [Modal] Emitiendo materiaisSubject.next() con:', materiais);
      this.formularioService.materiaisSubject.next(materiais);
      this.closeModal();
    } else {
      this.pnotifyService.notice('Seleccione al menos un material');
    }
    this.selected = [];

    /*  this.form.controls.almacenForm.disable() */
    /* this.upsell = [];
    this.crosell = []; */
  }

  closeModal() {
    this.modalService.hide(1);
  }


  openModalCross(row: any, template: any): void {
    this.selectedRow = row;
    this.listaCrossSell(row.ID_CODIGOMATERIAL); 
    this.modalRef = this.modalService.show(template); // Abrir el modal con el template
  }

  openModalUpSell(row: any, template: any): void {
    this.selectedRow = row;
    this.listaUpsell(row.ID_CODIGOMATERIAL); 
    this.modalRef = this.modalService.show(template); // Abrir el modal con el template
  }
}

