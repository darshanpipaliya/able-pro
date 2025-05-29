import { Component, Input, OnInit, Output, EventEmitter, ViewChild, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import moment from 'moment';
import { takeUntil } from 'rxjs/operators';
import _ from 'lodash';
import { MatDialog } from '@angular/material/dialog';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { WirelineService } from 'src/app/services/wireline.service';
import { isValueExist } from 'src/app/services/helper';
import { BillingLPTableComponent } from 'src/app/common/billing-l-p-table/billing-l-p-table.component';
import { CommonPTreeTableComponent } from 'src/app/common/common-p-tree-table/common-p-tree-table.component';
import { api_list } from 'src/app/services/api-list';
import { createColumn } from 'src/app/utils/column-utils';

@Component({
  selector: 'app-add-billing-l',
  templateUrl: './add-billing-l.component.html',
  styleUrls: ['./add-billing-l.component.scss'],
  imports: [SharedModule, PrimgModule, BillingLPTableComponent, CommonPTreeTableComponent],
  providers: [WirelineService]
})
export class AddBillingLComponent implements OnInit {

  @Input() rowData: any;
  @Input() pageName: any;
  public sideBar;
  public columnDefs1;
  public columnDefs2;
  public exportInvoiceSummaryData: any;
  public getDataPath: any = (data: any) => data.dataPath;
  @ViewChild('ccStructure') ccStructure!: TemplateRef<any>;

  isDisabledExport: boolean = false;
  submitted = false;

  sbInvoiceId: any;
  columnSubAccount: any;
  gridApi: any;
  gridColumnApi: any;
  matchRecord = [];
  displayRule = undefined;

  rowDataForInvoiceSummary: any = [];
  rowSelection = 'multiple';
  defaultColDef = {
    editable: false,
    sortable: true,
    minWidth: 100,
    resizable: true,
    floatingFilter: true,
    flex: 1,
  };

  public autoGroupColumnDef: any = {
    headerName: 'Service Number',
    field: 'BillingId',
    cellRendererParams: {
      suppressCount: true,
    },
    filterParams: {
      treeList: true,
    },
    filter: 'agTextColumnFilter',
    minWidth: 185,
    width: 185,
    resizable: true,
    editable: false,
  };

  @Output() getIdsArray: EventEmitter<any> = new EventEmitter<any>();
  @Output() redirectTab: EventEmitter<any> = new EventEmitter<any>();

  private readonly _unsubscribeGRid: Subject<any> = new Subject<any>();
  private readonly _unsubscribeGRidCCS: Subject<any> = new Subject<any>();


  payload: any;
  selectedNode: any;
  loader: boolean = false;
  totalRecords: number = 0;
  refreshbutton: boolean = false;
  cols: any;
  GridAPI: any = api_list.Inventory.getCostCenterStructureUrl;
  @Output() tableDataExist: EventEmitter<any> = new EventEmitter();
  @Output() exportAccountData: EventEmitter<any> = new EventEmitter();
  @Output() selectedRowsEmit: EventEmitter<any> = new EventEmitter();
  @Output() rowCellDoubleClicked: EventEmitter<any> = new EventEmitter();
  @Output() loaderEmitParent: EventEmitter<any> = new EventEmitter();
  constructor(private wirelineService: WirelineService, public dialog: MatDialog) {

    this.sideBar = {
      toolPanels: ['columns', 'filters']
    };

    this.columnDefs1 = [
      {
        headerName: 'Account',
        children: [
          {
            field: 'PayableAccount',
            headerName: 'Payable Account Number',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 210
          },
          {
            field: 'MainAccountNumber',
            headerName: 'Main Account Number',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 210
          },
          {
            field: 'Subaccount',
            headerName: 'Sub Account Number',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 200
          }
        ],
      },
      {
        headerName: 'Invoice',
        children: [
          {
            field: 'InvoiceDate',
            headerName: 'Invoice Date',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 140,
            valueGetter(params:any) {
              if (params.data && params.data?.InvoiceDate) {
                return moment(params.data.InvoiceDate).format('MM/DD/YYYY');
              }
              return '';
            }
          },
          {
            field: 'InvoiceNumber',
            headerName: 'Invoice Number',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 165
          }
        ]
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
            minWidth: 125
          }
        ]
      },
      {
        headerName: 'Product',
        children: [
          {
            field: 'VendorProductName',
            headerName: 'Vendor Product',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 185
          },
          {
            field: 'ServiceTypeName',
            headerName: 'Service Type ',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 145
          },
          {
            field: 'ServiceName',
            headerName: 'Service ',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 125
          },
          {
            field: 'ProductTypeName',
            headerName: 'Product Type',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 145
          },
          {
            field: 'ProductName',
            headerName: 'Product',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 110
          }
        ],
      },
      {
        headerName: 'Charge Code',
        children: [
          {
            field: 'ChargeCodeName',
            headerName: 'Charge Code Name',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 210
          },
          {
            field: 'ChargeCode',
            headerName: 'Charge Code',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 140
          },
          {
            field: 'ChargeCodeTypeName',
            headerName: 'Charge Code Type',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 180
          },
          {
            field: 'ChargeTypeName',
            headerName: 'Charge Type',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 140
          },
          {
            field: 'ChargeCodeOccurrence',
            headerName: 'Charge Occurrence',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 185
          }
        ]
      },
      {
        headerName: 'Charges',
        children: [
          {
            field: 'TotalChargeDisplay',
            headerName: 'Product Total',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 145
          },
          {
            field: 'ChargeDisplay',
            headerName: 'Charge',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 105
          },
          {
            field: 'DistributionEventId',
            headerName: 'Distribution Event ID',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 195
          }
        ]
      }
    ];

    this.columnDefs2 = [
      {
        headerName: 'Organization',
        children: [
          {
            field: 'CustomerAccountName',
            headerName: 'Customer',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 140
          },
          {
            field: 'CompanyName',
            headerName: 'Company',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 140
          },
          {
            field: 'TEMAccountName',
            headerName: 'TEM',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 105
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
            minWidth: 155
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
            minWidth: 145
          },
          {
            field: 'ProductName',
            headerName: 'Product',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 135
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
            minWidth: 110
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
            minWidth: 155
          },
          {
            field: 'VendorProductTypeName',
            headerName: 'Vendor Product',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 185
          },
          {
            field: 'PeopleName',
            headerName: 'Name',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 115
          },
          {
            field: 'PeopleEmail',
            headerName: 'Email',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 140
          },
          {
            field: 'LocationName',
            headerName: 'Location name',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 180
          },
          {
            field: 'LocationAddress1',
            headerName: 'Address',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 130
          },
          {
            field: 'LocationCity',
            headerName: 'City',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 105
          },
          {
            field: 'StateName',
            headerName: 'State',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 175
          }
        ],
      },
      {
        headerName: 'Status',
        children: [
          {
            field: 'InvoiceDate',
            headerName: 'Invoice Date',
            columnGroupShow: 'close',
            filter: 'agDateColumnFilter',
            editable: false,
            minWidth: 156,
            valueGetter(params:any) {
              if (params.data && params.data?.InvoiceDate) {
                return moment(params.data.InvoiceDate).format('MM/DD/YYYY');
              }
              return '';
            }
          },
          {
            field: 'CCStructureStatusDisplay',
            headerName: 'Status',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 110
          }
        ]
      }
    ];
  }

  ngOnInit(): void {

    if(this.pageName == 'location-tab') {
      this.payload = {
        CompanyLocationId: this.rowData.Id
      }
    } else {
      this.payload = {
        PeopleId: this.rowData.PeopleId
      }
    }

    
    this.setCols();
  }
  openTooltip() {
    this.dialog.open(this.ccStructure, {
      width: '900px'
    });
  }

  onAgGridReadyEmit($event:any) {
    this.gridApi = $event.api;
    this.gridColumnApi = $event.columnApi;
  }

  dataValuesFn(event: any) {
    this.sendPaylod(event);
  }
  sendPaylod(obj: any) {
    let a:any = [];
    let b:any = [];
    let c:any = [];

    _.forEach(obj, (data: any) => {
      if (data['data'].CostCenterStructureId != null) {
        a.push(data['data'].CostCenterStructureId);
      }
      if (data['data'].CCSXServiceServiceTypeId != null) {
        b.push(data['data'].CCSXServiceServiceTypeId);
      }
      if (data['data'].CCAllocationId != null) {
        c.push(data['data'].CCAllocationId);
      }
    });

    const payload = {
      CostCenterStructureId: a,
      CCStructureServiceXServiceTypeIds: b,
      CCAllocationAssignmentIds: c
    }
    this.getIdsArray.emit(payload);
  }
  
  export() {
    this.isDisabledExport = true;
    let rowData: any = [];
    this.gridApi.forEachNodeAfterFilter((node:any) => {
      rowData.push(node.data.InvoiceChargeDetailsId);
    });
    this.exportInvoiceSummaryData['ParentRecordIds'] = rowData;
    this.exportInvoiceSummaryData['VendorProductInventoryId'] = this.rowData.VendorProductInventoryId;
    this.wirelineService
      .getInvoiceSummryBillingMobilityExport(this.exportInvoiceSummaryData)
      .subscribe({
        next: data => {
          this.isDisabledExport = false;
          let bolbUrl = URL.createObjectURL(data);
          var link = document.createElement("a");
          link.setAttribute("href", bolbUrl);
          link.setAttribute("download", "Invoice Summary.xlsx");
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

  ngOnDestroy(): any {
    this._unsubscribeGRid.next(null);
    this._unsubscribeGRid.complete();
    this._unsubscribeGRidCCS.next(null);
    this._unsubscribeGRidCCS.complete();
  }

  redirectToCCS() {
    if(this.pageName == 'location-tab') {
      this.redirectTab.emit({redirectIndex: 6}); // no value
    } else {
      this.redirectTab.emit({redirectIndex: 4}); // no value
    }
  }

  
  /* p-table */

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

  setCols() {
 
    this.cols = [
      // Organization group
      createColumn(1, '140px', true, 'text', 'Organization', 'CustomerAccountName', 'Customer'),
      createColumn(1, '140px', false, 'text', '', 'CompanyName', 'Company'),
      createColumn(1, '105px', false, 'text', '', 'TEMAccountName', 'TEM', 'open'),
  
      // Cost Center group
      createColumn(2, '155px', true, 'text', 'Cost Center', 'CostCenterGLCodeFormatted', 'Cost Center'),
  
      // Approver group
      createColumn(3, '180px', true, 'text', 'Approver', 'PeopleApproverName', 'Approver Name'),
      createColumn(3, '180px', false, 'text', '', 'PeopleApproverEmail', 'Approver Email', 'open'),
  
      // Service group
      createColumn(4, '145px', true, 'text', 'Service', 'ServiceTypeName', 'Service Type'),
      createColumn(4, '135px', false, 'text', '', 'ProductName', 'Product', 'open'),
  
      // Allocation group
      createColumn(5, '110px', true, 'numberFilter', 'Allocation', 'PercentageDisplay', '%'),
  
      // Assignment group
      createColumn(6, '155px', true, 'text', 'Assignment', 'CostCenterStructureType', 'Assignment'),
      createColumn(6, '185px', false, 'text', '', 'VendorProductTypeName', 'Vendor Product', 'open'),
      createColumn(6, '115px', false, 'text', '', 'PeopleName', 'Name', 'open'),
      createColumn(6, '140px', false, 'text', '', 'PeopleEmail', 'Email', 'open'),
      createColumn(6, '180px', false, 'text', '', 'LocationName', 'Location name', 'open'),
      createColumn(6, '130px', false, 'text', '', 'LocationAddress1', 'Address', 'open'),
      createColumn(6, '105px', false, 'text', '', 'LocationCity', 'City', 'open'),
      createColumn(6, '175px', false, 'text', '', 'StateName', 'State', 'open'),
  
      // Status group
      createColumn(7, '156px', true, 'dateFilter', 'Status', 'InvoiceDate', 'Invoice Date'),
      createColumn(7, '110px', false, 'text', '', 'CCStructureStatusDisplay', 'Status')
    ];
  }


}
