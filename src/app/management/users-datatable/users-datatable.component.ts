import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatAccordion } from '@angular/material/expansion';
import { ActivatedRoute, Router } from '@angular/router';
import { DualListComponent } from 'angular-dual-listbox';

import moment from 'moment';
import { PrimeNGConfig } from 'primeng/api';
import { NewPasswordDialogComponent } from '../../people/new-password-dialog/new-password-dialog.component';

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
import { AddTemUserComponent } from '../add-tem-user/add-tem-user.component';
import { EditTemUserComponent } from '../edit-tem-user/edit-tem-user.component';
import { FilesUploadComponent } from 'src/app/common/files-upload/files-upload.component';
import { ModuleRegistry } from 'ag-grid-community';
import { ServerSideRowModelModule } from 'ag-grid-enterprise';
ModuleRegistry.registerModules([ServerSideRowModelModule]);
@Component({
    selector: 'app-users-datatable',
    templateUrl: './users-datatable.component.html',
    styleUrls: ['./users-datatable.component.scss'],
    standalone: true,
    imports: [SharedModule, PrimgModule, AgGridTableComponent, AgGridModule, AddTemUserComponent, EditTemUserComponent, FilesUploadComponent]
})
export class UsersDatatableComponent implements OnInit {
    selectedButton: any = 'users';
    buttonOptions: any = [
        // { 'label': 'Dashboard', value: 'dashboard' },
        { 'label': 'TEM', value: 'tem' },
        { 'label': "Users", value: 'users' }
    ];
    panelOpenState = false;
    @ViewChild(MatAccordion) accordion: MatAccordion;
    private _unsubscribeGRid: Subject<any> = new Subject<any>();
    isSuperTEMUser: boolean = false;
    public columnDefs;
    public rowSelection;
    public defaultColDef;
    public sideBar;
    public rowData: any = [];
    selected: any = 0;
    girdDataCount = 0;
    editUsersArray: any = [];
    addUsersArray: any = [];
    uploadUsersArray: any = [];
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
    stopSpinner: any = false;
    isCompanyUser: any = false;
    isSuperTEMUsers: boolean = false;
    private userState: any;
    private userId: any;
    isTEMUsers: boolean = false;
    gridApi: any;
    gridColumnApi: any;
    currentOpenEditPagevar = 'Table';
    userVerified: any = false;
    userStatus: any;
    userDataTable: any;
    lockUserInput: any;
    public exportTemUserData: any;
    public exportTemUserDetail: any;

    isDisabledExport = false;

    gridOptions = {
        rowModelType: 'serverSide',
        serverSideInfiniteScroll: true,
        enableFiltering: true,
        headerHeight: 35,
        groupHeaderHeight: 37,
        floatingFiltersHeight: 35
    };

