import { Component, Input, OnInit } from '@angular/core';
import * as _ from 'lodash';
import moment from 'moment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { AgGridTableComponent } from 'src/app/common/ag-grid-table/ag-grid-table.component';
import { checkIsValueExists } from 'src/app/services/helper';
import { LocationService } from 'src/app/services/location.service';
import { SandBoxService } from 'src/app/services/sandbox.service';
import { ClientSideRowModelModule, ModuleRegistry, ServerSideRowModelModule } from 'ag-grid-enterprise';

ModuleRegistry.registerModules([ServerSideRowModelModule, ClientSideRowModelModule]);
@Component({
  selector: 'app-parent-inventory-selection',
  templateUrl: './parent-inventory-selection.component.html',
  styleUrls: ['./parent-inventory-selection.component.scss'],
  imports: [SharedModule, PrimgModule, AgGridTableComponent],
  providers: [SandBoxService,LocationService]
})
export class ParentInventorySelectionComponent implements OnInit {
  @Input() recordPublishedOrCompleted: any;
  @Input() sandBoxGridRowData: any;
  public columnDefs1: any;
  public columnDefs: any;
  rowData: any = [];
  vbaList = [];
  rowSelection = 'none';
  defaultColDef = {
    editable: false,
    sortable: true,
    minWidth: 100,
    filter: true,
    resizable: true,
    floatingFilter: true,
    flex: 1,
  };
  gridApi: any;
  gridColumnApi: any;
  private _unsubscribeGRid: Subject<any> = new Subject<any>();
  private _unsubscribeVBAbyChargeCode: Subject<any> = new Subject<any>();

  gridOptions = {
    rowModelType: 'serverSide',
    serverSideInfiniteScroll: true,
    enableFiltering: true,
    headerHeight: 35,
    groupHeaderHeight: 37,
    floatingFiltersHeight: 35,
    isRowSelectable: (rowNode: any) => {
      // Disable selection for all rows
      return false;
    }
  };
  
