import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { GridReadyEvent, IServerSideDatasource, IServerSideGetRowsParams } from 'ag-grid-community';
import { AgGridTableComponent } from 'src/app/common/ag-grid-table/ag-grid-table.component';
import { api_list } from 'src/app/services/api-list';
import { LocationService } from 'src/app/services/location.service';
import { AgGridAngular, AgGridModule } from 'ag-grid-angular';
import { ServerSideRowModelModule } from 'ag-grid-enterprise';
import { ModuleRegistry } from 'ag-grid-enterprise';
import { GridOptions } from 'ag-grid-community';

// Register AG Grid Modules
ModuleRegistry.registerModules([ServerSideRowModelModule]);

interface ServerSideRequest {
  StartRowIndex: number;
  MaximumRows: number;
  OrderBy?: string;
  SortOrder?: string;
}

@Component({
  selector: 'app-customer-ag-grid',
  standalone: true,
  imports: [
    AgGridTableComponent,
    AgGridModule
  ],
  templateUrl: './customer-ag-grid.component.html',
  styleUrl: './customer-ag-grid.component.scss'
})
export class CustomerAgGridComponent {

  public columnDefs: any;
  public rowData: any;
  public rowSelection: any
  public gridOptions: GridOptions = {
    // Server-side settings
    rowModelType: 'serverSide',
    
    // Header settings
    headerHeight: 35,
    groupHeaderHeight: 37,
    
    // Default filter settings
    defaultColDef: {
      filter: true,
      floatingFilter: true
    }
  };
  public defaultColDef: any;
  public sideBar: any;
  public singleClickEdit: any;

  constructor(private router: Router,
    public dialog: MatDialog,
    public locationService: LocationService) {

    this.columnDefs = [
      {
        // headerName: ' ',
        headerCheckboxSelection: true,
        checkboxSelection: true,
        floatingFilter: true,
        suppressMenu: true,
        minWidth: 50,
        maxWidth: 50,
        width: 50,
        flex: 0,
        resizable: true,
        sortable: true,
        editable: false,
        filter: false,
        suppressColumnsToolPanel: true,
      },


      {
        headerName: 'Organization',
        children: [
          {
            field: 'AccountName',
            headerName: 'Customer',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            floatingFilter: true,
            minWidth: 140,
            flex: 0,
            sortingField: 'AccountName'
          },
        ],
      },

      {
        headerName: 'Address',
        children: [
          {
            field: 'WebAddress',
            headerName: 'Website',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            floatingFilter: true,
            minWidth: 200,
            flex: 0,
            sortingField: 'WebAddress'
          },
          {
            field: 'PhysicalAddress',
            headerName: 'Address One',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            floatingFilter: true,
            minWidth: 200,
            flex: 0,
            sortingField: 'PhysicalAddress'
          },
          {
            field: 'PhysicalAddress2',
            headerName: 'Address Two',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            floatingFilter: true,
            minWidth: 200,
            flex: 0,
            sortingField: 'PhysicalAddress2'
          },
          {
            field: 'City',
            headerName: 'City',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            floatingFilter: true,
            minWidth: 120,
            flex: 0,
            sortingField: 'City'
          },
          {
            field: 'Country',
            headerName: 'Country',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            floatingFilter: true,
            minWidth: 130,
            flex: 0,
            sortingField: 'Country'
          },
          {
            field: 'State',
            headerName: 'State/Province/Region',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            floatingFilter: true,
            width: 220, maxWidth: 300,
            flex: 0,
            sortingField: 'State'
          },
          {

            field: 'PostalCode',
            headerName: 'Zip/Postal Code',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            floatingFilter: true,
            width: 170, maxWidth: 350,
            flex: 0,
            sortingField: 'PostalCode'
          },
        ],
      },
      {
        headerName: 'Status',
        children: [
          {
            field: 'CustomerStatus',
            headerName: 'Status',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            floatingFilter: true,
            minWidth: 124,
            flex: 0,
            sortingField: 'CustomerStatus'
          },
        ],
      },
      {
        headerName: 'Invoice Workflow',
        children: [
          {
            field: 'ReconciliationOption',
            headerName: 'Inventory Assignment',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            floatingFilter: true,
            minWidth: 202,
            flex: 0,
            sortingField: 'CustomerStatus'
          },
          {
            field: 'CostAllocationStatusDisplay',
            headerName: 'Cost Allocation',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            floatingFilter: true,
            minWidth: 156,
            flex: 0,
            sortingField: 'CustomerStatus'
          },
          {
            field: 'ApprovalsStatusDisplay',
            headerName: 'Approvals',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            floatingFilter: true,
            minWidth: 121,
            flex: 0,
            sortingField: 'CustomerStatus'
          },
          {
            field: 'BillPayStatusDisplay',
            headerName: 'Bill Pay',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            floatingFilter: true,
            minWidth: 101,
            flex: 0,
            sortingField: 'CustomerStatus'
          }
        ],
      },
      {
        headerName: 'Other',
        children: [
          {
            headerName: 'Cost Center Edits',
            field: 'AllowCCManualEdits',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            floatingFilter: true,
            editable: false,
            minWidth: 200,
            flex: 0,
            sortingField: 'AllowCCManualEdits'
          },
          {
            headerName: 'Approval Days',
            field: 'ApprovalDays',
            filter: 'agTextColumnFilter',
            floatingFilter: true,
            editable: false,
            columnGroupShow: 'close',
            minWidth: 151,
            flex: 0,
            sortingField: 'ApprovalDays'
          },
          {
            headerName: 'MFA',
            field: 'TwoFactorEnabledDisplay',
            filter: 'agTextColumnFilter',
            floatingFilter: true,
            editable: false,
            columnGroupShow: 'open',
            minWidth: 90,
            flex: 0,
            sortingField: 'TwoFactorEnabled'
          },
          {
            headerName: 'Notification Frequency',
            field: 'NotificationFrequencyDays',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            floatingFilter: true,
            editable: false,
            minWidth: 208,
            flex: 0,
            sortingField: 'NotificationFrequencyDays'
          },
          {
            headerName: 'TEM Account',
            field: 'TEMAccountNumber',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            floatingFilter: true,
            minWidth: 50,
            flex: 0,
            sortingField: 'TEMAccountNumber'
          }
        ]
      }

    ];


    this.rowSelection = 'multiple';
    this.defaultColDef = {
      editable: true,
      sortable: true,
      minWidth: 100,
      filter: true,
      resizable: true,
      floatingFilter: true,
      flex: 1,
    };
    this.sideBar = {
      toolPanels: ['columns', 'filters']
    };
  }

