import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import moment from 'moment';
import { Router } from '@angular/router';
import { WirelineService } from 'src/app/services/wireline.service';
import { checkIsValueExists } from 'src/app/services/helper';
import { ErrorWarningPopupComponent } from '../../error-warning-popup/error-warning-popup.component';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { AgGridModule } from 'ag-grid-angular';
import { AgGridTableComponent } from '../../ag-grid-table/ag-grid-table.component';
import { CustomPipe } from 'src/app/custom-pipe/date.pipe';
import { DatePipe } from '@angular/common';
import { ModuleRegistry, ServerSideRowModelModule } from 'ag-grid-enterprise';

ModuleRegistry.registerModules([ServerSideRowModelModule]);
@Component({
  selector: 'app-link-associated-inventory',
  templateUrl: './link-associated-inventory.component.html',
  styleUrls: ['./link-associated-inventory.component.scss'],
  imports: [
    SharedModule,
    PrimgModule,
    AgGridModule,
    AgGridTableComponent
  ],
  providers: [CustomPipe, DatePipe, WirelineService]
})
export class LinkAssociatedInventoryComponent implements OnInit {

  sideBar = {
    toolPanels: ['columns', 'filters']
  };
  rowSelection = 'multiple';
  gridApi: any;
  gridColumnApi: any;
  saveButtonLoader = false;
  columnDefs: any;
  public linkInventory: any;
  public rowData: any;
  public inventoryData: any;
  public customerId: any;
  checkedData: any;
  public getDataPath: any = (data: any) => data.dataPath;
  serviceId = [];

  public autoGroupColumnDef: any = {
    headerName: 'Service Number',
    field: 'ServiceNumber',
    cellRendererParams: {
      checkbox: true,
      suppressCount: true,
    },
    filterParams: {
      treeList: true,
    },
    filter: 'agTextColumnFilter',
    minWidth: 230,
    resizable: true,
    sortingField: 'ServiceNumber'
  };

  gridOptions = {
    rowModelType: 'serverSide',
    serverSideInfiniteScroll: true,
    headerHeight: 35,
    groupHeaderHeight: 37,
    floatingFiltersHeight: 35,
    rowSelection: {
      type: 'multiple',   
      enableClickSelection: true
    },
  };
  defaultColDef = {
    editable: true,
    sortable: true,
    minWidth: 100,
    filter: true,
    resizable: true,
    floatingFilter: true,
    flex: 1,
    cellStyle: {
      display: "flex",
      alignItems: "center"
    }
  };
  private _unsubscribeChildInventory: Subject<any> = new Subject<any>();

  constructor(private wirelineService: WirelineService,
    public dialogRef: MatDialogRef<LinkAssociatedInventoryComponent>,
     public dialog: MatDialog, private router: Router,
    @Inject(MAT_DIALOG_DATA) data: any) {
    this.linkInventory = data.inventory;
    this.rowData = data.rowData;
    this.customerId = data.customerId;
    this.serviceId = data.serviceId;
    dialogRef.disableClose = true;
  }

  ngOnInit(): void {
    this.setColumnDef();
  }
   locationIds:any = [];
  onSelectionChanged(event: any) {
    this.checkedData = event;
    let data: any = {};
    this.locationIds = [];
  
    event.forEach((element: any) => {
      if(element.VendorProductInventoryId !== null && element.VendorProductInventoryId !== 0 && !this.locationIds.includes(element.VendorProductInventoryId)) {
        this.locationIds.push(element.VendorProductInventoryId);
      }
    });
    data['VendorProductInventoryId'] = this.rowData['VendorProductInventoryId'];
    data['VendorProductInventoryIds'] = this.locationIds;
    data['InventoryId'] = this.rowData['InventoryId'];
    this.inventoryData = data;
  }

