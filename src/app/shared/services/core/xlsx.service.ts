import { Injectable, EventEmitter } from '@angular/core';

import { IXlsxExport } from 'src/app/models/xlsx-export';

// xlsx
import * as XLSX from 'xlsx';
type AOA = any[][];

@Injectable({
  providedIn: 'root'
})
export class XlsxService {

  private data: AOA;
  private wopts: XLSX.WritingOptions = { bookType: 'xlsx', type: 'array' };

  fileLoaded: EventEmitter<any> = new EventEmitter();

  constructor() { }

  export(params: Partial<IXlsxExport>) {

    let varExport: any = [];

    const headers = params.headers ?? Object.keys(params.data[0]);

    varExport.push(headers);

    params.data.forEach(element => {
      varExport.push(Object.values(element));
    });

    /* generate worksheet */
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(varExport);

    /* generate workbook and add the worksheet */
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    /* save to file */
    XLSX.writeFile(wb, (this.getFileName(params.filename)) + '.xlsx');
  }

  getFile(evt: any) {

    /* wire up file reader */
    const target: DataTransfer = <DataTransfer>evt.target;

    if (target.files.length !== 1) throw new Error('Cannot use multiple files');

    const reader: FileReader = new FileReader();
    reader.onload = (e: any) => {
      /* read workbook */
      const bstr: string = e.target.result;
      const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });

      /* grab first sheet */
      const wsname: string = wb.SheetNames[0];
      const ws: XLSX.WorkSheet = wb.Sheets[wsname];

      /* save data */
      this.fileLoaded.emit(<AOA>XLSX.utils.sheet_to_json(ws, { header: 1 }));
    };

    reader.readAsBinaryString(target.files[0]);
  }

  getFileName(filename: string = 'relatorio'){

    filename = filename ?? 'relatorio'

    const d = (new Date());
    const timestamp = `${d.getFullYear()}_${d.getMonth()}_${d.getDate()}_${d.getHours()}_${d.getMinutes()}_${d.getSeconds()}`;
    return `${filename}__${timestamp}`;
  }
}