  onAgGridReady(params: any) {
    console.log('onAgGridReady', params);
    const datasource = {
      getRows: (params: any) => {
        let paramsRequest = params['request'];
        const filterArray:any = [];
        const filterArrayDate:any = [];

        for (var key in paramsRequest.filterModel) {
          let data = paramsRequest.filterModel[key];
          let arr;
          let arrDate;

          if (key === 'StartDate' || key === 'EndDate') {
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

        // if (this.selectedTemSearchBtn != 'all') {
        //   data['TemAccountId'] = parseInt(this.selectedTemSearchBtn);
        // }

        if (paramsRequest?.sortModel?.length > 0) {
          const sortModel = paramsRequest.sortModel;
          data['OrderBy'] = sortModel[0].colId;
          data['SortOrder'] = sortModel[0].sort;
        }
        // this.exportCustomerData = { ...this.exportCustomerDetail, ...data };
        // this.selectedTemDD = this.selectedTemSearchBtn;
        this.locationService
          .getAllCustomerUrl(data)
          .subscribe({
            next: (response: any) => {
              if (response && response.Data?.$values) {
                const lastRow = response.TotalCount <= (params.request.startRow || 0) + 100 
                  ? response.TotalCount 
                  : undefined;
                params.success({
                  rowData: response.Data.$values,
                  rowCount: lastRow
                });
              } else {
                params.success({
                  rowData: [],
                  rowCount: 0
                });
              }
            },
            error: (err: Error) => {
              console.error('Error fetching data:', err);
              params.fail();
            }
          });
      }
    };

    // Use the grid API through params
    params.api!.setGridOption("serverSideDatasource", datasource);
  }

  onAgGridReadyEmit($event: any) {
    // Implementation needed
  }

}
