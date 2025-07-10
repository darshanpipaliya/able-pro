import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { SandBoxService } from 'src/app/services/sandbox.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { AgGridTableComponent } from 'src/app/common/ag-grid-table/ag-grid-table.component';

@Component({
  selector: 'app-isd-by-charge-location',
  templateUrl: './isd-by-charge-location.component.html',
  styleUrls: ['./isd-by-charge-location.component.scss'],
  imports: [SharedModule, PrimgModule, AgGridTableComponent]
})
export class IsdByChargeLocationComponent implements OnInit {

  public columnDefs1: any;
  rowData: any = [];
  rowSelection = 'multiple';
  defaultColDef = {
    editable: true,
    sortable: true,
    minWidth: 100,
    filter: true,
    resizable: true,
    floatingFilter: true,
    flex: 1,
    
  };
  sideBar = {
    toolPanels: ['columns', 'filters']
  };
  @Input() sandBoxGridRowData: any;
  @Input() overviewData: any;
  @Input() recordPublishedOrCompleted: any;

  @ViewChild('tooltipText') tooltipText!: TemplateRef<any>;

  private _unsubscribeInventory: Subject<any> = new Subject<any>();


  @Output() onCellClicked: EventEmitter<any> = new EventEmitter<any>();

  constructor(public sandBoxService: SandBoxService, public dialog: MatDialog) {
   

  }

  cellActDetailRenderer() {
    const symbol = this.overviewData?.CurrencySymbol;
    return function (params: any) {
      if (params.data.AccountLevelChargesDifference === null || params.data.AccountLevelChargesDifference === undefined) {
        if (params.data.DistributedAccountLevelCharges === null) {
          return '';
        } else {
          return `<a href="javascript:void(0);" style="text-decoration: underline;">${symbol}${Number(params.value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</a>`;
        }
      } else {
        return '--';
      }
    };
  }


  cellAdjDetailRenderer() {
    const symbol = this.overviewData?.CurrencySymbol;
    return function (params: any) {
      if (params.data.AccountLevelAdjustmentChargesDifference === null || params.data.AccountLevelAdjustmentChargesDifference === undefined) {
        if (params.data.DistributedAccountLevelAdjustmentCharges === null) {
          return '';
        } else {
          return `<a href="javascript:void(0);" style="text-decoration: underline;">${symbol}${Number(params.value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</a>`;
        }
      } else {
        return '--';
      }
    };
  }

