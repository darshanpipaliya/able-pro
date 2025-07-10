import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatAccordion } from '@angular/material/expansion';
import { ActivatedRoute, Router } from '@angular/router';
import { DualListComponent } from 'angular-dual-listbox';
import moment from 'moment';
import { PrimeNGConfig } from 'primeng/api';
import { AddChargeTypeDialogComponent } from '../add-charge-type-dialog/add-charge-type-dialog.component';
import { AddVendorProductDialogComponent } from '../add-vendor-product-dialog/add-vendor-product-dialog.component';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import * as _ from 'lodash';
import { LocationService } from 'src/app/services/location.service';
import { SessionStorageService } from 'src/app/services/session-storage.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { isValueExist } from 'src/app/services/helper';
import { ErrorWarningPopupComponent } from 'src/app/common/error-warning-popup/error-warning-popup.component';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { AgGridModule } from 'ag-grid-angular';
import { AgGridTableComponent } from 'src/app/common/ag-grid-table/ag-grid-table.component';
import { UiModalComponent } from '../ui-modal/ui-modal.component';

@Component({
  selector: 'app-charge-type-datatable',
  templateUrl: './charge-type-datatable.component.html',
  styleUrls: ['./charge-type-datatable.component.scss'],
  imports: [SharedModule, PrimgModule, AgGridModule, AgGridTableComponent, UiModalComponent]
})
export class ChargeTypeDatatableComponent implements OnInit {

  selectedButton: any = 'users';
  buttonOptions: any = [
    // { 'label': 'Vendors', value: 'vendors' },
    // { 'label': "Users", value: 'users' },
    // { 'label': 'Products', value: 'products', icon: 'fa-box-open' },
    // { 'label': 'Product Structure', value: 'productstructure', icon: 'fa-sitemap' },
    { 'label': "Charge Type", value: 'charge', icon: 'fa-box-open' },
    // { 'label': "Service Type Attributes", value: 'serviceTypeAttributes', icon: 'fa-tag' }
  ];
  panelOpenState = false;
  @ViewChild(MatAccordion) accordion: MatAccordion;

  public columnDefs;
  public columnDefs1;
  public columnDefs2 : any;
  public columnDefs3 : any;
  public columnDefs4 : any;
  public rowSelection;
  public defaultColDef;
  public sideBar;
  public rowData: any = [];
  public rowData1: any = [];
  public rowData2: any = [];
  public rowData3: any = [];
  public rowData4: any = [];
  selected: any = 0;
  girdDataCount = 0;
  girdDataCount2 = 0;
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
  gridApiChargeType: any;
  gridColumnApiChargeType: any;
  gridOptions = {
    rowModelType: 'serverSide',
    serverSideInfiniteScroll: true,
    enableFiltering: true,
    headerHeight: 35,
    groupHeaderHeight: 37,
    floatingFiltersHeight: 35
  };
  public exportChargeType: any;
  isDisabledExport = false;
  public exportChargeData: any;
  public exportChargeDetail: any;

  isDisabledCharge = false;

  private _unsubscribeGRid: Subject<any> = new Subject<any>();
  private _unsubscribeCC: Subject<any> = new Subject<any>();

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


