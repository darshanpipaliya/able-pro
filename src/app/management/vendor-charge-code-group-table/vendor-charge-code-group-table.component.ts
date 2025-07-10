import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import * as _ from 'lodash';
import { LocationService } from 'src/app/services/location.service';
import { isValueExist } from 'src/app/services/helper';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { AgGridTableComponent } from 'src/app/common/ag-grid-table/ag-grid-table.component';
import { AgGridModule } from 'ag-grid-angular';
import { AddChargeCodeComponent } from '../add-charge-code/add-charge-code.component';
import { ChargeCodesGroupDatatableComponent } from '../charge-codes-group-datatable/charge-codes-group-datatable.component';
import { ModuleRegistry } from 'ag-grid-community';
import { ServerSideRowModelModule } from 'ag-grid-enterprise';
ModuleRegistry.registerModules([ServerSideRowModelModule]);
interface Filter {
  filterKey: string;
  filterOptionType1: any; // Change 'any' to a more specific type if possible
  filterOptionValue1: string;
  filterOperationType: string;
  filterOptionType2: any | null; // Or specify a more precise type if possible
  filterOptionValue2: any | null; // Or specify a more precise type if possible
}


@Component({
  selector: 'app-vendor-charge-code-group-table',
  templateUrl: './vendor-charge-code-group-table.component.html',
  styleUrls: ['./vendor-charge-code-group-table.component.scss'],
  standalone: true,
  imports: [SharedModule, PrimgModule, AgGridTableComponent, AgGridModule, ChargeCodesGroupDatatableComponent]
})
export class VendorChargeCodeGroupTableComponent implements OnInit {

  buttonOptions: any = [
    { 'label': 'Products', value: 'products', icon: "fa-box-open" },
    { 'label': "Charge Codes", value: 'charge', icon: "fa-copyright" },
    { 'label': 'Charge Codes Group', value: 'codegroup', icon: "fa-layer-group" },
  ];
  selected: any = 0;
  girdDataCount = 0;
  editChargeCodeArray: any = [];
  addChargeCodeArray: any = [];

  isSuperTEMAdmin: boolean = false;
  isSuperTEMManager: boolean = false;
  isUserSuperTemOrAdmin: boolean = false;
  isTEMManager: boolean = false;
  currentOpenEditPagevar = 'Table';
  private _unsubscribeGRid: Subject<any> = new Subject<any>();
  public exportVCCGdata: any;
  public exportVCCGdetail: any;

  gridOptions = {
    rowModelType: 'serverSide',
    serverSideInfiniteScroll: true,
    enableFiltering: true,
    headerHeight: 35,
    groupHeaderHeight: 37,
    floatingFiltersHeight: 35
  };

  rowData = [];
  stopSpinner: any = false;
  public columnDefs;
  public rowSelection;
  public defaultColDef;
  public sideBar;
  gridApi: any;
  gridColumnApi: any;
  isDisabledExport = false;
  params: any;

