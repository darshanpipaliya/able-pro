import { Component, Input, OnInit, EventEmitter, Output, SimpleChanges, ViewChild, TemplateRef } from '@angular/core';

import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { SandBoxService } from 'src/app/services/sandbox.service';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { AgGridTableComponent } from 'src/app/common/ag-grid-table/ag-grid-table.component';
@Component({
  selector: 'app-payable-account',
  templateUrl: './payable-account.component.html',
  styleUrls: ['./payable-account.component.scss'],
  imports: [SharedModule, PrimgModule, AgGridTableComponent]
})
export class PayableAccountComponent implements OnInit {
  @Output() onCellClicked: EventEmitter<any> = new EventEmitter<any>();
  @Output() mainTabRedirect: EventEmitter<any> = new EventEmitter<any>();

  @Input() sandBoxGridRowData: any;
  @Input() overViewData: any;
  @Input() recordPublishedOrCompleted: any;
  @Input() reloadGrid: any;
  
  rowData: any = [];
  totalRecords = 0;
  loadingPaybleAccTable: boolean = false;
  
  private _unsubscribeCharge: Subject<any> = new Subject<any>();
  public columnDefs1;
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
  @ViewChild('tooltipText') tooltipText!: TemplateRef<any>;

  constructor(public sandBoxService: SandBoxService, public dialog: MatDialog) {
    this.columnDefs1 = [
      {
        field: 'IsTotalMatch',
        headerName: 'Total Match',
        editable: false,
        filter: 'agTextColumnFilter',
        width: 135,
        minWidth: 135,
        flex: 0,
        cellRenderer: function (params: any) {
          return params.value == true ? '<i class="far fa-check-square text-success"></i>' : '<i class="fas fa-times" style="color: #CF2A27"></i>'
        }
      },
      {
        field: 'PayableAccount',
        headerName: 'Payable Account Number',
        editable: false,
        filter: 'agTextColumnFilter',
        minWidth: 250,
        flex: 0
      },
      {
        field: 'AmountToPay',
        headerName: 'Invoice Amount to Pay',
        columnGroupShow: 'close',
        editable: false,
        filter: 'agTextColumnFilter',
        minWidth: 250,
        flex: 0,
        valueFormatter: (params: any) => this.currencyFormatter(params.data.AmountToPay, this.overViewData.CurrencySymbol),
        cellStyle: {display: 'flex !important', 'justify-content': 'end','padding-right':'50px'}
      }, {
        field: 'ChargeDetailTotal',
        headerName: 'Detail Charges',
        columnGroupShow: 'close',
        editable: false,
        filter: 'agTextColumnFilter',
        minWidth: 175,
        flex: 0,
        valueFormatter: (params: any) => this.currencyFormatter(params.data.ChargeDetailTotal, this.overViewData.CurrencySymbol),
        cellStyle: {display: 'flex !important', 'justify-content': 'end','padding-right':'50px'}
      },
      {
        field: 'Difference',
        headerName: 'Difference',
        columnGroupShow: 'close',
        editable: false,
        filter: 'agTextColumnFilter',
        minWidth: 170,
        flex: 0,
        cellRenderer: (params: any) => {
          const formattedValue = this.currencyFormatter(params.value, this.overViewData.CurrencySymbol);
          return `<a href="javascript:void(0)" style="text-decoration: underline; color: blue;">${formattedValue}</a>`;
        },
        onCellDoubleClicked: (params: any) => {
          this.onCellClicked.emit({ index: 1 });
        },
        cellStyle: {display: 'flex !important', 'justify-content': 'end','padding-right':'50px'}
      }
    ]
  }

  ngOnInit(): void {
    this.getChargeValidation();
  }

  ngOnChanges(changes: SimpleChanges) {  
    if(changes['reloadGrid'] && changes['reloadGrid'].currentValue) {
      this.getChargeValidation();
    }
  }
  openDialog(): void {
    const dialogRef = this.dialog.open(this.tooltipText, {
      width: '900px',
          data: {
            colseButton: true,
          }
    });
  }
  redirectTab(tab: any) {
    if (tab == 'details') {
      this.onCellClicked.emit({ index: 4 })
    } else if (tab == 'totals') {
      this.onCellClicked.emit({ index: 1 })
    } else {
      this.mainTabRedirect.emit(true);
    }
  }

  getChargeValidation() {
    this._unsubscribeCharge.next(null);
    this.sandBoxService.getChargeValidation(this.sandBoxGridRowData.SBInvoiceId).pipe(takeUntil(this._unsubscribeCharge))
      .subscribe((data: any) => {
        if (data.Success) {
          this.rowData = [data.Data];
        }
      });
  }

  ngOnDestroy() {
    this._unsubscribeCharge.next(null);
    this._unsubscribeCharge.complete();
  }

  currencyFormatter(currency: any, sign: any) {
    var sansDec = currency.toFixed(2);
    // var formatted = sansDec.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    // if(formatted != 0){
    //   formatted = formatted ? formatted.toFixed(2) : 0.00;
    // }
    return sign + sansDec.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
}
