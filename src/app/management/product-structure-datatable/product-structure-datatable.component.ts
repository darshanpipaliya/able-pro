import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatAccordion } from '@angular/material/expansion';
import { ActivatedRoute, Router } from '@angular/router';
import { DualListComponent } from 'angular-dual-listbox';
import moment from 'moment';
import { PrimeNGConfig } from 'primeng/api';
import { AddProductStructureDialogComponent } from '../add-product-structure-dialog/add-product-structure-dialog.component';
import { AddVendorProductDialogComponent } from '../add-vendor-product-dialog/add-vendor-product-dialog.component';
import * as _ from 'lodash';
import { LocationService } from 'src/app/services/location.service';
import { SessionStorageService } from 'src/app/services/session-storage.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { isValueExist } from 'src/app/services/helper';
import { ErrorWarningPopupComponent } from 'src/app/common/error-warning-popup/error-warning-popup.component';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { AgGridTableComponent } from 'src/app/common/ag-grid-table/ag-grid-table.component';
import { AgGridModule } from 'ag-grid-angular';
import { EditProductComponent } from '../edit-product/edit-product.component';
import { AddTemUserComponent } from '../add-tem-user/add-tem-user.component';
import { FilesUploadComponent } from 'src/app/common/files-upload/files-upload.component';
import { ModuleRegistry } from 'ag-grid-community';
import { ServerSideRowModelModule } from 'ag-grid-enterprise';
ModuleRegistry.registerModules([ServerSideRowModelModule]);
@Component({
  selector: 'app-product-structure-datatable',
  templateUrl: './product-structure-datatable.component.html',
  styleUrls: ['./product-structure-datatable.component.scss'],
  standalone: true,
  imports: [SharedModule, PrimgModule, AgGridTableComponent, AgGridModule, EditProductComponent, AddTemUserComponent, FilesUploadComponent]
})
export class ProductStructureDatatableComponent implements OnInit {

  selectedButton: any = 'users';
  buttonOptions: any = [
    // { 'label': 'Vendors', value: 'vendors' },
    // { 'label': "Users", value: 'users' },
    // { 'label': 'Products', value: 'products', icon: 'fa-box-open' },
    // { 'label': 'Product Structure', value: 'productstructure', icon: 'fa-sitemap' },
    // { 'label': "Charge Type", value: 'charge', icon: 'fa-users' },
    // { 'label': "Service Type Attributes", value: 'serviceTypeAttributes', icon: 'fa-tag' }
    { 'label': 'Products', value: 'products', icon: 'fa-box-open' },
    { 'label': 'Products Structure', value: 'productstructure', icon: 'fa-sitemap fas' },
    { 'label': 'Service Type Attributes', value: 'serviceTypeAttributes', icon: 'fa-tag fas' },
  ];
  panelOpenState = false;
  @ViewChild(MatAccordion) accordion: MatAccordion;

  public columnDefs;
  public columnDefs1;
  public columnDefs2;
  public columnDefs3;
  public columnDefs4;
  public rowSelection;
  public defaultColDef;
  public sideBar;
  public rowData: any = [];
  public rowData1: any = [];
  public rowData2: any = [];
  public rowData3: any = [];
  public rowData4: any = [];
  selected: any = 0;
  editProductsArray: any = [];
  addProductsArray: any = [];
  uploadProductsArray: any = [];
  sourceLeft = true;
  format: any = DualListComponent.DEFAULT_FORMAT;
  keepSorted = true;
  filter = true;
  userAdd = '';
  disabled = false;
  users: any;
  customers: any;
  isUserSuperTemOrAdmin: any = false;
  isCompanyAdmin: any = false;
  isTEMManager: any = false;
  isTemUser: any = false;
  stopSpinner: any = true;
  private userState: any;
  private userId: any;
  isSuperTEMAdmin: boolean = false;
  isSuperTEMManager: boolean = false;
  gridApi: any;
  gridColumnApi: any;
  gridColumnApiService: any;
  gridApiService: any;
  gridApiServiceType: any;
  gridColumnApiServiceType: any;
  gridApiProduct: any;
  gridColumnApiProduct: any;
  gridApiProductType: any;
  gridColumnApiProductType: any;
  public exportIndustryData: any;
  isDisabledExport = false;
  public exportServiceData: any;
  isServiceExport = false;
  public exportSericeType: any;
  isServiceType = false;
  public exportProducts: any;
  isProductExport = false;
  public exportProductType: any;
  isProductTypeExport = false;

  gridOptions = {
    rowModelType: 'serverSide',
    serverSideInfiniteScroll: true,
    enableFiltering: true,
    headerHeight: 35,
    groupHeaderHeight: 37,
    floatingFiltersHeight: 35
  };

