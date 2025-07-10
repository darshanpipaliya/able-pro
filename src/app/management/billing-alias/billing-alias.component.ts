import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatAccordion } from '@angular/material/expansion';
import { Router } from '@angular/router';
import moment from 'moment';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import * as _ from 'lodash';
import { AddBillingAliasComponent } from 'src/app/billing-alias/add-billing-alias/add-billing-alias.component';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { LocationService } from 'src/app/services/location.service';
import { isValueExist, rolePermission } from 'src/app/services/helper';
import { AgGridTableComponent } from 'src/app/common/ag-grid-table/ag-grid-table.component';
import { AgGridModule } from 'ag-grid-angular';
import { ModuleRegistry } from 'ag-grid-community';
import { ServerSideRowModelModule } from 'ag-grid-enterprise';
ModuleRegistry.registerModules([ServerSideRowModelModule]);
@Component({
  selector: 'app-billing-alias',
  templateUrl: './billing-alias.component.html',
  styleUrls: ['./billing-alias.component.scss'],
  standalone: true,
  imports : [SharedModule, PrimgModule, AddBillingAliasComponent, AgGridTableComponent, AgGridModule, ]
})
export class BillingAliasComponent implements OnInit {
  selectedButton: any = 'billing-alias';
  buttonOptions: any = [
    { 'label': 'Vendors', value: 'vendors', icon: "fa-snowplow" },
    { 'label': "Billing Alias", value: 'billing-alias', icon: "fa-user-ninja" }
  ];
  panelOpenState = false;
  @ViewChild(MatAccordion) accordion: MatAccordion;
  isShowButton: boolean = true;
  public columnDefs;
  public rowSelection;
  public defaultColDef;
  public sideBar;
  public rowData: any = [];
  public billingAliasLogsEmitData: any = [];
  public vendorsListEmitData: any = [];
  selected: any = 0;
  girdDataCount = 0;
  sourceLeft = true;
  keepSorted = true;
  filter = true;
  isCompanyAdmin: any = false;
  stopSpinner: any = false;
  addeditBillingAliasTabs: any = [];
  BillingAliasRowDetails: any;
  viewNEdit: boolean = false;
  private _unsubscribeGRid: Subject<any> = new Subject<any>();
  gridApi: any;
  gridColumnApi: any;
  currentOpenEditPagevar =  'Table';
  gridOptions = {
    rowModelType: 'serverSide',
    serverSideInfiniteScroll: true,
    enableFiltering: true,
    headerHeight: 35,
    groupHeaderHeight: 37,
    floatingFiltersHeight: 35
  };
  public exportBillingData: any;
  public exportBillingDetail: any;

  isDisabledExport = false;
  
