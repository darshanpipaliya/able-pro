import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import moment from 'moment';
import _ from 'lodash';
import { CostStructureService } from '../services/cost-structure.service';
import { LocalStorageService } from '../services/local-storage.service';
import { SessionStorageService } from '../services/session-storage.service';
import { isValueExist } from '../services/helper';
import { SharedModule } from '../demo/shared/shared.module';
import { PrimgModule } from '../demo/shared/primeng.module';
import { AgGridModule } from 'ag-grid-angular';
import { AgGridTableComponent } from '../common/ag-grid-table/ag-grid-table.component';
import { ModuleRegistry, ServerSideRowModelModule } from 'ag-grid-enterprise';

ModuleRegistry.registerModules([ServerSideRowModelModule]);
@Component({
  selector: 'app-cost-center-structure-main',
  templateUrl: './cost-center-structure-main.component.html',
  styleUrls: ['./cost-center-structure-main.component.scss'],
  providers: [CostStructureService],
  imports: [SharedModule, PrimgModule, AgGridModule, AgGridTableComponent]
})
export class CostCenterStructureMainComponent implements OnInit {

  public sideBar;
  responseData: any;
  gridApi: any;
  @Input() selectedTem: any;
  @Input() selectedCustomer: any;
  private _unsubscribeGRid: Subject<any> = new Subject<any>();
  @Output() rowCellDoubleClicked: EventEmitter<any> = new EventEmitter();
  @Output() selectedTemCCS: EventEmitter<any> = new EventEmitter<any>();
  @Output() exportCCSExcelData: EventEmitter<any> = new EventEmitter<any>();
  @Output() isCCSData: EventEmitter<any> = new EventEmitter<any>();

  public exportCCData: any;
  public exportCCDetail: any;
  girdDataCount = 0;

  isSuperTem = false;
  isFilterData = false;
  CustomerAdmin = false;
  isTemUser = false;

  public columnDefs1;
  rowSelection = 'multiple';
  defaultColDef = {
    editable: true,
    sortable: true,
    minWidth: 100,
    resizable: true,
    floatingFilter: true,
    flex: 1,
  };
  gridOptions: any = {
    rowModelType: 'serverSide',
    serverSideInfiniteScrollOptions: {
      storeType: 'partial',
      cacheBlockSize: 100
    },
    enableFiltering: true,
    headerHeight: 35,
    groupHeaderHeight: 37,
    floatingFiltersHeight: 35
  };
  @ViewChild('PeopleAssignment') PeopleAssignment!: TemplateRef<any>;