  onAgGridReady($event: any) {
    this._unsubscribeChildInventory.next(null);
    this.gridApi = $event;
    const pageMappings = ['wireline', 'mobility', 'cloud'];
    const pagename = pageMappings.find((page) =>
      this.router.url.toLowerCase().includes(page.toLowerCase())
    ) || null;

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
          // if (key == 'TotalCurrentChargesDisplay') {
          //   key = 'TotalCurrentCharges'
          // }
          if (key === 'CreationDate') {
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
          } else if(key === 'TotalCurrentChargesDisplay') {
            arrNumber = {
              filterKey: key,
              filterOptionType1: data['type'] ? data['type'] : data['condition1'].type ? data['condition1'].type : null,
              filterOptionValue1: (data && data.filter) ? data.filter : (data['condition1'] && data['condition1']['filter']) ? data['condition1'].filter : null,
              filterOptionValue1_2 : (data && data.filterTo) ? data.filterTo : (data['condition1'] && data['condition1']['filterTo']) ? data['condition1']?.filterTo : null,
              filterOperationType: data['operator'] ? data['operator'] : 'AND',
              filterOptionType2: data['condition2']?.type ? data['condition2']?.type : null,
              filterOptionValue2: (data['condition2'] && data['condition2'].filter) ? data['condition2']?.filter : null,
              filterOptionValue2_2: (data['condition2'] && data['condition2'].filterTo) ? data['condition2']?.filterTo : null
            }
            filterArrayNumber.push(arrNumber);
          } else {
            arr = {
              filterKey: key == 'ag-Grid-AutoColumn' ? 'ServiceNumber' : key,
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
          startRowIndex:
            paramsRequest.startRow === 0 ? 1 : paramsRequest.startRow + 1,
          maximumRows: 100,
        };

        if (this.rowData['CustomerAccountId'] !== this.customerId) {
          data['CustomerAccountId'] = this.customerId;
        } else {
          data['CustomerAccountId'] = this.rowData['CustomerAccountId'];
        }

        data['LinkAssVendorProductInventoryId'] = this.rowData['VendorProductInventoryId']
        data['ForAssociateInventory'] = true
        data['IsTotalNeed'] = true;
        if (filterArrayDate && filterArrayDate.length > 0) {
          data['advanceDateFilter'] = filterArrayDate;
        }

        if (filterArray && filterArray.length > 0) {
          data['advanceFilter'] = filterArray;
        }
        if (filterArrayNumber && filterArrayNumber.length > 0) {
          data['advanceNumberFilter'] = filterArrayNumber;
        }
        data['inventoryType'] = pagename;

        if(params['request']['sortModel'][0]?.colId == 'ag-Grid-AutoColumn') {
          data['OrderBy'] = 'ServiceNumber';
          data['SortOrder'] = paramsRequest.sortModel[0].sort;
        }
        if (paramsRequest?.sortModel?.length > 0) {
          const sortModel = paramsRequest.sortModel;
          data['OrderBy'] = sortModel[0].colId;
          data['SortOrder'] = sortModel[0].sort;
        }

        this.wirelineService.getInventoryData(data)
          .pipe(takeUntil(this._unsubscribeChildInventory))
          .subscribe(
            (data: any) => {
              if (data && data.Data.$values.length > 0) {
                // this.childInventoryData = data.Data.$values;
                let lastRow = -1;
                this.locationIds = data.Data.$values[0].LinkVendorProductInventoryId ? data.Data.$values[0].LinkVendorProductInventoryId.split(',').map((part: any) =>parseInt(part, 10)) : [];

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

              params.api.forEachNode(function (node: any) {
                node.setSelected(node.data.InventoryLocationAtt == 'Yes' ? true : false);
              });
            }, (error) => {
              // this.childInventoryData = [];
              params.success({
                rowData: [],
                rowCount: 0
              });
                this.gridApi.showNoRowsOverlay();
            });
      },
    };
    if (this.gridApi.api) {
      this.gridApi.api!.setGridOption("serverSideDatasource", dataSource);
    } else {
      this.gridApi!.setGridOption("serverSideDatasource", dataSource);
    }
  }