    this.columnDefs = [
      {
        checkboxSelection: true,
        minWidth: 150,
        maxWidth: 50,
        width: 100,
        flex: 0,
        resizable: true,
        filter: false
      },


      {
        headerName: 'Charge Code Types',
        children: [
          {
            field: 'ChargeCodeTypeName',
            headerName: 'Charge Code Types',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 190,
            flex: 0
          },
          {
            field: 'StatusValue',
            headerName: 'Status',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 100,
            flex: 0
          },

        ],
      },

      {
        headerName: 'Created',
        children: [

          {
            field: 'CreatedByUser',
            headerName: 'Created By',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 150,
            flex: 0,
          },
          {
            // field: 'CreationDate',
            field: 'CreationDate', valueGetter(params:any) {
              return moment(params.data && params.data.CreationDate).format('MM/DD/YYYY');
            },
            headerName: 'Created Date',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agDateColumnFilter',
            filterParams: filterParams,
            minWidth: 150,
            flex: 0,
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
            minWidth: 180,
            flex: 0,
            // cellRenderer: params => {
            //  return params.value ? params.value.FirstName + " " + params.value.LastName : '';
            // }

          },
          {
            field: 'ModificationDate', valueGetter(params:any) {
              if (params.data && params.data.ModificationDate) {
                return moment(params.data.ModificationDate).format('MM/DD/YYYY');
              }
              return '';
            },
            headerName: 'Modified Date',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agDateColumnFilter',
            filterParams: filterParams,
            minWidth: 180,
            flex: 0,
          },
        ],
      },


    ];
    this.columnDefs1 = [
      {
        checkboxSelection: true,
        minWidth: 150,
        maxWidth: 50,
        width: 100,
        flex: 0,
        resizable: true,
        filter: false
      },


      {
        headerName: 'Charge Types',
        children: [
          {
            field: 'ChargeTypeName',
            headerName: 'Charge Types',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 150,
            flex: 0
          },
          {
            field: 'ChargeCodeTypeName',
            headerName: 'Charge Code Types',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 190,
            flex: 0
          },
          {
            field: 'StatusValue',
            headerName: 'Status',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 150,
            flex: 0
          },

        ],
      },

      {
        headerName: 'Created',
        children: [

          {
            field: 'CreatedByUser',
            headerName: 'Created By',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 150,
            flex: 0,
          },
          {
            field: 'CreationDate', valueGetter(params:any) {
              return moment(params.data && params.data.CreationDate).format('MM/DD/YYYY');
            },
            headerName: 'Created Date',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agDateColumnFilter',
            filterParams: filterParams,
            minWidth: 150,
            flex: 0,
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
            minWidth: 180,
            flex: 0,
          },
          {
            field: 'ModificationDate', valueGetter(params:any) {
              if (params.data && params.data.ModificationDate) {
                return moment(params.data.ModificationDate).format('MM/DD/YYYY');
              }
              return '';
            },
            headerName: 'Modified Date',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agDateColumnFilter',
            filterParams: filterParams,
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
      toolPanels: ['columns', 'filters']/* ,
      defaultToolPanel: 'columns', */
    };
  }

  onAgGridReady($event:any) {
    this.stopSpinner = true;
    this.gridApi = $event;
    let dataSource: any = {
      rowCount: null,
      getRows: (params: any) => {

        let paramsRequest = params['request'];
        const filterArray :any= [];
        const filterArrayDate :any= [];

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
          maximumRows: 100,
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
        this.exportChargeType = {...this.exportChargeType, ...data};

        this.locationService
          .getChargeCodetypeLogged(data)
          .pipe(takeUntil(this._unsubscribeGRid))
          .subscribe(
            async (data: any) => {
                this.girdDataCount = _.cloneDeep(data?.TotalCount);
              if (data && data.Data.$values.length > 0) {
                this.rowData = data.Data.$values;
                let lastRow = -1;
                if (data.TotalCount <= paramsRequest.startRow + 100) {
                  lastRow = data.TotalCount;
                }
                params.successCallback(
                  data.Data.$values,
                  lastRow
                );
              } else {
                params.successCallback([], 0 );
                this.gridApi.showNoRowsOverlay();
              }
            },
            (error) => {
              this.rowData = [];
              this.stopSpinner = true;
              params.successCallback([], 0 );
                this.gridApi.showNoRowsOverlay();
            }
          );
      },
    };
    this.gridApi.setServerSideDatasource(dataSource);
  }

  onAgGridReady2($event:any) {
    this.gridApiChargeType = $event;
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
          maximumRows: 100,
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
        this.exportChargeData = {...this.exportChargeDetail, ...data};
        this.locationService
          .getChargeCodeLogged(data)
          .pipe(takeUntil(this._unsubscribeCC))
          .subscribe(
            async (data: any) => {
              this.girdDataCount2 = _.cloneDeep(data?.TotalCount);
              if (data && data.Data.$values.length > 0) {
                this.rowData1 = data.Data.$values;
                let lastRow = -1;
                if (data.TotalCount <= paramsRequest.startRow + 100) {
                  lastRow = data.TotalCount;
                }
                params.successCallback(
                  data.Data.$values,
                  lastRow
                );
              } else {
                params.successCallback([], 0 );
                this.gridApiChargeType.showNoRowsOverlay();
              }
            },
            (error) => {
              this.rowData = [];
              this.stopSpinner = true;
              params.successCallback([], 0 );
                this.gridApiChargeType.showNoRowsOverlay();
            }
          );
      },
    };
    this.gridApiChargeType.setServerSideDatasource(dataSource);
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
    // this.getChargeType();
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

    this.exportChargeType = {
      ExportToExcelData : { 
        HeaderData: headerData,
        ChildHeaderData: ChildHeaderData,
        fileName: "Charge Code Type"
      },
      ExportToExcel: true
    };


    let chargeheaderData:any = [];
    let chargeChildHeaderData:any = [];
    let chargei = 0;
    let chargechildIndex = 0;
    _.map(this.columnDefs1, (x: any) => {
      if (isValueExist(x.headerName)) {
        chargei = chargei + 1;
        chargeheaderData.push({ position: chargei, title: x.headerName });
        if (x.children) {
          _.map(x.children, (y: any) => {
            chargechildIndex = chargechildIndex + 1;
            chargeChildHeaderData.push({ Position: chargechildIndex, Title: y.headerName, FieldName: y.field, HeaderPosition: chargei })
          })
        }
      }
    });

    this.exportChargeDetail = {
      ExportToExcelData : { 
        HeaderData: chargeheaderData,
        ChildHeaderData: chargeChildHeaderData,
        fileName: "Charge Type"
      },
      ExportToExcel: true
    };
    this.exportChargeData = this.exportChargeDetail; 
  }

  onAgGridReadyEmit($event:any) {
    this.gridApi = $event.api;
    this.gridColumnApi = $event.columnApi;
  }

