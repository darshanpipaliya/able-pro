import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatAccordion } from '@angular/material/expansion';
import { ActivatedRoute, Router } from '@angular/router';
import { DualListComponent } from 'angular-dual-listbox';
 
import moment from 'moment';
import { PrimeNGConfig } from 'primeng/api';
import { AddVendorProductDialogComponent } from '../add-vendor-product-dialog/add-vendor-product-dialog.component';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import * as _ from 'lodash';
import { LocationService } from 'src/app/services/location.service';
import { SessionStorageService } from 'src/app/services/session-storage.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { isValueExist, rolePermission } from 'src/app/services/helper';
import { ErrorWarningPopupComponent } from 'src/app/common/error-warning-popup/error-warning-popup.component';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { AgGridTableComponent } from 'src/app/common/ag-grid-table/ag-grid-table.component';
import { AgGridModule } from 'ag-grid-angular';
import { EditProductComponent } from '../edit-product/edit-product.component';
import { FilesUploadComponent } from 'src/app/common/files-upload/files-upload.component';
import { AddProductComponent } from '../add-product/add-product.component';
import { ModuleRegistry } from 'ag-grid-community';
import { ServerSideRowModelModule } from 'ag-grid-enterprise';
ModuleRegistry.registerModules([ServerSideRowModelModule]);
@Component({
  selector: 'app-products-datatable',
  templateUrl: './products-datatable.component.html',
  styleUrls: ['./products-datatable.component.scss'],
  standalone: true,
  imports: [SharedModule, PrimgModule, AgGridTableComponent, AgGridModule, EditProductComponent, FilesUploadComponent, AddProductComponent]
})
export class ProductsDatatableComponent implements OnInit {

  selectedButton: any = 'users';
  buttonOptions: any = [
    // { 'label': 'Vendors', value: 'vendors' },
    // { 'label': "Users", value: 'users' },
    { 'label': 'Products', value: 'products', icon: 'fa-box-open' },
    { 'label': 'Products Structure', value: 'productstructure', icon: 'fa-sitemap fas' },
    { 'label': 'Service Type Attributes', value: 'serviceTypeAttributes', icon: 'fa-tag fas' },
    // { 'label': 'Product Structure', value: 'productstructure', icon: 'fa-sitemap' },
    // { 'label': "Charge Type", value: 'charge', icon: 'fa-users' },
    // { 'label': "Service Type Attributes", value: 'serviceTypeAttributes', icon: 'fa-tag' }

  ];
  gridOptions = {
    rowModelType: 'serverSide',
    serverSideInfiniteScroll: true,
    enableFiltering: true,
    headerHeight: 35,
    groupHeaderHeight: 37,
    floatingFiltersHeight: 35
  };
  panelOpenState = false;
  @ViewChild(MatAccordion) accordion: MatAccordion;

  public columnDefs;
  public rowSelection;
  public defaultColDef;
  public sideBar;
  public rowData: any = [];
  selected: any = 0;
  girdDataCount = 0;
  data: any;
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
  isTemAdmin: any = false;
  stopSpinner: any = false;
  isSuperTEMManager: any = false;
  private userState: any;
  private userId: any;
  selectedTem: string = 'all';
  tems: any = [];
  isSuperTEMUsers: boolean = false;
  isSuperTEMAdmin: boolean = false;
  isSuperTEMUser: boolean = false;
  gridApi: any;
  gridColumnApi: any;
  currentOpenEditPagevar = 'Table';
  private _unsubscribeGRid: Subject<any> = new Subject<any>();
  public exportProductData: any;
  public exportProductDetail: any;