  constructor(public dialog: MatDialog, private localStorageService: LocalStorageService, private sessionStorageService: SessionStorageService, private costStructureService: CostStructureService) {
    this.sideBar = {
      toolPanels: ['columns', 'filters']
    };
    this.columnDefs1 = [
      {
        headerName: 'Organization',
        children: [
          {
            field: 'CustomerAccountName',
            headerName: 'Customer',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 140,
            sortingField: 'CustomerAccountName'
          },
          {
            field: 'CompanyName',
            headerName: 'Company',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 140,
            sortingField: 'CompanyName'
          },
          {
            field: 'TEMAccountName',
            headerName: 'TEM',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 105,
            sortingField: 'TEMAccountName'
          }
        ],
      },
      {
        headerName: 'Cost Center',
        children: [
          {
            field: 'CostCenterGLCodeFormatted',
            headerName: 'Cost Center',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 155,
            sortingField: 'CostCenterGLCodeFormatted'
          }
        ]
      },
      {
        headerName: 'Approver',
        children: [
          {
            field: 'PeopleApproverName',
            headerName: 'Approver Name',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 180,
            sortingField: 'PeopleApproverName'
          },
          {
            field: 'PeopleApproverEmail',
            headerName: 'Approver Email',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 180,
            sortingField: 'PeopleApproverEmail'
          }
        ]
      },
      {
        headerName: 'Service',
        children: [
          {
            field: 'ServiceTypeName',
            headerName: 'Service Type ',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 145,
            sortingField: 'ServiceTypeName'
          },
          {
            field: 'ProductName',
            headerName: 'Product',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 125,
            sortingField: 'ProductName'
          },
        ],
      },
      {
        headerName: 'Allocation',
        children: [
          {
            field: 'PercentageDisplay',
            headerName: '%',
            columnGroupShow: 'close',
            filter: 'agNumberColumnFilter',
            editable: false,
            minWidth: 110,
            sortingField: 'Percentage'
          }
        ]
      },
      {
        headerName: 'Allocated',
        children: [
          {
            field: 'ActualAllocatedPercentageDisplay',
            headerName: '%',
            columnGroupShow: 'close',
            filter: 'agNumberColumnFilter',
            editable: false,
            minWidth: 110,
            sortingField: 'ActualAllocatedPercentage'
          }
        ]
      },
      {
        headerName: 'Assignment',
        children: [
          {
            field: 'CostCenterStructureType',
            headerName: 'Assignment',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 155,
            sortingField: 'CostCenterStructureType'
          },
          {
            field: 'ServiceNumber',
            headerName: 'Service Number',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 185,
            sortingField: 'ServiceNumber'
          },
          {
            field: 'VendorProductTypeName',
            headerName: 'Vendor Product',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 185,
            sortingField: 'VendorProductTypeName'
          },
          {
            field: 'PeopleName',
            headerName: 'Name',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 115,
            sortingField: 'PeopleName'
          },
          {
            field: 'PeopleEmail',
            headerName: 'Email',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 140,
            sortingField: 'PeopleEmail'
          },
          {
            field: 'LocationName',
            headerName: 'Location name',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 180,
            sortingField: 'LocationName'
          },
          {
            field: 'LocationAddress1',
            headerName: 'Address One',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 135,
            sortingField: 'LocationAddress1'
          },
          {
            field: 'LocationAddress2',
            headerName: 'Address Two',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 135,
            sortingField: 'LocationAddress2'
          },
          {
            field: 'LocationCity',
            headerName: 'City',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 105,
            sortingField: 'LocationCity'
          },
          {
            field: 'StateName',
            headerName: 'State/Province',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 175,
            sortingField: 'StateName'
          },
          {
            field: 'LocationPostalCode',
            headerName: 'Zip/Postal Code ',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 165,
            sortingField: 'LocationPostalCode'
          }
        ],
      },
      {
        headerName: 'Status',
        children: [
          {
            field: 'CCStructureStatusDisplay',
            headerName: 'Status',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 110,
            sortingField: 'CCStructureStatusDisplay'
          },
          {
            field: 'CCStructureAllocationRuleTotalUsed',
            headerName: 'Times Used',
            columnGroupShow: 'open',
            filter: 'agNumberColumnFilter',
            editable: false,
            minWidth: 135,
            sortingField: 'CCStructureAllocationRuleTotalUsed'
          },
          {
            field: 'CCStructureAllocationRuleLastRan',
            headerName: 'Last Used',
            columnGroupShow: 'open',
            filter: 'agDateColumnFilter',
            editable: false,
            minWidth: 120,
            sortingField: 'CCStructureAllocationRuleLastRan'
          },
          {
            field: 'CreationDate',
            headerName: 'Create Date',
            columnGroupShow: 'open',
            filter: 'agDateColumnFilter',
            editable: false,
            minWidth: 135,
            valueFormatter: this.createDateFormatter,
            sortingField: 'CreationDate'
          },
          {
            field: 'CreatedByUser',
            headerName: 'Created By',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 155,
            sortingField: 'CreatedByUser'
          },
          {
            field: 'ModifiedByUser',
            headerName: 'Modified By',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 160,
            sortingField: 'ModifiedByUser'
          },
          {
            field: 'ModificationDate',
            headerName: 'Modified Date',
            columnGroupShow: 'open',
            filter: 'agDateColumnFilter',
            editable: false,
            minWidth: 180,
            valueFormatter: this.modifyDateFormatter,
            sortingField: 'ModificationDate'
          }
        ]
      }
    ];

  }
  createDateFormatter(params: any) {
    if (params && params.data && params.data.CreationDate) {
      let date = new Date(params.data.CreationDate);
      return moment(date).format('MM/DD/YYYY');
    } else {
      return '';
    }
  }

  modifyDateFormatter(params: any) {
    if (params && params.data && params.data.ModificationDate) {
      let date = new Date(params.data.ModificationDate);
      return moment(date).format('MM/DD/YYYY');
    }
    else {
      return '';
    }
  }

