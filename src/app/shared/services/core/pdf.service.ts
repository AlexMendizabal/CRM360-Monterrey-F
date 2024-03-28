import { Injectable } from '@angular/core';

// jspdf / html2canvas
import jspdf from 'jspdf';
import html2canvas from 'html2canvas';

// pdfmake
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { Observable } from 'rxjs';
import { getLocaleDateFormat } from '@angular/common';

pdfMake.vfs = pdfFonts.pdfMake.vfs;

interface PdfMakeConfig {
  content: Array<any>;
  styles?: Array<any>;
}

@Injectable({
  providedIn: 'root',
})
export class PdfService {
  pdfData: string;

  download(id: string, fileName: string) {
    const data = document.getElementById(id);

    html2canvas(data).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let doc = new jspdf('p', 'mm');
      let position = 0;

      doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        doc.addPage();
        doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      doc.save(`${fileName}.pdf`);
    });
  }

  generatePdf(pdfMakeConfig: PdfMakeConfig, name: string = null) {
    const fileName = name === null ? 'Documento.pdf' : `${name}.pdf`;

    let document = {
      pageSize: 'LETTER',
      pageOrientation: 'portrait',
      pageMargins: [20, 20, 20, 20],
      content: [],
      styles: [],
      defaultStyle: {
        font: 'Roboto',
      },
    };

    document.content = pdfMakeConfig.content;
    document.styles = pdfMakeConfig.styles || [];

    pdfMake.createPdf(document).download(fileName);
  }

  getData(data: any) {
    this.pdfData = data;
    console.log(this.pdfData);
    return this.pdfData;
  }

  generateEmailPdf(pdfMakeConfig: PdfMakeConfig) {
    let document = {
      pageSize: 'A4',
      pageOrientation: 'portrait',
      pageMargins: [20, 20, 20, 20],
      content: [],
      styles: [],
      defaultStyle: {
        font: 'Roboto',
      },
    };

    document.content = pdfMakeConfig.content;
    document.styles = pdfMakeConfig.styles || [];
    let pdfDoc = pdfMake.createPdf(document);

    return pdfDoc;
  }
}
