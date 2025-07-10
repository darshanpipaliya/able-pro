import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatAccordion } from '@angular/material/expansion';
import { ActivatedRoute, Router } from '@angular/router';
import { DualListComponent } from 'angular-dual-listbox';

import moment from 'moment';
import { PrimeNGConfig } from 'primeng/api';

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
import { AddTemComponent } from '../add-tem/add-tem.component';
import { EditTemComponent } from '../edit-tem/edit-tem.component';
import { FilesUploadComponent } from 'src/app/common/files-upload/files-upload.component';
import { ClientSideRowModelModule, ModuleRegistry } from 'ag-grid-community';
import { ServerSideRowModelModule } from 'ag-grid-enterprise';
ModuleRegistry.registerModules([ClientSideRowModelModule, ServerSideRowModelModule]);
@Component({
  selector: 'app-tem-datatable',
  templateUrl: './tem-datatable.component.html',
  styleUrls: ['./tem-datatable.component.scss'],
  standalone: true,
  imports: [SharedModule, PrimgModule, AgGridTableComponent, AgGridModule, AddTemComponent, EditTemComponent, FilesUploadComponent]
})
export class TemDatatableComponent implements OnInit {
  selectedButton: any = 'tem';
  buttonOptions: any = [
    // { 'label': 'Dashboard', value: 'dashboard' },
    { 'label': 'TEM', value: 'tem' },
    { 'label': "Users", value: 'users' }
  ];

  gridApi: any;
  currentOpenEditPagevar = 'Table';

  panelOpenState = false;
  @ViewChild(MatAccordion) accordion: MatAccordion;

  public columnDefs;
  public rowSelection;
  public defaultColDef;
  public sideBar;
  public rowData: any = [];
  selected: any = 0;
  girdDataCount = 0;
  editTemArray: any = [];
  addTemArray: any = [];
  uploadTemArray: any = [];
  sourceLeft = true;
  format: any = DualListComponent.DEFAULT_FORMAT;
  keepSorted = true;
  filter = true;
  userAdd = '';
  disabled = false;
  users: any;
  customers: any;
  isCompanyUser: any = true;
  isCompanyAdmin: any = false;
  isCustomerAdmin: any = false;
  isCompanyManager: any = false;
  isSuperTEMUsers: any = false;
  isSuperUsers: boolean = false;
  isTemUser: any = false;
  stopSpinner: any = false;
  SuperTEMUsers: any = false;
  private userState: any;
  private userId: any;
  isSuperTEMAdmin: boolean = false;
  gridColumnApi: any;
  isDisabledExport = false;
  public exportTemData: any;
  public exportTemDetail: any;

