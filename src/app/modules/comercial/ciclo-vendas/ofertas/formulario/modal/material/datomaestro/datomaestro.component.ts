import { Component, Input, OnInit } from '@angular/core';
import { FormularioService } from '../../../formulario.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';


@Component({
  selector: 'datomaestro',
  templateUrl: './datomaestro.component.html',
  styleUrls: ['./datomaestro.component.scss']
})
export class DatomaestroComponent implements OnInit {
  Formulario1: FormGroup;
  articulo: string;
  descripcion: string;
  lista: number;
  clase: string;  
  famialia: string;
  listaPrecio: string;
  listaNombre:string;
  unidad: string;
  peso: number;
  stocks: []; 

  constructor(
    private formularioService: FormularioService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    
    this.Formulario1 = this.fb.group({
      numeroArticulo: [''],
      descripcion: [''],
      clase: [''],
      famialia: [''],
      listaPrecio: [''],
      listaNombre: [''],
      unidad: [''],
      peso: ['']
    });
    
    // Obtener datos iniciales
    this.formularioService.getArticulo().subscribe(data => {
      this.articulo = data.articulo;
      this.lista = data.lista;

      // Luego de obtener los datos iniciales, realiza la solicitud para obtener los detalles del material
      this.loadMaterialData();
    });
   
  }
  private isFetchingStock: boolean = false;

  getStockAll(codigoArticulo: string): void {
    if (this.isFetchingStock) {
        console.warn('Ya se está obteniendo el stock, la solicitud no se enviará de nuevo.');
        return; // Salir si ya se está procesando
    }

    console.log('Código de artículo enviado:', codigoArticulo); // Verifica el valor
    this.isFetchingStock = true; // Cambia el estado antes de hacer la solicitud

    this.formularioService.getStockAll(codigoArticulo).subscribe(
      (response: any) => {
        this.isFetchingStock = false; // Restablece el estado al finalizar la solicitud
        if (response.success) {
          this.stocks = response.data;
          console.log('Datos de stock obtenidos:', this.stocks);
        } else {
          console.error('Error en la respuesta:', response);
        }
      },
      (error: HttpErrorResponse) => {
        this.isFetchingStock = false; // Asegúrate de restablecer el estado en caso de error
        console.error('Error al obtener el stock:', error);
      }
    );
}
  
  loadMaterialData(): void {
    if (!this.articulo || !this.lista) {
      console.error('Artícuo o lista no están definidos');
      return;
    }
    

    this.formularioService.getMaterialDatosMaestros(this.articulo, this.lista).subscribe(data => {
      const material = data['data'][0];
      if (material) {
        // Actualizar el formulario con los datos del material
        this.Formulario1.patchValue({
          numeroArticulo: material.numeroArticulo,
          descripcion: material.descripcion,
          clase: material.clase,
          famialia: material.famialia,
          listaPrecio: material.precio,
          listaNombre: material.lista,
          unidad: material.unidad,
          peso: material.peso
        });
        console.log('Datos del material actualizados en el formulario:', material);
  
        // Solo una llamada a getStockAll
        this.getStockAll(material.numeroArticulo);
      }
    });
  }
}