  cellRenderer() {
    const symbol = this.overviewData?.CurrencySymbol;
    return function (params: any) {
      if (params.value === null || params.value === undefined) {
        return '--';
      } else if (params.value > 0 || params.value < 0) {
        return `<a href="javascript:void(0);" style="text-decoration: underline;">${symbol}${Number(params.value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</a>`;
      } else {
        return `${symbol}${Number(params.value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      }
    };
  }

  serviceCellRender() {
    const symbol = this.overviewData?.CurrencySymbol;
    return function (params: any) {
      if (params.value === null || params.value === undefined) {
        if (params.data.ServiceLevelDetailCharges === null) {
          return '';
        } else{
        return '--';
        }
      } else if (params.value > 0 || params.value < 0) {
        return `<a href="javascript:void(0);" style="text-decoration: underline;">${symbol}${Number(params.value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</a>`;
      } else {
        return `${symbol}${Number(params.value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      }
    };
  }


  ngOnInit(): void {
    this.getChargeValidationByChargeLocations();
    this.columnDefs1 = [
      {
        headerName: 'Account',
        children: [
          {
            field: 'AccountNumber',
            headerName: 'Account Number',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 153,
            minWidth: 153,
            flex: 0
          }
        ],
      },
      {
        headerName: 'Service Level Charges',
        children: [
          {
            field: 'ServiceLevelChargesDifference',
            headerName: 'Service Difference',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agNumberColumnFilter',
            width: 159,
            minWidth: 159,
            flex: 0,
            cellStyle: {display: 'flex !important', 'justify-content': 'end','padding-right':'50px'},
            cellRenderer: this.serviceCellRender()
          },
          {
            field: 'TotalServiceLevelCharges',
            headerName: 'Total Service Charges',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agNumberColumnFilter',
            width: 178,
            minWidth: 178,
            flex: 0,
            cellStyle: {display: 'flex !important', 'justify-content': 'end','padding-right':'50px'},

            valueFormatter: (params: any) => this.currencyFormatter(params.data.TotalServiceLevelCharges, this.overviewData.CurrencySymbol)
          },
          {
            field: 'ServiceLevelDetailCharges',
            headerName: 'Service Detail Summary',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agNumberColumnFilter',
            width: 193,
            minWidth: 193,
            flex: 0,
            cellStyle: {display: 'flex !important', 'justify-content': 'end','padding-right':'50px'},
            cellRenderer: this.serviceCellRender()
          }
        ],
      },
      {
        headerName: 'Account Level Charges',
        children: [
          {
            field: 'AccountLevelChargesDifference',
            headerName: 'Acct Charge Difference',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agNumberColumnFilter',
            width: 188,
            minWidth: 188,
            flex: 0,
            cellStyle: {display: 'flex !important', 'justify-content': 'end','padding-right':'50px'},
            cellRenderer: this.cellRenderer()
          },
          {
            field: 'TotalAccountLevelCharges',
            headerName: 'Total Account Charges',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agNumberColumnFilter',
            width: 184,
            minWidth: 184,
            flex: 0,
            cellStyle: {display: 'flex !important', 'justify-content': 'end','padding-right':'50px'},
            valueFormatter: (params: any) => this.currencyFormatter(params.data.TotalAccountLevelCharges, this.overviewData.CurrencySymbol)
          },
          {
            field: 'DistributedAccountLevelCharges',
            headerName: 'Acct Detail Summary',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agNumberColumnFilter',
            width: 176,
            minWidth: 176,
            flex: 0,
            cellStyle: {display: 'flex !important', 'justify-content': 'end','padding-right':'50px'},
            cellRenderer: this.cellActDetailRenderer()
          }
        ],
      },
      {
        headerName: 'Account Level Adjustments',
        children: [
          {
            field: 'AccountLevelAdjustmentChargesDifference',
            headerName: 'Account Adjustment Difference',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agNumberColumnFilter',
            width: 238,
            minWidth: 238,
            flex: 0,
            cellStyle: {display: 'flex !important', 'justify-content': 'end','padding-right':'50px'},
            cellRenderer: this.cellRenderer()
          },
          {
            field: 'TotalAccountLevelAdjustmentCharges',
            headerName: 'Total Account Adjustments',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agNumberColumnFilter',
            width: 211,
            minWidth: 211,
            flex: 0,
            cellStyle: {display: 'flex !important', 'justify-content': 'end','padding-right':'50px'},
            valueFormatter: (params: any)  => this.currencyFormatter(params.data.TotalAccountLevelAdjustmentCharges, this.overviewData.CurrencySymbol)
          },
          {
            field: 'DistributedAccountLevelAdjustmentCharges',
            headerName: 'Acct Adj Detail Summary',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agNumberColumnFilter',
            width: 200,
            minWidth: 200,
            flex: 0,
            cellStyle: {display: 'flex !important', 'justify-content': 'end','padding-right':'50px'},
            cellRenderer: this.cellAdjDetailRenderer()
             
          },
        ],
      },
      
    ];
  }

  openDialog(): void {
     this.dialog.open(this.tooltipText, {
      width: '900px',
          data: {
            colseButton: true,
          }
    });
  }

  ngOnDestroy(): void {
    this._unsubscribeInventory.next(null);
    this._unsubscribeInventory.complete();
  }

  getChargeValidationByChargeLocations() {
    this._unsubscribeInventory.next(null);
    this.sandBoxService
      .chargeValidationByChargeLocations(this.sandBoxGridRowData.SBInvoiceId)
      .pipe(takeUntil(this._unsubscribeInventory))
      .subscribe(
        async (data: any) => {
          if (data && data.Data.$values) {
            this.rowData = data.Data.$values;
          }
        },
        (error) => {
        }
      );
  }

  onCellDoubleClicked(event: any) {
    if(((event.data.ServiceLevelChargesDifference > 0 || event.data.ServiceLevelChargesDifference < 0) && event.colDef.field == "ServiceLevelChargesDifference") || (event.data.ServiceLevelChargesDifference === null && event.colDef.field == "ServiceLevelDetailCharges")){
      const rowData = event.data;
      this.onCellClicked.emit({ rowData: rowData, index: 3, field: event.colDef.field });
    } 

    if(((event.data.AccountLevelChargesDifference > 0 || event.data.AccountLevelChargesDifference < 0) && event.colDef.field == "AccountLevelChargesDifference") || (event.data.AccountLevelChargesDifference === null && event.colDef.field == "DistributedAccountLevelCharges")){
      const rowData = event.data;
      this.onCellClicked.emit({ rowData: rowData, index: 4, field: event.colDef.field });
    } 

    if(((event.data.AccountLevelAdjustmentChargesDifference > 0 || event.data.AccountLevelAdjustmentChargesDifference < 0) && event.colDef.field == "AccountLevelAdjustmentChargesDifference") || (event.data.AccountLevelAdjustmentChargesDifference === null && event.colDef.field == "DistributedAccountLevelAdjustmentCharges")){
      const rowData = event.data;
      this.onCellClicked.emit({ rowData: rowData, index: 4, field: event.colDef.field });
    } 

  }

  // currencyFormatter(currency, sign) {
  //   if(currency !== null){
  //     var sansDec = currency.toFixed(2);
  //     // var formatted = sansDec.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  //     // if(formatted != 0){
  //     //   formatted = formatted ? parseFloat(formatted).toFixed(2) : 0.00;
  //     // }
  //     return sign + `${sansDec}`;
  //   }
  // }
  
  currencyFormatter(currency: any, sign: any  ) {
    if (currency === null || currency === undefined) {
      return '--';
    }
    const sansDec = currency.toFixed(2);
    return sign + `${sansDec.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
  }
}