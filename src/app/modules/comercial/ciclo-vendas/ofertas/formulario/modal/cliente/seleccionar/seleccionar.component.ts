import { Component, OnInit } from '@angular/core';
import { JsonResponse } from 'src/app/models/json-response';
//servicio
import { FormularioService } from '../../../formulario.service';
import { ColumnMode, SelectionType } from '@swimlane/ngx-datatable';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Subject } from 'rxjs';
//import { NgbModal } from '@ng-bootstrap/ng-bootstrap';  

@Component({
  selector: 'seleccionar',
  templateUrl: './seleccionar.component.html',
  styleUrls: ['./seleccionar.component.scss']
})
export class SeleccionarComponent implements OnInit {

  rows = [];
  selected = [];
  ColumnMode = ColumnMode;
  SelectionType = SelectionType;
  modalRef: BsModalRef; 
  columns = [{ prop: 'CODIGO', name: 'CÓDIGO SN' },
  { prop: 'NOMBRE', name: 'NOMBRE SN' },
  { prop: 'SALDO_CUENTA', name: 'SALDO DE CUENTA' },
  { prop: 'DOCUMENTO_NUM', name: 'NIT' },
  { prop: 'EJECUTIVO', name: 'EJECUTIVO' },
  { prop: 'EXTERNO', name: 'NOMBRE EXTERNO' }
  ];
  private searchSubject = new Subject<string>();
  constructor(
    private formularioService: FormularioService,
    private modalService: BsModalService
    //private modalService: NgbModal
  ) { }

  ngOnInit(): void {
    // Configuramos la búsqueda reactiva con debounceTime, distinctUntilChanged y switchMap
    this.searchSubject
      .pipe(
        debounceTime(300), // Espera 300 ms después de que el usuario deja de escribir
        distinctUntilChanged(), // Evita buscar si el término es el mismo que el anterior
        switchMap((searchTerm: string) => 
          this.formularioService.getCliente({ search: searchTerm })
        )
      )
      .subscribe((response: Array<any>) => {
        this.rows = response['data'];
        this.selected = [response['data'][2]]; // Esto es opcional y depende de tu lógica
      });
  }

  updateFilter(event: any) {
    const filterValue = event.target.value; // Extrae el valor del input

    // Emitimos el valor al Subject para que gestione la búsqueda
    this.searchSubject.next(filterValue);
  }
  onSelect(event: any) {
    const codigo = event.selected[0]?.CODIGO;
    if (codigo) {
      this.formularioService.setSelectedClient(codigo);
      
      
    }
    this.closeModal();
  }
  closeModal() {
    this.modalService.hide(1); // Cierra el modal usando el servicio directamente
  }
  

}