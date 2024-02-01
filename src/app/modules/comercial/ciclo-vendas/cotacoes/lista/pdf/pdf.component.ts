import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { DomSanitizer } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import html2canvas from 'html2canvas';
import * as jsPDF from 'jspdf';
import { VERSION, ViewChild, ElementRef } from '@angular/core';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { PdfService } from 'src/app/shared/services/core/pdf.service';


interface PdfMakeConfig {
  content: Array<any>;
  styles?: Array<any>;
}


@Component({
  // tslint:disable-next-line:component-selector
  selector: 'pdf',
  templateUrl: './pdf.component.html',
  styleUrls: ['./pdf.component.scss']
})
export class PdfComponent implements OnInit {

  @ViewChild('captureButton', { static: true }) captureButtonRef: ElementRef;
  @ViewChild('contentToConvert', { static: false }) contentToConvert: ElementRef;

  name = 'Angular ' + VERSION.major;

  dataFromParent: any; // Property to receive the response data
  imageSrc: any;
  data: [];
  materiais: any[];
  pdfData: string;

  public onClose: Subject<boolean>;

  imageWidth = 300; // Increase the width as needed
  imageHeight = 85; // Increase the height as needed
  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private pdfService: PdfService,
    // tslint:disable-next-line:variable-name
    private _bsModalRef: BsModalRef,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.data = this.dataFromParent;
    this.materiais = this.dataFromParent.materiais;
    this.onClose = new Subject();
    this.imageSrc = this.sanitizer.bypassSecurityTrustUrl('assets/images/logo/logo-monterrey.png');
    // console.log('Received data in modal:', this.data);
  }

  public onPrint(): void {
    // Call the window.print() method to open the print dialog
    window.print();
  }

  public onConfirm(): void {
    this.onClose.next(true);
    this._bsModalRef.hide();
  }

  public onCancel(): void {
    this.onClose.next(false);
    this._bsModalRef.hide();
  }

  onDownlaod(){
    //this.loaderNavbar = true;
    this.pdfService.download(
      'contentToConvert',
      `${this.dataFromParent.pedido[0].codigo_oferta}_Monterrey`
    );
  }
  captureScreen(): void {
    const data = this.contentToConvert.nativeElement;

    // Utilizar html2canvas para capturar el contenido del div como una imagen
    html2canvas(data).then(canvas => {
      const imgWidth = 190; // Ancho de la imagen en el documento PDF
      const imgHeight = (canvas.height * imgWidth) / canvas.width; // Altura de la imagen en el documento PDF

      // Crear un nuevo objeto jsPDF con margenes
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
        putOnlyUsedFonts: true,
        compress: true,
        floatPrecision: 16,
        precision: 16,
        userUnit: 16,
        marginLeft: 10, // Margen izquierdo
        marginRight: 10, // Margen derecho
        marginTop: 10, // Margen superior
        marginBottom: 10 // Margen inferior
      });
      const xOffset = 10; 
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 10, 10, imgWidth, imgHeight); // Añadir la imagen con márgenes

      // Mandar a imprimir automáticamente
      pdf.autoPrint();
      const blob = pdf.output('bloburl'); // Obtener un Blob URL del documento PDF
      window.open(blob, '_blank'); // Abrir una nueva ventana con el Blob URL para imprimir
    });
  }
}
