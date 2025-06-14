import { Component, Inject, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { WirelineService } from 'src/app/services/wireline.service';
import { LocationService } from 'src/app/services/location.service';
import { rolePermission } from 'src/app/services/helper';
import { CommanHtmlRendererComponent } from '../ag-grid-cell-renderer-element/comman-html-renderer.component';
import { ErrorWarningPopupComponent } from '../error-warning-popup/error-warning-popup.component';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { AgGridTableComponent } from '../ag-grid-table/ag-grid-table.component';
import { AgGridModule } from 'ag-grid-angular';
import { ClientSideRowModelModule, ModuleRegistry, ServerSideRowModelModule } from 'ag-grid-enterprise';
import { CustomPipe } from 'src/app/custom-pipe/date.pipe';
import { DatePipe } from '@angular/common';
import { CommonModule } from '@angular/common';

ModuleRegistry.registerModules([ServerSideRowModelModule, ClientSideRowModelModule]);
@Component({
  selector: 'app-link-people-dialog',
  templateUrl: './link-people-dialog.component.html',
  styleUrls: ['./link-people-dialog.component.scss'],
  standalone: true,
  imports: [
    SharedModule,
    AgGridTableComponent,
    AgGridModule,
    CommonModule
  ],
  providers: [CustomPipe, DatePipe, LocationService, WirelineService]
})
export class LinkPeopleDialogComponent implements OnInit {

  private _unsubscribeLocation: Subject<any> = new Subject<any>();
  private _unsubscribePeopleAssign: Subject<any> = new Subject<any>();
  columnDefs: any;
  gridApi: any;
  stopSpinner: boolean;
  gridColumnApi: any;
  rowData: any;
  peopleAssignData: any;
  saveButtonDisabled: boolean;
  saveButtonLoader: boolean;
  savePrimarayButtonLoader: boolean;
  isUserAccess = false;
  existingPeople: any;
  public totalSelected: any;
  public lastSelected: any;
  public isExisting: any;
  peopleRowData: any = [];
  chargeCodeForm: FormGroup;
  customerId: any;
  action: any;
  isPrimaryExist = false;
  primaryLocationId: any;
  checkedData: any;
  openFrom: any;
  primaryPeopleId: any;
  @ViewChild('IIconTooltip') IIconTooltip!: TemplateRef<any>;
  @ViewChild('primaryCell', { static: false }) primaryCell: TemplateRef<any>;

  sideBar = {
    toolPanels: ['columns', 'filters']
  };


  constructor(
    private wirelineService: WirelineService,
    private locationService: LocationService,
    public dialogref: MatDialogRef<LinkPeopleDialogComponent>,
    private dialog: MatDialog,
    public fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) data: any) {
    this.rowData = data.rowData;
    this.customerId = data.customerId;
    this.action = data.action;
    this.openFrom = data.openFrom;
    this.isPrimaryExist = data.isPrimaryExist;
    this.primaryLocationId = data.primaryLocationId;
    this.existingPeople = data.linkPeople;
    this.primaryPeopleId = data.primaryPeopleId;
    dialogref.disableClose = true;
    this.chargeCodeForm = this.fb.group({
      chargeCodeTypeId: new FormControl('', [Validators.required]),
      chargeCodeName: new FormControl('', [Validators.required]),
      chargeCodeOccurrenceId: new FormControl('', [Validators.required]),
      chargeTypeId: new FormControl('', [Validators.required]),
      description: new FormControl('', [Validators.required]),
      chargeCode: new FormControl('', [Validators.required]),
    });
  }

  ngOnInit(): void {
    this.isUserAccess = rolePermission(['CompanyUser', 'TEMUser']);
  }
  ngAfterViewInit(): void {
    this.setColumnDef();
  }

  ngOnDestroy() {
    this._unsubscribeLocation.next(null);
    this._unsubscribeLocation.complete();
    this._unsubscribePeopleAssign.next(null);
    this._unsubscribePeopleAssign.complete();
  }

  setColumnDef() {
    this.columnDefs = [
      {
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
        suppressColumnsToolPanel: true,
        howDisabledCheckboxes: true,
      },
      {
        headerName: 'Organization',
        children: [
          {
            sortingField: 'customerAccountName',
            field: 'CustomerAccountName',
            headerName: 'Customer',
            resizable: true,
            editable: false,
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            minWidth: 130,
            cellRenderer: CommanHtmlRendererComponent,
            cellRendererParams: {
              ngTemplate: this.primaryCell
            }
          },
          {
            sortingField: 'companyName',
            field: 'CompanyName',
            headerName: 'Company',
            resizable: true,
            editable: false,
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            minWidth: 130,
          },

        ],
      },
      {
        headerName: 'Personal',
        children: [
          {
            sortingField: 'peopleName',
            headerName: 'Name',
            columnGroupShow: 'close',
            field: 'PeopleName',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 120,
            flex: 0,
          },
          {
            sortingField: 'peopleFirstName',
            field: 'PeopleFirstName',
            headerName: 'First Name',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            minWidth: 120,
            flex: 0
          },
          {
            sortingField: 'peopleLastName',
            field: 'PeopleLastName',
            headerName: 'Last Name',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            minWidth: 120,
            flex: 0,
          },
          {
            sortingField: 'peopleUserTitle',
            field: 'PeopleUserTitle',
            headerName: 'Title',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            minWidth: 120,
            flex: 0,
          },
          {
            sortingField: 'employeeId',
            field: 'EmployeeId',
            headerName: 'Employee ID',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            minWidth: 120,
            flex: 0,
          },
          {
            sortingField: 'managerName',
            field: 'ManagerName',
            headerName: 'Manager',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            minWidth: 120,
            flex: 0,
          },

          {
            sortingField: 'managerEmail',
            field: 'ManagerEmail',
            headerName: 'Manager Email',
            editable: false,
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            minWidth: 130,
            flex: 0,
          },
          {
            sortingField: 'department',
            field: 'Department',
            headerName: 'Department',
            editable: false,
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            minWidth: 130,
            flex: 0,
          },
          {
            sortingField: 'peopleCustomField1',
            field: 'PeopleCustomField1',
            headerName: 'People Custom 1',
            editable: false,
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            minWidth: 130,
            flex: 0,
          },
          {
            sortingField: 'peopleCustomField2',
            field: 'PeopleCustomField2',
            headerName: 'People Custom 2',
            editable: false,
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            minWidth: 130,
            flex: 0,
          },
          {
            sortingField: 'peopleCustomField3',
            field: 'PeopleCustomField3',
            headerName: 'People Custom 3',
            editable: false,
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            minWidth: 130,
            flex: 0,
          },
          {
            sortingField: 'peopleCustomField4',
            field: 'PeopleCustomField4',
            headerName: 'People Custom 4',
            editable: false,
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            minWidth: 130,
            flex: 0,
          },

        ],
      },

      {
        headerName: 'Contact',
        children: [
          {
            sortingField: 'peopleEmail',
            field: 'PeopleEmail',
            headerName: 'Email',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 120,
            flex: 0,
          },
          {
            sortingField: 'deskPhone',
            field: 'DeskPhone',
            headerName: 'Desk Phone',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 120,
            flex: 0,
          },
          {
            sortingField: 'cellPhone',
            field: 'CellPhone',
            headerName: 'Mobile Phone',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 120,
            flex: 0,
          },
          {
            sortingField: 'customerContactType',
            field: 'CustomerContactType',
            headerName: 'Contact Type',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 120,
            flex: 0,
          },
          {
            sortingField: 'userBlockEmail',
            field: 'UserBlockEmail',
            headerName: 'Block Email',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 120,
            flex: 0,
          },
        ],
      },

      {
        headerName: 'Status',
        children: [
          {
            sortingField: 'PeopleStatusDisplayValue',
            field: 'PeopleStatusDisplayValue',
            headerName: 'Status',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 120,
            flex: 0,
          },
          {
            sortingField: 'CustomerDisplayRole',
            field: 'CustomerDisplayRole',
            headerName: 'Roles',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 120,
            flex: 0,
          },
          {
            sortingField: 'systemUser',
            field: 'SystemUser',
            headerName: 'System User',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 120,
            flex: 0,
          },
          {
            sortingField: 'userAccountState',
            field: 'UserAccountState',
            headerName: 'User Account',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 120,
            flex: 0,
          },
          {
            sortingField: 'UserEmailVerified',
            field: 'UserEmailVerified',
            headerName: 'Email Verification',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 120,
            flex: 0,
          },


        ],
      },
      {
        headerName: 'Location',
        children: [
          {
            sortingField: 'primaryLocationDisplayValue',
            field: 'PrimaryLocationDisplayValue',
            headerName: 'Location',
            editable: false,
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            minWidth: 160,
            flex: 0,
            tooltipField: 'PrimaryLocationDisplayValue',
            tooltipComponentParams: { color: '#ececec' },
          },
        ],

      },

    ];
  }

  public defaultColDef = {
    editable: true,
    sortable: true,
    minWidth: 100,
    filter: true,
    resizable: true,
    floatingFilter: true,
    flex: 1,
  };

  gridOptions = {
    rowModelType: 'serverSide',
    enableFiltering: true,
    headerHeight: 35,
    groupHeaderHeight: 37,
    floatingFiltersHeight: 35,
    serverSideInfiniteScrollOptions: {
      storeType: 'partial',
      cacheBlockSize: 100
    },
  };

  onAgGridReady($event: any) {
    this.stopSpinner = true;
    this.gridApi = $event;
    let dataSource: any = {
      rowCount: null,
      getRows: (params: any) => {
        let paramsRequest = params['request'];
        const filterArray: any = [];
        const filterArrayDate: any = [];

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
          startRowIndex:
            paramsRequest.startRow === 0 ? 1 : paramsRequest.startRow + 1,
          maximumRows: 100,
        };

        if (filterArrayDate && filterArrayDate.length > 0) {
          data['advanceDateFilter'] = filterArrayDate;
        }

        if (filterArray && filterArray.length > 0) {
          data['advanceFilter'] = filterArray;
        }
        if (paramsRequest?.sortModel?.length > 0) {
          const sortModel = paramsRequest.sortModel;
          data['OrderBy'] = sortModel[0].colId;
          data['SortOrder'] = sortModel[0].sort;
        }
        if (this.rowData && this.action == 'Edit') {
          if (this.rowData['CustomerAccountId'] !== this.customerId) {
            data['CustomerAccountId'] = this.customerId ? this.customerId : this.rowData['CustomerAccountId'];
          } else {
            data['customerAccountId'] = this.rowData['CustomerAccountId'];
          }
        } else {
          data['customerAccountId'] = this.customerId ? this.customerId : this.rowData['CustomerAccountId'];
        }

        if (this.rowData && this.rowData['VendorProductInventoryId']) {
          data['vendorProductInventoryId'] = this.rowData['VendorProductInventoryId'];
        }

        if (data['advanceFilter'] == undefined) {
          data['advanceFilter'] = [{
            "filterKey": "PeopleStatusDisplayValue",
            "filterOptionType1": "equals",
            "filterOptionValue1": 'Active',
            "filterOperationType": "AND",
            "filterOptionType2": null,
            "filterOptionValue2": null
          }];
        } else {
          data['advanceFilter'].push({
            "filterKey": "PeopleStatusDisplayValue",
            "filterOptionType1": "equals",
            "filterOptionValue1": 'Active',
            "filterOperationType": "AND",
            "filterOptionType2": null,
            "filterOptionValue2": null
          });

        }
        this._unsubscribeLocation.next(null);
        this.locationService
          .getPeopleList(data)
          .pipe(takeUntil(this._unsubscribeLocation))
          .subscribe(
            async (data: any) => {
              if (data && data.Data.$values.length > 0) {
                this.peopleRowData = data.Data.$values
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
              if (this.existingPeople) {
                this.peopleRowData.forEach((node: any) => {
                  const d = this.existingPeople?.some((r: any) => r.PeopleId === node.PeopleId);
                  node['IsSelected'] = d;
                })
              }
              params.api.forEachNode(function (node: any) {
                node.setSelected(node.data.IsSelected);
              });

            },
            (error) => {
              this.stopSpinner = true;
              params.success([], 0);
              this.gridApi.showNoRowsOverlay();
            }
          );


      },
    };
    this.gridApi.api!.setGridOption("serverSideDatasource", dataSource);
  }

  onAgGridReadyEmit($event: any) {
    this.gridApi = $event.api;
    this.gridColumnApi = $event.columnApi;
  }

  onSelectionChanged(event: any) {
    this.checkedData = event;
    this.totalSelected = event.length;
    this.lastSelected = event.filter((e: any) => e.IsSelected === false);
    this.isExisting = event.filter((e: any) => e.IsSelected === true);
    let data: any = {}

    if (this.rowData && this.rowData['VendorProductInventoryId']) {
      data['vendorProductInventoryId'] = this.rowData['VendorProductInventoryId'];
    }

    let contactIds: any = [];
    event.forEach((element: any) => {
      contactIds.push(element.PeopleId)
    });
    data['contactIds'] = contactIds;
    data['inventoryId'] = this.rowData && this.rowData['InventoryId'] ? this.rowData['InventoryId'] : null;
    this.peopleAssignData = data;
  }

  savePeople(primaryBtnclick = false) {
    let peopleData;

    // if (this.totalSelected == 0 || this.totalSelected == undefined) {
    //   let errorData: any = {
    //     messgeType: "error",
    //     title: "Attention",
    //     titleClass: "text-c-blue",
    //     icon: "fas fa-exclamation-triangle",
    //     iconClass: "text-c-blue f-70",
    //     message: 'At least one People must be selected.'
    //   }
    //   const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
    //   dialogRef.afterClosed().subscribe(result => {
    //   });
    // } else 
    if (!this.primaryLocationId && (this.totalSelected == 0 || this.totalSelected == undefined)) {
      const msg = 'The system requires at least one primary Location or Person. This action will remove the current primary inventory assignment. Please review and designate a new primary inventory assignment.';

      let errorData: any = {
        messgeType: 'error',
        title: 'Attention',
        titleClass: 'text-c-blue',
        icon: 'fas fa-exclamation-circle',
        iconClass: 'text-c-blue f-70',
        message: msg,
      };
      const dialogRef = this.dialog.open(ErrorWarningPopupComponent, {
        panelClass: 'error-warning',
        data: errorData,
      });
      dialogRef.afterClosed().subscribe((result) => {
      });
    }
    else if (this.action == 'Edit') {

      if (this.customerId === this.rowData['CustomerAccountId']) {
        if (this.peopleAssignData) {
          peopleData = this.peopleAssignData;
        } else {
          let data: any = {}

          if (this.rowData && this.rowData['VendorProductInventoryId']) {
            data['vendorProductInventoryId'] = this.rowData['VendorProductInventoryId'];
          }

          data['contactIds'] = [];
          data['inventoryId'] = this.rowData['InventoryId']
          peopleData = data;
        }

        this.savePrimarayButtonLoader = primaryBtnclick;
        this.saveButtonLoader = !primaryBtnclick;
        this.callPeopleAPI(peopleData, primaryBtnclick);
      } else if (this.openFrom === 'assignment-tab') {
        let data: any = {}

        if (this.rowData && this.rowData['VendorProductInventoryId']) {
          data['vendorProductInventoryId'] = this.rowData['VendorProductInventoryId'];
        }

        data['contactIds'] = this.peopleAssignData.contactIds;
        data['inventoryId'] = this.rowData['InventoryId']
        peopleData = data;
        peopleData['primaryContactId'] = this.peopleAssignData['primaryContactId'];

        this.savePrimarayButtonLoader = primaryBtnclick;
        this.saveButtonLoader = !primaryBtnclick;
        this.callPeopleAPI(peopleData, primaryBtnclick);

      } else {

        if (this.isPrimaryExist && this.primaryLocationId && primaryBtnclick) {
          let errorData: any = {
            messgeType: 'error',
            title: 'Attention',
            titleClass: 'text-c-blue',
            icon: 'fas fa-exclamation-circle',
            iconClass: 'text-c-blue f-70',
            message: 'This inventory item already has a Primary assignment. Continuing with this action will change the Primary assignment.',
            okBtnName: 'Close & Review',
            closeBtnName: 'Change the Assignment!',
          };
          const dialogRef = this.dialog.open(ErrorWarningPopupComponent, {
            panelClass: 'error-warning',
            data: errorData,
          });
          dialogRef.afterClosed().subscribe((res) => {
            if (res == false) {
              let data = {
                checkedData: this.checkedData,
                primaryData: null,
                add: true,
                contactIds: this.peopleAssignData.contactIds,
                primaryContactId: this.peopleAssignData.primaryContactId
              }
              this.dialogref.close(data)
            }

          });
        } else {
          let data = {
            checkedData: this.checkedData,
            primaryData: null,
            add: true,
            contactIds: this.peopleAssignData.contactIds,
            primaryContactId: this.peopleAssignData.primaryContactId
          }
          this.dialogref.close(data)
        }

      }

    } else {
      let data = {
        checkedData: this.checkedData,
        primaryData: null,
        add: true,
        contactIds: this.peopleAssignData.contactIds,
        primaryContactId: this.peopleAssignData.primaryContactId
      }
      this.dialogref.close(data)
    }

  }

  callPeopleAPI(peopleData: any, primaryBtnclick = false) {
    if (this.isPrimaryExist && this.primaryLocationId && primaryBtnclick && !this.primaryPeopleId) {
      let errorData: any = {
        messgeType: 'error',
        title: 'Attention',
        titleClass: 'text-c-blue',
        icon: 'fas fa-exclamation-circle',
        iconClass: 'text-c-blue f-70',
        message: 'This inventory item already has a Primary assignment. Continuing with this action will change the Primary assignment.',
        okBtnName: 'Close & Review',
        closeBtnName: 'Change the Assignment!',
      };
      const dialogRef = this.dialog.open(ErrorWarningPopupComponent, {
        panelClass: 'error-warning',
        data: errorData,
      });
      dialogRef.afterClosed().subscribe((res) => {
        if (res == false) {

          peopleData['primaryLocationId'] = this.primaryLocationId;

          this.wirelineService.inventorycontactsAssign(peopleData).pipe(takeUntil(this._unsubscribePeopleAssign))
            .subscribe((response) => {
              this.saveButtonLoader = false;
              this.savePrimarayButtonLoader = false;
              if (response.Success) {
                this.errorPopup(response);
              } else {
                this.errorPopup(response);
              }
            }, error => {
              this.saveButtonLoader = false;
              this.savePrimarayButtonLoader = false;
              this.errorPopup(error);
            });
        } else {
          this.savePrimarayButtonLoader = false;
          this.saveButtonLoader = false;
        }
      })
      return
    } else {
      this.wirelineService.inventorycontactsAssign(peopleData).pipe(takeUntil(this._unsubscribePeopleAssign))
        .subscribe((response) => {
          this.saveButtonLoader = false;
          this.savePrimarayButtonLoader = false;
          if (response.Success) {
            this.errorPopup(response);
          } else {
            this.errorPopup(response);
          }
        }, error => {
          this.saveButtonLoader = false;
          this.savePrimarayButtonLoader = false;
          this.errorPopup(error);
        });
    }
  }
  errorPopup(data: any) {
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
      this.dialogref.close(result);
    });
  }

  saveLocationPrimary() {
    if (this.totalSelected == 0 || this.totalSelected == undefined) {
      let errorData: any = {
        messgeType: "error",
        title: "Attention",
        titleClass: "text-c-blue",
        icon: "fas fa-exclamation-triangle",
        iconClass: "text-c-blue f-70",
        message: 'At least one People must be selected to set as Primary. Please select a People.'
      }
      const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
      dialogRef.afterClosed().subscribe(result => {
      });
    } else if (this.totalSelected > 1) {
      if (this.lastSelected.length > 1) {
        let errorData: any = {
          messgeType: "error",
          title: "Attention",
          titleClass: "text-c-blue",
          icon: "fas fa-exclamation-triangle",
          iconClass: "text-c-blue f-70",
          message: 'Only one person may be set as the Primary.'
        }
        const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
        dialogRef.afterClosed().subscribe(result => {
        });
      } else if (this.lastSelected.length == 0) {
        let errorData: any = {
          messgeType: "error",
          title: "Attention",
          titleClass: "text-c-blue",
          icon: "fas fa-exclamation-triangle",
          iconClass: "text-c-blue f-70",
          message: 'At least one person must be selected to set as Primary. Please select a Person.'
        }
        const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
        dialogRef.afterClosed().subscribe(result => {
        });
      } else {
        this.peopleAssignData['primaryContactId'] = this.lastSelected[0].PeopleId;
        this.savePeople(true)
      }
    }
    else {
      this.peopleAssignData['primaryContactId'] = this.peopleAssignData['contactIds'][0];
      this.savePeople(true);
    }
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(this.IIconTooltip, {
      width: '700px',
      data: {
        colseButton: true,
      }
    });
  }

  closeModal() {
    this.dialog.closeAll();
  }

}