  constructor(private router: Router,
    private primengConfig: PrimeNGConfig,
    private locationService: LocationService,
    private sessionStorageService: SessionStorageService,
    private localStorageService: LocalStorageService,
    private activatedRoute: ActivatedRoute,
    public dialog: MatDialog) {

    this.userState = this.activatedRoute.paramMap.subscribe((data: any) => {
      this.userId = window.history.state && window.history.state.id ? window.history.state.id : null;
    });


    function CreatedDateFormatter(params: any) {
      if (params.data.CreationDate) {
        let date = new Date(params.data.CreationDate);
        return moment(date).format('MM/DD/YYYY');
      } else {
        return '';
      }
    }

    function modDateFormatter(params: any) {
      if (params.data.ModificationDate) {
        let date = new Date(params.data.ModificationDate);
        return moment(date).format('MM/DD/YYYY');
      } else {
        return '';
      }
    }


    this.columnDefs = [
      {
        headerName: 'Industry',
        children: [
          {
            field: 'IndustryName',
            headerName: 'Industry',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 120,
            flex: 0
          },
          {
            field: 'Status',
            headerName: 'Status',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 94,
            flex: 0
          },

        ],
      },

      {
        headerName: 'Created',
        children: [

          {
            field: 'CreatedByUser',
            suppressMenu: true,
            headerName: 'Created By',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 160,
            flex: 0,
          },
          {
            field: 'CreationDate',
            headerName: 'Created Date',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agDateColumnFilter',
            filterParams: filterParams,
            minWidth: 141,
            flex: 0,
            valueFormatter: CreatedDateFormatter,
          },
        ],
      },
      {
        headerName: 'Modified',
        children: [
          {
            field: 'ModifiedByUser',
            headerName: 'Modified By',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 160,
            flex: 0
          },
          {
            field: 'ModificationDate',
            headerName: 'Modified Date',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agDateColumnFilter',
            filterParams: filterParams,
            minWidth: 150,
            flex: 0,
            valueFormatter: modDateFormatter,
          },
        ],
      },


    ];
    this.columnDefs1 = [
      {
        headerName: 'Service',
        children: [
          {
            field: 'ServiceName',
            headerName: 'Service',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 120,
            flex: 0
          },
          {
            field: 'Status',
            headerName: 'Status',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 94,
            flex: 0
          },

        ],
      },

      {
        headerName: 'Created',
        children: [

          {
            field: 'CreatedByUser', suppressMenu: true,
            headerName: 'Created By',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 160,
            flex: 0,
          },
          {
            field: 'CreationDate',
            headerName: 'Created Date',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agDateColumnFilter',
            filterParams: filterParams,
            minWidth: 141,
            flex: 0,
            valueFormatter: CreatedDateFormatter,
          },
        ],
      },
      {
        headerName: 'Modified',
        children: [
          {
            field: 'ModifiedByUser',
            headerName: 'Modified By',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 160,
            flex: 0
          },
          {
            field: 'ModificationDate',
            headerName: 'Modified Date',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agDateColumnFilter',
            filterParams: filterParams,
            minWidth: 150,
            flex: 0,
            valueFormatter: modDateFormatter,
          },
        ],
      },

    ];

    this.columnDefs2 = [
      {
        headerName: 'Service Type',
        children: [
          {
            field: 'ServiceTypeName',
            headerName: 'Service Type',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 138,
            flex: 0
          },
          {
            field: 'Status',
            headerName: 'Status',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 125,
            flex: 0
          },
          {
            field: 'InventoryTypeDisplayName',
            headerName: 'Default Inventory Type',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 210,
            flex: 0
          },

        ],
      },

      {
        headerName: 'Created',
        children: [

          {
            field: 'CreatedByUser',
            suppressMenu: true,
            headerName: 'Created By',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 160,
            flex: 0,
          },
          {
            field: 'CreationDate',
            headerName: 'Created Date',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agDateColumnFilter',
            filterParams: filterParams,
            minWidth: 141,
            flex: 0,
            valueFormatter: CreatedDateFormatter,
          },
        ],
      },
      {
        headerName: 'Modified',
        children: [
          {
            field: 'ModifiedByUser',
            headerName: 'Modified By',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 160,
            flex: 0
          },
          {
            field: 'ModificationDate',
            headerName: 'Modified Date',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agDateColumnFilter',
            filterParams: filterParams,
            minWidth: 150,
            flex: 0,
            valueFormatter: modDateFormatter,
          },
        ],
      },

    ];

    this.columnDefs3 = [
      {
        headerName: 'Product',
        children: [
          {
            field: 'ProductName',
            headerName: 'Product',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 120,
            flex: 0
          },
          {
            field: 'Status',
            headerName: 'Status',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 94,
            flex: 0
          },

        ],
      },

      {
        headerName: 'Created',
        children: [

          {
            field: 'CreatedByUser',
            suppressMenu: true,
            headerName: 'Created By',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 160,
            flex: 0,
          },
          {
            field: 'CreationDate',
            headerName: 'Created Date',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agDateColumnFilter',
            filterParams: filterParams,
            minWidth: 141,
            flex: 0,
            valueFormatter: CreatedDateFormatter,
          },
        ],
      },
      {
        headerName: 'Modified',
        children: [
          {
            field: 'ModifiedByUser',
            headerName: 'Modified By',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 160,
            flex: 0
          },
          {
            field: 'ModificationDate',
            headerName: 'Modified Date',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agDateColumnFilter',
            filterParams: filterParams,
            minWidth: 150,
            flex: 0,
            valueFormatter: modDateFormatter,
          },
        ],
      },

    ];

    this.columnDefs4 = [
      {
        headerName: 'Product Type',
        children: [
          {
            field: 'ProductTypeName',
            headerName: 'Product Type',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 142,
            flex: 0
          },
          {
            field: 'Status',
            headerName: 'Status',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 94,
            flex: 0
          },

        ],
      },

      {
        headerName: 'Created',
        children: [

          {
            field: 'CreatedByUser',
            suppressMenu: true,
            headerName: 'Created By',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 160,
            flex: 0,
          },
          {
            field: 'CreationDate',
            headerName: 'Created Date',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agDateColumnFilter',
            filterParams: filterParams,
            minWidth: 141,
            flex: 0,
            valueFormatter: CreatedDateFormatter,
          },
        ],
      },
      {
        headerName: 'Modified',
        children: [
          {
            field: 'ModifiedByUser',
            headerName: 'Modified By',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 160,
            flex: 0,
          },
          {
            field: 'ModificationDate',
            headerName: 'Modified Date',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agDateColumnFilter',
            filterParams: filterParams,
            minWidth: 150,
            flex: 0,
            valueFormatter: modDateFormatter,
          },
        ],
      },

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
      toolPanels: ['columns', 'filters']/* ,
      defaultToolPanel: 'columns', */
    };
  }

