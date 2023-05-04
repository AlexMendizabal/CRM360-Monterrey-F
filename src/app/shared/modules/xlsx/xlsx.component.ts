import { Component, OnInit } from '@angular/core';

// xlsx
import * as XLSX from 'xlsx';
import { XlsxService } from './xlsx.service';

type AOA = any[][];

@Component({
  selector: 'xlsx',
  templateUrl: './xlsx.component.html',
  styleUrls: ['./xlsx.component.scss']
})
export class XlsxComponent implements OnInit {
  files: any = [];
  headers: any = [];
  constructor(private xlsxEventEmitter: XlsxService) {}

  ngOnInit() {}

  data: AOA = [[1, 2], [3, 4]];
  wopts: XLSX.WritingOptions = { bookType: 'xlsx', type: 'array' };
  //fileName: string = 'export.xlsx';

  onFileChange(evt: any) {
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

      this.xlsxEventEmitter.fileEventEmitter.emit(this.data);
      this.data = [];
    };
    reader.readAsBinaryString(target.files[0]);
  }

  export(obj, filename: string = 'relatório'): void {
    const argument: any = this.makeArray(obj);

    /* generate worksheet */
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(argument);

    /* generate workbook and add the worksheet */
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    /* save to file */
    XLSX.writeFile(wb, filename + '.xlsx');
  }

  makeArray(data) {
    for (let index = 0; index < data.length; index++) {
      const element = data[index];

      if (index === 0) this.headers = element;
      else {
        if (element[0] > 0) {
          const qtElementos = this.files.length;
          this.files[qtElementos] = {};
          for (let i = 0; i < this.headers.length; i++)
            this.files[qtElementos][this.headers[i]] = element[i];
        }
      }
    }
  }
}