  constructor(
    private router: Router,
    public dialog: MatDialog,
    private locationService: LocationService,
    private route: ActivatedRoute
  ) {

    if (this.route.snapshot.queryParams) {
      this.params = this.route.snapshot.queryParams;
    }

    this.columnDefs = [
      {
        headerCheckboxSelection: true,
        checkboxSelection: true,
        floatingFilter: true,
        minWidth: 150,
        maxWidth: 50,
        width: 100,
        flex: 0,
        resizable: true,
        sortable: true,
        editable: false,
        filter: false,
        suppressColumnsToolPanel: true,
      },
      {
        headerName: 'Group Name',
        children: [
          {
            field: 'GroupName',
            headerName: 'Group ID',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 130,
            flex: 0
          },
        ],
      },
      {
        headerName: 'Charge Code',
        children: [
          {
            field: 'ChargeCodeName',
            headerName: 'Charge Code Name',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 250,
            flex: 0,
          },
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
            field: 'ChargeCodeType',
            headerName: 'Charge Code Type',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 176,
            width: 176,
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
            headerName: 'Charge Code Occurrence',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 221,
            flex: 0,
          },

        ],
      },
      {
        headerName: 'Group Info',
        children: [
          {
            field: 'PrimaryChargeCodeDisplay',
            headerName: 'Primary?',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 140,
            flex: 0
          },
          {
            field: 'RequiredChargeCodeDisplay',
            headerName: 'Required?',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 120,
            width: 120,
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
            minWidth: 140,
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
            minWidth: 150,
            flex: 0,
          },
          // {
          //   field: 'ParentVendorAccountName',
          //   headerName: 'Parent Vendor',
          //   resizable: true,
          //   editable: false,
          //   columnGroupShow: 'open',
          //   filter: 'agTextColumnFilter',
          //   minWidth: 200,
          //   sortingField: 'ParentVendorAccountName'
          // },
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
            minWidth: 230,
            flex: 0,
          },
          // {
          //   field: 'VendorProductDescription',
          //   headerName: 'Vendor Product Description',
          //   columnGroupShow: 'open',
          //   editable: false,
          //   filter: 'agTextColumnFilter',
          //   minWidth: 260,
          //   flex: 0,
          // },
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
            minWidth: 170,
            flex: 0,
          },
          {
            field: 'ServiceTypeName',
            headerName: 'Service Type',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 250,
            flex: 0,
          },
          {
            field: 'ProductName',
            headerName: 'Product',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 170,
            flex: 0,
          },
          {
            field: 'ProductTypeName',
            headerName: 'Product Type',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 170,
            flex: 0,
          },

        ],
      },

      {
        headerName: 'Status',
        children: [
          {
            field: 'GroupStatusValue',
            headerName: 'CC Group Status',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 120,
            flex: 0,
          },
          {
            field: 'VendorProductStatusValue',
            headerName: 'Vendor Product Status',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 120,
            flex: 0,
          },
        ],
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
      toolPanels: ['columns', 'filters']/* ,
    defaultToolPanel: 'columns', */
    };
  }

  onAgGridReadyEmit($event: any) {
    this.gridApi = $event.api;
    this.gridColumnApi = $event.columnApi;

    if (isValueExist(this.params?.GroupId)) {
      const predefinedFilterModel = {
        GroupName: {
          filterType: 'text',
          type: 'equals',
          filter: `${this.params?.GroupId}`
        }
      };

      if (this.gridApi) {
        this.gridApi.setFilterModel(predefinedFilterModel);
      }
    }
  }

  currentOpenEditPage($event: any) {
    this.currentOpenEditPagevar = ($event) ? 'Edit' : 'Add';
  }

  changeTab(event: any) {
    this.selected = event;
    this.currentOpenEditPagevar = (event === 0) ? 'Table' : this.currentOpenEditPagevar;
  }

  onBtnExportDataAsExcel() {
    
    this.isDisabledExport = true;
    this.locationService
      .vendorProductChargeCodeGroupsExcel(this.exportVCCGdata)
      .subscribe({
        next: data => {
          this.isDisabledExport = false;
          let bolbUrl = URL.createObjectURL(data);
          var link = document.createElement("a");
          link.setAttribute("href", bolbUrl);
          link.setAttribute("download", "Charge Code Groups.xlsx");
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

  ngOnInit(): void {
    this.isUserSuperTemOrAdmin = this.locationService.isUserHasSuperTEMOrAdminRole();
    this.isTEMManager = this.locationService.isUserHasTEMManagerRole();
    this.isSuperTEMManager = this.locationService.isUserHasSuperTEMManagerRole();
    this.isSuperTEMAdmin = this.locationService.isUserHasSuperTEMAdminRole();

    let headerData: any = [];
    let ChildHeaderData: any = [];
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

    this.exportVCCGdetail = {
      ExportToExcelData: {
        HeaderData: headerData,
        ChildHeaderData: ChildHeaderData,
        fileName: "Charge Code Groups"
      },
      ExportToExcel: true
    };
    this.exportVCCGdata = this.exportVCCGdetail;
  }


  onAgGridReady($event: any) {
    this.gridApi = $event;
    let dataSource: any = {
      rowCount: null,
      getRows: (params: any) => {
        let paramsRequest = params['request'];
        const filterArray: any = [];
        const filterArrayDate: any = [];

        for (var key in paramsRequest.filterModel) {
          let data = paramsRequest.filterModel[key];
          let arr: any;
          let arrDate: any;

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
        // if (this.params && this.params.GroupId) {
        //   let arrr = 
        //     {
        //       "filterKey": "GroupName",
        //       "filterOptionType1": "equals",
        //       "filterOptionValue1": this.params.GroupId,
        //       "filterOperationType": "AND",
        //       "filterOptionType2": null,
        //       "filterOptionValue2": null
        //   }
        //   filterArray.push(arrr);
        // }

        if (filterArrayDate && filterArrayDate.length > 0) {
          data['advanceDateFilter'] = filterArrayDate;
        }

        if (filterArray && filterArray.length > 0) {
          data['advanceFilter'] = filterArray;
        }
        if (paramsRequest.sortModel.length > 0) {

          Object.values(params['columnApi']['columnController']['columnDefs']).forEach((key: any) => {
            if (key['children']) {
              Object.values(key['children']).forEach((k: any) => {
                if (k['field'] === paramsRequest.sortModel[0].colId) {
                  data['OrderBy'] = k['field'];
                  data['SortOrder'] = paramsRequest.sortModel[0].sort;
                }
              });
            }
          });
        }
        this.exportVCCGdata = { ...this.exportVCCGdetail, ...data };

        this.locationService
          .vendorProductChargeCodeGroups(data)
          .pipe(takeUntil(this._unsubscribeGRid))
          .subscribe(
            async (data: any) => {
              this.rowData = data.Data.$values;
              this.girdDataCount = _.cloneDeep(data?.TotalCount);
              if (this.params) {
                const paramsObj = _.filter(this.rowData, ((res: any) => {
                  return res.GroupId == this.params?.GroupId && res.GroupXVendorProductTypeId == this.params?.GroupXVendorProductTypeId && res.VendorProductTypeId == this.params?.VendorProductTypeId
                }));

                if (paramsObj.length > 0) {
                  const obj = { data: paramsObj[0] };
                  this.onChargeCodeCellDoubleClicked(obj);
                }
              }

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

  addSaveEvent($event: any, index: any) {
    if ($event) {
      this.addChargeCodeArray.splice(index, 1);
      this.addChargeCodeArray = _.cloneDeep(this.addChargeCodeArray);
      this.onAgGridReady(this.gridApi);
    }
  }

  editSaveEvent($event: any, index: any) {
    if ($event) {
      this.editChargeCodeArray.splice(index, 1);
      this.editChargeCodeArray = _.cloneDeep(this.editChargeCodeArray);
      this.onAgGridReady(this.gridApi);
    }
  }
  setSelectedTab(from: any) {
    if (from === 'addChargeCode') {
      this.selected = this.editChargeCodeArray.length + this.addChargeCodeArray.length;
    }
  }


  goToPage(to: any) {
    if (to === 'products') {
      this.router.navigate(['/management/vendors/vendor-products']);
    } else if (to === 'charge') {
      this.router.navigate(['/management/vendors/charge-codes']);
    } else if (to === 'users') {
      this.router.navigate(['/management/vendors/users']);
    } else if (to === 'vendors') {
      this.router.navigate(['/management/vendors/vendors']);
    } else if (to === 'billing-alias') {
      this.router.navigate(['/management/vendors/billing-alias']);
    } else if (to === 'codegroup') {
      this.router.navigate(['/management/vendors/charge-codes-group']);
    }
  }

  removeChargeCodeTab(index: any) {
    this.editChargeCodeArray.splice(index, 1);
    this.editChargeCodeArray = _.cloneDeep(this.editChargeCodeArray);
  }

  removeAddChargeCodeTab(index: any) {
    this.addChargeCodeArray.splice(index, 1);
    this.addChargeCodeArray = _.cloneDeep(this.addChargeCodeArray);
  }


  onChargeCodeCellDoubleClicked($event: any) {
    if ($event.data) {
      this.editChargeCodeArray.push($event.data);
      setTimeout(() => {
        this.selected = this.editChargeCodeArray.length;
      }, 0);
    }
  }
}