  onBtnExportDataAsExcel() {
    
    this.isDisabledExport = true;
    this.locationService
      .getChargeCodetypeExcel(this.exportChargeType)
      .subscribe({
          next: data => {
            this.isDisabledExport = false;
            let bolbUrl = URL.createObjectURL(data);
            var link = document.createElement("a");
            link.setAttribute("href", bolbUrl);
            link.setAttribute("download", "Charge Code Type.xlsx");
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

  onAgGridReadyEmitChargeType($event:any) {
    this.gridApiChargeType = $event.api;
    this.gridColumnApiChargeType = $event.columnApi;
  }

  onBtnExportDataAsExcelChargeType() {
    
    this.isDisabledCharge = true;
    this.locationService
      .getChargeCodeExcelData(this.exportChargeData)
      .subscribe({
          next: data => {
            this.isDisabledCharge = false;
            let bolbUrl = URL.createObjectURL(data);
            var link = document.createElement("a");
            link.setAttribute("href", bolbUrl);
            link.setAttribute("download", "Charge Type.xlsx");
            link.style.display = "none";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
           
          }, 
          error: error => {
            this.isDisabledCharge = false;
            
          }
        });
  }

  getChargeType() {
    this.locationService.getChargeType().subscribe((data) => {
      this.rowData = (data && data.ChargeCodeTypes && data.ChargeCodeTypes.$values) ? data.ChargeCodeTypes.$values : [];
      this.rowData1 = (data && data.TaxRegulatoryTypes && data.TaxRegulatoryTypes.$values) ? data.TaxRegulatoryTypes.$values : [];
    })
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

    const dialogRef = this.dialog.open(AddChargeTypeDialogComponent, {
      panelClass: 'width-665',
      data: { from: from, data: data, disabled: disabled },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result == 'Charge Code Type') {
        const a = this.gridApi.api ? this.gridApi.api : this.gridApi;
        this.onAgGridReady(a);
      } else if (result == 'Charge Type') {
        const a = this.gridApiChargeType.api ? this.gridApiChargeType.api : this.gridApiChargeType;
        this.onAgGridReady2(a);
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

  onCellEditingStoppedEventForCL($event:any) {
    if ($event && $event.Email) {
      let user:any = {};
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


  onCellClicked($event:any) {
    // return false;
  }

  onCellDoubleClicked($event:any, from:any) {
    if ($event.data) {
      this.addProduct(from, $event.data);
    }
  }

  removeTab(index:any) {
    this.editProductsArray.splice(index, 1);
    this.editProductsArray = _.cloneDeep(this.editProductsArray);
  }

  removeUser(index:any) {
    this.addProductsArray.splice(index, 1);
    this.addProductsArray = _.cloneDeep(this.addProductsArray);
  }


  forgotPassword(email: any) {
    const data = { 'email': email }
    this.locationService.forgetPwd(data).subscribe({
      next: data => {
        let errorData: any = {
          messgeType: "success",
          title: "Attention",
          titleClass: "text-c-blue",
          icon: "fas fa-exclamation-triangle",
          iconClass: "text-c-blue f-70",
          message: 'Reset password link sent successfully'  //if messges is multiple use array
        }
        const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
      },
      error: error => {
        if (error.status === 200) {
          // this.locationService.showToster({ type: 'error', message: 'Something wrong!' });
          let errorData: any = {
            messgeType: "error",
            title: "Attention",
            titleClass: "text-c-blue",
            icon: "fas fa-exclamation-triangle",
            iconClass: "text-c-blue f-70",
            message: 'Something wrong'  //if messges is multiple use array
          }
          const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
        }
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
        message: result  //if messges is multiple use array
      }
      const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
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
        message: 'Email verification sent successfully'   //if messges is multiple use array
      }
      const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
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
              iconClass: "text-c-blue f-70",
              message: 'User loggedin successfully'   //if messges is multiple use array
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
              message: 'Please assign roles to the user'   //if messges is multiple use array
            }
            const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
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
    //   $("div.listbox").find("button").css("background-color", "rgb(207 207 207)");
    // }, 800);
  }

  goToPage(to:any) {
    if (to === 'charge') {
      this.router.navigate(['/management/products/charge-types']);
    } else if (to === 'users') {
      this.router.navigate(['/management/vendors/users']);
    } else if (to === 'vendors') {
      this.router.navigate(['/management/vendors/vendors']);
    } else if (to === 'products') {
      this.router.navigate(['/management/products/products'])
    } else if (to === 'productstructure') {
      this.router.navigate(['/management/products/structure']);
    } else if (to === 'serviceTypeAttributes') {
      this.router.navigate(['/management/products/service-type-attributes']);
    }
  }

  uploadProductsData() {
    this.uploadProductsArray.push({ name: 'New' });
    this.setSelectedTab('uploadProducts');
  }

  removeUploadPage(index:any) {
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

  onUserAddEvent(event:any, index:any) {
    if (event) {
      this.addProductsArray.splice(index, 1);
      this.addProductsArray = _.cloneDeep(this.addProductsArray);
      // this.getChargeType();
      this.onAgGridReady(this.gridApi);
      this.onAgGridReady2(this.gridApiChargeType);
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