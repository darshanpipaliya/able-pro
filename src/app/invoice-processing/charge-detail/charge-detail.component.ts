import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import * as _ from 'lodash';
import { VendorDropdownCellRenderer } from './vendor-dropdown-cell-renderer';
import { SandBoxService } from 'src/app/services/sandbox.service';
import { LocationService } from 'src/app/services/location.service';
import { checkIsValueExists } from 'src/app/services/helper';
import { ErrorWarningPopupComponent } from 'src/app/common/error-warning-popup/error-warning-popup.component';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { AgGridTableComponent } from 'src/app/common/ag-grid-table/ag-grid-table.component';

@Component({
  selector: 'app-charge-detail',
  templateUrl: './charge-detail.component.html',
  styleUrls: ['./charge-detail.component.scss'],
  imports: [SharedModule, PrimgModule, AgGridTableComponent],
})
export class ChargeDetailComponent implements OnInit {
  public sideBar;
  @Input() sandBoxGridRowData: any;
  @Input() recordPublishedOrCompleted: any;
  @Input() overviewData: any;

  frameworkComponents: any;
  @ViewChild('tooltipText') tooltipText!: TemplateRef<any>;
  @Output() step2Done: EventEmitter<any> = new EventEmitter<any>();

  public columnDefs: any;
  public rowData: any;
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
  saveButtonDisabled = false;

  VBAbyChargeCodeData = [];
  vendorsList = [];
  changedVendor: any = [];

  payloadArray: any;

  private _unsubscribeVendor: Subject<any> = new Subject<any>();
  private _unsubscribeVBAbyChargeCode: Subject<any> = new Subject<any>();
  private _unsubscribeSaveVBAbyChargeCode: Subject<any> = new Subject<any>();

  @Output() overviewDataOP: EventEmitter<any> = new EventEmitter<any>();
  @Output() clickOnSaved: EventEmitter<any> = new EventEmitter<any>();