  public autoGroupColumnDef: any = {
    headerName: 'Group Id',
    field: 'GroupId',
    cellRendererParams: {
      suppressCount: true,
    },
    filterParams: {
      treeList: true,
    },
    filter: 'agTextColumnFilter',
    minWidth: 280,
    resizable: true,
  };
  sideBar = {
    toolPanels: ['columns', 'filters']
  };
  constructor(public sandBoxService: SandBoxService, private locationService: LocationService) {
    this.columnDefs = [
      // {
      //   headerCheckboxSelection: true,
      //   checkboxSelection: true,
      //   floatingFilter: true,
      //   minWidth: 150,
      //   maxWidth: 50,
      //   width: 100,
      //   flex: 0,
      //   resizable: true,
      //   sortable: true,
      //   editable: false,
      //   filter: false,
      //   suppressColumnsToolPanel: true,
      // },
      {
        headerName: 'Group Name',
        children: [
          {
            field: 'GroupName',
            headerName: 'Group ID',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 128,
            flex: 0
          },
        ],
      },

      {
        headerName: 'Vendor',
        children: [
          {
            headerName: 'VBA',
            field: 'VendorBillingAliasName',
            filter: 'agTextColumnFilter',
            columnGroupShow: 'close',
            width: 110,
            minWidth: 110,
            flex: 0,
            resizable: true,
            editable: false,
            sortingField: 'VendorBillingAliasName'
          },
          {
            field: 'VendorName',
            headerName: 'Vendor',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 150,
            minWidth: 150,
            flex: 0,
          },
          {
            field: 'ParentVendorAccountName',
            headerName: 'Parent Vendor',
            resizable: true,
            editable: false,
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            width: 158,
            minWidth: 158,
            sortingField: 'ParentVendorAccountName'
          },
         
        ],
      },
      {
        headerName: 'Vendor Product',
        children: [
          {
            field: 'VendorProductName',
            headerName: 'Vendor Product Name',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 206,
            minWidth: 206,
            flex: 0,
          },
          {
            field: 'VendorProductDescription',
            headerName: 'Vendor Product Description',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 238,
            minWidth: 238,
            flex: 0,
          },

          {
            field: 'VendorProductStatusValue',
            headerName: 'Status',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 111,
            minWidth: 111,
            flex: 0,
          },
          {
            field: 'IndustryName',
            headerName: 'Industry',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 200,
            flex: 0,
          },
          {
            field: 'ServiceName',
            headerName: 'Service',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 120,
            minWidth: 120,
            flex: 0,
          },
          {
            field: 'ServiceTypeName',
            headerName: 'Service Type',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 148,
            minWidth: 148,
            flex: 0,
          },
          {
            field: 'ProductName',
            headerName: 'Product',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 125,
            minWidth: 125,
            flex: 0,
          },
          {
            field: 'ProductTypeName',
            headerName: 'Product Type',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 152,
            minWidth: 152,
            flex: 0,
          },

        ],
      },
      {
        headerName: 'Charge Code',
        children: [
          {
            field: 'ChargeCode',
            headerName: 'Charge Code',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 250,
            flex: 0,
          },
          {
            field: 'ChargeCodeName',
            headerName: 'Charge Code Name',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 250,
            flex: 0,
          },
          // {
          //   field: 'ChargeCodeDisplayName',
          //   headerName: 'Charge Code Display Name',
          //   columnGroupShow: 'open',
          //   editable: false,
          //   filter: 'agTextColumnFilter',
          //   minWidth: 250,
          //   flex: 0,
          // },
          {
            field: 'ChargeCodeDescription',
            headerName: 'Charge Code Description',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 250,
            flex: 0,
          },
          {
            field: 'ChargeCodeType',
            headerName: 'Charge Code Type',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 150,
            flex: 0,
          },
          {
            field: 'ChargeTypeName',
            headerName: 'Charge Type',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 150,
            flex: 0,
          },
          {
            field: 'ChargeCodeOccurrence',
            headerName: 'Charge Code Occurence',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 250,
            flex: 0,
          },
          {
            headerName: 'Created By',
            field: 'ChargeCodeCreatedUserName',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 120,
            flex: 0,
          },
          {
            field: 'ChargeCodeCreatedDate', valueGetter(params: any) {
              return moment(params.data && params.data.ChargeCodeCreatedDate).format('MM/DD/YYYY');
            }, 
            headerName: 'Created Date',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agDateColumnFilter',
            width: 152,
            minWidth: 152,
            flex: 0,
          },
          {
            headerName: 'Modified By',
            field: 'ChargeCodeModifiedUserName',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 150,
            minWidth: 150,
            flex: 0,
          },
          {
            field: 'ChargeCodeModificationDate', valueGetter(params: any) {
              if (params.data && params.data.ChargeCodeModificationDate) {
                return moment(params.data.ChargeCodeModificationDate).format('MM/DD/YYYY');
              }
              return '';
            }, 
            headerName: 'Modified Date',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agDateColumnFilter',
            width: 159,
            minWidth: 159,
            flex: 0,
          },

        ],
      },

    


    ];

  }
  onAgGridReadyEmit($event: any) {
    this.gridApi = $event.api;
    this.gridColumnApi = $event.columnApi;
  }
  
