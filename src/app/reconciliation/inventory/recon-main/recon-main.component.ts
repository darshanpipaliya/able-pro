import { Component, EventEmitter, Input, OnInit, Output, OnDestroy } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import moment from 'moment';
import _ from 'lodash';
import { ReconService } from 'src/app/services/recon.service';
import { SessionStorageService } from 'src/app/services/session-storage.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { AgGridModule } from 'ag-grid-angular';
import { AgGridTableComponent } from 'src/app/common/ag-grid-table/ag-grid-table.component';
import { GridApi, GridReadyEvent, ColDef } from 'ag-grid-community';
import { ModuleRegistry } from 'ag-grid-community';
import { ServerSideRowModelModule } from 'ag-grid-enterprise';
ModuleRegistry.registerModules([ServerSideRowModelModule]);
@Component({
  selector: 'app-recon-main',
  templateUrl: './recon-main.component.html',
  styleUrls: ['./recon-main.component.scss'],
  imports: [SharedModule, PrimgModule, AgGridModule, AgGridTableComponent],
  providers: [ReconService]
})
export class ReconMainComponent implements OnInit, OnDestroy {

  public sideBar: any;
  public columnDefs: any[];
  reconData = 0;

  saveButtonLoader = false;
  isSuperTem = false;
  isFilterData = false;
  CustomerAdmin = false;
  isTemUser = false;

  gridApi: any;
  selectedCustomer: any;
  selectedTem: any;

  rowData: any = [];
  rowSelection = 'multiple';
  defaultColDef = {
    editable: true,
    sortable: true,
    minWidth: 100,
    resizable: true,
    floatingFilter: true,
    flex: 1,
  };

  gridOptions = {
    rowModelType: 'serverSide',
    serverSideStoreType: 'partial',
    enableFiltering: true,
    headerHeight: 35,
    groupHeaderHeight: 37,
    floatingFiltersHeight: 35,
    rowSelection: {
      type: 'multiple',   
      enableClickSelection: true
  },
  };

  private _unsubscribeGRid: Subject<any> = new Subject<any>();
  @Output() rowCellDoubleClicked: EventEmitter<any> = new EventEmitter();

  constructor(public reconService: ReconService,
    private sessionStorageService: SessionStorageService,
    private localStorageService: LocalStorageService
  ) {

    this.sideBar = {
      toolPanels: ['columns', 'filters']
    };

    this.columnDefs = [
      {
        headerName: 'Organization',
        children: [
          {
            field: 'CustomerAccountName',
            headerName: 'Customer',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 150
          },
          {
            field: 'TEMAccountName',
            headerName: 'TEM',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 140
          }
        ],
      },
      {
        headerName: 'Vendor',
        children: [
          {
            field: 'VendorAccountName',
            headerName: 'Vendor',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 130
          }
        ],
      },
      {
        headerName: 'Payable Account Number',
        children: [
          {
            field: 'PayableAccountNumber',
            headerName: 'Payable Account Number',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 236
          },
          {
            field: 'MainAccountNumber',
            headerName: 'Main Account Number',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 230
          },
          {
            field: 'SubAccountNumber',
            headerName: 'Sub Account Number',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 225
          }
        ],
      },
      {
        headerName: 'Invoice',
        children: [
          {
            field: 'InvoiceNumber',
            headerName: 'Invoice Number',
            filter: 'agTextColumnFilter',
            columnGroupShow: 'close',
            editable: false,
            minWidth: 161
          },
          {
            field: 'InvoicePayByDate',
            headerName: 'Pay by Date',
            filter: 'agDateColumnFilter',
            columnGroupShow: 'close',
            editable: false,
            minWidth: 133,
            valueGetter(params: any) {
              if (params.data?.InvoicePayByDate) {
                return moment(params.data.InvoicePayByDate).format('MM/DD/YYYY');
              }
              return '';
            }
          },
          {
            field: 'InvoiceBillDate',
            headerName: 'Invoice Date',
            filter: 'agDateColumnFilter',
            columnGroupShow: 'close',
            editable: false,
            minWidth: 137,
            valueGetter(params: any) {
              if (params.data?.InvoiceBillDate) {
                return moment(params.data.InvoiceBillDate).format('MM/DD/YYYY');
              }
              return '';
            }
          },
          {
            field: 'InvoiceStatusDisplayText',
            headerName: 'Invoice Status',
            filter: 'agTextColumnFilter',
            columnGroupShow: 'open',
            editable: false,
            minWidth: 147
          }
        ],
      },
      {
        headerName: 'To Do',
        children: [
          {
            field: 'StatusInventoryAssignment',
            headerName: 'Inventory Assignment',
            columnGroupShow: 'open',
            editable: false,
            minWidth: 202,
            filter: 'agTextColumnFilter',
            cellStyle: { display: 'flex !important', 'justify-content': 'center' },
            cellRenderer: function (params: any) {
              return params.value == true ? '<i class="fa fa-check text-success"></i>' : '<i class="fas fa-times" style="color: #CF2A27"></i>'
            }
          },
          {
            field: 'StatusCostDistribution',
            headerName: 'Cost Distribution',
            columnGroupShow: 'open',
            editable: false,
            minWidth: 168,
            filter: 'agTextColumnFilter',
            cellStyle: { display: 'flex !important', 'justify-content': 'center' },
            cellRenderer: function (params: any) {
              return params.value == true ? '<i class="fa fa-check text-success"></i>' : '<i class="fas fa-times" style="color: #CF2A27"></i>'
            }
          },
          {
            field: 'StatusCostAllocation',
            headerName: 'Cost Allocation',
            columnGroupShow: 'open',
            editable: false,
            minWidth: 156,
            filter: 'agTextColumnFilter',
            cellStyle: { display: 'flex !important', 'justify-content': 'center' },
            cellRenderer: function (params: any) {
              return params.value == true ? '<i class="fa fa-check text-success"></i>' : '<i class="fas fa-times" style="color: #CF2A27"></i>'
            }
          }
        ],
      }
    ];
  }

