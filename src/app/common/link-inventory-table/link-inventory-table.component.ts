import { Component, Inject, OnInit } from '@angular/core';
import * as _ from 'lodash';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { isValueExist, rolePermission } from 'src/app/services/helper';
import { LocationService } from 'src/app/services/location.service';
import { WirelineService } from 'src/app/services/wireline.service';
import { ErrorWarningPopupComponent } from '../error-warning-popup/error-warning-popup.component';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
@Component({
  selector: 'app-link-inventory-table',
  templateUrl: './link-inventory-table.component.html',
  styleUrls: ['./link-inventory-table.component.scss'],
  imports: [
    SharedModule,
    PrimgModule
  ]
})
export class LinkInventoryTableComponent implements OnInit {
  selectedIds:any = [];
  rowData: any;
  stopSpinner: boolean = true;
  saveButtonDisabled: boolean = false;
  columnDefs: any;
  defaultColDef = {
    editable: false,
    sortable: true,
    minWidth: 100,
    filter: true,
    resizable: true,
    floatingFilter: true,
    flex: 1,
  };
  request: any = {};
  checkedRowData:any = [];
  emitedData: any;
  close = "undefined";
  disableEdit: boolean = false;
  public autoGroupColumnDef: any = {
    headerName: 'Service Number',
    field: 'ServiceNumber',
    cellRendererParams: {
      checkbox: true,
      suppressCount: true,
    },
    filterParams: {
      treeList: true,
    },
    filter: 'agTextColumnFilter',
    minWidth: 280,
    resizable: true,
  };
  public getDataPath: any = (data: any) => data.dataPath;
  private _unsubscribe: Subject<any> = new Subject<any>();
  public rowSelection: 'single' | 'multiple' = 'multiple';
  gridOptions: any = {
    rowModelType: 'serverSide',
    serverSideInfiniteScroll: true,
    enableFiltering: true,
    headerHeight: 35,
    groupHeaderHeight: 37,
    floatingFiltersHeight: 35,
    onRowSelected: this.onRowSelected.bind(this)
  };

  gridApi: any;
  gridColumnApi: any;
  private _unsubscribeInventory: Subject<any> = new Subject<any>();

  sideBar = {
    toolPanels: ['columns', 'filters']
  };


