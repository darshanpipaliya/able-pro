import { Component, OnInit, Inject, Output, EventEmitter, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import * as _ from 'lodash';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { LocationService } from 'src/app/services/location.service';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { rolePermission } from 'src/app/services/helper';
import { ErrorWarningPopupComponent } from 'src/app/common/error-warning-popup/error-warning-popup.component';
import { CommonPTreeTableComponent } from 'src/app/common/common-p-tree-table/common-p-tree-table.component';
import { api_list } from 'src/app/services/api-list';
import { createColumn } from 'src/app/utils/column-utils';
import { ModuleRegistry } from 'ag-grid-community';
import { ServerSideRowModelModule } from 'ag-grid-enterprise';
ModuleRegistry.registerModules([ServerSideRowModelModule]);
@Component({
  selector: 'app-link-location-popup',
  templateUrl: './link-location-popup.component.html',
  styleUrls: ['./link-location-popup.component.scss'],
  standalone: true,
  imports: [
    SharedModule,
    PrimgModule,
    CommonPTreeTableComponent,
  ]
})
export class LinkLocationPopupComponent implements OnInit {

  private readonly getLocationAPIDestroy = new Subject<void>();
  rowData = [];
  sideBar = {
    toolPanels: ['columns', 'filters']
  };
  rowSelection = 'multiple';
  gridApi: any;
  gridColumnApi: any;
  saveButtonLoader = false;
  public locationAssignData: any;
  private _unsubscribeLocationAssign: Subject<any> = new Subject<any>();
  saveButtonDisabled = false;
  public lastSelected: any;
  isUserAccess: boolean = false;
  customerId: any;
  public isExisting: any;
  public totalSelected: any;

  public columnDefs:any;
  existingLocation: any;
  invenotryData: any;
  action: any;
  checkedData: any;
  peopleData: any;
  selectedLocation: any;
  primaryCompanyLocationID: any;

  gridOptions = {
    rowModelType: 'serverSide',
    serverSideInfiniteScroll: true,
    headerHeight: 35,
    groupHeaderHeight: 37,
    floatingFiltersHeight: 35,
    rowSelection: {
      type: 'multiple',
      enableClickSelection: true
    },
  };

  defaultColDef = {
    editable: true,
    sortable: true,
    minWidth: 100,
    filter: true,
    resizable: true,
    floatingFilter: true,
    flex: 1,
    cellStyle: {
      display: "flex",
      alignItems: "center"
    }
  };


  /* p-tree-table */
  refreshbutton: boolean = false;
  payload: any = {};
  GridAPI: any = api_list.Location.Location.Grid;
  cols: any;
  selectedNode: any;
  loader: boolean = false;

  @Output() tableDataExist: EventEmitter<any> = new EventEmitter();
  @Output() exportAccountData: EventEmitter<any> = new EventEmitter();
  @Output() selectedRowsEmit: EventEmitter<any> = new EventEmitter();
  @Output() rowCellDoubleClicked: EventEmitter<any> = new EventEmitter();
  @Output() loaderEmitParent: EventEmitter<any> = new EventEmitter();
  @Output() totalRecords: EventEmitter<any> = new EventEmitter();

  @ViewChild(CommonPTreeTableComponent) CommonPTreeTableComponent!: CommonPTreeTableComponent;

  constructor(private locationService: LocationService,
    public dialogRef: MatDialogRef<LinkLocationPopupComponent>,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) data:any) {
    this.existingLocation = data.linkLocation;
    this.invenotryData = data.inventoryData;
    this.action = data.action;
    this.peopleData = data.peopleData;
    this.customerId = data.customerId;
    this.selectedLocation = data.selectedLocation;
    this.primaryCompanyLocationID = data.primaryCompanyLocationId;
    dialogRef.disableClose = true;
    if (this.peopleData && this.action == 'Edit') {
      if (this.peopleData['CustomerAccountId'] !== this.customerId) {
        this.payload['CustomerAccountId'] = this.customerId;
      } else {
        this.payload['PeopleId'] = this.peopleData['PeopleId'];
        this.payload['CustomerAccountId'] = this.peopleData['CustomerAccountId'];
        this.payload['ForPeopleLocation'] = true;
      }
    } else {
      this.payload['customerAccountId'] = this.customerId;
    }
  }

  ngOnInit(): void {
    this.isUserAccess = rolePermission(['CompanyUser', 'TEMUser']);
   
    this.setCols();
  }

  saveLocation() {
    if (this.totalSelected == 0 || this.totalSelected == undefined) {
      let errorData: any = {
        messgeType: "error",
        title: "Attention",
        titleClass: "text-c-blue",
        icon: "fas fa-exclamation-triangle",
        iconClass: "text-c-blue f-70",
        message: 'At least one Location must be selected.'
      }
      const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
      dialogRef.afterClosed().subscribe(result => {
      });
    } else if (this.action == 'Edit') {
      if (_.cloneDeep(this.peopleData['CustomerAccountId']) == this.customerId) {
        this._unsubscribeLocationAssign.next(null);
        this.saveButtonLoader = true;
        this.locationService.peopleAssign(this.locationAssignData).pipe(takeUntil(this._unsubscribeLocationAssign))
          .subscribe((response) => {
            this.saveButtonLoader = false;
            if (response.Success) {
              this.errorPopup(response);
              this.dialogRef.close(true)
            } else {
              this.errorPopup(response);
            }
          }, error => {
            this.saveButtonLoader = false;
            this.errorPopup(error);
          });
      } else {
        let data = {
          checkedData: this.checkedData,
          primaryLocationId: this.locationAssignData.primaryLocationId
        }
        this.dialogRef.close(data)
      }
    } else {
      let data = {
        checkedData: this.checkedData,
        primaryData: null
      }
      this.dialogRef.close(data)
    }
  }

  setColumnDef() {
    this.CommonPTreeTableComponent.setColumnDefs();
  }

  setCols() {
    let currentParent = 0;
    const getParentId = (isChild: boolean) => isChild ? ++currentParent : currentParent;
  
    this.cols = [
      createColumn(1, '60px', true, 'checkbox', '', 'checkbox', ''),

      createColumn(2, '180px', true, 'text', 'Location Name', 'LocationName', 'Location Name'),

      createColumn(3, '160px', true, 'text', 'Location Type', 'LocationTypeDisplayName', 'Location Type'),

      createColumn(4, '200px', true, 'text', 'Address', 'Address1', 'Address One', 'close'),
      createColumn(4, '120px', false, 'text', '', 'City', 'City', 'close'),
      createColumn(4, '130px', false, 'text', '', 'StateName', 'State/Province/Region', 'close'),
    ];
  }
  
  onSelectionChanged(event:any) {
    this.checkedData = event;

    this.totalSelected = event.length;
    this.lastSelected = event.filter((e:any) => e.IsSelected === false);
    this.isExisting = event.filter((e:any) => e.IsSelected === true);
    let data:any = {};

    let locationIds:any = [];
    event.forEach((element:any) => {
      data['primaryCompanyLocationId'] = element.Id ? element.Id : null;
      locationIds.push(element.Id)
    });

    let matchingRecord =  this.selectedLocation.filter((x:any) => event.find((r:any) => x.CompanyLocationId == r.Id ))

    if(matchingRecord.includes((x:any) => x.CompanyLocationId == this.primaryCompanyLocationID) == false) {
      data['primaryCompanyLocationId'] = null;
    }

    data['companyLocationIds'] = locationIds;
    data['peopleId'] = this.peopleData?.PeopleId;
    this.locationAssignData = data;
  }

  onAgGridReady($event:any) {
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

        if (this.peopleData && this.action == 'Edit') {
          if (this.peopleData['CustomerAccountId'] !== this.customerId) {
            data['CustomerAccountId'] = this.customerId;
          } else {
            data['PeopleId'] = this.peopleData['PeopleId'];
            data['CustomerAccountId'] = this.peopleData['CustomerAccountId'];
            data['ForPeopleLocation'] = true;
          }
        } else {
          data['customerAccountId'] = this.customerId;
        }

        if (paramsRequest.sortModel.length > 0) {
          Object.values(params['columnApi']['columnController']['columnDefs']).forEach((key:any) => {
            if (key['children']) {
              Object.values(key['children']).forEach((k:any) => {
                if (k['field'] === paramsRequest.sortModel[0].colId) {
                  data['OrderBy'] = k['sortingFiled'];
                  data['SortOrder'] = paramsRequest.sortModel[0].sort;
                }
              });
            }
          });
        }

        this.getLocationAPIDestroy.next();
        this.locationService
          .getCompanylocationsURL(data)
          .pipe(takeUntil(this.getLocationAPIDestroy))
          .subscribe(
            async (data: any) => {
              if (data && data._companyLocationDto.$values.length > 0) {
                this.rowData = data._companyLocationDto.$values;
                let lastRow = -1;
                if (data.TotalRecordCount <= paramsRequest.startRow + 100) {
                  lastRow = data.TotalRecordCount;
                }
                params.success({
                  rowData: data._companyLocationDto.$values,
                  rowCount: lastRow
                });
              } else {
                params.success({
                  rowData: [],
                  rowCount: 0
                });
                this.gridApi.showNoRowsOverlay();
              }

              if (this.action == 'Edit') {
                params.api.forEachNode(function (node: any) {
                  node.setSelected(node.data.IsSelected);
                });
              } else {
                this.rowData.forEach((node: any) => {
                  const d = this.selectedLocation.some((r:any) => r.Id === node.Id);
                  node['isChecked'] = d;
                })
                params.api.forEachNode(function (node: any) {
                  node.setSelected(node.data.isChecked);
                });
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
    if(this.gridApi.api){
      this.gridApi.api!.setGridOption("serverSideDatasource", dataSource);
    } else {
      this.gridApi!.setGridOption("serverSideDatasource", dataSource);
    }
  }

  saveLocationPrimary() {
    if (this.totalSelected == 0 || this.totalSelected == undefined) {
      let errorData: any = {
        messgeType: "error",
        title: "Attention",
        titleClass: "text-c-blue",
        icon: "fas fa-exclamation-triangle",
        iconClass: "text-c-blue f-70",
        message: 'At least one Location must be selected to set as Primary. Please select a Location.'
      }
      const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
      dialogRef.afterClosed().subscribe(result => {
      });
    }
    else if (this.totalSelected > 1) {
      if (this.lastSelected.length > 1) {
        let errorData: any = {
          messgeType: "error",
          title: "Attention",
          titleClass: "text-c-blue",
          icon: "fas fa-exclamation-triangle",
          iconClass: "text-c-blue f-70",
          message: 'Only one location may be set as the Primary Location.'
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
          message: 'At least one Location must be selected to set as Primary. Please select a Location.'
        }
        const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
        dialogRef.afterClosed().subscribe(result => {
        });
      } else {
        this.locationAssignData['primaryCompanyLocationId'] = this.lastSelected[0].Id;
        this.saveLinkedLocation(this.locationAssignData)
      }
    }
    else {
      this.locationAssignData['primaryCompanyLocationId'] = this.locationAssignData['companyLocationIds'][0];
      this.saveLinkedLocation(this.locationAssignData);
    }
  }

  saveLinkedLocation(data:any) {

    if (this.action == 'Edit') {
      if (this.peopleData['CustomerAccountId'] == this.customerId) {
        this.saveButtonDisabled = true;
        this._unsubscribeLocationAssign.next(null);
        this.locationService.peopleAssign(data).pipe(takeUntil(this._unsubscribeLocationAssign))
          .subscribe((response) => {
            this.saveButtonDisabled = false;
            if (response.Success) {
              this.errorPopup(response);
              this.dialogRef.close(true)
            } else {
              this.errorPopup(response);
            }
          }, error => {
            this.saveButtonDisabled = false;
            this.errorPopup(error);
          });

      } else {
        let data = {
          checkedData: this.checkedData,
          locationIds: this.locationAssignData.locationIds,
          primaryCompanyLocationId: this.locationAssignData.primaryCompanyLocationId
        }
        this.dialogRef.close(data)
      }
    } else {
      let data = {
        checkedData: this.checkedData,
        locationIds: this.locationAssignData.locationIds,
        primaryCompanyLocationId: this.locationAssignData.primaryCompanyLocationId
      }
      this.dialogRef.close(data)
    }
  }

  errorPopup(data:any) {
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

      if (this.checkedData && this.locationAssignData.locationIds && this.locationAssignData.primaryLocationId) {
        let data = {
          checkedData: this.checkedData,
          locationIds: this.locationAssignData.locationIds,
          primaryCompanyLocationId: this.locationAssignData.primaryCompanyLocationId
        }
        this.dialogRef.close(data);
      }
    });
  }

  /* p-tree-table */
  refreshbuttonEmitFn(event: any) {
    this.refreshbutton = event;
  }

  onNodeSelect(event: any) {
    this.selectedNode = event.node;
  }

  tableDataExistFn(event: any) {
    this.tableDataExist.emit(event)
  }

  exportAccountDataFn(event: any) {
    this.exportAccountData.emit(event)
  }

  selectedRowsEmitFn(event: any) {
    this.onSelectionChanged(event);
    this.selectedRowsEmit.emit(event)
  }

  rowCellDoubleClickedFn(event: any) {
    this.rowCellDoubleClicked.emit(event)
  }
  totalRecordsEmitFn(event: any) {
    this.totalRecords = event;
  }
  loaderEmitFn(event: any) {
    this.loader = event;
    this.loaderEmitParent.emit(event);
  }

}