  ngOnInit(): void {
    let headerData:any = [];
    let ChildHeaderData:any = [];
    let i = 0;
    let childIndex = 0;
    _.map(this.columnDefs1, (x: any) => {
      if (isValueExist(x.headerName)) {
        i = i + 1;
        headerData.push({ position: i, title: x.headerName });
        if (x.children) {
          _.map(x.children, (y: any) => {
            childIndex = childIndex + 1;
            let obj: any = {Position: childIndex, Title: y.headerName, FieldName: y.field, HeaderPosition: i};
            if(y.field == 'PercentageDisplay' || y.field == 'ActualAllocatedPercentageDisplay') {
              obj['isPercentage'] = true; 
            }
            ChildHeaderData.push(obj)
          })
        }
      }
    });

    this.exportCCDetail = {
      ExportToExcelData: {
        HeaderData: headerData,
        ChildHeaderData: ChildHeaderData,
        fileName: "Cost Center Structures"
      },
      ExportToExcel: true
    };
    this.exportCCData = this.exportCCDetail;

    this.isSuperTem  =  this.sessionStorageService.getObjectValue('userRoles').includes("SuperTEMAdmin") || this.sessionStorageService.getObjectValue('userRoles').includes("SuperTEMManager") || this.sessionStorageService.getObjectValue('userRoles').includes("SuperTEMUser");
    this.CustomerAdmin = this.sessionStorageService.getObjectValue('userRoles').includes("CustomerAdmin");
    // Mihir - changes for auth
    this.isTemUser = this.sessionStorageService.getObjectValue('userRoles').includes("TEMAdmin") || this.sessionStorageService.getObjectValue('userRoles').includes("TEMManager") || this.sessionStorageService.getObjectValue('userRoles').includes("TEMUser");

  }
  getCostCenterStructureData(selectedCust = null) {
    this.selectedCustomer = selectedCust;
    const a = this.gridApi.api ? this.gridApi.api : this.gridApi;
    this.onAgGridReady(a);
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
          let arrDate;
          let arrNumber;
          if (key == 'PercentageDisplay') {
            key = 'Percentage'
          }
          if(key == 'ActualAllocatedPercentageDisplay') {
            key = 'ActualAllocatedPercentage';
          }
          if (key === 'CreationDate' || key === 'ModificationDate' || key == 'CCStructureAllocationRuleLastRan') {
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
          } else if(key == 'Percentage' || key == 'CCStructureAllocationRuleTotalUsed' || key == 'ActualAllocatedPercentage') {
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
          }  else {
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
        if(this.isSuperTem && !this.isFilterData) {
          filterArray.push({
            "filterKey": "ReconValue",
            "filterOptionType1": "equals",
            "filterOptionValue1": "SuperTEM",
            "filterOperationType": "AND",
            "filterOptionType2": null,
            "filterOptionValue2": null
          })
        }

        if(this.isTemUser && !this.isFilterData) {
          filterArray.push({
            "filterKey": "ReconValue",
            "filterOptionType1": "equals",
            "filterOptionValue1": "TEM",
            "filterOperationType": "AND",
            "filterOptionType2": null,
            "filterOptionValue2": null
          })
        }
        // } else if(this.isTemUser && this.isFilterData) {
        //   filterArray.push({
        //     "filterKey": "ReconValue",
        //     "filterOptionType1": "notEqual",
        //     "filterOptionValue1": "SuperTEM",
        //     "filterOperationType": "AND",
        //     "filterOptionType2": null,
        //     "filterOptionValue2": null
        //   })
        // }
        
        // if(this.CustomerAdmin && !this.isFilterData) {
        //   filterArray.push({
        //     "filterKey": "ReconValue",
        //     "filterOptionType1": "equals",
        //     "filterOptionValue1": "Customer",
        //     "filterOperationType": "AND",
        //     "filterOptionType2": null,
        //     "filterOptionValue2": null
        //   })
        // }
        if (filterArray && filterArray.length > 0) {
          data['advanceFilter'] = filterArray;
        }
        if(filterArrayNumber && filterArrayNumber.length > 0) {
          data['advanceNumberFilter'] = filterArrayNumber;
        }
        if (this.selectedTem != 'all') {
          data['TemAccountId'] = parseInt(this.selectedTem);
        }

        if (this.selectedCustomer != 'all') {
          data['customerAccountId'] = parseInt(this.selectedCustomer);
        }
        
        if (paramsRequest.sortModel.length > 0) {

          Object.values(params['columnApi']['columnController']['columnDefs']).forEach((key:any) => {
            if (key['children']) {
              Object.values(key['children']).forEach((k:any) => {
                if (k['field'] === paramsRequest.sortModel[0].colId) {
                  data['OrderBy'] = k['sortingField'];
                  data['SortOrder'] = paramsRequest.sortModel[0].sort;
                }
              });
            }
          });
        }
        this.exportCCData = { ...this.exportCCDetail, ...data };
        this.exportCCSExcelData.emit(this.exportCCData);
        this.costStructureService
          .getccStructures(data)
          .pipe(takeUntil(this._unsubscribeGRid))
          .subscribe(
            async (data: any) => {
            this.girdDataCount = _.cloneDeep(data?.TotalCount);
              if (data && data.Data.$values.length > 0) {
                data.Data.$values.length > 0 ? this.isCCSData.emit(true) : this.isCCSData.emit(false);
                this.selectedTemCCS.emit(this.selectedTem);
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
      this.gridApi.api.setGridOption('serverSideDatasource', dataSource);
    } else {
      this.gridApi.setGridOption('serverSideDatasource', dataSource);
    }
  }
  toggle() {
    this.onAgGridReady(this.gridApi)
  }
  openDialog4(): void {
    this.dialog.open(this.PeopleAssignment, {
      width: '900px',
      data: {
        colseButton: true,
      }
    });
  }
  onCellDoubleClicked($event: any) {
    this.rowCellDoubleClicked.emit($event.data);
  }

  ngOnDestroy() {
    this._unsubscribeGRid.next(null);
    this._unsubscribeGRid.complete();
  }
}