  ngOnInit(): void {
    this.isSuperTem = this.sessionStorageService?.getObjectValue('userRoles').includes("SuperTEMAdmin") || this.sessionStorageService.getObjectValue('userRoles').includes("SuperTEMManager") || this.sessionStorageService.getObjectValue('userRoles').includes("SuperTEMUser");
    this.CustomerAdmin = this.sessionStorageService?.getObjectValue('userRoles').includes("CustomerAdmin");
    // Mihir - changes for auth
    this.isTemUser = this.sessionStorageService.getObjectValue('userRoles').includes("TEMAdmin") || this.sessionStorageService.getObjectValue('userRoles').includes("TEMManager") || this.sessionStorageService.getObjectValue('userRoles').includes("TEMUser");
 
  }

  onCellDoubleClicked($event: any) {
    if($event.data.StatusInventoryAssignment !== true){
      this.rowCellDoubleClicked.emit({rowData: $event.data, redirectTo: 1})
    } else if($event.data.StatusInventoryAssignment == true && $event.data.StatusCostDistribution !== true) {
      this.rowCellDoubleClicked.emit({rowData: $event.data, redirectTo: 2})
    } else if($event.data.StatusInventoryAssignment == true && $event.data.StatusCostDistribution == true && $event.data.StatusCostAllocation !== true) {
      this.rowCellDoubleClicked.emit({rowData: $event.data, redirectTo: 3})
    } 
  }

  toggle() {
    this.onAgGridReady(this.gridApi);
  }

  getLatestData() {
    this.onAgGridReady(this.gridApi);
  }

  searchInvoice(selectedTem: any, selectedCustomer: any){
    this.selectedTem = selectedTem;
    this.selectedCustomer = selectedCustomer;
    if (this.gridApi) {
      this.onAgGridReady(this.gridApi);
    }
  }

  onFilterChanged(event: any) {
    this.reconService.reconciliationFilter = event.api.getFilterModel();
  }

  onSortChanged(event: any) {
    this.reconService.sortModel = event.api.getSortModel();
  }