  saveAssociatedInventory() {
  if (checkIsValueExists(this.inventoryData) && this.rowData['CustomerAccountId'] == this.customerId) {
      this.saveButtonLoader = true;
      this.wirelineService.inventoryAssociatedAssign(this.inventoryData)
        .subscribe((response) => {
          this.saveButtonLoader = false;
          if (response.Success) {
            this.errorPopup(response);
          } else {
            this.errorPopup(response);
          }
        }, error => {
          this.saveButtonLoader = false;
          this.errorPopup(error);
        });
    } else {
      if (this.checkedData && this.checkedData.length > 0) {
        this.inventoryData['checkedData'] = this.checkedData;
        this.dialogRef.close(this.inventoryData);
      } else {
        const response = {
          'Message' : 'Please select At least one Inventory' 
        }
        this.errorPopup(response, false);
      }
    }
  }

  onAgGridReadyEmit($event: any) {
    this.gridApi = $event;
    this.gridColumnApi = $event.columnApi;
  }

  setColumnDef() {
    this.columnDefs = [
      {
        headerName: 'Vendor Product',
        children: [
          {
            headerName: 'Vendor Product',
            field: 'VendorProductTypeName',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 200,
            flex: 0,
            resizable: true,
            sortingField: 'VendorProductTypeName'
          },
          {
            headerName: 'Service',
            field: 'Service',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 50,
            flex: 0,
            resizable: true,
            sortingField: 'ServiceName'
          },
          {
            headerName: 'Service Type',
            field: 'ServiceType',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 50,
            flex: 0,
            resizable: true,
            sortingField: 'ServiceType'
          },
          {
            headerName: 'Product',
            field: 'Product',
            filter: 'agTextColumnFilter',
            editable: false,
            columnGroupShow: 'open',
            minWidth: 200,
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
            minWidth: 200,
            flex: 0,
            resizable: true,
            sortingField: 'ProductType'
          },
        ]
      },

      {
        headerName: 'Cost',
        children: [
          {
            headerName: 'Total Current Charges',
            field: 'TotalCurrentChargesDisplay',
            filter: 'agNumberColumnFilter',
            editable: false,
            columnGroupShow: 'close',
            minWidth: 200,
            flex: 0,
            resizable: true,
            sortingField: 'TotalCurrentChargesDisplay',
            cellStyle: {display: 'flex !important', 'justify-content': 'end','padding-right':'50px'},
          },
        ]
      },

      {
        headerName: 'Account Information',
        children: [
          {
            field: 'VendorAccountName',
            headerName: 'Vendor',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 120,
            flex: 0,
            resizable: true,
            sortingField: 'VendorAccountName'
          },
          {
            field: 'ParentVendorAccountName',
            headerName: 'Parent Vendor',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 150,
            flex: 0,
            resizable: true,
            sortingField: 'ParentVendorAccountName'
          },
          {
            field: 'MainAccountNumber',
            headerName: 'Main Account Number',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 230,
            flex: 0,
            resizable: true,
            sortingField: 'MainAccountNumber'
          },
          {
            field: 'SubAccountNumber',
            headerName: 'Sub Account Number',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 230,
            flex: 0,
            resizable: true,
            sortingField: 'SubAccountNumber'
          },
          {
            field: 'PayableAccountNumber',
            headerName: 'Payable Account Number',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 250,
            flex: 0,
            resizable: true,
            sortingField: 'PayableAccountNumber'
          },
        ]
      },

      {
        headerName: 'Status',
        children: [
          {
            headerName: 'Status',
            field: 'InventoryStatusDisplayText',
            filter: 'agTextColumnFilter',
            editable: false,
            columnGroupShow: 'close',
            minWidth: 200,
            flex: 0,
            resizable: true,
            sortingField: 'InventoryStatusDisplayText'
          },
          {
            headerName: 'Contract Start Date',
            field: 'StartDate',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 50,
            flex: 0,
            resizable: true,
            valueGetter(params: any) {
              if (params.data.StartDate) {
                return moment(params.data.StartDate).format('MM/DD/YYYY');
              }
              return '';
            },
            sortingField: 'StartDate'
          },
          {
            headerName: 'Contract End Date',
            field: 'EndDate',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 50,
            flex: 0,
            resizable: true,
            valueGetter(params: any) {
              if (params.data.EndDate) {
                return moment(params.data.EndDate).format('MM/DD/YYYY');
              }
              return '';
            },
            sortingField: 'EndDate'
          },
        ]
      },


      {
        headerName: 'Inventory Custom',
        children: [
          {
            field: 'InventoryCustomField1',
            headerName: 'Service Custom 1',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 180,
            flex: 0,
            resizable: true,
            sortingField: 'InventoryCustomField1'
          },
          {
            field: 'InventoryCustomField2',
            headerName: 'Service Custom 2',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 140,
            flex: 0,
            resizable: true,
            sortingField: 'InventoryCustomField2'
          },
          {
            field: 'InventoryCustomField3',
            headerName: 'Service Custom 3',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 140,
            flex: 0,
            resizable: true,
            sortingField: 'InventoryCustomField3'
          },
          {
            field: 'InventoryCustomField4',
            headerName: 'Service Custom 4',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 140,
            flex: 0,
            resizable: true,
            sortingField: 'InventoryCustomField4'
          },
        ],
      },

      {
        headerName: 'Organization',
        children: [
          {
            field: 'CustomerAccountName',
            headerName: 'Customer',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 200,
            flex: 0,
            resizable: true,
            sortingField: 'CustomerAccountName'
          },
          {
            field: 'CompanyName',
            headerName: 'Company',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 200,
            flex: 0,
            resizable: true,
            sortingField: 'CompanyName'
          },
        ]
      },

      {
        headerName: 'Location',
        children: [
          {
            headerName: 'Name',
            field: 'LocationName',
            filter: 'agTextColumnFilter',
            editable: false,
            columnGroupShow: 'close',
            minWidth: 200,
            flex: 0,
            resizable: true,
            sortingField: 'LocationName'
          },
          {
            headerName: 'Address One',
            field: 'Address1',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 50,
            flex: 0,
            resizable: true,
            sortingField: 'Address1'
          },
          {
            headerName: 'Address Two',
            field: 'Address2',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 50,
            flex: 0,
            resizable: true,
            sortingField: 'Address2'
          },
          {
            headerName: 'City',
            field: 'City',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 50,
            flex: 0,
            resizable: true,
            sortingField: 'City'
          },
          {
            headerName: 'State/Province/Region',
            field: 'StateName',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 260,
            flex: 0,
            resizable: true,
            sortingField: 'StateName'
          },
          {
            headerName: 'Zip/Postal Code',
            field: 'PostalCode',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 50,
            flex: 0,
            resizable: true,
            sortingField: 'PostalCode'
          },
        ]
      },

      {
        headerName: 'People',
        children: [
          {
            field: 'PeopleName',
            headerName: 'Name',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 140,
            flex: 0,
            resizable: true,
            sortingField: 'PeopleName'
          },
          {
            field: 'PeopleEmail',
            headerName: 'Email',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 140,
            flex: 0,
            resizable: true,
            sortingField: 'PeopleEmail'
          },
        ]
      }
      // {
      //   headerName: 'Inventory',
      //   children: [
      //     {
      //       field: 'BillingId',
      //       headerName: 'Billing ID',
      //       columnGroupShow: 'close',
      //       editable: false,
      //       filter: 'agTextColumnFilter',
      //       minWidth: 140,
      //       flex: 0,
      //       resizable: true
      //     },

      //   ],
      // },

      // {
      //   headerName: 'Cost',
      //   children: [

      //     {
      //       headerName: 'Previous Charges',
      //       field: 'PreviousBillBalance',
      //       columnGroupShow: 'open',
      //       filter: 'agNumberColumnFilter',
      //       editable: false,
      //       minWidth: 50,
      //       flex: 0,
      //       resizable: true
      //     },
      //   ],
      // },

    ];
  }



  errorPopup(data: any, popupCloseToRefresh = true) {
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
      if (popupCloseToRefresh) {
        this.dialogRef.close(result);
      }
    });
  }
}