  isDisabledExport = false;
  productsRowData: any = [];
  addBtnPermission = false;
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
        headerName: 'Products',
        children: [
          {
            field: 'ProductTypeName',
            headerName: 'Product Type',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 144,
            flex: 0
          },
          {
            field: 'ProductName',
            headerName: 'Products',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 120,
            flex: 0,
          },

          {
            field: 'ServiceTypeName',
            headerName: 'Service Type',
            editable: false,
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            minWidth: 140,
            flex: 0,
          },
          {
            field: 'ServiceName',
            headerName: 'Service',
            editable: false,
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            minWidth: 130,
            flex: 0,
          },
          {
            field: 'IndustryName',
            headerName: 'Industry',
            editable: false,
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            minWidth: 130,
            flex: 0,
          },
          {
            field: 'ReconAssigmentsName',
            headerName: 'Default Recon Type',
            editable: false,
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            minWidth: 187,
            flex: 0,
          }

        ],
      },

      {
        headerName: 'Status',
        children: [
          {
            field: 'ProductStructureStatusDisplayValue',
            headerName: 'Status',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 80,
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

  ngOnInit(): void {
    this.isUserSuperTemOrAdmin = this.locationService.isUserHasSuperTEMOrAdminRole();
    this.isTEMManager = this.locationService.isUserHasTEMManagerRole();
    this.isTemUser = this.locationService.isUserHasTEMUserRole();
    this.isTemAdmin = this.locationService.isUserHasTEMAdminRole();
    this.isSuperTEMUsers = this.locationService.isUserHasSuperTEMUsersRole();
    this.isSuperTEMAdmin = this.locationService.isUserHasSuperTEMAdminRole();
    this.isSuperTEMManager = this.locationService.isUserHasSuperTEMManagerRole();
    this.isSuperTEMUser = this.locationService.isUserHasSuperTEMUserRole();
    this.addBtnPermission = rolePermission(['SuperTEMAdmin']);
    this.primengConfig.ripple = true;
    //this.getTemuser();
    if (this.isSuperTEMAdmin || this.isSuperTEMManager) {
      this.getTemLists();
    }
    // this.getProduct();
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

    this.exportProductDetail = {
      ExportToExcelData : { 
        HeaderData: headerData,
        ChildHeaderData: ChildHeaderData,
        fileName: "Products"
      },
      ExportToExcel: true
    };
    this.exportProductData = this.exportProductDetail;
  }

  currentOpenEditPage($event: any) {
    this.currentOpenEditPagevar = ($event) ? 'Edit' : 'Add';
  }

  changeTab(event: any) {
    this.selected = event;
    this.currentOpenEditPagevar = (event === 0) ? 'Table' : this.currentOpenEditPagevar;
  }

  getProduct() {
    // this.locationService.getProducts().subscribe((data) => {
    //   if (data && data.$values) {
    //     this.rowData = data.$values;
    //     this.stopSpinner = true;
    //   }
    // },error => {
    //   this.rowData = [];
    //   this.stopSpinner = true;
    // });
  }

  onAgGridReady($event: any) {
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
          MaximumRows: 100
        };

        if (filterArrayDate && filterArrayDate.length > 0) {
          data['advanceDateFilter'] = filterArrayDate;
        }

        if (filterArray && filterArray.length > 0) {
          data['advanceFilter'] = filterArray;
        }

        if (this.selectedTem != 'all') {
          data['TemAccountId'] = parseInt(this.selectedTem);
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
        this.exportProductData = {...this.exportProductDetail, ...data};
        this.locationService
          .getProducts(data)
          .pipe(takeUntil(this._unsubscribeGRid))
          .subscribe(
            async (data: any) => {
              this.productsRowData = data.Data.$values;
              this.girdDataCount = _.cloneDeep(data?.TotalCount);
              if (data && data.Data.$values.length > 0) {
                // this.selectedTemDD = this.selectedTem;
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


  getTemLists() {
    this.locationService.getTemLists().subscribe((data) => {
      if (data && data.$values) {
        this.tems = data.$values;
      }
    });
  }

  addProduct() {
    this.addProductsArray.push({ name: 'New' });
    this.setSelectedTab('addProducts');
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


  onAgGridReadyEmit($event: any) {
    this.gridApi = $event.api;
    this.gridColumnApi = $event.columnApi;
  }


  onBtnExportDataAsExcel(){
 
    this.isDisabledExport = true;
    this.locationService
      .getProductsExcelData(this.exportProductData)
      .subscribe({
          next: data => {
            this.isDisabledExport = false;
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
            this.isDisabledExport = false;
            
          }
        });
  }

  onCellClicked($event: any) {
    // return false;
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
          message: 'Reset password link sent successfully'//if messges is multiple use array
        }
        const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning',data: errorData });
        dialogRef.afterClosed().subscribe(result => {
        });
      },
      error: error => {
        // if (error.status === 200) {
          let errorData: any = {
            messgeType: "error",
            title: "Attention",
            titleClass: "text-c-blue",
            icon: "fas fa-exclamation-triangle",
            iconClass: "text-c-blue f-70",
            message: error.error.text //if messges is multiple use array
          }
          const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning',data: errorData });
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
      const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning',data: errorData });
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
      const dialogRef = this.dialog.open(ErrorWarningPopupComponent, {panelClass: 'error-warning', data: errorData });
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
              iconClass: "text-c-blue f-70",
              message: 'User loggedin successfully'  //if messges is multiple use array
            }
            const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning',data: errorData });
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
            const dialogRef = this.dialog.open(ErrorWarningPopupComponent, {panelClass: 'error-warning', data: errorData });
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
        const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning',data: errorData });
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


  onUserAddEvent(event: any, index: any, mode?:any) {
    this.onAgGridReady(this.gridApi);
    if (event) {
      if (mode === 'edit') {
        this.editProductsArray.splice(index, 1);
        this.editProductsArray = _.cloneDeep(this.editProductsArray);
      } else {
        this.addProductsArray.splice(index, 1);
        this.addProductsArray = _.cloneDeep(this.addProductsArray);
      }
    }

  }

  filterProductsGridByTEMId() {
    this.rowData = [];
    this.stopSpinner = false;
    if (this.selectedTem && this.selectedTem != 'all') {
      this.locationService.getAllProductsListByTEMId(this.selectedTem).subscribe({
        next: data => {
          if (data && data.$values) {
            this.rowData = data.$values;
            this.stopSpinner = true;
          }
        },
        error: error => {
          if (error.status === 404) {
            this.stopSpinner = true;
          }
        }
      });
    } else {
      this.onAgGridReady(this.gridApi);
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