  constructor(public sandBoxService: SandBoxService, public dialog: MatDialog, private locationService: LocationService) {
    this.sideBar = {
      toolPanels: ['columns', 'filters']
    };
    this.setColumnDefs();

  }
  currencyFormatter(currency: number, sign: string) {
    var sansDec = currency.toFixed(2);
    // var formatted = sansDec.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    // formatted = formatted ? parseFloat(formatted).toFixed(2) : 0.00;
    return sign + `${sansDec.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
  }
  ngOnInit(): void {
    // this.setColumnDefs();
    this.getVBAbyChargeCode();
    this._unsubscribeVendor.next(null);

    this.locationService
      .getVendorDropdown()
      .pipe(takeUntil(this._unsubscribeVendor))
      .subscribe({
        next: (data) => {
          if (data && data.Data.$values) {
            this.vendorsList = data.Data.$values;
            this.setColumnDefs();
          }
        }
      });
  }

  openTooltipDialog() {
      const dialogRef = this.dialog.open(this.tooltipText, {
        width: '900px',
            data: {
              colseButton: true,
            }
      });
  }
  setColumnDefs() {
    this.columnDefs = [
      {
        headerName: 'Vendor',
        children: [
          {
            field: 'VendorBillingAlias',
            headerName: 'Vendor Billing Alias By Charge Code',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 280,
            width: 280,
            flex: 0
          },
          {
            headerName: 'Charge Code Vendor',
            filter: 'agSetColumnFilter',
            minWidth: 180,
            width: 180,
            flex: 0,
            editable: false,
            cellStyle: {
              'display': 'flex',
              'justify-content': 'center'
            },
            cellClass: 'custom-cell-class-p-dropdown',
            filterParams: {
              values: this.vendorsList,
            },
            cellRenderer: VendorDropdownCellRenderer,
            cellRendererParams: {
              onClick: this.recordPublishedOrCompleted ? "" : this.onBtnClick1.bind(this),
              disabled: this.recordPublishedOrCompleted
            }
          }
        ],
      },
      {
        headerName: 'Detail',
        children: [
          {
            field: 'CountOfChargeCode',
            headerName: 'Count Of Charge Codes',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 205,
            width: 205,
            flex: 0,
            valueGetter(params: { data: { CountOfChargeCode: { toString: () => string; }; }; }) {
              if (params?.data?.CountOfChargeCode) {
                return params?.data?.CountOfChargeCode.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
              }
              return '';
            }
          },
          {
            field: 'TotalAmount',
            headerName: 'Total Amount',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            // width: 135,
            minWidth: 145,
            flex: 0,
            cellStyle: {display: 'flex !important', 'justify-content': 'end','padding-right':'43px'},
            valueFormatter: (params: { data: { TotalAmount: any; }; }) => this.currencyFormatter(params.data.TotalAmount, this.overviewData?.CurrencySymbol),
          },
          {
            field: 'PercentOfTotalDisplay',
            headerName: '% of Total',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            // width: 125,
            minWidth: 125,
            // flex: 0
          }
        ],
      },

    ];

    this.frameworkComponents = {
      VendorDropdownCellRenderer: VendorDropdownCellRenderer
    }
  }

  onBtnClick1(e: { index: string | number; vendorAccountId: any; }) {
    this.payloadArray[e.index].vendorAccountId = e.vendorAccountId;
  }

 
  getVBAbyChargeCode() {
    if (!checkIsValueExists(this.sandBoxGridRowData.SBInvoiceId)) {
      return;
    }
    this._unsubscribeVBAbyChargeCode.next(null);
    this.sandBoxService.getVBAbyChargeCode(this.sandBoxGridRowData.SBInvoiceId)
      .pipe(takeUntil(this._unsubscribeVBAbyChargeCode))
      .subscribe((data: any) => {
        this.rowData = [];
        if (data && data.Success) {
          this.rowData = data.Data.$values;
          for (let i = 0; i < this.rowData.length; i++) {
            this.rowData[i]['index'] = i;
          }
         
          this.payloadArray = _.map(this.rowData, function (value:any, key) {
            return { name: value.VendorBillingAlias, vendorAccountId: value.VendorAccountId };
          });

        } else {
          this.rowData = [];
        }
      });
  }

  ngOnDestroy(): void {
    this._unsubscribeVBAbyChargeCode.next(null);
    this._unsubscribeVBAbyChargeCode.complete();
    this._unsubscribeVendor.next(null);
    this._unsubscribeVendor.complete();
    this._unsubscribeSaveVBAbyChargeCode.next(null);
    this._unsubscribeSaveVBAbyChargeCode.complete();
  }

  saveVendorAlias() {
    let isVendorExist = _.some(this.payloadArray, (x: any) => x.vendorAccountId == null);
    if(isVendorExist) {
      let errorData: any = {
        messgeType: 'error',
        title: 'Attention',
        titleClass: 'text-c-blue',
        icon: 'fas fa-exclamation-circle',
        iconClass: 'text-c-blue f-70',
        message: 'Please select the charge code vendor.'
      };
      const dialogRef = this.dialog.open(ErrorWarningPopupComponent, {
        panelClass: 'error-warning',
        data: errorData,
      });
      return
    }

    let passData;
    this._unsubscribeSaveVBAbyChargeCode.next(null);
 
    passData = {
      vendorBillingAliasSaveDtos: this.payloadArray
    }
   
    this.saveButtonDisabled = true;
    this.sandBoxService.updateVBAbyChargeCode(this.sandBoxGridRowData.SBInvoiceId, passData).pipe(takeUntil(this._unsubscribeSaveVBAbyChargeCode))
      .subscribe((data: any) => {
        this.saveButtonDisabled = false;
        if (data.Success) {
          this.rowData = data.Data.$values;
          this.sandBoxService.getInvoiceOverview(this.sandBoxGridRowData.SBInvoiceId).subscribe((dataa: any) => {
            if (dataa?.Data) {
              dataa.Data.InvoiceProcessingStepsData.ChargeCodeAssignment = false;
              this.step2Done.emit(true);
              this.overviewDataOP.emit(dataa.Data);
              this.clickOnSaved.emit(true);
            }
          });
        } else {
          let errorData: any = {
            messgeType: 'error',
            title: 'Attention',
            titleClass: 'text-c-blue',
            icon: 'fas fa-exclamation-circle',
            iconClass: 'text-c-blue f-70',
            message: data.Message
          };
          const dialogRef = this.dialog.open(ErrorWarningPopupComponent, {
            panelClass: 'error-warning',
            data: errorData,
          });
        }
        
        if(data?.Other?.NeedToCheckNextStep) {
          this.sandBoxService.getInvoiceStep(this.sandBoxGridRowData.SBInvoiceId).subscribe((f) => {
          })
        }

      });
  }
}
