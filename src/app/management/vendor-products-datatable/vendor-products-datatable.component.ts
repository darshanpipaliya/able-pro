import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatAccordion } from '@angular/material/expansion';
import { ActivatedRoute, Router } from '@angular/router';
import { DualListComponent } from 'angular-dual-listbox';

import moment from 'moment';
import { PrimeNGConfig } from 'primeng/api';
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
import { AgGridTableComponent } from 'src/app/common/ag-grid-table/ag-grid-table.component';
import { AgGridModule } from 'ag-grid-angular';
import { EditVendorProductComponent } from '../edit-vendor-product/edit-vendor-product.component';
import { ChargeCodesGroupDatatableComponent } from '../charge-codes-group-datatable/charge-codes-group-datatable.component';
import { AddProductComponent } from '../add-product/add-product.component';
import { FilesUploadComponent } from 'src/app/common/files-upload/files-upload.component';
import { AddVendorProductComponent } from '../add-vendor-product/add-vendor-product.component';
import { AddChargeCodeComponent } from '../add-charge-code/add-charge-code.component';
import { ModuleRegistry } from 'ag-grid-community';
import { ServerSideRowModelModule } from 'ag-grid-enterprise';
ModuleRegistry.registerModules([ServerSideRowModelModule]);
@Component({
  selector: 'app-vendor-products-datatable',
  templateUrl: './vendor-products-datatable.component.html',
  styleUrls: ['./vendor-products-datatable.component.scss'],
  standalone: true,
  imports: [SharedModule, PrimgModule, AgGridTableComponent, AgGridModule, EditVendorProductComponent, ChargeCodesGroupDatatableComponent,
    AddProductComponent, FilesUploadComponent, AddVendorProductComponent, 
    AddChargeCodeComponent
  ]
})
export class VendorProductsDatatableComponent implements OnInit {
  selectedButton: any = 'users';
  buttonOptions: any = [
    { 'label': 'Products', value: 'products', icon: "fa-box-open" },
    { 'label': 'Charge Codes', value: 'charge', icon: "fa-copyright" },
    { 'label': 'Charge Codes Group', value: 'codegroup', icon: "fa-layer-group" },
  ];
  panelOpenState = false;
  @ViewChild(MatAccordion) accordion: MatAccordion;
  public columnDefs;
  public rowSelection;
  public defaultColDef;
  public sideBar;
  public rowData: any = [];
  selected: any = 0;
  girdDataCount = 0;
  isShowCCG: boolean = false;
  userData: any;
  editProductsArray: any = [];
  addProductsArray: any = [];
  addVendorProductsArray: any = [];
  uploadProductsArray: any = [];
  chargeCodeGroupArray: any = [];
  sourceLeft = true;
  format: any = DualListComponent.DEFAULT_FORMAT;
  keepSorted = true;
  filter = true;
  userAdd = '';
  disabled = false;
  users: any;
  customers: any;
  isCompanyAdmin: any = false;
  isSuperTEMManager: any = false;
  isSuperTEMAdmin: any = false;
  stopSpinner: any = false;
  public exportProductData: any;
  public exportProductDetail: any;

  isDisabledExport = false;

  currentOpenEditPagevar = 'Table';
  private _unsubscribeGRid: Subject<any> = new Subject<any>();
  params: any;

