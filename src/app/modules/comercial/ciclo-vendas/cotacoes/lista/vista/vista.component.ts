import { Component, OnInit, VERSION, ViewChild, ElementRef, AfterViewInit, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { DomSanitizer } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import html2canvas from 'html2canvas';
import * as jsPDF from 'jspdf';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';


import { AuthService } from 'src/app/shared/services/core/auth.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { ComercialCicloVendasCotacoesService } from '../../cotacoes.service';

import { JsonResponse } from 'src/app/models/json-response';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'app-vista',
  templateUrl: './vista.component.html',
  styleUrls: ['./vista.component.scss']
})

export class VistaComponent implements OnInit, AfterViewInit {
  myForm: FormGroup; 
  @ViewChild('contentToConvert', { static: true }) contentToConvert: ElementRef;

  loaderNavbar: boolean;
  loaderFullScreen = true;
  name = 'Angular ' + VERSION.major;

  resultFromParent: any;
  imageSrc: any;
  result: [];
  analiticos: any[];
  total: any[];
  cierre_oferta: any[];

  formObj: any = {};

  showCierreButton: boolean = true;
  showDescripcionCard: boolean = false;
  showGuardarButton: boolean = false;
  dadosEmpty = false;
  public onClose: Subject<boolean>;

  imageWidth = 300;
  imageHeight = 85;
  

  @Input() ofertaId: number; // Input property to receive the 'id_oferta'

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    // tslint:disable-next-line:variable-name
    private _bsModalRef: BsModalRef,
    private cotacoesService: ComercialCicloVendasCotacoesService,
    private sanitizer: DomSanitizer,
    private pnotifyService: PNotifyService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
   
    this.result = this.resultFromParent;
    this.cierreOferta();
    this.analiticos = this.resultFromParent.analitico;
    this.onClose = new Subject();
    this.imageSrc = this.sanitizer.bypassSecurityTrustUrl('assets/images/logo/logo-monterrey.png');
  

    this.myForm = this.fb.group({
      id_oferta:  [this.resultFromParent.oferta[0].id_oferta],
      estadoOfert: [''],
      descripcion: ['']
    });
  
   /*  if(this.resultFromParent.oferta[0].estado_of === 3) {
      console.log('aqui olo',this.resultFromParent.oferta[0].estado_of);
      this.toggleDescripcionCard();
    }  */
  }

  ngAfterViewInit(): void {
    // Capture the content when the modal opens
    // this.captureScreen();
  }

  public cierreOferta()
  {
    this.cotacoesService.getCierreOferta().pipe()
    .subscribe({
      next: (response: any) => {
        if (response.responseCode === 200) {
          this.cierre_oferta = response.result;
        } else {
          this.loaderNavbar = false;
          this.pnotifyService.notice('Ningun dato encontrado');
          this.dadosEmpty = true;
        }
      }
    });
  }

  public onConfirm(): void 
  {
    this.onClose.next(true);
    this._bsModalRef.hide();
  }

  public onCancel(): void {
    this.onClose.next(false);
    this._bsModalRef.hide();
  }

  /*public openInNewTab() {
    // Construct the URL with the 'ofertaId' parameter
    const url = `/comercial/ciclo-vendas/23/cotacoes-pedidos/lista/vista/${this.ofertaId}`;

    // Open the URL in a new tab
    window.open(url, '_blank');
  }*/

  public captureScreen() {
    const content = this.contentToConvert.nativeElement;

    if (!content) {
      console.error('Element with id contentToConvert not found.');
      return;
    }

    if (content.childElementCount === 0) {
      console.error('No content found inside the contentToConvert element.');
      return;
    }

    html2canvas(content).then((canvas) => {
      const imgWidth = 980;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      const contentDataURL = canvas.toDataURL('image/png');

      // Create a new window and open the PDF in a new tab
      const newWindow = window.open('', '_blank');
      newWindow.document.open();
      newWindow.document.write(`<html><body><img src="${contentDataURL}" width="${imgWidth}" height="${imgHeight}" /></body></html>`);
      newWindow.document.close();

      setTimeout(() => {
        newWindow.print();
      }, 500);
    });
  }

  onDownloadPDF() {
    const content = this.contentToConvert.nativeElement;

    // Use html2canvas to capture the content as an image
    html2canvas(content).then(canvas => {
      // Create a new PDF document
      const pdf = new jsPDF('p', 'mm', 'a4');

      // Calculate the image dimensions to fit the PDF page
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Add the captured image to the PDF
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, imgHeight);

      // Download the PDF
      pdf.save('your_pdf_filename.pdf');
    });
  }

  toggleDescripcionCard() {
    this.showCierreButton = false;
    this.showDescripcionCard = true;
    this.showGuardarButton = true;
  }

  onSubmit() {
    this.cotacoesService.finalizarOferta(this.myForm.value).subscribe((response: JsonResponse) => {
      if (response.success == false) {
        this.pnotifyService.error(response.message);
      }
      else{
        this.pnotifyService.success(response.message);
      }
    });
    this._bsModalRef.hide();
    return '/comercial/ciclo-vendas/23/cotacoes-pedidos/lista';
  }

}