  onAgGridReady($event: any) {
    // this.costCenterIds = [];
    // this.onSelectedRow.emit(this.costCenterIds);
    this.gridApi = $event;
    if (this.gridApi) {
      const filterModel = this.reconService.reconciliationFilter;
      const sortModel = this.reconService.sortModel;
    
      if (filterModel) {
        this.gridApi.setFilterModel(filterModel);
        this.gridApi.onFilterChanged();
      }
    
      if (sortModel) {
        this.gridApi.setSortModel(sortModel);
      }
    }
    let dataSource: any = {
      rowCount: null,
      getRows: (params: any) => {
        let paramsRequest = params['request'];
        const filterArray:any = [];
        const filterArrayDate:any = [];
        const filterArrayNumber:any = [];

        for (var key in paramsRequest.filterModel) {
          let data = paramsRequest.filterModel[key];
          let arr;
          let arrDate;
          let arrNumber;
          if (key == 'InvoiceStatusDisplayText') {
            key = 'InvoiceStatus'
          }
          if (key === 'InvoiceBillDate' || key === 'InvoicePayByDate') {
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
          }
          // else if(key == 'Percentage' || key == 'CCStructureAllocationRuleTotalUsed') {
          //   arrNumber = {
          //     filterKey: key,
          //     filterOptionType1: data['type'] ? data['type'] : data['condition1'].type ? data['condition1'].type : null,
          //     filterOptionValue1: (data && data.filter) ? data.filter : (data['condition1'] && data['condition1']['filter']) ? data['condition1'].filter : null,
          //     filterOptionValue1_2 : (data && data.filterTo) ? data.filterTo : (data['condition1'] && data['condition1']['filterTo']) ? data['condition1']?.filterTo : null,
          //     filterOperationType: data['operator'] ? data['operator'] : 'AND',
          //     filterOptionType2: data['condition2']?.type ? data['condition2']?.type : null,
          //     filterOptionValue2: (data['condition2'] && data['condition2'].filter) ? data['condition2']?.filter : null,
          //     filterOptionValue2_2: (data['condition2'] && data['condition2'].filterTo) ? data['condition2']?.filterTo : null
          //   }
          //   filterArrayNumber.push(arrNumber);
          // }  
          else {
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
            paramsRequest.startRow === 0 ? 1 : paramsRequest.startRow,
          MaximumRows: 100
        };

        if (filterArrayDate && filterArrayDate.length > 0) {
          data['advanceDateFilter'] = filterArrayDate;
        }
        if (this.isSuperTem && !this.isFilterData) {
          filterArray.push({
            "filterKey": "ReconValue",
            "filterOptionType1": "equals",
            "filterOptionValue1": "SuperTEM",
            "filterOperationType": "AND",
            "filterOptionType2": null,
            "filterOptionValue2": null
          })
        }
        if(this.isTemUser && !this.isFilterData) {
          filterArray.push({
            "filterKey": "ReconValue",
            "filterOptionType1": "equals",
            "filterOptionValue1": "TEM",
            "filterOperationType": "AND",
            "filterOptionType2": null,
            "filterOptionValue2": null
          })
        }
        // } else if(this.isTemUser && this.isFilterData) {
        //   filterArray.push({
        //     "filterKey": "ReconValue",
        //     "filterOptionType1": "notEqual",
        //     "filterOptionValue1": "SuperTEM",
        //     "filterOperationType": "AND",
        //     "filterOptionType2": null,
        //     "filterOptionValue2": null
        //   })
        // }
        // if (this.CustomerAdmin && !this.isFilterData) {
        //   filterArray.push({
        //     "filterKey": "ReconValue",
        //     "filterOptionType1": "equals",
        //     "filterOptionValue1": "Customer",
        //     "filterOperationType": "AND",
        //     "filterOptionType2": null,
        //     "filterOptionValue2": null
        //   })
        // }
        if (filterArray && filterArray.length > 0) {
          data['advanceFilter'] = filterArray;
        }
        if (filterArrayNumber && filterArrayNumber.length > 0) {
          data['advanceNumberFilter'] = filterArrayNumber;
        }
        if (this.selectedTem != 'all') {
          data['TemAccountId'] = parseInt(this.selectedTem);
        }
        if (this.selectedCustomer != 'all') {
          data['customerAccountId'] = parseInt(this.selectedCustomer);
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
        // this.exportCCData = { ...this.exportCCDetail, ...data };
        this.reconService
          .getReconSummary(data)
          .pipe(takeUntil(this._unsubscribeGRid))
          .subscribe(
            async (data: any) => {
              this.rowData = data.Data.$values;
              this.reconData = _.cloneDeep(data?.TotalCount);
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
                params.success({rowData: [], rowCount: 0} );
                this.gridApi?.showNoRowsOverlay();
              }
            },
            (error) => {
              params.success({rowData: [], rowCount: 0} );
              this.gridApi?.showNoRowsOverlay();
            }
          );
      },
    };
    if (this.gridApi!.api) {
      this.gridApi!.api.setGridOption("serverSideDatasource", dataSource);
    } else {
      this.gridApi!.setGridOption("serverSideDatasource", dataSource);
    }
  }


  ngOnDestroy() {
    this._unsubscribeGRid.next(null);
    this._unsubscribeGRid.complete();
  }
}

