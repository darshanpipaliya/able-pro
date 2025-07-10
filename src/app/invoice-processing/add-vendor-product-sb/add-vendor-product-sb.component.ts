import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import _ from 'lodash';
import { processNumberFilter, processTextFilter } from 'src/app/common/ag-grid-filter';
import { ErrorWarningPopupComponent } from 'src/app/common/error-warning-popup/error-warning-popup.component';
import { SandBoxService } from 'src/app/services/sandbox.service';
import { WirelineService } from 'src/app/services/wireline.service';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { AgGridTableComponent } from 'src/app/common/ag-grid-table/ag-grid-table.component';
@Component({
  selector: 'app-add-vendor-product-sb',
  templateUrl: './add-vendor-product-sb.component.html',
  styleUrls: ['./add-vendor-product-sb.component.scss'],
  imports: [SharedModule, PrimgModule, AgGridTableComponent]
})
export class AddVendorProductSbComponent implements OnInit {

  @Input() sandBoxGridRowData: any;

  @Input() overviewData: any;
  
  gridApi: any;
  @Output() switchTab: EventEmitter<any> = new EventEmitter<any>();
  saveButtonLoader = false;
  
  private _unsubscribeFromOtherSBInvoice: Subject<any> = new Subject<any>();
  private _unsubscribeSave: Subject<any> = new Subject<any>();
  selectedInventory = [];

