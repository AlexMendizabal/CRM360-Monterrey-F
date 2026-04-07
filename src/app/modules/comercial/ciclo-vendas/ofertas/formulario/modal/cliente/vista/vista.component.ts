import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormularioService } from '../../../formulario.service';
import { JsonResponse } from 'src/app/models/json-response';
import { finalize, catchError } from 'rxjs/operators';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { PdfComponent } from 'src/app/modules/comercial/ciclo-vendas/ofertas/lista/pdf/pdf.component';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { ListaService } from 'src/app/modules/comercial/ciclo-vendas/ofertas/lista/lista.service';
import { of } from 'rxjs';
import { celular } from 'ng-brazil/celular/validator';

@Component({
  selector: 'vista',
  templateUrl: './vista.component.html',
  styleUrls: ['./vista.component.scss']
})
export class VistaComponent implements OnInit {
  // Propiedades del formulario
  form: FormGroup;

  // Opciones para selects
  rubroOptions: { id_cnae: string, descricao: string }[] = [];
  TiposDoc: { id: string, nombre_doc: string }[] = [];
  TiposPersona: { id: number, tipo_persona: string, sigla: string, estado: number }[] = [];

  // Variables para almacenar información del cliente
  codigoSAP: string = '';
  nombres: string = '';
  razonSocial: string = '';
  rubro: string = '';
  noDoc: number;
  tipoDoc: string = '';
  idTipoDoc: number;
  listaPrec: string = '';
  categoria: string = '';
  idcategoria: number;
  telefono: string = '';
  telefono2: string = '';
  tipoPersona: string;
  departamento: string;
  id_cliente: Number; 
  Sigla: string;
  celular: string;
  ofertas: any[] = [];
  id_vendedor: Number;

  // Variables para el modal y PDF
  modalRef: BsModalRef;
  imprimirPdf: boolean = false;
  pdfBase64: any;
  loaderNavbar: boolean = false;
  modalRef2: BsModalRef;
  idCliente: any;
  isSubmitting: boolean = false;

  constructor(
    private formularioService: FormularioService,
    private fb: FormBuilder,
    private modalService: BsModalService,
    private pnotifyService: PNotifyService,
    private ListaService: ListaService
  ) {
    // Inicializamos el formulario
    this.form = this.fb.group({
      nombres: ['', Validators.required],
      razonSocial: [''],
      rubro: [''],
      telefono: ['', [Validators.required]],
      telefono2: [''],
      tipoPersona: [''],
      noDoc: [''],
      departamento: [''],
      Sigla: [''],
      celular: ['', [Validators.required]],
      tipoDoc: [''],
      categoria: [''],
      idcategoria: ['', Validators.required],
    });

    // Inicializa las notificaciones
    this.pnotifyService.getPNotify();
  }

  // Método que abre un modal con una clase específica
  openModalWithClass2(template: TemplateRef<void>) {
    this.modalRef = this.modalService.show(template, { class: 'gray modal-lg' });
  }

  // Método principal que se ejecuta al iniciar el componente
  ngOnInit(): void {
    this.loadRubros();
    this.loadTipoDoc();
    this.loadTipoPersona();

    // Suscribirse al cliente seleccionado
    this.formularioService.selectedClient$.subscribe(codigo => {
      if (codigo) {
        this.loadExtendedData(codigo); // Carga datos extendidos del cliente
        this.loadOfertas(codigo); // Carga las ofertas asociadas al cliente
      }
    });
  }

  onSubmit(): void {
    this.isSubmitting = true;
    // 1. Obtener los valores del formulario
    const formValues = this.form.value;
    
    // 2. Estructurar los datos para enviarlos al servicio
    const clienteData = {
      codigo_cliente: this.codigoSAP, // Código SAP del cliente
      id_cliente: this.id_cliente, // ID del cliente
      nombres: formValues.nombres,
      numero_documento: formValues.noDoc, // NIT o número de documento
      telefono: formValues.telefono,
      celular: formValues.celular,
      tipo_documento: formValues.tipoDoc, // Tipo de documento (DNI, etc.)
      razon_social: formValues.razonSocial,
      id_rubro: formValues.rubro, // Rubro o sector de actividad
      id_vendedor: this.id_vendedor, // ID del vendedor
      id_tipo_cliente: formValues.idcategoria, // Tipo de cliente
      tipo_persona: formValues.tipoPersona.charAt(0).toUpperCase() + formValues.tipoPersona.slice(1).toLowerCase(), // Tipo de persona (Sociedad, Privado, etc.)
      nombre_factura: formValues.nombreFactura,
      id_ciudad: formValues.Sigla,
      ciudad: formValues.Sigla || '', // Enviar ciudad directamente
      ubicacion: [], // Ejemplo de ubicación (puede necesitar ajustes)
      contactos: formValues.contactos || [], // Ejemplo de contactos (puede necesitar ajustes)
      id_estado: 1,
      frontend: 1, // Marcar que viene desde el frontend
    };

    // 3. Mostrar los datos en consola para ver qué se está enviando

    // 4. Llamada al servicio para actualizar el cliente
    this.formularioService.updateCliente(clienteData).pipe(
      finalize(() => {
        this.isSubmitting = false; // Desbloquear el botón después de completar el submit
        this.loaderNavbar = false;
      }),
      catchError(error => {
        this.isSubmitting = false;
    
        if (error && error.error && error.error.detalle) {
          this.pnotifyService.error(`Error: ${error.error.detalle}`);
        } else {
          this.pnotifyService.error('Error al actualizar el cliente');
        }
    
        return of(null); // Retornar un observable vacío en caso de error
      })
    ).subscribe(response => {
      if (response && response.CodigoRespuesta === 200 && response.Estado) {
        // Notificar éxito
        this.pnotifyService.success(response.Mensaje || 'Cliente actualizado con éxito');
      } else if (response && response.Mensaje) {
        // Mostrar el mensaje de error específico del backend si existe
        this.pnotifyService.error(`Error: ${response.Mensaje}`);
      } else {
        this.pnotifyService.error('Error en la actualización del cliente');
      }
    });
    
  }




