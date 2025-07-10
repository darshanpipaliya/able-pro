import { Component, OnInit } from '@angular/core';
import { AgGridTableComponent } from 'src/app/common/ag-grid-table/ag-grid-table.component';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { SharedModule } from 'src/app/demo/shared/shared.module';

@Component({
  selector: 'app-additional-bill-detail',
  templateUrl: './additional-bill-detail.component.html',
  styleUrls: ['./additional-bill-detail.component.scss'],
  imports: [SharedModule, PrimgModule, AgGridTableComponent]
})
export class AdditionalBillDetailComponent implements OnInit {

  public columnDefs1;
  rowData: any = [];
  rowSelection = 'multiple';
  defaultColDef = {
    editable: true,
    sortable: true,
    minWidth: 100,
    filter: true,
    resizable: true,
    floatingFilter: true,
    flex: 1,
  };
  sideBar = {
    toolPanels: ['columns', 'filters']
  };
  constructor() {
    this.columnDefs1 = [
      {
        headerName: 'Service',
        children: [
          {
            field: 'StatusValue',
            headerName: 'Status',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 300,
            flex: 0
          },
          {
            field: 'TEMAccountId',
            headerName: 'Billing ID',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 250,
            flex: 0
          },
          {
            field: 'TEMAccountId',
            headerName: 'Service Number',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 250,
            flex: 0
          }
        ],
      },
      {
        headerName: 'Charge Code',
        children: [
          {
            field: 'TEMAccountId',
            headerName: 'Charge Code',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 250,
            flex: 0
          }
        ],
      },
      {
        headerName: 'Charges',
        children: [
          {
            field: 'TEMAccountId',
            headerName: 'Charge',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 250,
            flex: 0
          }
        ],

      },
      {
        headerName: 'Product',
        children: [
          {
            field: 'Name',
            headerName: 'Vendor Product',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 250,
            flex: 0
          }
        ],
      },
      {
        headerName: 'Charge Descriptions',
        children: [
          {
            field: 'TEMAccountId',
            headerName: 'Charge Descriptions',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 300,
            flex: 0
          }
        ],
      }
    ];

    this.rowData = {
      "$id": "1",
      "ChargeCodeTypes": {
        "$id": "2",
        "$values": [
          {
            "$id": "3",
            "Id": 1010,
            "TEMAccountId": 1000,
            "Name": "Account Adjustment",
            "Description": null,
            "AllowInVendorProduct": '10 %',
            "CreatedBy": 1001,
            "ModifiedBy": 2383,
            "StatusValue": "Active",
            "childVendor": 'Account',
            "SystemLevel": '31',
            "ammount": '$ 2057'
          },
          {
            "$id": "11",
            "Id": 1009,
            "TEMAccountId": 1000,
            "Name": "Tranfer",
            "Description": null,
            "AllowInVendorProduct": '20 %',
            "CreatedBy": 1001,
            "ModifiedBy": 2755,
            "StatusValue": "Active",
            "childVendor": 'Mihir',
            "SystemLevel": '298',
            "ammount": '$ 807'
          },
          {
            "$id": "17",
            "Id": 1008,
            "TEMAccountId": 1000,
            "Name": "Credit",
            "Description": null,
            "AllowInVendorProduct": '60 %',
            "CreatedBy": 1001,
            "ModifiedBy": 2755,
            "StatusValue": "Active",
            "childVendor": 'Akash',
            "SystemLevel": '50',
            "ammount": '$ 9010'
          },
          {
            "$id": "36",
            "Id": 1007,
            "TEMAccountId": 1000,
            "Name": "Carrier Fees",
            "Description": null,
            "AllowInVendorProduct": '70 %',
            "CreatedBy": 1001,
            "ModifiedBy": 2383,
            "StatusValue": "Active",
            "childVendor": 'Darshan',
            "SystemLevel": '190',
            "ammount": '$ 1000'
          },
          {
            "$id": "50",
            "Id": 1006,
            "TEMAccountId": 1000,
            "Name": "Discount",
            "Description": null,
            "AllowInVendorProduct": '40 %',
            "CreatedBy": 1001,
            "ModifiedBy": 2755,
            "StatusValue": "Active",
            "childVendor": 'Krupali',
            "SystemLevel": '376',
            "ammount": '$ 1170'
          },
          {
            "$id": "64",
            "Id": 1005,
            "TEMAccountId": 1000,
            "Name": "Regulatory",
            "Description": null,
            "AllowInVendorProduct": '68 %',
            "CreatedBy": 1001,
            "ModifiedBy": 2755,
            "StatusValue": "Active",
            "SystemLevel": '125',
            "childVendor": 'Demo vendor',
            "ammount": '$ 1290'
          },
          {
            "$id": "81",
            "Id": 1004,
            "TEMAccountId": 1000,
            "Name": "Tax",
            "Description": null,
            "AllowInVendorProduct": '45 %',
            "CreatedBy": 1001,
            "ModifiedBy": 2755,
            "StatusValue": "Active",
            "childVendor": 'Vendor one',
            "SystemLevel": '103',
            "ammount": '$ 1900'
          },
          {
            "$id": "123",
            "Id": 1003,
            "TEMAccountId": 1000,
            "Name": "Equipment",
            "Description": null,
            "AllowInVendorProduct": '8 %',
            "CreatedBy": 1001,
            "ModifiedBy": 2755,
            "StatusValue": "Active",
            "childVendor": 'Tunisha',
            "SystemLevel": '201',
            "ammount": '$ 600'
          },
          {
            "$id": "131",
            "Id": 1002,
            "TEMAccountId": 1000,
            "Name": "Usage",
            "Description": null,
            "AllowInVendorProduct": '10 %',
            "CreatedBy": 1001,
            "ModifiedBy": 2755,
            "StatusValue": "Active",
            "childVendor": 'vijay',
            "SystemLevel": '61',
            "ammount": '$ 300'
          },
          {
            "$id": "158",
            "Id": 1001,
            "TEMAccountId": 1000,
            "Name": "Feature",
            "Description": "Charge code type is Feature",
            "AllowInVendorProduct": '11 %',
            "CreatedBy": 1001,
            "StatusValue": "Active",
            "childVendor": 'devarshi',
            "SystemLevel": '30',
            "ammount": '$ 985'
          },
          {
            "$id": "164",
            "Id": 1000,
            "TEMAccountId": 1000,
            "Name": "Product",
            "Description": "Charge code type is Product",
            "AllowInVendorProduct": '17 %',
            "CreatedBy": 1001,
            "StatusValue": "Active",
            "childVendor": 'hardik',
            "SystemLevel": '100',
            "ammount": '$ 720'
          }
        ]
      }
    }
  }

  ngOnInit(): void {
  }


}
