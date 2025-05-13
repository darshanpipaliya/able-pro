import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import moment from 'moment';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class VariableManageService {

  profileDialog = false;
  isLoggedinPopup = false;
  wirelineWhichPageEnabled = 'Table';
  mobilityWhichPageEnabled = 'Table';
  selectedRecordsGRID: any = [];


  private setCallAPIForInventoryDta: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
  getCallAPIForInventoryDta$: Observable<string | null> = this.setCallAPIForInventoryDta.asObservable();

  constructor() {
  }

  onBtnExportDataAsExcel(data: { gridApi: { exportDataAsExcel: (arg0: { fileName: any; sheetName: any; allColumns: boolean; columnGroups: boolean; columnWidth: number; onlySelected: boolean; onlySelectedAllPages: boolean; shouldRowBeSkipped: boolean; skipFooters: boolean; skipGroups: boolean; skipHeader: boolean; skipPinnedTop: boolean; skipPinnedBottom: boolean; columnKeys: string[]; processCellCallback: (params: any) => any; }) => void; }; exportFilename: any; sheetName: any; gridColumnApi: any; }) {
    data.gridApi.exportDataAsExcel({
      fileName: data.exportFilename,
      sheetName: data.sheetName,
      allColumns: true,
      columnGroups: true,
      columnWidth: 100,
      onlySelected: false,
      onlySelectedAllPages: false,
      shouldRowBeSkipped: false,
      skipFooters: false,
      skipGroups: false,
      skipHeader: false,
      skipPinnedTop: true,
      skipPinnedBottom: true,
      columnKeys: this.generateColumnsForExcel(data.gridColumnApi),
      processCellCallback: function (params: { column: { getColId: () => string; }; value: string | number | Date; }) {
        if ((params.column.getColId() === 'StartDate' || params.column.getColId() === 'EndDate') && params.value) {
          params.value = moment(new Date(params.value)).format('MM-DD-YYYY')
        }
        return params.value;
      },
    });
  }

  generateColumnsForExcel(data: { getAllColumns: () => any; }): string[] {
    var columnsForExport: any = [];
    const allColumns = data.getAllColumns();
    allColumns.forEach((element: any) => {
      if (element.colId != '0') {
        columnsForExport.push(element.colId);
      }
    });
    return columnsForExport;
  }

  saveCelectedRecordsGRID(e: any, bool: any) {
    this.selectedRecordsGRID.push(e);

    if (!bool) {
      let index = this.selectedRecordsGRID.findIndex((x: any) => x === e);
      this.selectedRecordsGRID = this.selectedRecordsGRID.splice(index, 1);
    }
  }

  getCallAPIInventoryData() {
    return this.setCallAPIForInventoryDta.getValue();
  }

  setCallAPIInventoryData(value: string | null) {
    this.setCallAPIForInventoryDta.next(value);
  }

}