  onAgGridReady($event: any) {
    this.gridApi = $event;
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

          if (key === 'CreationDate' || key === 'ModificationDate') {
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

        let data: any =
        {
          "StartRowIndex": paramsRequest.startRow + 1,
          "maximumRows": paramsRequest.endRow
        }

        if (paramsRequest.sortModel.length > 0) {
          Object.values(params['columnApi']['columnController']['columnDefs']).forEach((key:any) => {
            if (key['children']) {
              Object.values(key['children']).forEach((k:any) => {
                if (k['field'] === paramsRequest.sortModel[0].colId) {
                  data['OrderBy'] = k['field'];
                  data['SortOrder'] = paramsRequest.sortModel[0].sort.toUpperCase();
                }
              });
            }
          });
        }

        if (filterArrayDate && filterArrayDate.length > 0) {
          data['advanceDateFilter'] = filterArrayDate;
        }

        if (filterArray && filterArray.length > 0) {
          data['advanceFilter'] = filterArray;
        }
        this.exportIndustryData = { ...this.exportIndustryData, ...data };

        this.locationService.getIndustryLogged(data)
          .subscribe(async (data) => {
            this.rowData = data.Data.$values;
            if (data && data.Data.$values.length > 0) {
              // if on or after the last page, work out the last row.
              let lastRow = -1;

              if (data.TotalCount <= paramsRequest.endRow) {
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
          }, error => {
            this.stopSpinner = true;
            params.success({
              rowData: [],
              rowCount: 0
            });
            this.gridApi.showNoRowsOverlay();
          });
      }
    }
    if (this.gridApi.api) {
      this.gridApi.api.setGridOption("serverSideDatasource", dataSource);
    } else {
      this.gridApi.setGridOption("serverSideDatasource", dataSource);
    }
  }

  onAgGridReady3($event: any) {
    this.gridApiProduct = $event;
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

          if (key === 'CreationDate' || key === 'ModificationDate') {
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

        let data: any =
        {
          "StartRowIndex": paramsRequest.startRow + 1,
          "maximumRows": paramsRequest.endRow
        }

        if (paramsRequest.sortModel.length > 0) {
          Object.values(params['columnApi']['columnController']['columnDefs']).forEach((key:any) => {
            if (key['children']) {
              Object.values(key['children']).forEach((k:any) => {
                if (k['field'] === paramsRequest.sortModel[0].colId) {
                  data['OrderBy'] = k['field'];
                  data['SortOrder'] = paramsRequest.sortModel[0].sort.toUpperCase();
                }
              });
            }
          });
        }

        if (filterArrayDate && filterArrayDate.length > 0) {
          data['advanceDateFilter'] = filterArrayDate;
        }

        if (filterArray && filterArray.length > 0) {
          data['advanceFilter'] = filterArray;
        }

        this.exportProducts = { ...this.exportProducts, ...data };
        this.locationService.getProductsLoggedData(data)
          .subscribe(async (data) => {
            this.rowData3 = data.Data.$values;
            if (data && data.Data.$values.length > 0) {
              // if on or after the last page, work out the last row.
              let lastRow = -1;

              if (data.TotalCount <= paramsRequest.endRow) {
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
              this.gridApiProduct.showNoRowsOverlay();
            }
          }, error => {
            this.rowData3 = [];
            this.stopSpinner = true;
            params.success({
              rowData: [],
              rowCount: 0
            });
            this.gridApiProduct.showNoRowsOverlay();
          });
      }
    }
    if (this.gridApiProduct.api) {
      this.gridApiProduct.api.setGridOption("serverSideDatasource", dataSource);
    } else {
      this.gridApiProduct.setGridOption("serverSideDatasource", dataSource);
    }

  }

  onAgGridReady4($event: any) {
    this.gridApiProductType = $event;
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

          if (key === 'CreationDate' || key === 'ModificationDate') {
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

        let data: any =
        {
          "StartRowIndex": paramsRequest.startRow + 1,
          "maximumRows": paramsRequest.endRow
        }

        if (paramsRequest.sortModel.length > 0) {
          Object.values(params['columnApi']['columnController']['columnDefs']).forEach((key:any) => {
            if (key['children']) {
              Object.values(key['children']).forEach((k:any) => {
                if (k['field'] === paramsRequest.sortModel[0].colId) {
                  data['OrderBy'] = k['field'];
                  data['SortOrder'] = paramsRequest.sortModel[0].sort.toUpperCase();
                }
              });
            }
          });
        }

        if (filterArrayDate && filterArrayDate.length > 0) {
          data['advanceDateFilter'] = filterArrayDate;
        }

        if (filterArray && filterArray.length > 0) {
          data['advanceFilter'] = filterArray;
        }
        this.exportProductType = { ...this.exportProductType, ...data };

        this.locationService.getProductTypeLoggedData(data)
          .subscribe(async (data) => {
            this.rowData4 = data.Data.$values;
            if (data && data.Data.$values.length > 0) {
              // if on or after the last page, work out the last row.
              let lastRow = -1;

              if (data.TotalCount <= paramsRequest.endRow) {
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
              this.gridApiProductType.showNoRowsOverlay();
            }
          }, error => {
            this.stopSpinner = true;
            params.success({
              rowData: [],
              rowCount: 0
            });
            this.gridApiProductType.showNoRowsOverlay();
          });
      }
    }
    if (this.gridApiProductType.api) {
      this.gridApiProductType.api.setGridOption("serverSideDatasource", dataSource);
    } else {
      this.gridApiProductType.setGridOption("serverSideDatasource", dataSource);
    }

  }

  onAgGridReady1($event: any) {
    this.gridApiService = $event;
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

          if (key === 'CreationDate' || key === 'ModificationDate') {
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

        let data: any =
        {
          "StartRowIndex": paramsRequest.startRow + 1,
          "maximumRows": paramsRequest.endRow
        }

        if (paramsRequest.sortModel.length > 0) {
          Object.values(params['columnApi']['columnController']['columnDefs']).forEach((key:any) => {
            if (key['children']) {
              Object.values(key['children']).forEach((k:any) => {
                if (k['field'] === paramsRequest.sortModel[0].colId) {
                  data['OrderBy'] = k['field'];
                  data['SortOrder'] = paramsRequest.sortModel[0].sort.toUpperCase();
                }
              });
            }
          });
        }

        if (filterArrayDate && filterArrayDate.length > 0) {
          data['advanceDateFilter'] = filterArrayDate;
        }

        if (filterArray && filterArray.length > 0) {
          data['advanceFilter'] = filterArray;
        }

        this.exportServiceData = { ...this.exportServiceData, ...data };
        this.locationService.getServicesLoggedUrlData(data)
          .subscribe(async (data) => {
            this.rowData1 = data.Data.$values;
            if (data && data.Data.$values.length > 0) {
              let lastRow = -1;

              if (data.TotalCount <= paramsRequest.endRow) {
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
              this.gridApiService.showNoRowsOverlay();
            }
          }, error => {
            this.rowData1 = [];
            this.stopSpinner = true;
            params.success({
              rowData: [],
              rowCount: 0
            });
            this.gridApiService.showNoRowsOverlay();
          });
      }
    }
    if (this.gridApiService.api) {
      this.gridApiService.api.setGridOption("serverSideDatasource", dataSource);
    } else {
      this.gridApiService.setGridOption("serverSideDatasource", dataSource);
    }


  }

  onAgGridReady5($event: any) {
    this.gridApiServiceType = $event;
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

          if (key === 'CreationDate' || key === 'ModificationDate') {
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

        let data: any =
        {
          "StartRowIndex": paramsRequest.startRow + 1,
          "maximumRows": paramsRequest.endRow
        }

        if (paramsRequest.sortModel.length > 0) {
          Object.values(params['columnApi']['columnController']['columnDefs']).forEach((key:any) => {
            if (key['children']) {
              Object.values(key['children']).forEach((k:any) => {
                if (k['field'] === paramsRequest.sortModel[0].colId) {
                  data['OrderBy'] = k['field'];
                  data['SortOrder'] = paramsRequest.sortModel[0].sort.toUpperCase();
                }
              });
            }
          });
        }

        if (filterArrayDate && filterArrayDate.length > 0) {
          data['advanceDateFilter'] = filterArrayDate;
        }

        if (filterArray && filterArray.length > 0) {
          data['advanceFilter'] = filterArray;
        }

        this.exportSericeType = { ...this.exportSericeType, ...data };

        this.locationService.getServicesTypesLoggedData(data)
          .subscribe(async (data) => {
            this.rowData2 = data.Data.$values;
            if (data && data.Data.$values.length > 0) {
              // if on or after the last page, work out the last row.
              let lastRow = -1;

              if (data.TotalCount <= paramsRequest.endRow) {
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
              this.gridApiServiceType.showNoRowsOverlay();
            }
          }, error => {
            this.stopSpinner = true;
            params.success({
              rowData: [],
              rowCount: 0
            });
            this.gridApiServiceType.showNoRowsOverlay();
          });
      }
    }
    if (this.gridApiServiceType.api) {
      this.gridApiServiceType.api.setGridOption("serverSideDatasource", dataSource);
    } else {
      this.gridApiServiceType.setGridOption("serverSideDatasource", dataSource);
    }

  }

  onAgGridReadyEmit($event: any) {
    this.gridApi = $event.api;
    this.gridColumnApi = $event.columnApi;
  }

  onAgGridReadyEmitService($event: any) {
    this.gridApiService = $event.api;
    this.gridColumnApiService = $event.columnApi;
  }

  onAgGridReadyEmitServiceType($event: any) {
    this.gridApiServiceType = $event.api;
    this.gridColumnApiServiceType = $event.columnApi;
  }

  onAgGridReadyEmitExcelProduct($event: any) {
    this.gridApiProduct = $event.api;
    this.gridColumnApiProduct = $event.columnApi;
  }

  onAgGridReadyEmitProductType($event: any) {
    this.gridApiProductType = $event.api;
    this.gridColumnApiProductType = $event.columnApi;
  }

  onBtnExportDataAsExcel() {
    
    this.isDisabledExport = true;
    this.locationService
      .getIndustryExcelData(this.exportIndustryData)
      .subscribe({
        next: data => {
          this.isDisabledExport = false;
          let bolbUrl = URL.createObjectURL(data);
          var link = document.createElement("a");
          link.setAttribute("href", bolbUrl);
          link.setAttribute("download", "Industries.xlsx");
          link.style.display = "none";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
        },
        error: error => {
          this.isDisabledExport = false;
          
        }
      });
    // this.variableManageService.onBtnExportDataAsExcel(data);
  }

  onBtnExportDataAsExcelService() {
    
    this.isServiceExport = true;
    this.locationService
      .getServiceExcelData(this.exportServiceData)
      .subscribe({
        next: data => {
          this.isServiceExport = false;
          let bolbUrl = URL.createObjectURL(data);
          var link = document.createElement("a");
          link.setAttribute("href", bolbUrl);
          link.setAttribute("download", "Services.xlsx");
          link.style.display = "none";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
         
        },
        error: error => {
          this.isServiceExport = false;
        
        }
      });
  }

  onBtnExportDataAsExcelServiceType() {
    
    this.isServiceType = true;
    this.locationService
      .getServicesTypesExcelData(this.exportSericeType)
      .subscribe({
        next: data => {
          this.isServiceType = false;
          let bolbUrl = URL.createObjectURL(data);
          var link = document.createElement("a");
          link.setAttribute("href", bolbUrl);
          link.setAttribute("download", "Service Types list.xlsx");
          link.style.display = "none";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

        },
        error: error => {
          this.isServiceType = false;
        }
      });
  }

  onBtnExportDataAsExcelProduct() {
    
    this.isProductExport = true;
    this.locationService
      .getProductsExportData(this.exportProducts)
      .subscribe({
        next: data => {
          this.isProductExport = false;
          let bolbUrl = URL.createObjectURL(data);
          var link = document.createElement("a");
          link.setAttribute("href", bolbUrl);
          link.setAttribute("download", "Products.xlsx");
          link.style.display = "none";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        },
        error: error => {
          this.isProductExport = false;

        }
      });
  }

  onBtnExportDataAsExcelProductType() {
   
    this.isProductTypeExport = true;
    this.locationService
      .getProductTypeExcelData(this.exportProductType)
      .subscribe({
        next: data => {
          this.isProductTypeExport = false;
          let bolbUrl = URL.createObjectURL(data);
          var link = document.createElement("a");
          link.setAttribute("href", bolbUrl);
          link.setAttribute("download", "Product Types.xlsx");
          link.style.display = "none";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

        },
        error: error => {
          this.isProductTypeExport = false;
        }
      });
  }

  ngOnInit(): void {
    this.isUserSuperTemOrAdmin = this.locationService.isUserHasSuperTEMOrAdminRole();
    this.isTEMManager = this.locationService.isUserHasTEMManagerRole();
    this.isTemUser = this.locationService.isUserHasTEMUserRole();
    this.isSuperTEMAdmin = this.locationService.isUserHasSuperTEMAdminRole();
    this.isSuperTEMManager = this.locationService.isUserHasSuperTEMManagerRole();

    this.primengConfig.ripple = true;
    //this.getTemuser();

    //this.getProduct();
    // this.getProductStructures();
    let headerData:any = [];
    let ChildHeaderData:any = [];
    let i = 0;
    let childIndex = 0;
    _.map(this.columnDefs, (x: any) => {
      if (isValueExist(x.headerName)) {
        i = i + 1;
        headerData.push({ position: i, title: x.headerName });
        if (x.children) {
          _.map(x.children, (y: any) => {
            childIndex = childIndex + 1;
            ChildHeaderData.push({ Position: childIndex, Title: y.headerName, FieldName: y.field, HeaderPosition: i })
          })
        }
      }
    });

    this.exportIndustryData = {
      ExportToExcelData: {
        HeaderData: headerData,
        ChildHeaderData: ChildHeaderData,
        fileName: "Industries"
      },
      ExportToExcel: true
    };

    let serviceHeaderData:any = [];
    let serviceChildHeaderData:any = [];
    let servicei = 0;
    let servicechildIndex = 0;
    _.map(this.columnDefs1, (x: any) => {
      if (isValueExist(x.headerName)) {
        servicei = servicei + 1;
        serviceHeaderData.push({ position: servicei, title: x.headerName });
        if (x.children) {
          _.map(x.children, (y: any) => {
            servicechildIndex = servicechildIndex + 1;
            serviceChildHeaderData.push({ Position: servicechildIndex, Title: y.headerName, FieldName: y.field, HeaderPosition: servicei })
          })
        }
      }
    });

    this.exportServiceData = {
      ExportToExcelData: {
        HeaderData: serviceHeaderData,
        ChildHeaderData: serviceChildHeaderData,
        fileName: "Services"
      },
      ExportToExcel: true
    };

    let serviceTypeHeaderData:any = [];
    let serviceTypeChildHeaderData:any = [];
    let serviceTypei = 0;
    let serviceTypechildIndex = 0;
    _.map(this.columnDefs2, (x: any) => {
      if (isValueExist(x.headerName)) {
        serviceTypei = serviceTypei + 1;
        serviceTypeHeaderData.push({ position: serviceTypei, title: x.headerName });
        if (x.children) {
          _.map(x.children, (y: any) => {
            serviceTypechildIndex = serviceTypechildIndex + 1;
            serviceTypeChildHeaderData.push({ Position: serviceTypechildIndex, Title: y.headerName, FieldName: y.field, HeaderPosition: serviceTypei })
          })
        }
      }
    });

    this.exportSericeType = {
      ExportToExcelData: {
        HeaderData: serviceTypeHeaderData,
        ChildHeaderData: serviceTypeChildHeaderData,
        fileName: "Service Types list"
      },
      ExportToExcel: true
    };

    let productHeaderData:any = [];
    let productChildHeaderData:any = [];
    let producti = 0;
    let productchildIndex = 0;
    _.map(this.columnDefs3, (x: any) => {
      if (isValueExist(x.headerName)) {
        producti = producti + 1;
        productHeaderData.push({ position: producti, title: x.headerName });
        if (x.children) {
          _.map(x.children, (y: any) => {
            productchildIndex = productchildIndex + 1;
            productChildHeaderData.push({ Position: productchildIndex, Title: y.headerName, FieldName: y.field, HeaderPosition: producti })
          })
        }
      }
    });

    this.exportProducts = {
      ExportToExcelData: {
        HeaderData: productHeaderData,
        ChildHeaderData: productChildHeaderData,
        fileName: "Products"
      },
      ExportToExcel: true
    };

    let productTypeHeaderData:any = [];
    let productTypeChildHeaderData:any = [];
    let productTypei = 0;
    let productTypechildIndex = 0;
    _.map(this.columnDefs4, (x: any) => {
      if (isValueExist(x.headerName)) {
        productTypei = productTypei + 1;
        productTypeHeaderData.push({ position: productTypei, title: x.headerName });
        if (x.children) {
          _.map(x.children, (y: any) => {
            productTypechildIndex = productTypechildIndex + 1;
            productTypeChildHeaderData.push({ Position: productTypechildIndex, Title: y.headerName, FieldName: y.field, HeaderPosition: productTypei })
          })
        }
      }
    });

    this.exportProductType = {
      ExportToExcelData: {
        HeaderData: productTypeHeaderData,
        ChildHeaderData: productTypeChildHeaderData,
        fileName: "Product Type"
      },
      ExportToExcel: true
    };
  }

  getProductStructures() {
    this.locationService.getProductStructure().subscribe((data) => {
      this.rowData = data && data.Industries && data.Industries.$values ? data.Industries.$values : [];
      this.rowData1 = data && data.Services && data.Services.$values ? data.Services.$values : [];
      this.rowData2 = data && data.ServiceTypes && data.ServiceTypes.$values ? data.ServiceTypes.$values : [];
      this.rowData3 = data && data.Products && data.Products.$values ? data.Products.$values : [];
      this.rowData4 = data && data.ProductTypes && data.ProductTypes.$values ? data.ProductTypes.$values : [];
    });
  }

  addProduct(from: any, data?: any, disabled?: any) {
    const dialogRef = this.dialog.open(AddProductStructureDialogComponent, {
      panelClass: 'width-665',
      data: { from: from, data: data, disabled: disabled },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      switch (result) {
        case 'Product Type':
          const data = this.gridApiProductType.api ? this.gridApiProductType.api : this.gridApiProductType;
          this.onAgGridReady4(data);
          break;
        case 'Industry':
          const data1 = this.gridApi.api ? this.gridApi.api : this.gridApi;
          this.onAgGridReady(data1);
          break;
        case 'Service Type':
          const data2 = this.gridApiServiceType.api ? this.gridApiServiceType.api : this.gridApiServiceType;
          this.onAgGridReady5(data2);
          break;
        case 'Product':
          const data3 = this.gridApiProduct.api ? this.gridApiProduct.api : this.gridApiProduct;
          this.onAgGridReady3(data3);
          break;
        case 'Service':
          const data4 = this.gridApiService.api ? this.gridApiService.api : this.gridApiService;
          this.onAgGridReady1(data4)
          break;

        default:
          break;
      }
    });
  }

  addVendorProduct() {
    const dialogRef = this.dialog.open(AddVendorProductDialogComponent, {
      panelClass: 'width-665',
      data: { name: 'Test', animal: 'Animal' }
    });

    dialogRef.afterClosed().subscribe(result => {
    });
  }

  onCellEditingStoppedEventForCL($event: any) {
    if ($event && $event.Email) {
      let user : any = {};
      user.Email = $event.Email;
      user.FirstName = $event.FirstName;
      user.LastName = $event.LastName;
      user.PrimaryLandline = $event.PrimaryLandline ? $event.PrimaryLandline : '';
      user.PrimaryMobile = $event.PrimaryMobile ? $event.PrimaryMobile : '';
      user.Active = $event.Active;
      user.BlockEmail = $event.BlockEmail;
      user.AccountId = $event.AccountId;
      user.MiddleInitial = $event.MiddleInitial;
      user.RolesToAssign = $event.Roles ? $event.Roles.$values : [];
      user.UserDefaultCompanyID = $event.CompanyID;
      this.locationService.editUser(user).subscribe((result) => {
      });
    }
  }


  onCellClicked($event: any) {
    // return false;
  }

  onCellDoubleClicked($event: any, from: any) {
    if ($event.data) {
      this.addProduct(from, $event.data);
    }
  }

  removeTab(index: any) {
    this.editProductsArray.splice(index, 1);
    this.editProductsArray = _.cloneDeep(this.editProductsArray);

  }

  removeUser(index: any) {
    this.addProductsArray.splice(index, 1);
    this.addProductsArray = _.cloneDeep(this.addProductsArray);

  }


  forgotPassword(email: any) {
    const data = { 'email': email }
    this.locationService.forgetPwd(data).subscribe({
      next: data => {
        let errorData: any = {
          messgeType: "error",
          title: "Attention",
          titleClass: "text-c-blue",
          icon: "fas fa-exclamation-triangle",
          iconClass: "text-c-blue f-70",
          message: 'Reset password link sent successfully' //if messges is multiple use array
        }
        const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
        dialogRef.afterClosed().subscribe(result => {
        });

      },
      error: error => {
        // if (error.status === 200) {
        // this.locationService.showToster({ type: 'error', message: 'Something Wrong!' });
        let errorData: any = {
          messgeType: "error",
          title: "Attention",
          titleClass: "text-c-blue",
          icon: "fas fa-exclamation-triangle",
          iconClass: "text-c-blue f-70",
          message: error.error.text //if messges is multiple use array
        }
        const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
        dialogRef.afterClosed().subscribe(result => {
        });
        // }
      }
    });
  }

  unlockUser(email: any) {
    this.locationService.unlockUser(email).subscribe((result) => {
      let errorData: any = {
        messgeType: "error",
        title: "Attention",
        titleClass: "text-c-blue",
        icon: "fas fa-exclamation-triangle",
        iconClass: "text-c-blue f-70",
        message: result //if messges is multiple use array
      }
      const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
      dialogRef.afterClosed().subscribe(result => {
      });
    })
  }


  sendEmailVerification(email: any) {
    this.locationService.emailVerficiationSend(email).subscribe(() => {
      let errorData: any = {
        messgeType: "error",
        title: "Attention",
        titleClass: "text-c-blue",
        icon: "fas fa-exclamation-triangle",
        iconClass: "text-c-blue f-70",
        message: 'Email verification sent successfully'  //if messges is multiple use array
      }
      const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
      dialogRef.afterClosed().subscribe(result => {
      });
    });
  }

  assumeIdentity(email: any) {
    this.locationService.assumeIdentity(email).subscribe({
      next: data => {
        this.locationService.loginUser = data;
        this.sessionStorageService.setObjectValue('user', data);
        this.sessionStorageService.setObjectValue('token', data.Token);
        this.localStorageService.setObjectValue('user', data);
        this.localStorageService.setObjectValue('token', data.Token);
        this.getLoggedinUserInfo().then((allow) => {
          if (allow) {
            let errorData: any = {
              messgeType: "error",
              title: "Attention",
              titleClass: "text-c-blue",
              icon: "fas fa-exclamation-triangle",
              iconClass: "t ext-c-blue f-70",
              message: 'User loggedin successfully'  //if messges is multiple use array
            }
            const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
            dialogRef.afterClosed().subscribe(result => {
              this.router.navigate(['/dashboard/analytics']).then(() => {
                window.location.reload();
              });
            });

          } else {
            let errorData: any = {
              messgeType: "error",
              title: "Attention",
              titleClass: "text-c-blue",
              icon: "fas fa-exclamation-triangle",
              iconClass: "text-c-blue f-70",
              message: 'Please assign roles to the user' //if messges is multiple use array
            }
            const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
            dialogRef.afterClosed().subscribe(result => {
            });
          }
        });
      },
      error: error => {
        let errorMessage: any = '';
        if (error.status === 400) {
          errorMessage = "Bad request please try again later ";
        } else if (error.status === 401) {
          errorMessage = error.error.ErrorMessage;
        }
        let errorData: any = {
          messgeType: "error",
          title: "Attention",
          titleClass: "text-c-blue",
          icon: "fas fa-exclamation-triangle",
          iconClass: "text-c-blue f-70",
          message: errorMessage //if messges is multiple use array
        }
        const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
        dialogRef.afterClosed().subscribe(result => {
        });
      }
    });
  }

  getLoggedinUserInfo(): Promise<any> {
    let promise = new Promise((resolve, reject) => {
      this.locationService.getLoggedinUserInfo().subscribe((result) => {
        if (result && result.Roles && result.Roles.$values && result.Roles.$values.length > 0) {
          const userRoles = result.Roles.$values;
          const userInfo = {
            id: result.Id,
            email: result.Email,
            name: result.FullName,
            mobile: result.PrimaryMobile,
            landline: result.PrimaryLandline,
            userImage: result.UserProfileImage ? result.UserProfileImage : '',
            headerLogo: (result.CompanyLogo && result.CompanyLogo.ImageData) ? result.CompanyLogo.ImageData : (result.AccountLogo && result.AccountLogo.ImageData) ? result.AccountLogo.ImageData : '',
            VendorAccountName: result.VendorAccountName,
            VendorUser: result.VendorUser
          }
          this.sessionStorageService.setObjectValue('userInfo', userInfo);
          this.localStorageService.setObjectValue('userInfo', userInfo);
          this.sessionStorageService.setObjectValue('userRoles', userRoles);
          this.localStorageService.setObjectValue('userRoles', userRoles);
          return resolve(true);
        } else {
          return resolve(false);
        }
      });
    });
    return promise;
  }

  getUserRoles(): Promise<any> {
    let promise = new Promise((resolve, reject) => {
      this.locationService.getUserRoles().subscribe((roles) => {
        if (roles && roles.$values.length > 0) {
          const userRoles = roles.$values;
          this.sessionStorageService.setObjectValue('userRoles', userRoles);
          return resolve(true);
        } else {
          return resolve(false);
        }
      });
    });
    return promise;
  }

  setSelectedTab(from: any) {

    if (from === 'editProducts') {
      this.selected = this.editProductsArray.length;
    } else if (from === 'addProducts') {
      this.selected = this.editProductsArray.length + this.addProductsArray.length;
    } else if (from === 'uploadProducts') {
      this.selected = this.uploadProductsArray.length + this.addProductsArray.length + this.uploadProductsArray.length;
    }
    // setTimeout(() => {
    //   $("div.listbox").find("button").removeClass('btn-primary');
    //   $("div.listbox").find("button").css("background-color", "rgb(207 ,207 ,207)");
    // }, 800);
  }

  goToPage(to: any) {
    if (to === 'charge') {
      this.router.navigate(['/management/products/charge-types']);
    } else if (to === 'users') {
      this.router.navigate(['/management/vendors/users']);
    } else if (to === 'vendors') {
      this.router.navigate(['/management/vendors/vendors']);
    } else if (to === 'products') {
      this.router.navigate(['/management/products/products'])
    } else if (to === 'serviceTypeAttributes') {
      this.router.navigate(['/management/products/service-type-attributes']);
    }
  }

  uploadProductsData() {
    this.uploadProductsArray.push({ name: 'New' });
    this.setSelectedTab('uploadProducts');
  }

  removeUploadPage(index: any) {
    this.uploadProductsArray.splice(index, 1);
    this.uploadProductsArray = _.cloneDeep(this.uploadProductsArray);

  }
  swapDirection() {
    this.sourceLeft = !this.sourceLeft;
    this.format.direction = this.sourceLeft ? DualListComponent.LTR : DualListComponent.RTL;
  }

  /*swapDirection() {
    this.sourceLeft = !this.sourceLeft;
    this.format.direction = this.sourceLeft ? DualListComponent.LTR : DualListComponent.RTL;
  }*/

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex);
    }
  }


  onUserAddEvent(event: any, index: any) {
    if (event) {
      this.addProductsArray.splice(index, 1);
      this.addProductsArray = _.cloneDeep(this.addProductsArray);

      this.getProductStructures();
    }
  }
}


var filterParams = {
  comparator: function (filterLocalDateAtMidnight: any, cellValue: any) {
    if (cellValue == null) return -1;

    let cellDate = moment(new Date(cellValue)).format('MM/DD/YYYY');
    let filterDate = moment(new Date(filterLocalDateAtMidnight)).format('MM/DD/YYYY');

    if (filterDate === cellDate) {
      return 0;
    }
    if (cellDate < filterDate) {
      return -1;
    }
    if (cellDate > filterDate) {
      return 1;
    }

    return 0; // ✅ fallback return (satisfies TS)
  },
  browserDatePicker: true,
};
