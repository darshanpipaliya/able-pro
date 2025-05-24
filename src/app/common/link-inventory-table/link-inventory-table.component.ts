import { Component, EventEmitter, Inject, OnInit, Output, ViewChild } from '@angular/core';
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
import { CommonPTreeTableComponent } from '../common-p-tree-table/common-p-tree-table.component';
import { api_list } from 'src/app/services/api-list';
import { createColumn } from 'src/app/utils/column-utils';

interface ColumnDefinition {
  parent: number;
  isicon: number;
  width: string;
  valuesset: null;
  isenable: boolean;
  isChildren: boolean;
  type: string;
  header: string;
  columnGroupShow: string;
  field: string;
  childHeader: string;
  colspan: number;
  parentWidth: number;
  isParentVisible: boolean;
  displayCheckboxColumns: boolean;
  isToggle: boolean;
}

@Component({
  selector: 'app-link-inventory-table',
  templateUrl: './link-inventory-table.component.html',
  styleUrls: ['./link-inventory-table.component.scss'],
  imports: [
    SharedModule,
    PrimgModule,
    CommonPTreeTableComponent
  ],
  providers: [WirelineService]
})
export class LinkInventoryTableComponent implements OnInit {
  selectedIds: any = [];
  rowData: any;
  stopSpinner: boolean = true;
  saveButtonDisabled: boolean = false;
  columnDefs: any;

  request: any = {};
  checkedRowData: any = [];
  emitedData: any;
  close = "undefined";
  disableEdit: boolean = false;

  private _unsubscribe: Subject<any> = new Subject<any>();
  selectedNode: any;
  totalRecords: number = 0;
  refreshbutton: boolean = false;
  @ViewChild(CommonPTreeTableComponent) CommonPTreeTableComponent!: CommonPTreeTableComponent;

  @Output() tableDataExist: EventEmitter<any> = new EventEmitter();
  @Output() exportAccountData: EventEmitter<any> = new EventEmitter();
  @Output() selectedRowsEmit: EventEmitter<any> = new EventEmitter();
  @Output() rowCellDoubleClicked: EventEmitter<any> = new EventEmitter();
  @Output() loaderEmitParent: EventEmitter<any> = new EventEmitter();
  loader: boolean = false;
  payload: any = {};
  cols: any;
  GridAPI: any = api_list.Inventory.GridData;
  exportData: any = {};
  preAppliedfilterArr = [
    {
      "filterKey": "InventoryStatusDisplayText",
      "filterOptionType1": "equals",
      "filterOptionValue1": "Pending Activation",
      "filterOperationType": "OR",
      "filterOptionType2": "equals",
      "filterOptionValue2": "Active"
    }
  ];

  constructor(private locationService: LocationService,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) data: any, public wirelineService: WirelineService,
    private dialogRef: MatDialogRef<LinkInventoryTableComponent>) {
    this.emitedData = data[0];

    this.payload = {
      CustomerAccountId: this.emitedData.AccountId,
      CompanyLocationId: this.emitedData['Id']
    }
    dialogRef.disableClose = true;
    const previousData: any = [];
    if (isValueExist(data[1])) {
      data[1].map((f: any) => {
        previousData.push({ VendorProductInventoryId: f.VendorProductInventoryId });
      });
      this.checkedRowData = previousData;
    }
  }
  ngOnInit(): void {
    this.disableEdit = rolePermission(['CompanyUser', 'TEMUser']);
    this.setCols();
  }

  ngOnDestroy() {
    this._unsubscribe.next(null);
    this._unsubscribe.complete();
  }

  setCols() {
    // Initialize parent counter
    let currentParent = 0;

    // Function to determine parent ID
    const getParentId = (isChild: boolean) => isChild ? ++currentParent : currentParent;

    this.cols = [
      // Inventory Group
      createColumn(getParentId(true), '60px', true, 'checkbox', '', 'checkbox', ''),
      createColumn(getParentId(true), '170px', true, 'text', '', 'ServiceNumber', 'Service Number', 'close'),
      
      createColumn(getParentId(true), '170px', true, 'text', 'Inventory', 'LocationPrimaryDisplay', 'Location Primary', 'close'),
      createColumn(currentParent, '145px', false, 'text', '', 'InventoryStatusDisplayText', 'Status', 'close'),

      // Product Group
      createColumn(getParentId(true), '130px', true, 'text', 'Product', 'VendorProductTypeName', 'Vendor Product', 'close'),
      createColumn(currentParent, '130px', false, 'text', '', 'Service', 'Service', 'open'),
      createColumn(currentParent, '140px', false, 'text', '', 'ServiceType', 'Service Type', 'open'),
      createColumn(currentParent, '140px', false, 'text', '', 'Product', 'Product', 'open'),
      createColumn(currentParent, '145px', false, 'text', '', 'ProductType', 'Product Type', 'open'),

      // Vendor Group
      createColumn(getParentId(true), '100px', true, 'text', 'Vendor', 'VendorAccountName', 'Vendor', 'close'),
    ];
  }

  setInventory() {
    this.saveButtonDisabled = true;
    this.locationService.setLocationInventories(this.emitedData['Id'], this.request).pipe(takeUntil(this._unsubscribe)).subscribe((data: any) => {
      this.stopSpinner = true;
      this.saveButtonDisabled = false;

      if (data.Data?.ValidationKey == 'RemovePrimaryLocation') {
        const result = _.map(data.Data.PrimaryVPIData.$values, (item: any) => ({
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

          if (result == false) {
            this.setInventory();
          }
          if (data.Success)
            this.dialogRef.close(true);
        });
      } else {
        if (data.Success) {
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
    this.selectedIds = _.map(event, (e: any) => { return e.VendorProductInventoryId })
    this.request['vendorProductInventoryIds'] = this.selectedIds;
  }

  onSelectionChangedEvent(event: any) {
    this.selectedIds = _.map(event, (e: any) => { return e.VendorProductInventoryId })
    this.request['vendorProductInventoryIds'] = this.selectedIds;
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
