import { Component, OnInit, Input } from '@angular/core';
import { ComercialService } from 'src/app/modules/comercial/comercial.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FormularioService } from '../formulario.service';

@Component({
  selector: 'logistica',
  templateUrl: './logistica.component.html',
  styleUrls: ['./logistica.component.scss']
})
export class LogisticaComponent implements OnInit {
  form: FormGroup;
  constructor(
    private comercialService: ComercialService,
    private fb: FormBuilder,
    private formularioService: FormularioService,
  ) {

  }

  @Input('tipoEntrega') tipoEntrega: number;
  @Input('destinarioFactura') destinarioFactura: string;
  @Input('centroLogisticoControl') centroLogisticoControl: number;
  @Input('fechaEntrega') fechaEntrega: string;
  @Input('cordenadas') cordenadas: string;


  centrosLogisticos: any[] = [];
  id_centro_logistico: number;
  modoEntregas = [
    { id: 1, name: 'ENTREGA EN ALMACEN' },
    { id: 2, name: 'ENTREGA EN OBRA' }
  ];
  ngOnInit(): void {
    this.getCentrosLogisticos();
    this.formgroup();

    // Aquí subscribimos para que, cuando el formulario cambie, se actualicen los datos en el servicio
    this.form.valueChanges.subscribe(values => {
      this.updateFormularioData(values);
    });

    this.formularioService.selectedClient$.subscribe(codigo => {
      if (codigo) {
        this.loadExtendedData(codigo);
      }
    });

    this.form.get('modoEntrega')?.valueChanges.subscribe(value => {
      this.tipoEntrega = value;  // Actualiza tipoEntrega con el valor seleccionado
    });
  }
  private loadExtendedData(codigo: string): void {
    this.formularioService.PostCodigoCliente(codigo).subscribe(
      response => {
        if (response?.data?.extendedData?.length) {
          const data = response.data.extendedData[0];
          this.updateFormData(data);
        } else {
        }
      },
      () => {}
    );
  }

  private updateFormData(data: any): void {
    if (data) {
      const patchData = {
        destinarioFactura: data.DIRECCION,
        nombreFactura: data.FORMAENVIO || 1,
        despachoMercaderia: data.despachoMercaderia || '',
      };
      this.form.patchValue(patchData);  // Actualiza los valores del formulario
    }
  }

  formgroup() {
    this.form = this.fb.group({
      modoEntrega: [this.tipoEntrega || 1],  // Valor predeterminado de 'tipoEntrega' o 1
      destino: [{ value: 'BOLIVIA', disabled: true }],  // Valor fijo y deshabilitado
      destinarioFactura: [{ value: this.destinarioFactura || '', disabled: false }],  // Valor de 'destinarioFactura'
      despachoMercaderia: [{ value: '', disabled: false }],  // Inicialmente vacío
      id_centro_logistico: [{ value: this.centroLogisticoControl || 1, disabled: false }],  // Valor predeterminado de 'centroLogisticoControl' o 1
      fechaEntrega: [{ value: this.fechaEntrega || '', disabled: false }],  // Valor de 'fechaEntrega'
      cordenadas: [{ value: this.cordenadas || '', disabled: false }]  // Valor de 'cordenadas'
    });

    this.form.get('modoEntrega')?.valueChanges.subscribe(value => {
      if (value === 1) {
        this.disableFormControls();
      } else {
        this.enableFormControls();
      }
    });

    if (this.form.get('modoEntrega')?.value === 1) {
      this.disableFormControls();
    }
  }

  disableFormControls(): void {
    Object.keys(this.form.controls).forEach(control => {
      if (control !== 'modoEntrega') {
        this.form.get(control)?.disable();  // Deshabilitar sin resetear
      }
    });
  }

  enableFormControls(): void {
    Object.keys(this.form.controls).forEach(control => {
      if (control !== 'modoEntrega') {
        this.form.get(control)?.enable();  // Habilitar sin modificar valores
      }
    });
  }

  onCentroLogisticoChange(ID) {
    this.id_centro_logistico = ID;
  }

  getCentrosLogisticos(): void {
    this.comercialService.getCentrosLogisticos().subscribe(
      (response: any) => {
        this.centrosLogisticos = response.data;
        this.form.patchValue({ id_centro_logistico: 1 });  // Selecciona el valor 1
      },
      (error: any) => { }
    );
  }

  // Esta función actualizará el formulario en el servicio compartido
  private updateFormularioData(data: any): void {
    this.formularioService.updateLogisticaData(data);
  }
}