  constructor(private router: Router,
    private locationService: LocationService,
    public dialog: MatDialog) {

    this.columnDefs = [
      {
        headerName: 'Vendor',
        children: [
          {
            field: 'VendorAccountName',
            headerName: 'Vendor',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 120,
            flex: 0
          }
        ]
      },
      {
        headerName: 'Vendor Billing Alias',
        children: [
          {
            field: 'VendorBillingAliasName',
            headerName: 'Vendor Billing Alias',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 250,
            flex: 0,
          },
          {
            field: 'Description',
            headerName: 'Description',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 150,
            flex: 0,
          }
        ]
      },
      {
        headerName: 'Status',
        children: [
          {
            field: 'StatusDisplayValue',
            headerName: 'Status',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 120,
            flex: 0,
          },
          {
            field: 'InvoiceAliasDisplayValue',
            headerName: 'Payable Alias',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 180,
            flex: 0,
          },
          {
            field: 'ChargeCodeAliasDisplayValue',
            headerName: 'Charge Code Alias',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 200,
            flex: 0,
          }
        ],
      },
      {
        headerName: 'History',
        children: [
          {
            headerName: 'Created By',
            field: 'CreatedByUser', 
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 130,
            flex: 0,
          },
          {
            field: 'CreationDate', valueGetter(params: any) {
              return moment(params.data && params.data.CreationDate).format('MM/DD/YYYY');
            },
            headerName: 'Created Date',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agDateColumnFilter',
            minWidth: 180,
            flex: 0,
          },
          {
            headerName: 'Modified By',
            field: 'ModifiedByUser',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 180,
            flex: 0,
          },
          {
            field: 'ModificationDate', valueGetter(params: any) {
              if (params.data.ModificationDate) {
                return moment(params.data && params.data.ModificationDate).format('MM/DD/YYYY');
              }
              return '';
            },
            headerName: 'Modified Date',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agDateColumnFilter',
            minWidth: 180,
            flex: 0,
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
      toolPanels: ['columns', 'filters']
    };

    
  }

  ngOnInit(): void {
    this.viewNEdit =  rolePermission(['SuperTEMAdmin', 'SuperTEMManager']);
    // this.getBillingAlias();

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

    this.exportBillingDetail = {
      ExportToExcelData : { 
        HeaderData: headerData,
        ChildHeaderData: ChildHeaderData,
        fileName: "Billing Alias"
      },
      ExportToExcel: true
    };
    this.exportBillingData = this.exportBillingDetail;
  }

  currentOpenEditPage($event: any) {
    this.currentOpenEditPagevar = ($event) ? 'Edit' : 'Add';
  }

  changeTab(event: any) {
    this.selected = event;
    this.currentOpenEditPagevar = (event === 0) ? 'Table' : this.currentOpenEditPagevar;

    if (event == 0) {
      this.isShowButton = true;
    } else {
      this.isShowButton = false;
    }
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
        this.exportBillingData = {...this.exportBillingDetail, ...data};
        this.locationService
          .getVendorBillingAliasList(data)
          .pipe(takeUntil(this._unsubscribeGRid))
          .subscribe(
            async (data: any) => {
              this.rowData = data.Data.$values;
              this.girdDataCount = _.cloneDeep(data?.TotalCount);
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
      this.gridApi.api.setGridOption("serverSideDatasource", dataSource);
    } else {
      this.gridApi.setGridOption("serverSideDatasource", dataSource);
    }
  }

  onCellDoubleClicked($event: any) {
    this.addeditBillingAliasTabs.push({ tab: "edit", rowData: $event.data });
    this.selected = this.addeditBillingAliasTabs.length;
    this.setSelectedTab('edit');

  }

  removeAddEditBillingAliasTab(index: any) {
    this.onAgGridReady(this.gridApi);
    this.addeditBillingAliasTabs.splice(index, 1);
    this.addeditBillingAliasTabs = _.cloneDeep(this.addeditBillingAliasTabs);

  }

  onAddBillingAliasComponentDestroy(data: any, i: any) {
    this.addeditBillingAliasTabs[i].rowData = data;
  }

  goToPage(to: any) {
    if (to === 'products') {
      this.router.navigate(['/management/vendors/vendor-products']);
    } else if (to === 'users') {
      this.router.navigate(['/management/vendors/users']);
    } else if (to === 'charge') {
      this.router.navigate(['/management/vendors/charge-codes']);
    } else if (to === 'vendors') {
      if (this.router.url.includes('management')) {
        this.router.navigate(['/management/vendors/vendors']);
      } else {
        this.router.navigate(['/vendors/vendors']);
      }
    } else if (to === 'billing-alias') {
      this.router.navigate(['/management/vendors/billing-alias']);
    }
  }

  addNewBillingAlias() {
    this.addeditBillingAliasTabs.push({ tab: "add", rowData: '' });
    this.selected = this.addeditBillingAliasTabs.length;
    this.setSelectedTab('add');
  }

  setSelectedTab(from: any) {
    if (from === 'edit') {
      this.currentOpenEditPagevar = 'Edit';
    } else if (from === 'add') {
      this.currentOpenEditPagevar = 'Add';
    }
  }

  ngOnDestroy() {
    this._unsubscribeGRid.next(null);
    this._unsubscribeGRid.complete();
  }

  onAgGridReadyEmit($event: any) {
    this.gridApi = $event.api;
    this.gridColumnApi = $event.columnApi;
  }

  onBtnExportDataAsExcel(){
    
    this.isDisabledExport = true;
    this.locationService
      .getVendorBillingAliasExportData(this.exportBillingData)
      .subscribe({
          next: data => {
            this.isDisabledExport = false;
            let bolbUrl = URL.createObjectURL(data);
            var link = document.createElement("a");
            link.setAttribute("href", bolbUrl);
            link.setAttribute("download", "Billing Alias.xlsx");
            link.style.display = "none";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
           
          }, 
          error: error => {
            this.isDisabledExport = false;
            
          }
        });
  }
}