  // Resetea la bandera de impresión
  resetImprimir(reset: boolean) {
    this.imprimirPdf = false;
  }

  // Carga las opciones de rubros
  private loadRubros(): void {
    this.formularioService.getRubros().subscribe(
      (response: any) => {
        if (response?.data) {
          this.rubroOptions = response.data;
        } else {
        }
      },
      () => {}
    );
  }

  // Carga los tipos de documentos
  private loadTipoDoc(): void {
    this.formularioService.obtenerTiposDocumentos().subscribe(
      (response: any) => {
        if (response?.result) {
          this.TiposDoc = response.result;
        } else {
        }
      },
      () => {}
    );
  }

  // Carga los tipos de personas
  private loadTipoPersona(): void {
    this.formularioService.getTipoPersona().subscribe(
      (response: any) => {
        if (response?.result) {
          this.TiposPersona = response.result;
        } else {
        }
      },
      () => {}
    );
  }

  // Carga las ofertas del cliente basado en el código
  private loadOfertas(codigo: string): void {
    this.formularioService.getHistorialOfertas(codigo).subscribe(
      (response) => {
        this.ofertas = response['data']; // Almacena las ofertas en el array
      },
      (error) => {
      }
    );
  }

  // Validar si un botón debe estar habilitado
  validarDato(tipoEstado: any, estadoOferta: any): boolean {
    return tipoEstado === 'someCondition' && estadoOferta === 'someOtherCondition';
  }

  @ViewChild('template') template!: TemplateRef<any>; // Referencia al template para el modal

  // Método para imprimir, genera un modal con el PDF
  onImprimir(id: number): void {
    this.loaderNavbar = true;

    this.ListaService.getImprimirCotacao(id)
      .pipe(
        finalize(() => this.loaderNavbar = false), // Detiene el loader al finalizar
        catchError((error) => {
          this.pnotifyService.error('Ocurrió un error al intentar imprimir');
          return of(null);
        })
      )
      .subscribe((response: JsonResponse) => {
        if (response?.success && response.data?.pedido) {
          this.modalRef = this.modalService.show(PdfComponent, { initialState: { selectedItem: response.data } });
          this.modalRef.content.onClose.subscribe((result) => { });
        } else {
          this.pnotifyService.error('Error al imprimir');
        }
      });
  }

  // Carga datos extendidos del cliente
  private loadExtendedData(codigo: string): void {
    this.formularioService.PostCodigoCliente(codigo).subscribe(
      response => {
        if (response?.data?.extendedData?.length) {
          const data = response.data.extendedData[0];
          this.updateFormData(data); // Actualiza el formulario con los datos del cliente
          this.updateRubroSelection(data.RUBRO.trim()); // Actualiza la selección de rubro
        } else {
        }
      },
      () => {}
    );
  }

  // Actualiza los campos del formulario con los datos del cliente
  private updateFormData(data: any): void {
    this.codigoSAP = data.CODIGOSAP;
    this.id_cliente = data.id_cliente;
    this.nombres = data.NOMBRE;
    this.razonSocial = data.RAZONSOCIAL;
    this.noDoc = data.NODOCUMENTO;
    this.listaPrec = data.LISTAPRECO;
    this.categoria = data.CATEGORIACLIENTE;
    this.idcategoria = data.IDCATEGORIACIENTE;
    this.telefono = data.TELEFONO || '';
    this.celular = data.CELULAR || '';
    this.Sigla = data.Sigla;
    this.id_vendedor = data.id_vendedor;

    // Establece el tipo de documento seleccionado
    const tipoDocSeleccionado = data.IDTIPODOCUMENTO;

    // Busca el ID de la persona seleccionada y actualiza el formulario
    const tipoPersonaSeleccionado = this.TiposPersona.find(tp => tp.tipo_persona.toUpperCase() === data.TIPOPERSONA.toUpperCase())?.tipo_persona || null;

    this.form.patchValue({
      nombres: this.nombres,
      razonSocial: this.razonSocial,
      telefono: this.telefono,
      tipoPersona: tipoPersonaSeleccionado,
      celular: this.celular,
      tipoDoc: tipoDocSeleccionado,
      noDoc: this.noDoc,
      idcategoria: this.idcategoria,
      categoria: this.categoria,
      Sigla: this.Sigla
    });
  }

  // Actualiza la selección del rubro
  private updateRubroSelection(rubro: string): void {
    const cleanedRubro = rubro.replace(/\/$/, '').trim(); // Limpia el valor del rubro
    const selectedOption = this.rubroOptions.find(option => {
      const cleanedOptionDescricao = option.descricao.replace(/\/$/, '').trim();
      return cleanedOptionDescricao === cleanedRubro;
    });

    if (selectedOption) {
      this.form.get('rubro')?.setValue(selectedOption.id_cnae); // Actualiza el valor en el formulario
    } else {
    }
  }
  closeModal() {
    this.modalService.hide(1);
  }
}