  onAgGridReady($event: any) {
    this.gridApi = $event;
    if(!this.vbaList.length) {
      return
    } 
    let dataSource: any = {
      rowCount: null,
      getRows: (params: any) => {
        let paramsRequest = params['request'];
        const filterArray:any = [];
        const filterArrayDate:any = [];

        for (var key in paramsRequest.filterModel) {
          let data = paramsRequest.filterModel[key];
          let arr;
          let arrDate;

          if (key === 'ChargeCodeCreatedDate' || key === 'ChargeCodeModificationDate') {
            arrDate = {
              filterKey: key,
              filterOptionType1: data['type'] ? data['type'] : data['condition1'].type ? data['condition1'].type : null,
              filterOptionValue1: (data && data.dateFrom) ? data.dateFrom.split(' ')[0].toString() : (data['condition1'] && data['condition1']['dateFrom']) ? data['condition1'].dateFrom.split(' ')[0].toString() : null,
              filterOptionValue1_2: (data && data.dateTo) ? data.dateTo.split(' ')[0].toString() : (data['condition1'] && data['condition1']['dateTo']) ? data['condition1']?.dateTo.split(' ')[0].toString() : null,
              filterOperationType: data['operator'] ? data['operator'] : 'AND',
              filterOptionType2: data['condition2']?.type ? data['condition2']?.type : null,
              filterOptionValue2: (data['condition2'] && data['condition2'].dateFrom) ? data['condition2']?.dateFrom.split(' ')[0].toString() : null,
              filterOptionValue2_2: (data['condition2'] && data['condition2'].dateTo) ? data['condition2']?.dateTo.split(' ')[0].toString() : null
            }
            filterArrayDate.push(arrDate);
          } else {
            arr = {
              filterKey: key,
              filterOptionType1: data['type'] ? data['type'] : data['condition1'].type ? data['condition1'].type : null,
              filterOptionValue1: data['filter'] ? data['filter'] : data['condition1'].filter ? data['condition1'].filter : null,
              filterOperationType: data['operator'] ? data['operator'] : 'AND',
              filterOptionType2: data['condition2']?.type ? data['condition2']?.type : null,
              filterOptionValue2: data['condition2']?.filter ? data['condition2']?.filter : null
            }
            filterArray.push(arr);
          }
        }
        let data: any = {
          StartRowIndex:
            paramsRequest.startRow === 0 ? 1 : paramsRequest.startRow + 1,
          MaximumRows: 100
        };

        if (filterArrayDate && filterArrayDate.length > 0) {
          data['advanceDateFilter'] = filterArrayDate;
        }

        if (filterArray && filterArray.length > 0) {
          data['advanceFilter'] = filterArray;
        }
        if (paramsRequest.sortModel.length > 0) {

          Object.values(params['columnApi']['columnController']['columnDefs']).forEach((key:any) => {
            if (key['children']) {
              Object.values(key['children']).forEach((k:any) => {
                if (k['field'] === paramsRequest.sortModel[0].colId) {
                  data['OrderBy'] = k['field'];
                  data['SortOrder'] = paramsRequest.sortModel[0].sort;
                }
              });
            }
          });
        }
    
        data['vendorBillingAliasIds'] = [...new Set(this.vbaList)];
        this.locationService
          .vendorProductChargeCodeGroups(data)
          .pipe(takeUntil(this._unsubscribeGRid))
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
    if (this.gridApi.api) {
      this.gridApi.api!.setGridOption("serverSideDatasource", dataSource);
    } else {
      this.gridApi!.setGridOption("serverSideDatasource", dataSource);
    }
  
  }
  ngOnInit(): void {
    // this.getVPChargeCodeGroups();
    this.getVBAbyChargeCode();
  }
  getVBAbyChargeCode() {
    if (!checkIsValueExists(this.sandBoxGridRowData.SBInvoiceId)) {
      return;
    }
    this._unsubscribeVBAbyChargeCode.next(null);
    this.sandBoxService.getVBAbyChargeCode(this.sandBoxGridRowData.SBInvoiceId)
      .pipe(takeUntil(this._unsubscribeVBAbyChargeCode))
      .subscribe((data: any) => {
        if (data && data.Success) {
          let values = data.Data.$values;
          this.vbaList = _.map(values, 'VendorBillingAliasId') as any;
          this.onAgGridReady(this.gridApi)
        } else {
          this.rowData = [];
        }
      });
  }



  ngOnDestroy(): void {
    this._unsubscribeGRid.next(null);
    this._unsubscribeGRid.complete();
    this._unsubscribeVBAbyChargeCode.next(null);
    this._unsubscribeVBAbyChargeCode.complete();
  }
}
