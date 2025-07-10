import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { LocationService } from 'src/app/services/location.service';
import { WirelineService } from 'src/app/services/wireline.service';
import { ErrorWarningPopupComponent } from '../../error-warning-popup/error-warning-popup.component';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { AgGridModule } from 'ag-grid-angular';
import { AgGridTableComponent } from '../../ag-grid-table/ag-grid-table.component';
import { ModuleRegistry } from 'ag-grid-community';
import { ServerSideRowModelModule } from 'ag-grid-enterprise';
ModuleRegistry.registerModules([ServerSideRowModelModule]);
@Component({
  selector: 'app-link-people',
  templateUrl: './link-people.component.html',
  styleUrls: ['./link-people.component.scss'],
  imports: [SharedModule, PrimgModule, AgGridModule, AgGridTableComponent]
})
export class LinkPeopleComponent implements OnInit {

  gridApi: any;
  gridColumnApi: any;
  stopSpinner: any = true;
  @Input() rowData: any;
  public peopleRowData: any = [];
  columnDefs: any;
  peopleAssignData: any;
  saveButtonDisabled = false;
  @Output() wirelinePageName: EventEmitter<any> = new EventEmitter<any>();

  private _unsubscribePeople: Subject<any> = new Subject<any>();
  private _unsubscribePeopleAssign: Subject<any> = new Subject<any>();
  private _unsubscribeInventoryPeoples: Subject<any> = new Subject<any>();

  constructor(private locationService: LocationService,
    public dialog: MatDialog, private wirelineService: WirelineService) { }


  ngOnInit(): void {
    this.wirelinePageName.emit('LinkPeople');
    this.setColumnDef();
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
    rowSelection: {
      type: 'multiple',
      enableClickSelection: true
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
        // Object.keys(paramsRequest.filterModel).forEach((key) => {
        //   if (key === 'StartDate' || key === 'EndDate') {
        //     data[key] = paramsRequest.filterModel[key].dateFrom
        //       .split(' ')[0]
        //       .toString();
        //   } else {
        //     if (key === 'Map') {
        //       data[key] = paramsRequest.filterModel[key].values[0];
        //     } else {
        //       data[key] = paramsRequest.filterModel[key].filter.toString();
        //     }
        //   }
        // });
        if (paramsRequest.sortModel.length > 0) {

          Object.values(params['columnApi']['columnController']['columnDefs']).forEach((key: any) => {
            if (key['children']) {
              Object.values(key['children']).forEach((k: any) => {
                if (k['field'] === paramsRequest.sortModel[0].colId) {
                  data['OrderBy'] = k['sortingField'];
                  data['SortOrder'] = paramsRequest.sortModel[0].sort;
                }
              });
            }
          });
        }
        data['customerAccountId'] = this.rowData['CustomerAccountId']
        data['vendorProductInventoryId'] = this.rowData['VendorProductInventoryId'];
        this._unsubscribePeople.next(null);
        this.locationService
          .getPeopleList(data)
          .pipe(takeUntil(this._unsubscribePeople))
          .subscribe(
            async (data: any) => {
              if (data && data.Data.$values.length > 0) {
                this.peopleRowData = data.Data.$values;

                let lastRow = -1;
                if (data.TotalCount <= paramsRequest.startRow + 100) {
                  lastRow = data.TotalCount;
                }
                params.success({
                  rowData: this.peopleRowData,
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
                node.setSelected(node.data.IsSelected);
              });
            },
            (error) => {
              this.peopleRowData = [];
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
      this.gridApi.api!.setGridOption("serverSideDatasource", dataSource);
    } else {
      this.gridApi!.setGridOption("serverSideDatasource", dataSource);
    }
  }

  onAgGridReadyEmit($event: any) {
    this.gridApi = $event.api;
    this.gridColumnApi = $event.columnApi;
  }

  onSelectionChanged(event: any) {
    let data: any = {}
    data['vendorProductInventoryId'] = this.rowData['VendorProductInventoryId'];
    let contactIds: any = [];
    event.forEach((element: any) => {
      contactIds.push(element.PeopleId)
    });
    data['contactIds'] = contactIds;
    data['inventoryId'] = this.rowData['InventoryId']
    this.peopleAssignData = data;
  }

  ngOnDestroy(): void {
    this._unsubscribePeople.next(null);
    this._unsubscribePeople.complete();
    this._unsubscribePeopleAssign.next(null);
    this._unsubscribePeopleAssign.complete();
    this._unsubscribeInventoryPeoples.next(null);
    this._unsubscribeInventoryPeoples.complete();
  }

  savePeople() {
    if (this.peopleAssignData) {
      this._unsubscribePeopleAssign.next(null);
      this.saveButtonDisabled = true;
      this.wirelineService.inventorycontactsAssign(this.peopleAssignData).pipe(takeUntil(this._unsubscribePeopleAssign))
        .subscribe((response) => {
          this.saveButtonDisabled = false;
          if (response.Success) {
            this.errorPopup(response)
            this.getInventoryMatched();
          } else {
            this.errorPopup(response)
          }
        }, error => {
          this.saveButtonDisabled = false;
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
    });
  }

  getInventoryMatched() {
    this._unsubscribeInventoryPeoples.next(null);
    let data = {};
    this.wirelineService
      .getInventoryContacts(data, this.rowData['VendorProductInventoryId'])
      .pipe(takeUntil(this._unsubscribeInventoryPeoples))
      .subscribe(
        async (data: any) => {
          if (data && data.Data.$values) {
            this.onAgGridReady(this.gridApi);
          }
        });
  }
}
