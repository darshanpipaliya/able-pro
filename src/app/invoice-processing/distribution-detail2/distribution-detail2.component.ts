import { Component, OnInit } from '@angular/core';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { AgGridTableComponent } from 'src/app/common/ag-grid-table/ag-grid-table.component';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { SharedModule } from 'src/app/demo/shared/shared.module';

@Component({
  selector: 'app-distribution-detail2',
  templateUrl: './distribution-detail2.component.html',
  styleUrls: ['./distribution-detail2.component.scss'],
  imports: [SharedModule, PrimgModule, AgGridTableComponent, NgbTooltipModule]
})
export class DistributionDetail2Component implements OnInit {

  public sideBar: any;
  sbInvoiceId: any;
  columnDefs2: any;

  public columnDefs: any;
  rowData: any = [];
  rowDataSecond: any = [];
  rowSelection = 'multiple';
  defaultColDef: any = {
    editable: true,
    sortable: true,
    minWidth: 100,
    resizable: true,
    floatingFilter: true,
    flex: 1,
  };
  constructor() {
    this.sideBar = {
      toolPanels: ['columns', 'filters']
    };

    this.columnDefs = [
      {
        headerName: '',
        children: [
          {
            headerName: 'Action',
            filter: false,
            editable: false,
            minWidth: 120,
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
            minWidth: 201
          },
        ],
      },
      {
        headerName: 'Distribution Details',
        children: [
          {
            field: 'AmountDistributed',
            headerName: 'Amount Distributed',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 210
          },
          {
            field: 'DistributionTo',
            headerName: 'Distribution To',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 175
          },
          {
            field: 'Difference',
            headerName: 'Difference',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 145
          },
          {
            field: 'DistributionEvent',
            headerName: 'Distribution Event',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 200
          }
        ],
      },
      {
        headerName: 'Distribution Rule',
        children: [
          {
            field: 'RuleType',
            headerName: 'Rule Type',
            filter: 'agTextColumnFilter',
            columnGroupShow: 'close',
            editable: false,
            minWidth: 185
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
            field: 'DistributionOrigin',
            headerName: 'Distribution Origin',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 205
          },
          {
            field: 'DistributionMethod',
            headerName: 'Distribution Method',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 215
          },
          {
            field: 'RuleOption',
            headerName: 'Rule Option',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 160
          },
          {
            field: 'DistributionRule',
            headerName: 'Distribution Rule',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 190
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
            field: 'ChargeLocation',
            headerName: 'Charge Location',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 185
          }
        ],
      },
      {
        headerName: 'Account',
        children: [
          {
            field: 'BillingID',
            headerName: 'Billing ID',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 140
          },
          {
            field: 'MainAccount',
            headerName: 'Main Account',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 175
          },
          {
            field: 'SubAccount',
            headerName: 'Sub Account',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 165
          },
          {
            field: 'PayableAccount',
            headerName: 'Payable Account',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 190
          }
        ],
      }
    ];
    this.rowData = [{ DistributionStatus: "Complete", AmountDistributed: "50", DistributionTo: "14", Difference: "", DistributionEvent: "5", RuleType: "% of Vendor Product", DistributionLevel: "", DistributionOrigin: "", DistributionMethod: "", RuleOption: "", DistributionRule: "", ChargeCodeName: "Acct Management Fee", ChargeCode: "", ChargeCodeType: "", ChargeType: "", ChargeLocation: "", BillingID: "198574987", MainAccount: "", SubAccount: "", PayableAccount: ""}];

    this.columnDefs2 = [
     
      {
        headerName: 'Account',
        children: [
          {
            field: 'BillingID',
            headerName: 'Billing ID',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            width: 140,
            minWidth: 140,
            flex: 0
          },
          {
            field: 'PayableAccountNumber',
            headerName: 'Payable Account Number',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 140
          },
          {
            field: 'MainAccount',
            headerName: 'Main Account',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 175
          },
          {
            field: 'SubAccount',
            headerName: 'Sub Account',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 165
          }
        ],
      },
      {
        headerName: 'Distribution',
        children: [
          {
            field: 'ItemizedDetail',
            headerName: 'Itemized Detail',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 180
          },
          {
            field: 'DistributionEvent',
            headerName: 'Distribution Event',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 200
          }
        ],
      },
      {
        headerName: 'Distribution Rule',
        children: [
          {
            field: 'RuleType',
            headerName: 'Rule Type',
            filter: 'agTextColumnFilter',
            columnGroupShow: 'close',
            editable: false,
            width: 190,
            flex: 0,
            minWidth: 190
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
            field: 'DistributionOrigin',
            headerName: 'Distribution Origin',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 205
          },
          {
            field: 'DistributionMethod',
            headerName: 'Distribution Method',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 215
          },
          {
            field: 'RuleOption',
            headerName: 'Rule Option',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 180
          },
          {
            field: 'DistributionRule',
            headerName: 'Distribution Rule',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 190
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
            field: 'ChargeLocation',
            headerName: 'Charge Location',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 185
          }
        ],
      }
    ];
    this.rowDataSecond = [{ BillingID: "8135426587", PayableAccountNumber: "789456232", MainAccount: "", SubAccount: "", ItemizedDetail: "$3.46", DistributionEvent: "1", RuleType: "% of Billing ID Total", DistributionLevel: "Group Pool Product", DistributionOrigin: "", DistributionMethod: "", RuleOption: "", DistributionRule: "", ChargeCodeName: "Acct Management Fee", ChargeCode: "", ChargeCodeType: "", ChargeType: "", ChargeLocation: ""}];
  }

  ngOnInit(): void {
  }

}
