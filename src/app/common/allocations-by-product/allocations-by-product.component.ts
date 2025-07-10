import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import _ from 'lodash';
import { InvoiceService } from 'src/app/services/invoice.service';
import { isValueExist } from 'src/app/services/helper';
import { ErrorWarningPopupComponent } from '../error-warning-popup/error-warning-popup.component';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { AgGridTableComponent } from '../ag-grid-table/ag-grid-table.component';
import { InvoiceOverviewIComponent } from '../invoice-overview-i/invoice-overview-i.component';
import { ModuleRegistry, ServerSideRowModelModule } from 'ag-grid-enterprise';
import { ClientSideRowModelModule } from 'ag-grid-community';
ModuleRegistry.registerModules([ClientSideRowModelModule, ServerSideRowModelModule]);

@Component({
  selector: 'app-allocations-by-product',
  templateUrl: './allocations-by-product.component.html',
  styleUrls: ['./allocations-by-product.component.scss'],
  standalone: true,
  providers: [],
  imports: [SharedModule, PrimgModule, AgGridTableComponent, InvoiceOverviewIComponent]
})
export class AllocationsByProductComponent implements OnInit {

  @Input() clickedRecord : any;
  @Input() gridRowData : any;
  @Input() allocationType : any;
  @Input() showFinished : any;
  @Input() fromRecon : any;
  @Input() fromTab : any;
  @Input() selectedTab : any;

  
  @Output() resetVariable: EventEmitter<any> = new EventEmitter<any>();
  @Output() onExportDisableEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() redirectAllocationTab: EventEmitter<any> = new EventEmitter<any>();
  @Output() redirectToRuleTab: EventEmitter<any> = new EventEmitter<any>();
  @Output() isRecordFinished: EventEmitter<any> = new EventEmitter<any>();
  costAllocationByCCStructureFilter: any = {};


  public exportCCData: any = {};
 
  productHeaderData : any;
  structureHeaderData : any;
  refreshDatas = false;
  public sideBar : any;
  VendorProductInventoryId: any;

  gridApi: any;
  gridApiStructure: any;
  isShowDetail = false;

  overViewData : any;
  gridColumnApi: any;
  cols: any[];

  gridOptions = {
    rowModelType: 'serverSide',
    serverSideInfiniteScroll: true,
    enableFiltering: true,
    headerHeight: 35,
    groupHeaderHeight: 37,
    floatingFiltersHeight: 35,
    rowSelection: {
      type: 'multiple',
      enableClickSelection: true
    },
  };

  public columnDefs1;
  public columnDefs2;
  rowData1: any = [];
  rowData2: any = [];
  defaultColDef = {
    editable: true,
    sortable: true,
    minWidth: 100,
    resizable: true,
    floatingFilter: true,
    flex: 1,
  };
  private _unsubscribeGRid: Subject<any> = new Subject<any>();
  private _unsubscribeGRidStructure: Subject<any> = new Subject<any>();

  isEnableFinished: boolean = false;

  @ViewChild('CostAllocationVendorProduct') CostAllocationVendorProduct!: TemplateRef<any>;
  @ViewChild('CostCenterStructureDetail') CostCenterStructureDetail!: TemplateRef<any>;

