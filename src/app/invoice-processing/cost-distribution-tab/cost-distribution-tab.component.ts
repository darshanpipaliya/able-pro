import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import _ from 'lodash';
import { MatDialog } from '@angular/material/dialog';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { AgGridTableComponent } from 'src/app/common/ag-grid-table/ag-grid-table.component';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-cost-distribution-tab',
  templateUrl: './cost-distribution-tab.component.html',
  styleUrls: ['./cost-distribution-tab.component.scss'],
  imports: [SharedModule, PrimgModule, AgGridTableComponent, NgbTooltipModule]
})
export class CostDistributionTabComponent implements OnInit {

  @Input() sandBoxGridRowData: any;
  @Input() clickedRefresh: any;
  @Output() onCellClicked: EventEmitter<any> = new EventEmitter<any>();

  public sideBar: any;
  sbInvoiceId: any;
  columnDefsEvent: any;

  public columnDefs: any;
  rowData: any = [];
  rowDataEvent: any = [];
  rowSelection = 'multiple';
  defaultColDef: any = {
    editable: true,
    sortable: true,
    minWidth: 100,
    resizable: true,
    floatingFilter: true,
    flex: 1,
  };
   frameworkComponents: any;
  dialogRef: any;

  constructor(public dialog: MatDialog) {
    this.sideBar = {
      toolPanels: ['columns', 'filters']
    };

    
    this.columnDefs = [
      {
        headerName: 'Action',
        children: [
          {
            headerName: 'Action',
            filter: false,
            editable: false,
            width: 100,
            minWidth: 100,
            flex: 0,
            cellStyle: {
              'display': 'flex',
              'justify-content': 'center'
            },
            cellRenderer: function () {
              return '<i class="fa fa-edit"></i>'
            }
          }
        ]
      },
      {
        headerName: 'Status',
        children: [
          {
            field: 'DistributionStatus',
            headerName: 'Distribution Status',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 210
          },
        ],
      },
      {
        headerName: 'Amount',
        children: [
          {
            field: 'DistributionTotalCharge',
            headerName: 'Distribution Total',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 200
          }
        ],
      },
      {
        headerName: 'Account',
        children: [
          {
            field: 'PayableAccountNumber',
            headerName: 'Payable Account',
            filter: 'agTextColumnFilter',
            columnGroupShow: 'close',
            editable: false,
            minWidth: 210
          },
          {
            field: 'MainAccountNumber',
            headerName: 'Main Account',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 175
          },
          {
            field: 'SubAccountNumber',
            headerName: 'Sub Account',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 165
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
            minWidth: 165
          },
          {
            field: 'ChargeCodeTypeName',
            headerName: 'Charge Code Type',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 200
          },
          {
            field: 'ChargeTypeName',
            headerName: 'Charge Type',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 165
          },
          {
            field: 'ChargeLocationTypeName',
            headerName: 'Charge Location',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 185
          }
        ],
      }
    ];

    this.rowData = [{ DistributionStatus: "Needs Rule", DistributionTotal: "$20.00", PayableAccount: "789456232", MainAccount: "", SubAccount: "",  ChargeCodeName: "Walver", ChargeCode: "", ChargeCodeType: "Carrler Feed", ChargeType: "Walver", ChargeLocation: ""}];

    this.columnDefsEvent = [
      {
        headerName: 'Action',
        children: [
          {
            headerName: 'Action',
            filter: false,
            editable: false,
            width: 80,
            minWidth: 80,
            flex: 0,
            cellStyle: {
              'display': 'flex',
              'justify-content': 'center'
            },
            cellRenderer: function () {
              return '<i class="fa fa-edit"></i> <i class="fa fa-binoculars" aria-hidden="true"></i>'
            }
          }
        ]
      },
      {
        headerName: 'Status',
        children: [
          {
            field: 'DistributionEventStatusDisplay',
            headerName: 'Distribution Status',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 210
          },
        ],
      },
      {
        headerName: 'Distribution Details',
        children: [
          {
            field: 'DistributionEventId',
            headerName: 'Distribution Event',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 195
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
            minWidth: 165
          },
          {
            field: 'ChargeCodeType',
            headerName: 'Charge Code Type',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 200
          },
          {
            field: 'ChargeType',
            headerName: 'Charge Type',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 165
          },
          {
            field: 'ChargeLocationType',
            headerName: 'Charge Location',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 185
          }
        ],
      },
      {
        headerName: 'Distribution Rule',
        children: [
          {
            field: 'DistributionRuleType',
            headerName: 'Rule Type',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 210,
            flex: 0
          },
          {
            field: 'DistributionLevel',
            headerName: 'Distribution Level',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 195
          },
          {
            field: 'DistributionOriginLevelType',
            headerName: 'Distribution Origin',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 205
          },
          {
            field: 'DistributionMethodType',
            headerName: 'Distribution Method',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 215
          },
          {
            field: 'DistributionRuleOption',
            headerName: 'Rule Option',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 180
          },
          {
            field: 'DistributionRuleId',
            headerName: 'Distribution Rule',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 190
          }
        ],
      }
    ];
    
  }

  ngOnInit(): void {
  }

 

}
