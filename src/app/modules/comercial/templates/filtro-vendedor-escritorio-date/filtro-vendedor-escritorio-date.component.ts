import { Component, OnInit, Input, Output } from '@angular/core';
import { Location } from '@angular/common';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { EventEmitter } from '@angular/core';
import { finalize, take } from 'rxjs/operators';
import { forkJoin, Observable } from 'rxjs';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


// Services
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { ComercialService } from '../../comercial.service';
import { ComercialVendedoresService } from '../../services/vendedores.service';
import { ComercialLoteService } from '../../lote/lote.service';
import { ComercialLoteRutaComponent } from '../../lote/ruta/ruta.component';


@Component({
  selector: 'comercial-templates-filtro-vendedor-escritorio-date',
  templateUrl: './filtro-vendedor-escritorio-date.component.html',
  styleUrls: ['./filtro-vendedor-escritorio-date.component.scss']
})
export class ComercialTemplatesFiltroVendedorEscritorioDateComponent
  implements OnInit {
  @Input('profile') profile: any = {};
  @Input('showAll') showAll: boolean;
  @Output('formValue')
  formValue: EventEmitter<any> = new EventEmitter();

  loaderFullScreen = true;

  escritorios: any[];
  vendedores: any[];
  estados: any[];
  /*  diasVisita: any[]; */
  filteredVendedores: any[] = [];
  ultima_visita = [];

  idVendedor: any;
  idEscritorio: any;
  idUltimaVisita: any;
  idSucursal: any;
  idEstado: any;

  form: FormGroup;

  constructor(

    private location: Location,
    private comercialService: ComercialService,
    private vendedoresService: ComercialVendedoresService,
    private formBuilder: FormBuilder,
    private pnotifyService: PNotifyService,
    private loteService: ComercialLoteService,
    private rutaService: ComercialLoteRutaComponent

  ) {
    this.pnotifyService.getPNotify();
  }

  ngOnInit() {
    this.checkUserProfile();
    this.form = this.formBuilder.group({
      sucursal_id: [],
      vendedor_id: [],
      visita_id: [],
      estado_id: []
    });
    this.setFormFilter();
  }


  setFormFilter(): void {
    this.form = this.formBuilder.group({
      sucursal_id: [null, Validators.required],
      vendedor_id: [null, Validators.required],
      visita_id: [null],
      estado_id: [null]
    });
  }

  /* obtenerDatos() {
  } */

  filtrarClientes() {

    const idSucursal = this.form.get('sucursal_id').value;
    const idVendedor = this.form.get('vendedor_id').value;
    const idUltimaVisita = this.form.get('visita_id').value;
    const idEstado = this.form.get('estado_id').value;

    const params = {
      idSucursal: idSucursal,
      idVendedor: idVendedor,
      idUltimaVisita: idUltimaVisita,
      idEstado: idEstado
    };

    this.rutaService.filtrarMapas(params);

  }









  adminOnly(): boolean {
    if (this.profile.coordenador === true || this.profile.gestor === true) {
      return true;
    } else if (
      this.profile.vendedor === true &&
      this.profile.coordenador === false &&
      this.profile.gestor === false
    ) {
      return false;
    }
  }

  checkUserProfile(): void {
    this.getEscritoriosVendedores()
  }


  getEscritoriosVendedores(): void {
    this.loadEscritoriosVendedores()
      .pipe(
        finalize(() => {
          this.loaderFullScreen = false;

          if (this.showAll === true) {
            this.formValue.emit({
              idEscritorio: 0,
              idVendedor: 0,
              nomeVendedor: 'TODOS OS VENDEDORES',
              nomeEscritorio: 'TODOS OS ESCRITÓRIOS'
            });
          }
        })
      )
      .subscribe({
        next: (response: any) => {
          if (response[0]['responseCode'] === 200) {
            this.setFormFilter();
            this.escritorios = response[0]['result'];

            const escritorioNoVacio = this.escritorios.find(item => item.nome !== null && item.nome !== '');

            if (escritorioNoVacio) {
              /*  // Se encontró un valor no vacío
               console.log(escritorioNoVacio.nome); */
            } else {
              /*   // No se encontró ningún valor no vacío
              console.log("No hay valores no vacíos en el array"); */
            }

            if (this.escritorios.length > 1 && this.showAll === true) {
              this.escritorios.unshift({
                id: 0,
                nome: 'TODAS LAS SUCURSALES'
              });
            }
          } else {
            this.handleLoadDependenciesError();
          }

          if (response[0]['responseCode'] === 200) {
            this.vendedores = response[1]['result'];
            this.filteredVendedores = this.vendedores;
            /* if (this.showAll === true) { */
              this.filteredVendedores.unshift({
                id: 0,
                nome: 'TODOS'
              });
            /* } */
          } else {
            this.handleLoadDependenciesError();
          }
        },
        error: (error: any) => {
          this.handleLoadDependenciesError();
        }
      });
  }



  ultimaVisita = [
    { id: 0, nombre: 'Todos' },
    { id: 1, nombre: '>= 90 días' },
    { id: 2, nombre: '>= 45 días' },
    { id: 3, nombre: '>= 30 días' },
    { id: 4, nombre: '>= 15 días' },
    { id: 5, nombre: '<= 15 días' },
  ];

  estadoCliente = [
    { id: 0, nombre: 'Todos' },
    { id: 1, nombre: 'Activo' },
    { id: 2, nombre: 'Inactivo' },
  ];



  loadEscritoriosVendedores(): Observable<any> {
    const escritorios = this.comercialService.getEscritorios();
    const vendedores = this.vendedoresService.getVendedores();

    return forkJoin([escritorios, vendedores]).pipe(take(1));
  }



  getVinculoOperadores(): void {
    this.vendedoresService
      .getVinculoOperadores()
      .pipe(
        finalize(() => {
          this.loaderFullScreen = false;
        })
      )
      .subscribe(
        (response: any) => {
          if (response['responseCode'] === 200) {
            this.setFormFilter();
            this.filteredVendedores = response['result'];
          } else {
            this.handleLoadDependenciesError();
          }
        },
        (error: any) => {
          this.handleLoadDependenciesError();
        }
      );
  }

  handleLoadDependenciesError(): void {
    this.pnotifyService.error();
    this.location.back();
  }

  /* setFormFilter(): void {
    this.form = this.formBuilder.group({
      idEscritorio: [null, Validators.required],
      idVendedor: [null, Validators.required],
      nomeVendedor: [null],
      nomeEscritorio: [null]
    });

    if (this.adminOnly()) {
      this.form.get('idEscritorio').setValue(0);
      this.form.get('idVendedor').setValue(0);
    } else {
      this.form.controls['idEscritorio'].clearValidators();
    }
  } */

  onInput(): void {
    if (this.form.valid) {
      if (this.adminOnly()) {
        if (this.form.value['idEscritorio'] === 0) {
          this.form.get('nomeEscritorio').setValue('TODOS OS ESCRITÓRIOS');
        } else {
          for (let i = 0; i < this.escritorios.length; i++) {
            if (this.form.value['idEscritorio'] === this.escritorios[i]['id']) {
              this.form
                .get('nomeEscritorio')
                .setValue(this.escritorios[i]['nome']);
            }
          }
        }

        if (this.form.value['idVendedor'] === 0) {
          this.form.get('nomeVendedor').setValue('TODOS OS VENDEDORES');
        } else {
          for (let i = 0; i < this.vendedores.length; i++) {
            if (this.form.value['idVendedor'] === this.vendedores[i]['id']) {
              this.form
                .get('nomeVendedor')
                .setValue(this.vendedores[i]['nome']);
            }
          }
        }
      } else {
        for (let i = 0; i < this.filteredVendedores.length; i++) {
          if (
            this.form.value['idVendedor'] === this.filteredVendedores[i]['id']
          ) {
            this.form
              .get('idEscritorio')
              .setValue(this.filteredVendedores[i]['idEscritorio']);
            this.form
              .get('nomeVendedor')
              .setValue(this.filteredVendedores[i]['nome']);
          }
        }
      }
      this.formValue.emit(this.form.value);
    }
  }

  /*  onEscritorioChange(escritorio: any) {
     this.filterVendedores(escritorio['id']);
     this.form.get('idVendedor').setValue(0);
   } */

  filterVendedores(idEscritorio: any) {
    this.form.controls['idVendedor'].setValue(null);

    if (idEscritorio == 0) {
      this.filteredVendedores = [
        {
          id: 0,
          nome: 'TODOS OS VENDEDORES',
          idEscritorio: 0
        }
      ];
      this.form.controls['idVendedor'].setValue(idEscritorio);
      this.onInput();
    } else {
      this.filteredVendedores = this.vendedores.filter(
        value => value.idEscritorio == idEscritorio
      );

      if (this.filteredVendedores.length > 0 && this.showAll === true) {
        this.filteredVendedores.unshift({
          id: 0,
          nome: 'TODOS OS VENDEDORES'
        });
      }
    }
  }
}