  constructor(public dialog: MatDialog, private invoiceService: InvoiceService) {
    this.sideBar = {
      toolPanels: ['columns', 'filters']
    };
    this.columnDefs1 = [
      {
        headerName: 'Inventory',
        children: [
          {
            field: 'ServiceNumber',
            headerName: 'Service Number',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 170,
            sortingField: 'ServiceNumber',
            cellClass: "ag-cell-add-btn",
            cellRenderer: function (params: any) {
              return  params.data.AccrossInventory == true ? params.data.ServiceNumber + '<div><button class="btn btn-primary grid-cell-btn" style="padding: 2px 8px; font-size: 10px; position: relative; top: -1px; margin-left: 5px;">Added</button></div>' : params.data.ServiceNumber
            }
          },
          {
            field: 'MainAccountNumber',
            headerName: 'Main Account Number',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 210,
            sortingField: 'MainAccountNumber'
          },
          {
            field: 'SubAccountNumber',
            headerName: 'Sub Account Number',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 200,
            sortingField: 'SubAccountNumber',
          }
        ],
      },
      {
        headerName: 'Vendor',
        children: [
          {
            field: 'VendorAccountName',
            headerName: 'Vendor',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 125,
            sortingField: 'VendorAccountName'
          }
        ]
      },
      {
        headerName: 'Product',
        children: [
          {
            field: 'VendorProductTypeName',
            headerName: 'Vendor Product',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 185,
            sortingField: 'VendorProductTypeName'
          },
          {
            field: 'ServiceName',
            headerName: 'Service',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 185,
            sortingField: 'ServiceName'
          },
          {
            field: 'ServiceType',
            headerName: 'Service Type',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 185,
            sortingField: 'ServiceType'
          },
          {
            field: 'ProductName',
            headerName: 'Product',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 185,
            sortingField: 'ProductName'
          },
          {
            field: 'ProductType',
            headerName: 'Product Type',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 185,
            sortingField: 'ProductType'
          },
          {
            field: 'IndustryName',
            headerName: 'Industry',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 185,
            sortingField: 'IndustryName'
          }
        ]
      },
      {
        headerName: 'Inventory Assignment',
        children: [
          {
            field: 'PrimaryAssignment',
            headerName: 'Primary',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 220,
            sortingField: 'PrimaryAssignment'
          },
          {
            field: 'PrimaryAssignmentName',
            headerName: 'Name',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 125,
            sortingField: 'PrimaryAssignmentName'
          },
          {
            field: 'PrimaryAssignmentId',
            headerName: 'Id',
            columnGroupShow: 'open',
            filter: 'agNumberColumnFilter',
            editable: false,
            minWidth: 135,
            sortingField: 'PrimaryAssignmentId'
          },
          {
            field: 'PrimaryAssignmentStatus',
            headerName: 'Status',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 125,
            sortingField: 'PrimaryAssignmentStatus'
          }
        ]
      },
      {
        headerName: 'Billed Charges',
        children: [
          {
            field: 'BilledChargesProductTotalDisplay',
            headerName: 'Product Total',
            columnGroupShow: 'close',
            filter: 'agNumberColumnFilter',
            editable: false,
            minWidth: 165,
            sortingField: 'BilledChargesProductTotal',
            cellStyle: {display: 'flex !important', 'justify-content': 'end','padding-right':'50px'}
          }
        ]
      },
      {
        headerName: 'Cost Allocation',
        children: [
          {
            field: 'CostAllocatedChargesTotalDisplay',
            headerName: 'Allocated Total',
            columnGroupShow: 'close',
            filter: 'agNumberColumnFilter',
            editable: false,
            minWidth: 155,
            sortingField: 'CostAllocatedChargesTotal',
            cellStyle: {display: 'flex !important', 'justify-content': 'end','padding-right':'50px'}
          },
          {
            field: 'CostAllocatedPercentageDisplay',
            headerName: '% Allocated',
            columnGroupShow: 'close',
            filter: 'agNumberColumnFilter',
            editable: false,
            minWidth: 133,
            sortingField: 'CostAllocatedPercentage'
          }
        ],
      },
      {
        headerName: 'Allocation Summary',
        children: [
          {
            field: 'PeopleApproverNames',
            headerName: 'Approver Name',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 200,
            sortingField: 'PeopleApproverNames'
          },
          {
            field: 'PeopleApproverEmails',
            headerName: 'Approver Email',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 180,
            sortingField: 'PeopleApproverEmails'
          }
        ]
      },
      {
        headerName: 'Service',
        children: [
          {
            field: 'CCServiceTypes',
            headerName: 'Service Type',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 200,
            sortingField: 'CCServiceTypes'
          },
          {
            field: 'CCProductNames',
            headerName: 'Product',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 180,
            sortingField: 'CCProductNames'
          }
        ]
      },
    ];

    this.columnDefs2 = [
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
        headerName: 'Service',
        children: [
          {
            field: 'ServiceTypeName',
            headerName: 'Service Type',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 140,
            sortingField: 'ServiceTypeName'
          },
          {
            field: 'ProductName',
            headerName: 'Product',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 160,
            sortingField: 'ProductName'
          }
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
          },
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
            headerName: 'Location Name',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 180,
            sortingField: 'LocationName'
          },
          {
            field: 'LocationId',
            headerName: 'Location ID',
            columnGroupShow: 'open',
            filter: 'agNumberColumnFilter',
            editable: false,
            minWidth: 135,
            sortingField: 'LocationId'
          },
          {
            field: 'LocationAddress1',
            headerName: 'Address1',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 135,
            sortingField: 'LocationAddress1'
          },
          {
            field: 'LocationAddress2',
            headerName: 'Address2',
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
            headerName: 'Zip/Postal Code',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 165,
            sortingField: 'LocationPostalCode'
          }
        ]
      },
      {
        headerName: 'Status',
        children: [
          {
            field: 'CCStructureStatusDisplay',
            headerName: 'Rule Status',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 130,
            sortingField: 'CCStructureStatusDisplay'
          }
        ]
      }
    ];  
  }

  ngOnInit(): void {
    let headerData:any = [];
    let ChildHeaderData:any = [];
    let i = 0;
    let childIndex = 0;
    _.map(this.columnDefs1, (x: any) => {
      if (isValueExist(x.headerName) && x.headerName !== " ") {
        i = i + 1;
        headerData.push({ position: i, title: x.headerName });
        if (x.children) {
          _.map(x.children, (y: any) => {
            childIndex = childIndex + 1;
            let obj: any = {
              Position: childIndex, Title: y.headerName, FieldName: y.field, HeaderPosition: i
             }
            if(y.field == 'CostAllocatedChargesTotalDisplay' || y.field == 'BilledChargesProductTotalDisplay' || y.field == 'CostAllocatedChargesTotalDisplay') {
              obj['isCurrency'] = true
            }
            if(y.field == 'CostAllocatedPercentageDisplay' || y.field == 'ActualAllocatedPercentageDisplay' || y.field == 'PercentageDisplay') {
              obj['isPercentage'] = true
            }
            ChildHeaderData.push(obj)
          })
        }
      }
    });
    headerData.pop();
    ChildHeaderData.pop();
    this.productHeaderData = {
      ExportToExcelData: {
        HeaderData: headerData,
        ChildHeaderData: ChildHeaderData,
        fileName: 'Allocation Vendor Product'
      },
      ExportToExcel: true
    };

    let headerData1:any = [];
    let ChildHeaderData1:any = [];
    let j = 0;
    let childIndex1 = 0;
    _.map(this.columnDefs2, (x: any) => {
      if (isValueExist(x.headerName) && x.headerName !== " ") {
        j = j + 1;
        headerData1.push({ position: j, title: x.headerName });
        if (x.children) {
          _.map(x.children, (y: any) => {
            childIndex1 = childIndex1 + 1;
            let obj1: any = {
              Position: childIndex, Title: y.headerName, FieldName: y.field, HeaderPosition: i
             }
            
            if(y.field == 'ActualAllocatedPercentageDisplay' || y.field == 'PercentageDisplay') {
              obj1['isPercentage'] = true
            }
            ChildHeaderData1.push(obj1)
          })
        }
      }
    });

    this.structureHeaderData = {
      ExportToExcelData: {
        HeaderData: headerData1,
        ChildHeaderData: ChildHeaderData1,
        fileName: 'Cost Center Structure'
      },
      ExportToExcel: true
    };
  }

  finish(){
    this.isRecordFinished.emit(true);
  }

  onBtnClick1(data: any) {
      this.redirectAllocationTab.emit({type: 'engine', rowData: data.rowData});
  }
  invoiceOverviewDataOutput(data: any) {
    this.overViewData = data;
    if(this.showFinished && (this.gridRowData.StatusCostAllocation || this.overViewData?.IsAllocation)){
      this.isEnableFinished = true;
    } else {
      this.isEnableFinished = false;
    }
  }

  ngOnChanges(changes: SimpleChanges) {

    if(this.showFinished && (this.gridRowData.StatusCostAllocation || this.overViewData?.IsAllocation)){
      this.isEnableFinished = true;
    } else {
      this.isEnableFinished = false;
    }

    if (changes?.['allocationType']?.currentValue == 'rerun') {
      this.refreshDatas = false;
      
       let errorData: any = {
          messgeType: "error",
          title: "Attention",
          titleClass: "text-c-blue",
          icon: "fas fa-exclamation-circle",
          iconClass: "text-c-blue f-70",
          message: '<p><strong>Reprocess Invoice</strong> will review both open and completed invoices to ensure that all Distributions and Allocations are consistent. If discrepancies are found, the system will either update them automatically or notify you of any that need to be created.</p><p>Before using this action, make sure to add any necessary Distributions or Cost Allocation Rules, or deactivate any that should no longer apply. This ensures that the system can accurately identify and notify you of any required corrections when a rule is no longer available.</p>',
          innerHtml: true
        }
        const dialogRef = this.dialog.open(ErrorWarningPopupComponent, {panelClass: 'error-warning', data: errorData });
        dialogRef.afterClosed().subscribe(result => {
            if(isValueExist(result)) {
                this.invoiceService.rerunAllocation(this.gridRowData.InvoiceId).subscribe((res: any) => {
                  if(res.Success) {
                    const a = this.gridApi.api ? this.gridApi.api : this.gridApi;
                    this.onAgGridReady(a);
                   
                    this.isShowDetail = false;
                  }
                  this.refreshDatas = true;
                  this.resetVariable.emit(true);
                });
              }
        });
    } else if (changes?.['allocationType']?.currentValue == 'export') {
      const data = this.exportCCData;
      data['fileName'] = `Cost Allocation ${this.gridRowData.InvoiceNumber}`;
      data['costAllocationByCCStructureFilter'] = this.costAllocationByCCStructureFilter ? this.costAllocationByCCStructureFilter : null;
      this.onExportDisableEvent.emit(true);
      this.invoiceService.costAllocationExcel(this.gridRowData.InvoiceId, data).subscribe({
        next: (data: any) => {
          this.resetVariable.emit(true);
          this.onExportDisableEvent.emit(false);

          let bolbUrl = URL.createObjectURL(data);
          var link = document.createElement("a");
          link.setAttribute("href", bolbUrl);
          link.setAttribute("download", `Cost Allocation ${this.gridRowData.InvoiceNumber}.xlsx`);
          link.style.display = "none";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        
        },
        error: error => {
          this.onExportDisableEvent.emit(false);
        }
      });
    }
  }

  onAgGridReady($event: any, reloadOveview = false) {

    this.gridApi = $event;
    let dataSource: any = {
      rowCount: null,
      getRows: (params: any) => {
        let paramsRequest = params['request'];
        const filterArray:any = [];
        const filterArrayNumber:any = [];
        for (var key in paramsRequest.filterModel) {
          let data = paramsRequest.filterModel[key];
          let arr;
          let arrNumber;
          if (key == 'BilledChargesProductTotalDisplay') {
            key = 'BilledChargesProductTotal'
          }
          if (key == 'CostAllocatedChargesTotalDisplay') {
            key = 'CostAllocatedChargesTotal'
          }
          if (key == 'CostAllocatedPercentageDisplay') {
            key = 'CostAllocatedPercentage'
          }
        
          if(key == 'BilledChargesProductTotal' || key == 'CostAllocatedChargesTotal' || key =='CostAllocatedPercentage') {
            arrNumber = {
              filterKey: key,
              filterOptionType1: data['type'] ? data['type'] : data['condition1'].type ? data['condition1'].type : null,
              filterOptionValue1: (data && data.filter) ? data.filter : (data['condition1'] && data['condition1']['filter']) ? data['condition1'].filter : null,
              filterOptionValue1_2 : (data && data.filter) ? data.filter : (data['condition1'] && data['condition1']['filterTo']) ? data['condition1']?.filterTo : null,
              filterOperationType: data['operator'] ? data['operator'] : 'AND',
              filterOptionType2: data['condition2']?.type ? data['condition2']?.type : null,
              filterOptionValue2: (data['condition2'] && data['condition2'].filter) ? data['condition2']?.filter : null,
              filterOptionValue2_2: (data['condition2'] && data['condition2'].filterTo) ? data['condition2']?.filterTo : null
            }
            filterArrayNumber.push(arrNumber);
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

        if (filterArray && filterArray.length > 0) {
          data['advanceFilter'] = filterArray;
        }
        if(filterArrayNumber && filterArrayNumber.length > 0) {
          data['advanceNumberFilter'] = filterArrayNumber;
        }
        // if (this.selectedTem != 'all') {
        //   data['TemAccountId'] = parseInt(this.selectedTem);
        // }

        // if (this.selectedCustomer != 'all') {
        //   data['customerAccountId'] = parseInt(this.selectedCustomer);
        // }


        this.exportCCData['costAllocationByVendorProductFilter'] = { ...data, ...this.productHeaderData };

        // this.exportCCSExcelData.emit(this.exportCCData);
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

        this.refreshDatas = false;
        this.invoiceService.getcostAllocationVendorProduct(this.gridRowData.InvoiceId, data)
          .pipe(takeUntil(this._unsubscribeGRid))
          .subscribe(
            async (data: any) => {

              if(reloadOveview) {
                this.refreshDatas = true;
              }
              if (data && data.Data.$values.length > 0) {
                data.Data.$values.length > 0 ? this.onExportDisableEvent.emit(false) : this.onExportDisableEvent.emit(true);
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

  onAgGridReadyStructure($event: any) {
 
    
    this.gridApiStructure = $event;
    let dataSource: any = {
      rowCount: null,
      getRows: (params: any) => {
        let paramsRequest = params['request'];
        const filterArray:any = [];
        const filterArrayNumber:any = [];
        let arr;
        let arrNumber;

        for (var key in paramsRequest.filterModel) {
          let data = paramsRequest.filterModel[key];

          if (key == 'PercentageDisplay') {
            key = 'Percentage'
          }
          if(key == 'ActualAllocatedPercentageDisplay') {
            key = 'ActualAllocatedPercentage';
          }
          if(key == 'Percentage' || key == 'ActualAllocatedPercentage') {
            arrNumber = {
                filterKey: key,
                filterOptionType1: data['type'] ? data['type'] : data['condition1'].type ? data['condition1'].type : null,
                filterOptionValue1: (data && data.filter) ? data.filter : (data['condition1'] && data['condition1']['filter']) ? data['condition1'].filter : null,
                filterOptionValue1_2 : (data && data.filter) ? data.filter : (data['condition1'] && data['condition1']['filterTo']) ? data['condition1']?.filterTo : null,
                filterOperationType: data['operator'] ? data['operator'] : 'AND',
                filterOptionType2: data['condition2']?.type ? data['condition2']?.type : null,
                filterOptionValue2: (data['condition2'] && data['condition2'].filter) ? data['condition2']?.filter : null,
                filterOptionValue2_2: (data['condition2'] && data['condition2'].filterTo) ? data['condition2']?.filterTo : null
              }
              filterArrayNumber.push(arrNumber);
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

        if (filterArray && filterArray.length > 0) {
          data['advanceFilter'] = filterArray;
        }
        if(filterArrayNumber && filterArrayNumber.length > 0) {
          data['advanceNumberFilter'] = filterArrayNumber;
        }

        data['VendorProductInventoryId'] = this.VendorProductInventoryId;
        data['InvoiceId'] = this.gridRowData.InvoiceId;
        this.exportCCData['costAllocationByCCStructureFilter'] = { ...data, ...this.structureHeaderData };
        this.costAllocationByCCStructureFilter = { ...data, ...this.structureHeaderData };

        // this.exportCCSExcelData.emit(this.exportCCData);
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

        this.invoiceService.getcostAllocationStructure(this.gridRowData.InvoiceId, data)
          .pipe(takeUntil(this._unsubscribeGRidStructure))
          .subscribe(
            async (data: any) => {
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
                this.gridApiStructure.showNoRowsOverlay();
              }
            },
            (error) => {
              params.success({
                rowData: [],
                rowCount: 0
              });
              this.gridApiStructure.showNoRowsOverlay();
            }
          );
      },
    };
    if(isValueExist(this.gridApiStructure)) {
      if (this.gridApiStructure.api) {
        this.gridApiStructure.api.setGridOption("serverSideDatasource", dataSource);
      } else {
        this.gridApiStructure.setGridOption("serverSideDatasource", dataSource);
      }
    }
  }
  
  onAgGridReadyEmit($event: any) {
    this.gridApi = $event.api;
    this.gridColumnApi = $event.columnApi;
  }
  onCellClicked(event: any) {
    this.VendorProductInventoryId = event.data.VendorProductInventoryId;
    if (event.data.CostAllocatedPercentage > 0) {
      this.isShowDetail = true;
      const a = this.gridApiStructure?.api ? this.gridApiStructure?.api : this.gridApiStructure;
      this.onAgGridReadyStructure(a)
    } else {
      this.isShowDetail = false;
    }
  }

  onCellDoubleClicked($event: any) {
    this.redirectToRuleTab.emit($event.data);
  }

  TooltipDialog1(): void {
    this.dialog.open(this.CostAllocationVendorProduct, {
      width: '900px',
      data: {
        colseButton: true,
      }
    });
  }

  TooltipDialog2(): void {
    this.dialog.open(this.CostCenterStructureDetail, {
      width: '900px',
      data: {
        colseButton: true,
      }
    });
  }

  ngOnDestroy() {
    this._unsubscribeGRidStructure.next(null);
    this._unsubscribeGRidStructure.complete();
    this._unsubscribeGRid.next(null);
    this._unsubscribeGRid.complete();
  }
}
