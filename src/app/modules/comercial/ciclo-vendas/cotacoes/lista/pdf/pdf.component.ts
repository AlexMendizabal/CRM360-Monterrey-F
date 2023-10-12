import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { DomSanitizer } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import html2canvas from 'html2canvas';
import * as jsPDF from 'jspdf';
import { VERSION, ViewChild, ElementRef } from '@angular/core';



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
  public onClose: Subject<boolean>;

  imageWidth = 300; // Increase the width as needed
  imageHeight = 85; // Increase the height as needed
  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
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

}