  private userState: any;
  private userId: any;
  addChargeCodeArray: any = [];
  currentPageGroupID = '';
  gridApi: any;
  gridColumnApi: any;
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
    private route: ActivatedRoute,
    public dialog: MatDialog) {

    if (this.route.snapshot.queryParams) {
      this.params = this.route.snapshot.queryParams;
    }

    this.userState = this.activatedRoute.paramMap.subscribe((data: any) => {
      this.userId = window.history.state && window.history.state.id ? window.history.state.id : null;
    });

    this.columnDefs = [
      {
        //headerName: ' ',
        headerCheckboxSelection: true,
        checkboxSelection: true,
        floatingFilter: true,
        suppressMenu: true,
        minWidth: 150,
        maxWidth: 50,
        width: 100,
        flex: 0,
        resizable: true,
        sortable: true,
        editable: false,
        filter: false,
        //autoHeight: true,
        suppressColumnsToolPanel: true,
      },
      {
        headerName: 'Vendor',
        children: [
          {
            field: 'VendorAccountName',
            headerName: 'Vendor',
            resizable: true,
            editable: false,
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            minWidth: 125,
          },
          ,
          {
            field: 'ParentVendorAccountName',
            headerName: 'Parent Vendor',
            resizable: true,
            editable: false,
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            minWidth: 175,
            sortingField: 'ParentVendorAccountName'
          }
        ],
      },
      {
        headerName: 'Vendor Product',
        children: [
          {
            field: 'VendorProductTypeName',
            headerName: 'Vendor Product Name',
            resizable: true,
            editable: false,
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            minWidth: 230,
          },
          {
            field: 'ReconAssignment',
            headerName: 'Inventory Assignment',
            resizable: true,
            editable: false,
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            minWidth: 202,
          },
          {
            field: 'Description',
            headerName: 'Description',
            resizable: true,
            editable: false,
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            minWidth: 250,
          },
        
          {
            field: 'CountInventoryId',
            headerName: 'Count of Inventory',
            resizable: true,
            editable: false,
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            minWidth: 202,
          },
          {
            field: 'InventoryType',
            headerName: 'Default Inventory Type',
            resizable: true,
            editable: false,
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            minWidth: 208,
          },
        ],
      },
      {
        headerName: 'Products Structure',
        children: [
          {
            field: 'ProductTypeName',
            headerName: 'Product Type',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 200,
            flex: 0
          },
          {
            field: 'ProductName',
            headerName: 'Product',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 120,
            flex: 0,
          },
          {
            field: 'ServiceTypeName',
            headerName: 'Service Type',
            editable: false,
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            minWidth: 130,
            flex: 0,
          },
          {
            field: 'ServiceName',
            headerName: 'Service',
            editable: false,
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            minWidth: 130,
            flex: 0,
          },
          {
            field: 'IndustryName',
            headerName: 'Industry',
            editable: false,
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            minWidth: 130,
            flex: 0,
          },
        ],
      },
      {
        headerName: 'Charge Code Groups',
        children: [
          {
            field: 'CountGroupId',
            headerName: ' Group Count',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 181,
            flex: 0
          }],
      },
      {
        headerName: 'Status',
        children: [
          {
            field: 'StatusValue',
            headerName: 'Status',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 120,
            flex: 0,
          },
        ],
      },
      {
        headerName: 'History',
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
            field: 'CreationDate', valueGetter(params: any) {
              return moment(params.data && params.data.CreationDate).format('MM/DD/YYYY');
            },
            headerName: 'Created Date',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agDateColumnFilter',
            filterParams: filterParams,
            minWidth: 120,
            flex: 0,
          },
          {
            field: 'ModifiedByUser',
            headerName: 'Modified By',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 180,

          },
          {
            field: 'ModificationDate', valueGetter(params: any) {
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
            //valueFormatter: modDateFormatter
          },
          {  field: 'VendorProductTypeId', hide: true,  filter: 'agNumberColumnFilter', suppressColumnsToolPanel: true,
            suppressFiltersToolPanel: true},
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
  ngOnInit(): void {
    this.isSuperTEMManager = this.locationService.isUserHasSuperTEMManagerRole();
    this.isSuperTEMAdmin = this.locationService.isUserHasSuperTEMAdminRole();
    this.primengConfig.ripple = true;
    // this.getVendorProduct();
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
            ChildHeaderData.push({ Position: childIndex, Title: y?.headerName ? y.headerName : '', FieldName: y?.field ? y.field : '', HeaderPosition: i })
          })
        }
      }
    });

    this.exportProductDetail = {
      ExportToExcelData: {
        HeaderData: headerData,
        ChildHeaderData: ChildHeaderData,
        fileName: "Charge Code Type"
      },
      ExportToExcel: true
    };
    this.exportProductData = this.exportProductDetail;
  }


  changeTab(event: any) {
    this.selected = event;
    this.currentOpenEditPagevar = (event === 0) ? 'Table' : this.currentOpenEditPagevar;

    if (event === 0) {
      this.onAgGridReady(this.gridApi, true);
    }

  }

  currentOpenEditPage($event: any) {
    this.currentOpenEditPagevar = ($event) ? 'Edit' : 'Add';
  }

  onAgGridReady($event: any, removeURLFilter = false) {
    this.gridApi = $event;
    let dataSource: any = {
      rowCount: null,
      getRows: (params: any) => {
        let paramsRequest = params['request'];
        const filterArray:any = [];
        const filterArrayDate:any = [];
        const filterArrayNumber: any = [];

        for (var key in paramsRequest.filterModel) {
          let data = paramsRequest.filterModel[key];
          let arr;
          let arrDate;
          let arrNumber;

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
          } else if(key === 'VendorProductTypeId' && !removeURLFilter) {
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
          }
          
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
            paramsRequest.startRow === 0 ? 1 : paramsRequest.startRow + 1,
          MaximumRows: 100
        };

        if (filterArrayDate && filterArrayDate.length > 0) {
          data['advanceDateFilter'] = filterArrayDate;
        }

        if (filterArray && filterArray.length > 0) {
          data['advanceFilter'] = filterArray;
        }
        if(filterArrayNumber && filterArrayNumber.length > 0) {
          data['advanceNumberFilter'] = filterArrayNumber;
        }

        if (removeURLFilter && data['advanceFilter']?.length > 0) {
          data['advanceFilter'] = data['advanceFilter'].filter((obj: any) => obj.filterKey !== "VendorProductTypeId");
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
        this.exportProductData = { ...this.exportProductDetail, ...data };
        this._unsubscribeGRid.next(true);
        this.locationService
          .getVendorProductLogged(data)
          .pipe(takeUntil(this._unsubscribeGRid))
          .subscribe(
            async (data: any) => {
              this.rowData = data.Data.$values;
              this.girdDataCount = _.cloneDeep(data?.TotalCount);
                if (this.params) {
                  const paramsObj = _.filter(this.rowData, ((res: any) => {
                    return res.VendorProductTypeId == this.params?.VendorProductTypeId
                  }));
                  if (paramsObj.length > 0) {
                    const obj = { data: paramsObj[0] };
                    this.onCellDoubleClicked(obj);
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

  addProduct() {
    this.addProductsArray.push({ name: 'New' });
    this.setSelectedTab('addProducts');
  }

  addVendorProduct() {
    this.addVendorProductsArray.push({ name: 'New' });
    this.setSelectedTab('addVendorProducts');
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

  removeChargeCodeTab1(){
    this.selected = 0;
    this.isShowCCG = false;
  }

  onChargeCodeCellDoubleClickedEmit($event: any) {
    if ($event) {
      this.isShowCCG = true;
      this.userData = $event;
      // setTimeout(() => {
        this.selected = this.editProductsArray.length ? this.editProductsArray.length + 1 : 1;
      // }, 0);
    }
  }

  onCellClicked($event: any) {
    // return false;
  }

  emitRecordData($event: any) {
    let data: any = {};
    data['data'] = $event.Data;

    this.onCellDoubleClicked(data);
  }

  onCellDoubleClicked($event: any) {
    if ($event.data) {
      this.editProductsArray.push($event.data);
      this.setSelectedTab('editProducts');
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

  removeVendorProduct(index: any) {
    this.addVendorProductsArray.splice(index, 1);
    this.addVendorProductsArray = _.cloneDeep(this.addVendorProductsArray);
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
          message: 'Reset password link sent successfully'  //if messges is multiple use array
        }
        const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
      },
      error: error => {
        if (error.status === 200) {
          // this.locationService.showToster({ type: 'error', message: 'Something Wrong !' });
          let errorData: any = {
            messgeType: "error",
            title: "Attention",
            titleClass: "text-c-blue",
            icon: "fas fa-exclamation-triangle",
            iconClass: "text-c-blue f-70",
            message: 'Something Wrong'  //if messges is multiple use array
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
        message: 'Email verification sent successfully'  //if messges is multiple use array
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
              message: 'Please assign roles to the user'  //if messges is multiple use array
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
      this.selected = this.editProductsArray.length + this.addProductsArray.length + this.uploadProductsArray.length;
    } else if (from === 'chargeCode') {
      this.selected = this.editProductsArray.length + this.addProductsArray.length + this.uploadProductsArray.length + this.chargeCodeGroupArray.length;
    } else if (from === 'addVendorProducts') {
      this.selected = this.editProductsArray.length + this.addProductsArray.length + this.uploadProductsArray.length + this.editProductsArray.length + this.addVendorProductsArray.length;
    } else if (from === 'addChargeCode') {
      this.selected = this.editProductsArray.length + this.addProductsArray.length + this.uploadProductsArray.length + this.addChargeCodeArray.length + this.chargeCodeGroupArray.length + this.addVendorProductsArray.length;
    }
  }

  goToPage(to: any) {
    if (to === 'charge') {
      this.router.navigate(['/management/vendors/charge-codes']);
    } else if (to === 'users') {
      this.router.navigate(['/management/vendors/users']);
    } else if (to === 'vendors') {
      this.router.navigate(['/management/vendors/vendors']);
    } else if (to === 'billing-alias') {
      this.router.navigate(['/management/vendors/billing-alias']);
    } else if (to === 'products') {
      this.router.navigate(['/management/vendors/vendor-products']);
    } else if (to === 'codegroup') {
      this.router.navigate(['/management/vendors/charge-codes-group']);
    }
  }

  addChargeCodeGroup(index: any) {
    this.chargeCodeGroupArray.push({ name: 'New', ProductData: this.editProductsArray[index - 1] });
    this.setSelectedTab('chargeCode');
  }


  onAddVendorProductDestroy(data: any, i: any) {
    this.addVendorProductsArray[i].vendorProductData = data;
  }

  onVendorProductById($event: any) {
    this.currentPageGroupID = ($event?.ChargeCodeGroupVendorProducts?.$values[0]?.GroupId) ? $event?.ChargeCodeGroupVendorProducts?.$values[0]?.GroupId : '';
  }

  uploadProductsData() {
    this.uploadProductsArray.push({ name: 'New' });
    this.setSelectedTab('uploadProducts');
  }

  removeUploadPage(index: any) {
    this.uploadProductsArray.splice(index, 1);
    this.uploadProductsArray = _.cloneDeep(this.uploadProductsArray);
  }

  removeChargePage(index: any) {
    this.chargeCodeGroupArray.splice(index, 1);
    this.chargeCodeGroupArray = _.cloneDeep(this.chargeCodeGroupArray);
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

  onUserAddEvent(event: any, index: any, type?: any) {
    if (event) {
      if (type === 'edit') {
        this.editProductsArray.splice(index, 1);
        this.editProductsArray = _.cloneDeep(this.editProductsArray);
        this.onAgGridReady(this.gridApi);
      } else {
        this.addProductsArray.splice(index, 1);
        this.addVendorProductsArray.splice(index, 1);
        this.addProductsArray = _.cloneDeep(this.addProductsArray);
        this.addVendorProductsArray = _.cloneDeep(this.addVendorProductsArray);
        this.onAgGridReady(this.gridApi);
      }
    }
  }
  onVendorProductAddEvent(event: any, index: any) {
    if (event) {
      this.addVendorProductsArray.splice(index, 1);
      this.addVendorProductsArray = _.cloneDeep(this.addVendorProductsArray);
      this.onAgGridReady(this.gridApi);
    }
  }

  addOption(option: any, i: any) {
    if (option === 2) {
      this.addChargeCodeGroup(this.selected);
    } else {
      this.addChargeCode(this.selected);
    }
  }

  addChargeCode(i: any) {
    this.addChargeCodeArray.push({ name: 'New', chargeCodeData: this.editProductsArray[i - 1] });
    this.setSelectedTab('addChargeCode');
  }

  removeAddChargeCodeTab(index: any) {
    this.addChargeCodeArray.splice(index, 1);
    this.addChargeCodeArray = _.cloneDeep(this.addChargeCodeArray);
  }

  onAddChargeCodeComponentDestroy(data: any, i: any) {
    this.addChargeCodeArray[i].chargeCodeData = data;
  }

  onAgGridReadyEmit($event: any) {
    this.gridApi = $event.api;
    this.gridColumnApi = $event.columnApi;

     if (isValueExist(this.params?.VendorProductTypeId)) {
      const predefinedFilterModel = {
        VendorProductTypeId: {
          filterType: 'number',
          type: 'equals',
          filter: `${this.params?.VendorProductTypeId}`
        }
      };

      if (this.gridApi) {
        this.gridApi.setFilterModel(predefinedFilterModel);
      }
    }
  }

  onBtnExportDataAsExcel() {
   
    this.isDisabledExport = true;
    this.locationService
      .getVendorProductExcelData(this.exportProductData)
      .subscribe({
        next: data => {
          this.isDisabledExport = false;
          let bolbUrl = URL.createObjectURL(data);
          var link = document.createElement("a");
          link.setAttribute("href", bolbUrl);
          link.setAttribute("download", "Vendor Products.xlsx");
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