    userResponse = {
        LastName: 'LastName',
        FirstName: 'FirstName',
        BlockEmail: 'BlockEmail',
        PrimaryMobile: 'PrimaryMobile',
        PrimaryLandline: 'PrimaryLandline',
        Name: 'Name'
    }
    viewNEditAccount = false;
    constructor(private router: Router,
        private primengConfig: PrimeNGConfig,
        private locationService: LocationService,
        private sessionStorageService: SessionStorageService,
        private localStorageService: LocalStorageService,
        public dialog: MatDialog,
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
                        headerName: 'TEM',
                        resizable: true,
                        editable: false,
                        columnGroupShow: 'close',
                        filter: 'agTextColumnFilter',
                        minWidth: 145,
                    },
                ],
            },
            {
                headerName: 'Personal',
                children: [
                    {
                        //field: 'FirstName +  + LastName',
                        headerName: 'Name',
                        columnGroupShow: 'close',
                        field: 'FullName',
                        suppressMenu: true,
                        filter: 'agTextColumnFilter',
                        editable: false,
                        minWidth: 140,
                        flex: 0,
                    },
                    {
                        field: 'FirstName',
                        headerName: 'First Name',
                        columnGroupShow: 'open',
                        filter: 'agTextColumnFilter',
                        minWidth: 120,
                        editable: false,
                        flex: 0
                    },
                    {
                        field: 'LastName',
                        headerName: 'Last Name',
                        columnGroupShow: 'open',
                        filter: 'agTextColumnFilter',
                        minWidth: 120,
                        editable: false,
                        flex: 0,
                    },

                    {
                        field: 'Email',
                        headerName: 'Email',
                        editable: false,
                        columnGroupShow: 'close',
                        filter: 'agTextColumnFilter',
                        minWidth: 250,
                        flex: 0,
                    },
                    {
                        field: 'PrimaryLandline',
                        headerName: 'Desk Phone',
                        columnGroupShow: 'open',
                        filter: 'agTextColumnFilter',
                        minWidth: 210,
                        flex: 0,
                    },
                    {
                        field: 'PrimaryMobileLine',
                        headerName: 'Mobile Number',
                        columnGroupShow: 'open',
                        filter: 'agTextColumnFilter',
                        minWidth: 130,
                        flex: 0,
                    },
                    {
                        field: 'Title',
                        headerName: 'User Title',
                        columnGroupShow: 'open',
                        filter: 'agTextColumnFilter',
                        //filterParams: NonDateFilterParams,
                        minWidth: 130,
                        flex: 0,
                    },

                ],
            },

            {
                headerName: 'Status',
                children: [
                    {
                        field: 'UserStatus',
                        headerName: 'Status',
                        columnGroupShow: 'close',
                        editable: false,
                        filter: 'agTextColumnFilter',
                        minWidth: 116,
                        flex: 0,
                    },
                    {
                        field: 'EmailVerification',
                        headerName: 'Email Verified',
                        editable: false,
                        columnGroupShow: 'close',
                        filter: 'agTextColumnFilter',
                        minWidth: 146,
                        flex: 0,
                    },
                    {
                        field: 'UserAccount',
                        headerName: 'User Account State',
                        editable: false,
                        columnGroupShow: 'close',
                        filter: 'agTextColumnFilter',
                        minWidth: 183,
                        flex: 0,
                    },
                ],
            },
            {
                headerName: 'System Access',
                children: [
                    {
                        field: 'TEMDisplayRole',
                        headerName: 'Role',
                        editable: false,
                        columnGroupShow: 'close',
                        filter: 'agTextColumnFilter',
                        // cellRenderer: 'showMultiline',
                        //cellClass: 'cell-wrap',
                        //autoHeight: true,
                        //wrapText: true,
                        //resizable: false,
                        minWidth: 200,
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
        this.isTEMUsers = this.locationService.isUserHasTEMUsersRole();
        this.isCompanyUser = this.locationService.isUserCompanyUser();
        this.isSuperTEMUsers = this.locationService.isUserHasSuperTEMUsersRole();
        this.viewNEditAccount = rolePermission(['SuperTEMAdmin', 'SuperTEMManager','SuperTEMUser', 'TEMAdmin', 'TEMManager']);
        this.isSuperTEMUser = this.locationService.isUserHasSuperTEMUserRole();

        this.primengConfig.ripple = true;
        // this.getTemuser();

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

        this.exportTemUserDetail = {
            ExportToExcelData: {
                HeaderData: headerData,
                ChildHeaderData: ChildHeaderData,
                fileName: "TEM Users"
            },
            ExportToExcel: true
        };
        this.exportTemUserData = this.exportTemUserDetail;

        if (this.isSuperTEMUser) {
            this.buttonOptions = this.buttonOptions.filter((item: any) => item.value !== 'tem')
        }
    }

    currentOpenEditPage($event: any) {
        this.currentOpenEditPagevar = ($event) ? 'Edit' : 'Add';
    }

    changeTab(event: any) {
        this.selected = event;
        this.currentOpenEditPagevar = (event === 0) ? 'Table' : this.currentOpenEditPagevar;
    }

    onAgGridReadyEmit($event: any) {
        this.gridApi = $event.api;
        this.gridColumnApi = $event.columnApi;
    }



    onBtnExportDataAsExcel() {
        
        this.isDisabledExport = true;
        this.locationService
            .getTemUserExcelData(this.exportTemUserData)
            .subscribe({
                next: data => {
                    this.isDisabledExport = false;
                    let bolbUrl = URL.createObjectURL(data);
                    var link = document.createElement("a");
                    link.setAttribute("href", bolbUrl);
                    link.setAttribute("download", "TEM Users.xlsx");
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
    onAgGridReady($event: any) {
        this.stopSpinner = true;
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
                this.exportTemUserData = { ...this.exportTemUserDetail, ...data };
                this.locationService
                    .getTemusers(data)
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
                            this.rowData = [];
                            this.stopSpinner = true;
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
    // getTemuser() {
    //     this.locationService.getTemusers().subscribe((data) => {
    //         if (data && data.$values) {
    //             this.rowData = data.$values;
    //             this.stopSpinner = true;
    //         }
    //     }, error => {
    //         this.rowData = [];
    //         this.stopSpinner = true;
    //     });
    // }


    addUsers() {
        this.addUsersArray.push({ name: 'New', addData: '' });
        this.setSelectedTab('addUsers');
    }

    onAddButton() {
        this.addUsers();
    }

    onComponetDestroy(data: any, i: any) {
        if (data && this.addUsersArray.length > 0) {
            this.addUsersArray[i].addData = data;
        }
    }

    onCellEditingStoppedEventForCL($event: any) {
        let rolesData = $event.Roles?.split(",");
        let roles = rolesData?.map((x: any) => x.trim());

        if ($event && $event.Email) {
            let user : any = {};
            user.Email = $event.Email;
            user.FirstName = $event.FirstName;
            user.LastName = $event.LastName;
            user.PrimaryLandline = $event.PrimaryLandline ? $event.PrimaryLandline : '';
            user.PrimaryMobile = $event.PrimaryMobile ? $event.PrimaryMobile : '';
            user.Active = $event.Active;
            user.BlockEmail = $event.BlockEmail ? true : false;
            user.AccountId = $event.AccountId;
            user.MiddleInitial = $event.MiddleInitial;
            user.UserDefaultCompanyID = $event.DefaultCompanyID;
            user.vendorAccountID = 0;
            user.vendorUser = false;
            user.RolesToAssign = roles ? roles : [];

            this.locationService.editUser(user).subscribe(
                (result: any) => {
                },
                (error: any) => {
                    let errorMessage: any = '';

                    if (error.status === 400) {
                        this.errorObjectEntries(error.error.errors)
                            .map(([key, value]: any) => {
                                if (this.userResponse.hasOwnProperty(key)) {
                                    errorMessage += `${value}`
                                }
                            });
                        errorMessage = error.error.errors ? errorMessage : error.error;

                        let errorData: any = {
                            messgeType: "error",
                            title: "Attention",
                            titleClass: "text-c-blue",
                            icon: "fas fa-exclamation-circle",
                            iconClass: "text-c-blue f-70",
                            message: this.tooltip(errorMessage.replace(/\./g, '<br>')),
                            innerHtml: true
                        }
                        const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
                        dialogRef.afterClosed().subscribe(result => {
                            window.scrollTo(0, 0);
                        });
                    }
                }
            );
        }
    }
    tooltip(data: any) {
        return `<span >${data} </span>`;
    }

    errorObjectEntries<K>(object: any) {
        return (Object.keys(object) as (keyof K)[])
            .filter((key) => object[key] !== undefined && object[key] !== null)
            .map(
                key => ([
                    key,
                    object[key],
                ] as [keyof K, Required<K>[keyof K]]),
            );
    }

    onUnlockButtonClick($event: any) {
        if ($event == true) {
            this.userVerified = true;
            this.userDataTable.UserAccount = 'Unlocked';
        } else {
            this.userDataTable.UserAccount = 'Locked';
        }
    }

    onCellClicked($event: any) {
        // return false;
    }

    onCellDoubleClicked($event: any) {
        if ($event.data) {
            this.editUsersArray.push($event.data);
            this.setSelectedTab('editUsers', $event.data);
        }
    }

    removeTab(index: any) {
        this.editUsersArray.splice(index, 1);
        this.editUsersArray = _.cloneDeep(this.editUsersArray);
    }

    removeUser(index: any) {
        this.addUsersArray.splice(index, 1);
        this.addUsersArray = _.cloneDeep(this.addUsersArray);
    }

    setNewPassword() {
        const dialogRef = this.dialog.open(NewPasswordDialogComponent, {
            panelClass: 'width-600',
            data: { email: this.userDataTable.Email }
        });

        dialogRef.afterClosed().subscribe(result => {

        });
    }

    forgotPassword() {
        const data = { 'email': this.userDataTable.Email };
        this.locationService.forgetPwd(data).subscribe({
            next: data => {
                let errorData: any = {
                    messgeType: "error",
                    title: "Attention",
                    titleClass: "text-c-blue",
                    icon: "fas fa-thumbs-up",
                    iconClass: "text-c-blue f-70",
                    message: 'Reset password link sent successfully'  //if messges is multiple use array
                }
                const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
            },
            error: error => {
                // if (error.status === 200) {
                // this.locationService.showToster({ type: 'error', message: 'Something Wrong !' });
                let errorData: any = {
                    messgeType: "error",
                    title: "Attention",
                    titleClass: "text-c-blue",
                    icon: error.error.text == 'Password reset notification sent successfully' ? "fas fa-thumbs-up" : "fas fa-exclamation-triangle",
                    iconClass: "text-c-blue f-70",
                    message: error.error.text ? error.error.text : error.error //if messges is multiple use array
                }

                const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
                // }
            }
        });
    }

    unlockUser() {
        this.locationService.unlockUser(this.userDataTable.Email).subscribe(
            (result) => {
                this.lockUserInput = 'Unlocked';
                let errorData: any = {
                    messgeType: "error",
                    title: "Attention",
                    titleClass: "text-c-blue",
                    icon: "fas fa-exclamation-triangle",
                    iconClass: "text-c-blue f-70",
                    message: result //if messges is multiple use array
                }
                const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
            },
            error => {
                if (error.error) {
                    this.ErrorWarningPopupOpen(error.error.$values[0]);
                }
            });
    }


    lockUser() {
        this.locationService.lockUser(this.userDataTable.Email).subscribe((result) => {
            this.lockUserInput = 'Locked';
            this.ErrorWarningPopupOpen(result);
        }, error => {
            if (error.error) {
                this.ErrorWarningPopupOpen(error.error.$values[0]);
            }
        });
    }


    ErrorWarningPopupOpen(message: any) {
        let errorData: any = {
            messgeType: "error",
            title: "Attention",
            titleClass: "text-c-blue",
            icon: "fas fa-exclamation-circle",
            iconClass: "text-c-blue f-70",
            message: message //if messges is multiple use array
        }
        const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
    }

    sendEmailVerification() {
        this.locationService.emailVerficiationSend(this.userDataTable.Email).subscribe(() => {
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
                            message: 'User loggedin successfully'  //if messges is multiple use array
                        }
                        const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
                        dialogRef.afterClosed().subscribe(result => {
                            this.router.navigate(['/dashboard/stuff']).then(() => {
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
                    let headerLogo = (result.CompanyLogo && result.CompanyLogo.ImageData) ? result.CompanyLogo.ImageData : (result.AccountLogo && result.AccountLogo.ImageData) ? result.AccountLogo.ImageData : '';
                    if (headerLogo && !headerLogo.includes('base64,')) {
                        headerLogo = 'data:image/png;base64,' + headerLogo;
                    }
                    const userInfo = {
                        id: result.Id,
                        email: result.Email,
                        name: result.FullName,
                        mobile: result.PrimaryMobile,
                        landline: result.PrimaryLandline,
                        userImage: result.UserProfileImage ? result.UserProfileImage : '',
                        headerLogo: headerLogo,
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

    setSelectedTab(from: any, data?: any) {

        if (from === 'editUsers') {
            this.selected = this.editUsersArray.length;
            this.userDataTable = data;
            this.lockUserInput = this.userDataTable.UserAccount;
        } else if (from === 'addUsers') {
            this.selected = this.editUsersArray.length + this.addUsersArray.length;
        } else if (from === 'uploadUsers') {
            this.selected = this.uploadUsersArray.length + this.addUsersArray.length + this.uploadUsersArray.length;
        }
    }

    goToPage(to: any) {
        if (to === 'tem') {
            this.router.navigate(['/management/tem']);
        } else if (to === 'users') {
            this.router.navigate(['/management/tem/users']);
        }
    }

    uploadUsersData() {
        this.uploadUsersArray.push({ name: 'New' });
        this.setSelectedTab('uploadUsers');
    }

    removeUploadPage(index: any) {
        this.uploadUsersArray.splice(index, 1);
        this.uploadUsersArray = _.cloneDeep(this.uploadUsersArray);
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
            this.addUsersArray.splice(index, 1);
            this.addUsersArray = _.cloneDeep(this.addUsersArray);
            const a = this.gridApi.api ? this.gridApi.api : this.gridApi;
            this.onAgGridReady(a);
        }
    }

    onUserEditEvent(event: any, index: any) {
        if (event) {
            this.editUsersArray.splice(index, 1);
            this.editUsersArray = _.cloneDeep(this.editUsersArray);
            const a = this.gridApi.api ? this.gridApi.api : this.gridApi;
            this.onAgGridReady(a);
        }
    }
}
