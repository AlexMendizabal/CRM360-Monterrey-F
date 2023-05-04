import { Injectable, EventEmitter } from '@angular/core';

// xlsx
import * as XLSX from 'xlsx';
type AOA = any[][];

@Injectable({
  providedIn: 'root'
})
export class XlsxService {
  fileEventEmitter: EventEmitter<any> = new EventEmitter();
  data: AOA = [[1, 2], [3, 4]];
  wopts: XLSX.WritingOptions = { bookType: 'xlsx', type: 'array' };

  constructor() {}

  loadFile(evt: any) {
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
      this.data = <AOA>XLSX.utils.sheet_to_json(ws, { header: 1 });

      this.fileEventEmitter.emit(this.data);
    };

    reader.readAsBinaryString(target.files[0]);
  }

  getFile() {
    return this.fileEventEmitter;
  }

  sendFile(file) {
    this.fileEventEmitter.emit(file);
  }

  exportFile(data, filename) {
    let varExport: any = [];

    varExport.push(Object.keys(data[0]));

    data.forEach(element => {
      varExport.push(Object.values(element));
    });

    /* generate worksheet */
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(varExport);

    /* generate workbook and add the worksheet */
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    /* save to file */
    XLSX.writeFile(wb, filename + '.xlsx');
  }
}