  constructor(private locationService: LocationService,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) data: any, public wirelineService: WirelineService,
    private dialogRef: MatDialogRef<LinkInventoryTableComponent>) {
    this.emitedData = data[0];
    dialogRef.disableClose = true;
    const previousData:any = [];
    if(isValueExist(data[1])) {
      data[1].map((f: any) => {
        previousData.push({ VendorProductInventoryId: f.VendorProductInventoryId });
      });
      this.checkedRowData = previousData;
    }
  }
  onRowSelected(event: any) {
    if (event.node.isSelected()) {
      this.expandParents(event.node);
    } else {
      if (event.node.childrenAfterFilter) {
        event.node.childrenAfterFilter.forEach(function (childNode: any) {
          childNode.setSelected(false);
        });
      }
    }
  }

  expandParents(node: any) {
    let parent = node.parent;

    if (node.childrenAfterFilter) {
      node.childrenAfterFilter.forEach(function (childNode: any) {
        childNode.setSelected(true);
      });
    }
    while (parent) {
      parent.setExpanded(true);
      parent = parent.parent;
    }
  }
  ngOnInit(): void {
    this.disableEdit = rolePermission(['CompanyUser', 'TEMUser']);
    this.setColumnDefs();
  }
 
  ngOnDestroy() {
    this._unsubscribe.next(null);
    this._unsubscribe.complete();
  }


  getLocationInventories() {
    this.rowData = [];
    this.stopSpinner = false;
    this._unsubscribe.next(null);

    let advanceFilter = [
      {
        "filterKey": "InventoryStatusDisplayText",
        "filterOptionType1": "equals",
        "filterOptionValue1": "Pending Activation",
        "filterOperationType": "OR",
        "filterOptionType2": "equals",
        "filterOptionValue2": "Active"
      }
    ];

    const data: any = {
      CustomerAccountId: this.emitedData.AccountId,
      CompanyLocationId: this.emitedData['Id'],
      ForLocationInventory: true,
      advanceFilter: advanceFilter
    };

    this.locationService.inventoryHierarchy(data).pipe(takeUntil(this._unsubscribe)).subscribe((res: any) => {
      if (res && res.Data.$values) {
        this.stopSpinner = true;
        this.rowData = this.processData(res.Data.$values);
        _.forEach(this.rowData, (node: any) => {
          const d = this.checkedRowData.some((r: any) => r.VendorProductInventoryId === node.VendorProductInventoryId);
          node['isChecked'] = d;
        })
        this.rowData = _.sortBy(this.rowData,
          [function (o) { return !o.isChecked; }]);
      }
    }, error => {
      this.rowData = [];
      this.stopSpinner = true;
    });
  }

  onAgGridReadyEmit($event: any) {
    this.gridApi = $event;
    this.gridColumnApi = $event.columnApi;
  }
  onAgGridReady($event: any) {
    this.gridApi = $event;
    let dataSource: any = {
      rowCount: null,
      getRows: (params: any) => {
        let paramsRequest = params['request'];
        const filterArray:any = [];
        const filterArrayDate:any = [];
        const filterArrayNumber:any = [];

        for (var key in paramsRequest.filterModel) {
          let data = paramsRequest.filterModel[key];
          let arr;

            arr = {
              filterKey: key == 'ag-Grid-AutoColumn' ? 'ServiceNumber' : key,
              filterOptionType1: data['type'] ? data['type'] : data['condition1'].type ? data['condition1'].type : null,
              filterOptionValue1: data['filter'] ? data['filter'] : data['condition1'].filter ? data['condition1'].filter : null,
              filterOperationType: data['operator'] ? data['operator'] : 'AND',
              filterOptionType2: data['condition2']?.type ? data['condition2']?.type : null,
              filterOptionValue2: data['condition2']?.filter ? data['condition2']?.filter : null
            }
            filterArray.push(arr);
          
        }
        let data: any = {
          StartRowIndex:
            paramsRequest.startRow === 0 ? 1 : paramsRequest.startRow + 1,
          MaximumRows: 100
        };

        if (filterArrayDate && filterArrayDate.length > 0) {
          data['advanceDateFilter'] = filterArrayDate;
        }
        filterArray.push({
          "filterKey": "InventoryStatusDisplayText",
          "filterOptionType1": "equals",
          "filterOptionValue1": "Pending Activation",
          "filterOperationType": "OR",
          "filterOptionType2": "equals",
          "filterOptionValue2": "Active"
        })
        if (filterArray && filterArray.length > 0) {
          data['advanceFilter'] = filterArray;
        }

        if(filterArrayNumber && filterArrayNumber.length > 0) {
          data['advanceNumberFilter'] = filterArrayNumber;
        }

        data['CustomerAccountId'] = this.emitedData.AccountId;
        data['CompanyLocationId'] = this.emitedData['Id'];
        // data['ForLocationInventory'] = true;

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
        this._unsubscribeInventory.next(null);
        this.stopSpinner = false;
        this.wirelineService.getInventoryData(data)
          .pipe(takeUntil(this._unsubscribeInventory))
          .subscribe(
            async (data: any) => {
              this.stopSpinner = true;
              this.rowData = data.Data.$values;
 
              if (data && data.Data.$values.length > 0) {
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
                this.gridApi.api?.showNoRowsOverlay();
              }

              params.api.forEachNode(function (node: any) {
                node.setSelected(node.data.InventoryLocationAtt == 'Yes' ? true : false );
              });
            },
            (error) => {
              this.stopSpinner = true;
              params.successCallback([], 0 );
                this.gridApi.api?.showNoRowsOverlay();
            }
          );
      },
    };
    this.gridApi.setServerSideDatasource(dataSource);
  }

  processData(data: any[]) {
    const flattenedData: any[] = [];
    const flattenRowRecursive = (row: any, parentPath: string[]) => {
      const dataPath = [...parentPath, row.$id];
      flattenedData.push({ ...row, dataPath });
      if (row.ChildInventory && row.ChildInventory.$values.length > 0) {
        row.ChildInventory.$values.forEach((underling: any) => {
          flattenRowRecursive(underling, dataPath)
        }
        );
      }
    };
    data.forEach((row) => flattenRowRecursive(row, []));
    return flattenedData;
  }
  setColumnDefs() {
    this.columnDefs = [
  
      {
        headerName: 'Inventory',
        children: [
        
          {
            field: 'LocationPrimaryDisplay',
            headerName: 'Location Primary',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 170,
            width: 170
          },
          {
            field: 'InventoryStatusDisplayText',
            headerName: 'Status',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 145,
            width: 145
          }
        ],
      },
      {
        headerName: 'Product',
        children: [
          {
            field: 'VendorProductTypeName',
            headerName: 'Vendor Product',
            resizable: true,
            editable: false,
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            minWidth: 130,
          },
          {
            field: 'Service',
            headerName: 'Service',
            resizable: true,
            editable: false,
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            minWidth: 130,
          },
          {
            field: 'ServiceType',
            headerName: 'Service Type',
            resizable: true,
            editable: false,
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            minWidth: 140,
          },
          {
            field: 'Product',
            headerName: 'Product',
            editable: false,
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            minWidth: 140,
          },
          {
            field: 'ProductType',
            headerName: 'Product Type',
            editable: false,
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            minWidth: 145,
          },
        ],
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
            minWidth: 100,
          },
        ],
      },
   
  
    ];
  }

  onSelectionChangedEvent(event: any) {
    this.selectedIds = _.map(event, (e: any) => { return e.VendorProductInventoryId})
    this.request['vendorProductInventoryIds'] = this.selectedIds;
  }

  setInventory() {
    this.saveButtonDisabled = true;
    this.locationService.setLocationInventories(this.emitedData['Id'], this.request).pipe(takeUntil(this._unsubscribe)).subscribe((data: any) => {
      this.stopSpinner = true;
      this.saveButtonDisabled = false;
    
      if(data.Data?.ValidationKey == 'RemovePrimaryLocation') {
        const result =  _.map(data.Data.PrimaryVPIData.$values, (item: any) => ({
          fullLabel: `${item.ServiceNumber} - ${item.VendorProductTypeName}`,
          serviceNumber: item.ServiceNumber,
          vendorProductTypeName: item.VendorProductTypeName,
          vendorProductInventoryId: item.VendorProductInventoryId
        }))
 
        let errorData: any = {
          messgeType: "error",
          title: "Attention",
          titleClass: "text-c-blue",
          icon: "fas fa-exclamation-circle",
          iconClass: "text-c-blue f-70",
          message: this.tooltip(data.Message.replace(/(?:\r\n|\r|\n)/g, '<br>')),
          innerHtml: true,
          from: 'link-inventory',
          inventoryList: result,
          closeBtnName: 'I made the corrections! Save',
          okBtnName: 'Close & Review'
        }
        const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
        dialogRef.afterClosed().subscribe(result => {

          if(result == false) {
            this.setInventory();
          }
          if(data.Success)
            this.dialogRef.close(true);
        });
      } else {
        if(data.Success) {
          let errorData: any = {
            messgeType: 'error',
            title: 'Attention',
            titleClass: 'text-c-blue',
            icon: 'fas fa-exclamation-circle',
            iconClass: 'text-c-blue f-70',
            message: data.Message, //if messges is multiple use array
          };
          const dialogRef = this.dialog.open(ErrorWarningPopupComponent, {
            panelClass: 'error-warning',
            data: errorData,
          });

          dialogRef.afterClosed().subscribe(result => {
            this.dialogRef.close(true);
          });
        }
      }
     
    }, error => {
      this.stopSpinner = true;
      this.saveButtonDisabled = false;

    });
  }

  tooltip(data: any) {
    return `<span >${data} </span>`;
  }
}
