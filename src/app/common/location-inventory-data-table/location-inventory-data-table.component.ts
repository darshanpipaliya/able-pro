import { Component, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import _ from 'lodash';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { WirelineService } from 'src/app/services/wireline.service';
import { isValuesUndefined, rolePermission } from 'src/app/services/helper';
import { LinkInventoryTableComponent } from '../link-inventory-table/link-inventory-table.component';
import { CommonPTreeTableComponent } from '../common-p-tree-table/common-p-tree-table.component';
import { api_list } from 'src/app/services/api-list';
import { LocationService } from 'src/app/services/location.service';

interface arrDate {
  filterKey: any;
  filterOptionType1: any;
  filterOptionValue1: any;
  filterOptionValue1_2?: any;
  filterOptionValue2_2?: any;
  filterOperationType: any;
  filterOptionType2: any;
  filterOptionValue2: any;
}

@Component({
  selector: 'app-location-inventory-data-table',
  templateUrl: './location-inventory-data-table.component.html',
  styleUrls: ['./location-inventory-data-table.component.scss'],
  imports: [
    SharedModule,
    PrimgModule,
    CommonPTreeTableComponent
  ],
  providers: [
    WirelineService,
    LocationService
  ]
})
export class LocationInventoryDataTableComponent implements OnInit {

  @Input() contactDataEmit: any;
  @Output() InventoryEmit: EventEmitter<any> = new EventEmitter<any>();
  @Output() disableEditEmit: EventEmitter<any> = new EventEmitter<any>();
  @Output() redirectTab: EventEmitter<any> = new EventEmitter<any>();
  @Output() disableExport: EventEmitter<any> = new EventEmitter<any>();

  public exportLocationDetail: any;
  public exportLocationData: any;

  rowData: any;
  columnDefs: any;

  gridColumnApi: any;
  disableEdit: boolean = false;

  public advanceFilter: any;

  private _unsubscribeInventory: Subject<any> = new Subject<any>();
  CompanyUser = false;

  /* p-table start */

  selectedNode: any;
  public exportAccounts: any;
  isApiAlerdayCall: boolean = false;
  isDisableExportBtn: boolean = false;

  refreshbutton: boolean = false;
  loading: boolean = false;
  cols: any;
  totalRecords: number = 0;
  @ViewChild(CommonPTreeTableComponent) CommonPTreeTableComponent!: CommonPTreeTableComponent;

  @Output() tableDataExist: EventEmitter<any> = new EventEmitter();
  @Output() exportAccountData: EventEmitter<any> = new EventEmitter();
  @Output() selectedRowsEmit: EventEmitter<any> = new EventEmitter();
  @Output() rowCellDoubleClicked: EventEmitter<any> = new EventEmitter();
  @Output() loaderEmitParent: EventEmitter<any> = new EventEmitter();
  loader: boolean = false;
  payload: any = {};
  GridAPI: any = api_list.Inventory.GridData;
  exportData: any = {};
  preAppliedfilterArr = [
    {
      "filterKey": "InventoryLocationAtt",
      "filterOptionType1": "Equal",
      "filterOptionValue1": "Yes",
      "filterOperationType": "AND",
      "filterOptionType2": null,
      "filterOptionValue2": null
    },
    {
      "filterKey": "InventoryStatusDisplayText",
      "filterOptionType1": "equals",
      "filterOptionValue1": "Pending Activation",
      "filterOperationType": "OR",
      "filterOptionType2": "equals",
      "filterOptionValue2": "Active"
    }
  ];
  /* p-table end */
  constructor(public wirelineService: WirelineService,
    public locationService: LocationService,
    public dialog: MatDialog) { }

  ngOnInit(): void {
    this.payload = {
      CompanyLocationId: this.contactDataEmit.Id ? this.contactDataEmit.Id : null,
    };
    this.setCols();
    this.loading = false;
    this.disableEdit = rolePermission(['CompanyUser', 'TEMUser']);
    this.CompanyUser = rolePermission(['CompanyUser']);
    this.disableEditEmit.emit(rolePermission(['CompanyUser', 'TEMUser']))
    this.InventoryEmit.emit(true);
  }

  ngOnDestroy() {
    this._unsubscribeInventory.next(null);
    this._unsubscribeInventory.complete();
    this.InventoryEmit.emit(false);
  }

  onCellDoubleClicked(data: any) {
    if (data.colDef.field == "ServiceNumber") {
      this.redirectTab.emit({ rowData: data.data, redirectIndex: 6 });
    }
  }

  onBtnExportDataAsExcel() {
    this.isDisableExportBtn = true;
    this.CommonPTreeTableComponent.setColumnDefs();

    this.locationService
      .callPTreeTabAPIExport(this.GridAPI, this.exportData, 'POST')
      .subscribe({
        next: (data: any) => {
          this.isDisableExportBtn = false;
          let bolbUrl = URL.createObjectURL(data);
          var link = document.createElement("a");
          link.setAttribute("href", bolbUrl);
          link.setAttribute("download", "Locations Inventory.xlsx");
          link.style.display = "none";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        },
        error: (error: any) => {
          this.isDisableExportBtn = false;
        }
      });
  }


  openInventoryGrid() {
    const dialogRef = this.dialog.open(LinkInventoryTableComponent, {
      panelClass: ['width-1100', 'location-contact-popup-c'],
      data: [this.contactDataEmit, this.rowData],
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (!isValuesUndefined(result)) {
        this.refreshbuttonEmitFn(true);
      }
    })
  }

  setCols() {
    const createColumn = (parent: any, width: any, isChildren: any, type: any, header: any, field: any, childHeader: any, columnGroupShow = 'close', colspan = 1, parentWidth = 150, isParentVisible = true, displayCheckboxColumns = true, isToggle = true) => ({
      parent,
      isicon: 1,
      width,
      valuesset: null,
      isenable: false,
      isChildren,
      type,
      header,
      columnGroupShow,
      field,
      childHeader,
      colspan,
      parentWidth,
      isParentVisible,
      displayCheckboxColumns,
      isToggle
    });

    this.cols = [

      createColumn(1, '60px', true, 'checkbox', '', 'checkbox', ''),

      createColumn(2, '180px', true, 'text', '', 'ServiceNumber', 'Service Number'),

      createColumn(3, '161px', true, 'text', 'Organization', 'CustomerAccountName', 'Customer'),
      createColumn(3, '170px', false, 'text', '', 'CompanyName', 'Company', 'open'),

      createColumn(4, '150px', true, 'text', 'Vendor', 'VendorAccountName', 'Vendor'),

      createColumn(5, '200px', true, 'text', 'Product', 'VendorProductTypeName', 'Vendor Product'),

      createColumn(6, '161px', true, 'text', 'Status', 'InventoryStatusDisplayText', 'Status'),
      createColumn(6, '170px', false, 'text', '', 'BillingChargeDisplayText', 'Billing?', 'open'),

      createColumn(7, '170px', true, 'text', 'Location', 'LocationDisplay', 'Location'),
    ];
  }


  /* p-table end */
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
    this.exportData = event;
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
}