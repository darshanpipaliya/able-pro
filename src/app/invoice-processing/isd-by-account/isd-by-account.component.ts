import { Component, EventEmitter, Input, OnInit, Output, ViewChild, TemplateRef } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { SandBoxService } from 'src/app/services/sandbox.service';
import { MatDialog } from '@angular/material/dialog';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { AgGridTableComponent } from 'src/app/common/ag-grid-table/ag-grid-table.component';
@Component({
  selector: 'app-isd-by-account',
  templateUrl: './isd-by-account.component.html',
  styleUrls: ['./isd-by-account.component.scss'],
  imports: [SharedModule, PrimgModule, AgGridTableComponent]
})
export class IsdByAccountComponent implements OnInit {
  @Input() sandBoxGridRowData: any;
  @Input() overviewData: any;
  @Input() recordPublishedOrCompleted: any;

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
  private _unsubscribeCharge: Subject<any> = new Subject<any>();

  @Output() onCellClicked: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild('tooltipText') tooltipText!: TemplateRef<any>;
  
  constructor(public sandBoxService: SandBoxService, public dialog: MatDialog) {    
  }

  ngOnInit(): void {
    this.getChargeValidationByAccount();
    this.columnDefs1 = [
      {
        headerName: 'Match',
        children: [
          {
            field: 'IsTotalMatch',
            headerName: 'Total Match',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 122,
            flex: 0,
            cellRenderer: function (params: any) { 
              return params.value == true ? '<i class="far fa-check-square text-success"></i>' : '<i class="fas fa-times" style="color: #CF2A27"></i>'
            }
          }
        ],
      },
      {
        headerName: 'Accounts',
        children: [
          {
            field: 'PayableAccount',
            headerName: 'Main Account Number',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 209,
            flex: 0
          },
          {
            field: 'SubAccountNumber',
            headerName: 'Sub Account Number',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 201,
            flex: 0
          },
          {
            field: 'IsPayableAccountDisplay',
            headerName: 'Payable ?',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 107,
            flex: 0,
           
          }
        ],
      },
      {
        headerName: 'Totals',
        children: [
          {
            field: 'AmountToPay',
            headerName: 'Invoice Amount to Pay',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agNumberColumnFilter',
            minWidth: 208,
            flex: 0,
            valueFormatter: (params: any) => this.currencyFormatter(params.data.AmountToPay, this.overviewData?.CurrencySymbol),
            cellStyle: {display: 'flex !important', 'justify-content': 'end','padding-right':'50px'}
          },
          {
            field: 'ChargeDetailTotal',
            headerName: 'Detail Summary',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agNumberColumnFilter',
            minWidth: 160,
            flex: 0,
            valueFormatter: (params: any) => this.currencyFormatter(params.data.ChargeDetailTotal, this.overviewData?.CurrencySymbol),
            cellStyle: {display: 'flex !important', 'justify-content': 'end','padding-right':'50px'}
          },
          {
            field: 'Difference',
            headerName: 'Difference',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agNumberColumnFilter',
            minWidth: 141,
            flex: 0,
            cellStyle: {display: 'flex !important', 'justify-content': 'end','padding-right':'50px'},
            cellRenderer: this.cellRenderer() 
          }
        ]
      }
    ];
  }

  cellRenderer() {
    const symbol = this.overviewData?.CurrencySymbol; // Default fallback
    return function (params: any) {
      const value = params?.value;
      if (value === null || value === undefined || isNaN(value)) {
        return '--';
      }
      const formatted = Number(value).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
      return `<a href="javascript:void(0);" style="text-decoration: underline;">${symbol}${formatted}</a>`;
    };
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(this.tooltipText, {
      width: '900px',
          data: {
            colseButton: true,
          }
    });
  }

  getChargeValidationByAccount() {
    this._unsubscribeCharge.next(null);
    this.sandBoxService.getChargeValidationByAccount(this.sandBoxGridRowData.SBInvoiceId).pipe(takeUntil(this._unsubscribeCharge))
    .subscribe((data: any) => {
      if (data.Success) {
        this.rowData = data.Data.$values
      }
    });
  }

  onCellDoubleClicked(event: any) {
    if (event.colDef.field == "Difference") {
      const rowData = event.data;
      this.onCellClicked.emit({ rowData: rowData, index: 4, field: event.colDef.field });
    }
  }

  currencyFormatter(currency: any, sign: any) {
    var sansDec = currency.toFixed(2);
    // var formatted = sansDec.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    // if(formatted != 0){
    //   formatted = formatted ? parseFloat(formatted).toFixed(2) : 0.00;
    // }
    return sign + `${sansDec.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
  }

  ngOnDestroy() {
    this._unsubscribeCharge.next(null);
    this._unsubscribeCharge.complete();
  }

  ngOnChanges(changes: any) {
    if (changes && changes['overviewData'] && changes['overviewData']['currentValue'] && changes['overviewData']['currentValue'] !== changes['overviewData']['previousValue']) {
      this.overviewData = changes['overviewData']['currentValue'];
      this.getChargeValidationByAccount();
    }
  }
}