  public columnDefs;
  rowData: any = [];
  rowData1: any = [];
  selectedCCVLeft = [];
  selectedCCVRight = [];
  vbaList = [];
  rowSelection = 'multiple';
  defaultColDef = {
    editable: false,
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

  gridOptions = {
    rowModelType: 'serverSide',
    serverSideInfiniteScroll: true,
    enableFiltering: true,
    headerHeight: 35,
    groupHeaderHeight: 37,
    floatingFiltersHeight: 35
  };

  @ViewChild('tooltipText') tooltipText!: TemplateRef<any>;

  constructor(public dialog: MatDialog, public sandBoxService: SandBoxService, public wirelineService: WirelineService) {
    this.columnDefs = [
      {
        headerCheckboxSelection: false,
        checkboxSelection: true,
        floatingFilter: true,
        suppressMenu: true,
        minWidth: 150,
        maxWidth: 50,
        width: 100,
        flex: 0,
        resizable: true,
        sortable: false,
        filter: false,
        suppressColumnsToolPanel: true,
      },
      {
        headerName: 'Inventory',
        children: [
          {
            field: 'ServiceNumber',
            headerName: 'Service Number',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 128,
            resizable: true,
            sortingField: 'ServiceNumber'
          },
        ],
      },
      {
        headerName: 'Accounts',
        children: [
          {
            field: 'MainAccountNumber',
            headerName: 'Main Billing Account Number',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 227,
            resizable: true,
            sortingField: 'MainAccountNumber'
          },
          {
            field: 'SubAccountNumber',
            headerName: 'Sub Account Number',
            filter: 'agTextColumnFilter',
            columnGroupShow: 'open',
            editable: false,
            minWidth: 179,
            resizable: true,
            sortingField: 'SubAccountNumber'
          },
          {
            field: 'PayableAccountNumber',
            headerName: 'Payable Account Number',
            filter: 'agTextColumnFilter',
            columnGroupShow: 'open',
            editable: false,
            minWidth: 202,
            resizable: true,
            sortingField: 'PayableAccountNumber'
          }
        ],
      },
      {
        headerName: 'Charge',
        children: [
          {
            field: 'TotalCurrentChargesDisplay',
            headerName: 'Charge',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agNumberColumnFilter',
            minWidth: 120,
            resizable: true,
            cellStyle: {display: 'flex !important', 'justify-content': 'end','padding-right':'30px'},
            sortingField: 'TotalCurrentCharges'
          }
        ],
      },
      {
        headerName: 'Vendor Product',
        children: [
          {
            field: 'VendorProductTypeName',
            headerName: 'Vendor Product',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 167,
            resizable: true,
            sortingField: 'VendorProductTypeName'
          },
          {
            field: 'Service',
            headerName: 'Service',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 125,
            resizable: true,
            sortingField: 'Service'
          },
          {
            field: 'ServiceType',
            headerName: 'Service Type',
            filter: 'agTextColumnFilter',
            columnGroupShow: 'open',
            editable: false,
            minWidth: 148,
            flex: 0,
            resizable: true,
            sortingField: 'ServiceType'
          },
          {
            field: 'Product',
            headerName: 'Product',
            filter: 'agTextColumnFilter',
            columnGroupShow: 'open',
            editable: false,
            minWidth: 121,
            flex: 0,
            resizable: true,
            sortingField: 'Product'
          },
          {
            headerName: 'Product Type',
            field: 'ProductType',
            filter: 'agTextColumnFilter',
            editable: false,
            columnGroupShow: 'open',
            minWidth: 152,
            flex: 0,
            resizable: true,
            sortingField: 'ProductType'
          }
        ],
      },
      {
        headerName: 'Status',
        children: [
          {
            field: 'InventoryStatusDisplayText',
            headerName: 'Status',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 111,
            resizable: true,
            sortingField: 'InventoryStatusDisplayText'
          }
        ],
      }
    ];
  }

  onSelectionChanged($event: any) {
    this.selectedInventory = $event;
  }

  onAgGridReady($event: any) {
    this.gridApi = $event;
    let dataSource: any = {
      rowCount: null,
      getRows: (params: any) => {
        let paramsRequest = params['request'];
        const filterArray:any = [];
        const filterArrayNumber:any = [];

        for (var key in paramsRequest.filterModel) {
          let data = paramsRequest.filterModel[key];
          let arr;
          let arrNumber;

          if (key == 'TotalCurrentChargesDisplay') {
            key = 'TotalCurrentCharges'
          }
          if(key == 'TotalCurrentCharges') {
            arrNumber = processNumberFilter(key, data);
              filterArrayNumber.push(arrNumber);
            } else {
            arr = processTextFilter(key, data);
            filterArray.push(arr);
          }
        }
        let data: any = {
          StartRowIndex:
            paramsRequest.startRow === 0 ? 1 : paramsRequest.startRow + 1,
          MaximumRows: 100
        };

        filterArrayNumber.push({
          
              "filterKey": "vendorAccountId",
              "filterOptionType1": "equals",
              "filterOptionValue1": this.sandBoxGridRowData.VendorAccountId,
              "filterOptionValue1_2": null,
              "filterOperationType": "AND",
              "filterOptionType2": null,
              "filterOptionValue2": null,
              "filterOptionValue2_2": null
        },
           {
              "filterKey": "BillingAccountHierarchyId",
              "filterOptionType1": "equals",
              "filterOptionValue1": this.sandBoxGridRowData.PayableBillingAccountHierarchyId,
              "filterOptionValue1_2": null,
              "filterOperationType": "AND",
              "filterOptionType2": null,
              "filterOptionValue2": null,
              "filterOptionValue2_2": null
          }
      )

        if (filterArrayNumber && filterArrayNumber.length > 0) {
          data['advanceNumberFilter'] = filterArrayNumber;
        } 

        if (filterArray && filterArray.length > 0) {
          data['advanceFilter'] = filterArray;
        }

        if (paramsRequest.sortModel.length > 0) {

          Object.values(params['columnApi']['columnController']['columnDefs']).forEach((key:any) => {
            if (key['children']) {
              Object.values(key['children']).forEach((k:any) => {
                if (k['field'] === paramsRequest.sortModel[0].colId) {
                  data['OrderBy'] = k['sortingField'];
                  data['SortOrder'] = paramsRequest.sortModel[0].sort;
                }
              });
            }
          });
        }
        
        data['customerAccountId'] = this.sandBoxGridRowData.CustomerAccountId;
        data['VendorBillingAliasId'] = this.sandBoxGridRowData.VendorBillingAliasId;
        data['VendorAccountId'] = this.sandBoxGridRowData.VendorAccountId;
        data['IsForDistrubation'] = true;
        data['IsTotalNeed'] = true
        data['IsChargeCodeNeed'] = true

        this.wirelineService.getInventoryData(data).pipe(takeUntil(this._unsubscribeFromOtherSBInvoice))
          .subscribe(
            async (data: any) => {
              this.rowData = data.Data.$values;
              if (data && data.Data.$values.length > 0) {
                let lastRow = -1;
                if (data.TotalCount <= paramsRequest.startRow + 100) {
                  lastRow = data.TotalCount;
                }
                params.success({
                  rowData: data.Data.$values,
                  rowCount: lastRow
                });
              } else {
                params.success({
                  rowData: [],
                  rowCount: 0
                });
                this.gridApi.showNoRowsOverlay();
              }
            },
            (error) => {
              params.success({
                rowData: [],
                rowCount: 0
              });
              this.gridApi.showNoRowsOverlay();
            }
          );
      },
    };
    if (this.gridApi!.api) {
      this.gridApi!.api.setGridOption("serverSideDatasource", dataSource);
    } else {
      this.gridApi.setGridOption("serverSideDatasource", dataSource);
    }
  }
  onAgGridReadyEmit($event: any) {
    this.gridApi = $event.api;
  }
  addInvoice() {
   
    let addInventoryData:any = _.map(this.selectedInventory, (record:any) => ({
      vendorAccountId: record.VendorAccountId,
      vendorBillingAliasId: record.VendorBillingAliasId,
      billingAccountHierarchyId: record.BillingAccountHierarchyId,
      inventoryId: record.InventoryId,
      vendorProductInventoryId: record.VendorProductInventoryId,
      ChargeCodeId : record.ChargeCodeId
    }));
  
    this.saveButtonLoader = true;
    this._unsubscribeSave.next(null);
    this.sandBoxService.FromOtherSBInvoiceSave(this.sandBoxGridRowData.SBInvoiceId, addInventoryData).pipe(takeUntil(this._unsubscribeSave)).subscribe((res: any) => {
      this.saveButtonLoader = false
      if (res.Success) {

        this.errorPopup(res);
      } else {
        this.errorPopup(res);
      }

      if(res?.Other?.NeedToCheckNextStep) {
        this.sandBoxService.getInvoiceStep(this.sandBoxGridRowData.SBInvoiceId).subscribe(()=> {
        })
      }
    })
  }

  errorPopup(data: any) {
    let errorData: any = {
      messgeType: 'error',
      title: 'Attention',
      titleClass: 'text-c-blue',
      icon: 'fas fa-exclamation-circle',
      iconClass: 'text-c-blue f-70',
      message: data.Message,
    };
    const dialogRef = this.dialog.open(ErrorWarningPopupComponent, {
      panelClass: 'error-warning',
      data: errorData,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (data.Success) {
        this.switchTab.emit(0)
      }
    });
  }
  openDialog() {
    const dialogRef = this.dialog.open(this.tooltipText, {
      width: '900px',
          data: {
            colseButton: true,
          }
    });
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    this._unsubscribeFromOtherSBInvoice.next(null);
    this._unsubscribeFromOtherSBInvoice.complete();
    this._unsubscribeSave.next(null);
    this._unsubscribeSave.complete();
  }
}