  constructor(private router: Router,
    private primengConfig: PrimeNGConfig,
    private locationService: LocationService,
    public dialog: MatDialog,
    private sessionStorageService: SessionStorageService,
    private localStorageService: LocalStorageService,
    private activatedRoute: ActivatedRoute) {

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
        headerName: 'TEM',
        children: [
          {
            field: 'AccountName',
            headerName: 'TEM Name',
            resizable: true,
            editable: false,
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            minWidth: 140,
          },
          {
            field: 'LogoUploadedStatus',
            headerName: 'Logo Uploaded',
            resizable: true,
            editable: false,
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            minWidth: 160
          },
        ],
      },
      {
        headerName: 'Other',
        children: [
          {
            headerName: 'MFA',
            field: 'TwoFactorEnabledDisplay',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 120,
            flex: 0,
            // sortingField: 'TwoFactorEnabled'
          },
        ]
      },
      {
        headerName: 'Address',
        children: [
          {
            field: 'PhysicalAddress1',
            headerName: 'Address One',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 150,
            flex: 0
          },
          {
            field: 'PhysicalAddress2',
            headerName: 'Address Two',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 150,
            flex: 0
          },
          {
            field: 'City',
            headerName: 'City',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 150,
            flex: 0,
          },
          {
            field: 'Country',
            headerName: 'Country',
            editable: false,
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            minWidth: 150,
            flex: 0,
          },

          {
            field: 'State',
            headerName: 'State/Province/Region',
            editable: false,
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            minWidth: 220,
            flex: 0,
          },
          {
            field: 'PostalCode',
            headerName: 'Zip/Postal Code',
            editable: false,
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            minWidth: 190,
            flex: 0,
          },
          {
            field: 'BillingAddressSameStatus',
            headerName: 'Billing the Same',
            editable: false,
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            minWidth: 170,
            flex: 0
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

  gridOptions = {
    rowModelType: 'serverSide',
    serverSideInfiniteScroll: true,
    enableFiltering: true,
    headerHeight: 35,
    groupHeaderHeight: 37,
    floatingFiltersHeight: 35
  };

  ngOnInit(): void {
    this.isSuperUsers = this.locationService.isUserHasTEMUsersRole();
    this.isSuperTEMUsers = this.locationService.isUserHasSuperTEMUsersRole();
    this.isCustomerAdmin = this.locationService.isUserCustomerAdmin();
    this.isCompanyAdmin = this.locationService.isUserCompanyAdmin();
    this.isCompanyManager = this.locationService.isUserCompanyManager();
    this.isTemUser = this.locationService.isUserHasTEMRole();
    this.isCompanyUser = this.locationService.isUserCompanyUser();
    this.isSuperTEMAdmin = this.locationService.isUserHasSuperTEMAdminRole();
    this.primengConfig.ripple = true;

    this.SuperTEMUsers = this.locationService.isUserHasSuperTEMUserRole();
    if (this.SuperTEMUsers) {
      this.buttonOptions = this.buttonOptions.filter((item: any) => item.value !== 'tem')
      this.goToPage('users')
    }
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

    this.exportTemDetail = {
      ExportToExcelData: {
        HeaderData: headerData,
        ChildHeaderData: ChildHeaderData,
        fileName: "Tem"
      },
      ExportToExcel: true
    };
    this.exportTemData = this.exportTemDetail;
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
        this.exportTemData = { ...this.exportTemDetail, ...data };

        this.locationService.getAllTemaccountUrl(data)
          .subscribe(async (data) => {
            this.rowData = data.Data.$values;
            this.girdDataCount = _.cloneDeep(data?.TotalCount);
            if (data && data.Data && data.Data.$values.length > 0 && data.Success) {
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

  // getTems() {
  //   this.locationService.getAllTemaccountUrl().subscribe((data) => {
  //     if (data && data.$values) {
  //       this.rowData = data.$values;
  //       this.stopSpinner = true;
  //     }
  //   },error => {
  //     this.rowData = [];
  //     this.stopSpinner = true;
  //   });
  // }

  addTem() {
    this.addTemArray.push({ name: 'New', addData: '' });
    this.setSelectedTab('addTem');
  }

  onCellEditingStoppedEventForCL($event: any) {
    if ($event && $event.Email) {
      let user: any = {};
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

  onCellDoubleClicked($event: any) {
    this.editTemArray.push($event.data);
    this.setSelectedTab('editTem');
  }

  allowEdit(role: any) {
    if (this.isCompanyAdmin && role === 'Customer Admin') {
      return false;
    } else if (this.isCompanyManager && (role === 'Customer Admin' || role === 'Company Admin')) {
      return false;
    } else {
      return true;
    }
  }

  removeTab(index: any) {
    this.editTemArray.splice(index, 1);
    this.editTemArray = _.cloneDeep(this.editTemArray);
  }

  removeUser(index: any) {
    this.addTemArray.splice(index, 1);
    this.addTemArray = _.cloneDeep(this.addTemArray);
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
            message: 'Something Wrong' //if messges is multiple use array
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
        message: result //if messges is multiple use array
      }
      const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
    })
  }

  currentOpenEditPage($event: any) {
    this.currentOpenEditPagevar = ($event) ? 'Edit' : 'Add';
  }

  changeTab(event: any) {
    this.selected = event;
    this.currentOpenEditPagevar = (event === 0) ? 'Table' : this.currentOpenEditPagevar;
  }

  sendEmailVerification(email: any) {
    this.locationService.emailVerficiationSend(email).subscribe(() => {
      let errorData: any = {
        messgeType: "error",
        title: "Attention",
        titleClass: "text-c-blue",
        icon: "fas fa-exclamation-triangle",
        iconClass: "text-c-blue f-70",
        message: 'Email verification sent successfully' //if messges is multiple use array
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

  onAgGridReadyEmit($event: any) {
    this.gridApi = $event.api;
    this.gridColumnApi = $event.columnApi;
  }

  onBtnExportDataAsExcel() {
    
    this.isDisabledExport = true;
    this.locationService
      .getTemExcelData(this.exportTemData)
      .subscribe({
        next: data => {
          this.isDisabledExport = false;
          let bolbUrl = URL.createObjectURL(data);
          var link = document.createElement("a");
          link.setAttribute("href", bolbUrl);
          link.setAttribute("download", "Tem.xlsx");
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

    if (from === 'editTem') {
      this.selected = this.editTemArray.length;
    } else if (from === 'addTem') {
      this.selected = this.editTemArray.length + this.addTemArray.length;
    } else if (from === 'uploadTem') {
      this.selected = this.uploadTemArray.length + this.addTemArray.length + this.uploadTemArray.length;
    }
    // setTimeout(() => {
    //   $("div.listbox").find("button").removeClass('btn-primary');
    //   $("div.listbox").find("button").css("background-color", "rgb(207 ,207 ,207)");
    // }, 800);
  }

  goToPage(to: any) {
    if (to === 'tem') {
      this.router.navigate(['/management/tem']);
    } else if (to === 'users') {
      this.router.navigate(['/management/tem/users']);
    }
  }

  uploadTemData() {
    this.uploadTemArray.push({ name: 'New' });
    this.setSelectedTab('uploadTem');
  }

  removeUploadPage(index: any) {
    this.uploadTemArray.splice(index, 1);
    this.uploadTemArray = _.cloneDeep(this.uploadTemArray);
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


  onTemAddEvent(event: any, index: any) {
    if (event) {
      this.addTemArray.splice(index, 1);
      this.addTemArray = _.cloneDeep(this.addTemArray);
      const a = this.gridApi.api ? this.gridApi.api : this.gridApi;
      this.onAgGridReady(a);
    }
  }

  onTemEditEvent(event: any, index: any) {
    if (event) {
      this.editTemArray.splice(index, 1);
      this.editTemArray = _.cloneDeep(this.editTemArray);
      const a = this.gridApi.api ? this.gridApi.api : this.gridApi;
      this.onAgGridReady(a);
    }
  }

  onComponetDestroy(data: any, i: any) {
    if (this.addTemArray.length > 0 && data) {
      this.addTemArray[i].addData = data;
    }
  }

}