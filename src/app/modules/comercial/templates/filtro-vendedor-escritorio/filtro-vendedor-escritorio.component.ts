import { Component, OnInit, Input, Output } from '@angular/core';
import { Location } from '@angular/common';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { EventEmitter } from '@angular/core';
import { finalize, take } from 'rxjs/operators';
import { forkJoin, Observable } from 'rxjs';

// Services
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { ComercialService } from '../../comercial.service';
import { ComercialVendedoresService } from '../../services/vendedores.service';

@Component({
  selector: 'comercial-templates-filtro-vendedor-escritorio',
  templateUrl: './filtro-vendedor-escritorio.component.html',
  styleUrls: ['./filtro-vendedor-escritorio.component.scss']
})
export class ComercialTemplatesFiltroVendedorEscritorioComponent
  implements OnInit {
  @Input('profile') profile: any = {};
  @Input('showAll') showAll: boolean;

  @Output('formValue')
  formValue: EventEmitter<any> = new EventEmitter();

  loaderFullScreen = true;

  escritorios: any[];
  vendedores: any[];
  filteredVendedores: any[] = [];

  form: FormGroup;

  constructor(
    private location: Location,
    private comercialService: ComercialService,
    private vendedoresService: ComercialVendedoresService,
    private formBuilder: FormBuilder,
    private pnotifyService: PNotifyService
  ) {
    this.pnotifyService.getPNotify();
  }

  ngOnInit() {
    this.checkUserProfile();
    this.setFormFilter();
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
    return this.adminOnly()
      ? this.getEscritoriosVendedores()
      : this.getVinculoOperadores();
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

            console.log(this.escritorios)
            this.escritorios[0] = "Sucursal Central"
            this.escritorios.splice(1, 2);
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
            if (this.showAll === true) {
              this.filteredVendedores.unshift({
                id: 0,
                nome: 'TODOS LOS VENDEDORES'
              });
            }
          } else {
            this.handleLoadDependenciesError();
          }
        },
        error: (error: any) => {
          this.handleLoadDependenciesError();
        }
      });
  }

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

  setFormFilter(): void {
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
  }

  onInput(): void {
    if (this.form.valid) {
      if (this.adminOnly()) {
        if (this.form.value['idEscritorio'] === 0) {
          this.form.get('nomeEscritorio').setValue('TODAS LAS SUCURSALES');
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
          this.form.get('nomeVendedor').setValue('TODOS LOS VENDEDORES');
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

  onEscritorioChange(escritorio: any) {
    this.filterVendedores(escritorio['id']);
    this.form.get('idVendedor').setValue(0);
  }

  filterVendedores(idEscritorio: any) {
    this.form.controls['idVendedor'].setValue(null);

    if (idEscritorio == 0) {
      this.filteredVendedores = [
        {
          id: 0,
          nome: 'TODOS LOS VENDEDORES',
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
          nome: ''
        });
      }
    }
  }
}
