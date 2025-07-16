import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import * as _ from 'lodash';
import { ChargeCodeAssignmentDialogComponent } from '../isd-by-billing-id/add-correction/charge-code-assignment-dialog/charge-code-assignment-dialog.component';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { ErrorWarningPopupComponent } from 'src/app/common/error-warning-popup/error-warning-popup.component';
import { UpdateChargeCodeGroupComponent } from 'src/app/management/edit-charge-code/update-charge-code-group/update-charge-code-group.component';
import { checkIsValueExists, checkIsValueExistswithZero } from 'src/app/services/helper';
import { LocationService } from 'src/app/services/location.service';
import { SandBoxService } from 'src/app/services/sandbox.service';
import { AgGridTableComponent } from 'src/app/common/ag-grid-table/ag-grid-table.component';
import { ChargeCodeAssignmentPtableComponent } from '../charge-code-assignment-ptable/charge-code-assignment-ptable.component';
import { AgGridModule } from 'ag-grid-angular';
import { ModuleRegistry, ServerSideRowModelModule } from 'ag-grid-enterprise';

ModuleRegistry.registerModules([ServerSideRowModelModule]);


@Component({
  selector: 'app-charge-code-assignment1',
  templateUrl: './charge-code-assignment1.component.html',
  styleUrls: ['./charge-code-assignment1.component.scss'],
  imports: [SharedModule, PrimgModule, AgGridModule , AgGridTableComponent, ChargeCodeAssignmentPtableComponent]
})
export class ChargeCodeAssignment1Component implements OnInit {
  public columnDefs1;
  public columnDefs2;
  private gridApi!: any;

  @Input() sbChargeDetailId: any;
  @Input() sandBoxGridRowData: any;
  @Input() overviewData: any;
  @Input() recordPublishedOrCompleted: any;
  @Input() step3mainData: any;
  @Input() SBChargeDetailIdsForCC: any;


  rowData: any = [];
  parentChargeRowData: any = [];
  defaultColDef = {
    editable: false,
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
  saveButtonDisabled = false;
  saveButtonDisabledForDistribution = false;
  SBChargeDetailIds: any;
  parentChargeId: any;
  isDisableSave: any;
  gridOptions = {
    headerHeight: 35,
    groupHeaderHeight: 37,
    floatingFiltersHeight: 35,
    isRowSelectable: (rowNode: any) => {
      return !rowNode.data.ParentChargeCodeId;
    }
  }
  additionalBillData: any;
  selectedRow: any;
  chargeCodeTypes: any = [];
  chargeCodeForm: FormGroup;
  parentChargeCodeForm: FormGroup;
  taxTypes: any = [];
  parenttaxTypes: any = [];
  codeOccurence: any = [];
  VendorBillingAliasId: any = 0;
  chargeCodeId: any = 0;
  parentChargeCodeSelected = false;
  chargeCodeContextSel: any;
  parentChargeValues: any;
  public getDataPath: any = (data: any) => data.dataPath;
  isChargeCodeFormSubmit: boolean = false;
  openDialog: boolean = false;
  showSaveButton: boolean = false;
  isMultipleCreate: boolean = false;

  public autoGroupColumnDef: any = {
    headerName: 'Charge Code Name',
    field: 'ChargeCodeName',
    cellRendererParams: {
      checkbox: true,
      suppressCount: true,
    },
    filterParams: {
      treeList: true,
    },
    filter: 'agTextColumnFilter',
    minWidth: 220,
    cellStyle: {
      display: "flex",
      'vertical-align': "middle"
    },
  };
  private _unsubscribeBillDetail: Subject<any> = new Subject<any>();
  private _unsubscribeCharge: Subject<any> = new Subject<any>();
  private _unsubscribeParent: Subject<any> = new Subject<any>();

  disabledAssignmentData = false;
  @Output() onSaveRedirect: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild('ChargeCodeAssignment') ChargeCodeAssignment!: TemplateRef<any>;
  @ViewChild('ChargeCodeAssignmentMulti') ChargeCodeAssignmentMulti!: TemplateRef<any>;

  constructor(public sandBoxService: SandBoxService, public fb: FormBuilder,
    public dialog: MatDialog,
    private locationService: LocationService) {
    this.columnDefs1 = [
      // {
      //   headerCheckboxSelection: false,
      //   checkboxSelection: true,
      //   floatingFilter: true,
      //   suppressMenu: true,
      //   minWidth: 150,
      //   maxWidth: 50,
      //   width: 100,
      //   flex: 0,
      //   resizable: true,
      //   sortable: false,
      //   filter: false,
      //   suppressColumnsToolPanel: true,
      // },
      {
        headerName: 'Status',
        children: [
          {
            field: 'Status',
            headerName: 'Status',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 115,
            minWidth: 115,
            flex: 0
          },
        ]
      },
      {
        headerName: 'Service',
        children: [
          {
            field: 'BillingId',
            headerName: 'Billing ID',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 130,
            width: 100,
            flex: 0,
            cellClass: "ag-cell-add-btn",
            cellRenderer: function (params : any) {
              return params.data.AccrossInventory == true ? params.data.BillingId + '<div><button class="btn btn-primary grid-cell-btn" style="padding: 2px 8px; font-size: 10px; position: relative; top: -1px; margin-left: 5px;">Added</button></div>' : params.data.BillingId
            }
          },
          {
            field: 'MainAccountNumber',
            headerName: 'Main Account Number',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 210,
            minWidth: 210,
            flex: 0
          },
          {
            field: 'SubAccountNumber',
            headerName: 'Sub Account Number',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 205,
            minWidth: 205,
            flex: 0
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
            editable: false,
            filter: 'agTextColumnFilter',
            width: 195,
            minWidth: 195,
            flex: 0
          },
          {
            field: 'ChargeCode',
            headerName: 'Charge Code',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 150,
            flex: 0
          },
          {
            field: 'Quantity',
            headerName: 'Quantity',
            filter: 'agTextColumnFilter',
            columnGroupShow: 'open',
            editable: false,
            width: 150,
            minWidth: 150
          },
          {
            field: 'ChargeCodeType',
            headerName: 'Charge Code Type',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 175,
            flex: 0
          },
          {
            field: 'ChargeType',
            headerName: 'Charge Type',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 150,
            minWidth: 150,
            flex: 0
          },
          {
            field: 'ChargeCodeOccurrence',
            headerName: 'Charge Code Occurrence',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 225,
            minWidth: 225,
            flex: 0
          },

          {
            field: 'UnitOfMesurement',
            headerName: 'Unit of Measure',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 170,
            minWidth: 170,
            flex: 0
          }
        ],
      },
      {
        headerName: 'Charges',
        children: [
          {
            field: 'Charges',
            headerName: 'Charges',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 120,
            minWidth: 120,
            cellStyle: { display: 'flex !important', 'justify-content': 'end', 'padding-right': '44px' },
            flex: 0,
            valueFormatter(params: { data: { Charges: number; CurrencySymbol: string; }; }) {
              if (params?.data?.Charges) {
                var sansDec = params?.data?.Charges.toFixed(2);
                return params.data.CurrencySymbol + `${sansDec.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
              }
              return '';
            }
          },
          {
            field: 'ChargeLocationType',
            headerName: 'Charge Location',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 170,
            minWidth: 170,
            flex: 0
          },
          {
            field: 'DistributionRuleName',
            headerName: 'Distribution Rule',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 170,
            flex: 0
          },
          {
            field: 'Prorated',
            headerName: 'Prorated',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 130,
            minWidth: 100,
            flex: 0,
            valueFormatter: (params: { data: { Prorated: boolean; }; }) => params.data.Prorated == true ? 'Yes' : 'No',
          }
        ],

      },
      // {
      //   headerName: 'Product',
      //   children: [
      //     {
      //       field: 'VendorProduct',
      //       headerName: 'Vendor Product',
      //       columnGroupShow: 'close',
      //       editable: false,
      //       filter: 'agTextColumnFilter',
      //       minWidth: 170,
      //       width: 110,
      //       flex: 0
      //     },
      //     {
      //       field: 'Service',
      //       headerName: 'Service',
      //       columnGroupShow: 'open',
      //       editable: false,
      //       filter: 'agTextColumnFilter',
      //       minWidth: 140,
      //       flex: 0
      //     },
      //     {
      //       field: 'ServiceType',
      //       headerName: 'Service Type',
      //       columnGroupShow: 'open',
      //       editable: false,
      //       filter: 'agTextColumnFilter',
      //       width: 150,
      //       minWidth: 150,
      //       flex: 0
      //     },
      //     {
      //       field: 'Product',
      //       headerName: 'Product',
      //       columnGroupShow: 'open',
      //       editable: false,
      //       filter: 'agTextColumnFilter',
      //       width: 125,
      //       minWidth: 125,
      //       flex: 0
      //     },
      //     {
      //       field: 'ProductType',
      //       headerName: 'Product Type',
      //       columnGroupShow: 'open',
      //       editable: false,
      //       filter: 'agTextColumnFilter',
      //       width: 155,
      //       minWidth: 155,
      //       flex: 0
      //     },
      //   ],
      // },
      {
        headerName: 'Charge Descriptions',
        children: [
          {
            field: 'ChargeDescription1',
            headerName: 'Charge Description 1',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 270,
            flex: 0
          },
          {
            field: 'ChargeDescription2',
            headerName: 'Charge Description 2',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 200,
            minWidth: 200,
            flex: 0
          },
          {
            field: 'ChargeDescription3',
            headerName: 'Charge Description 3',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 200,
            minWidth: 200,
            flex: 0
          },
          {
            field: 'ChargeDescription4',
            headerName: 'Charge Description 4',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 200,
            minWidth: 200,
            flex: 0
          },
          {
            field: 'ChargeDescription5',
            headerName: 'Charge Description 5',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 200,
            minWidth: 200,
            flex: 0
          },
          {
            field: 'ChargeDescription6',
            headerName: 'Charge Description 6',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 200,
            minWidth: 200,
            flex: 0
          },
          {
            field: 'ChargeDescription7',
            headerName: 'Charge Description 7',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 200,
            minWidth: 200,
            flex: 0
          },
          {
            field: 'ChargeDescription8',
            headerName: 'Charge Description 8',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 200,
            minWidth: 200,
            flex: 0
          },
          {
            field: 'ChargeDescription9',
            headerName: 'Charge Description 9',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 200,
            minWidth: 200,
            flex: 0
          },
          {
            field: 'ChargeDescription10',
            headerName: 'Charge Description 10',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 205,
            minWidth: 205,
            flex: 0
          }
        ],
      }
    ];

    this.columnDefs2 = [
      {
        headerName: 'Charge Code',
        children: [
          // {
          //   field: 'ChargeCodeName',
          //   headerName: 'Charge Code Name',
          //   columnGroupShow: 'close',
          //   editable: false,
          //   filter: 'agTextColumnFilter',
          //   minWidth: 200,
          //   flex: 0
          // },
          {
            field: 'ChargeCode',
            headerName: 'Charge Code',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 190,
            flex: 0
          },
          // {
          //   field: 'DistributionRuleName',
          //   headerName: 'Rule',
          //   columnGroupShow: 'open',
          //   editable: false,
          //   filter: 'agTextColumnFilter',
          //   minWidth: 170,
          //   flex: 0
          // },
        ]
      },
      {
        headerName: 'Charge Code Details',
        children: [
          {
            field: 'ChargeCodeType',
            headerName: 'Charge Code Type',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 200,
            flex: 0
          },
          {
            field: 'ChargeType',
            headerName: 'Charge Type',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 200,
            flex: 0
          },
          {
            field: 'ChargeCodeOccurrence',
            headerName: 'Charge Code Occurrence',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 200,
            flex: 0
          },
        ]
      },
      // {
      //   headerName: 'Vendor Product',
      //   children: [
      //     {
      //       field: 'VendorProduct',
      //       headerName: 'Vendor Product',
      //       columnGroupShow: 'close',
      //       editable: false,
      //       filter: 'agTextColumnFilter',
      //       minWidth: 200,
      //       flex: 0
      //     },
      //     {
      //       field: 'Service',
      //       headerName: 'Service',
      //       columnGroupShow: 'open',
      //       editable: false,
      //       filter: 'agTextColumnFilter',
      //       minWidth: 200,
      //       flex: 0
      //     },
      //     {
      //       field: 'ServiceType',
      //       headerName: 'Service Type',
      //       columnGroupShow: 'open',
      //       editable: false,
      //       filter: 'agTextColumnFilter',
      //       minWidth: 200,
      //       flex: 0
      //     },
      //     {
      //       field: 'Product',
      //       headerName: 'Product',
      //       columnGroupShow: 'open',
      //       editable: false,
      //       filter: 'agTextColumnFilter',
      //       minWidth: 200,
      //       flex: 0
      //     },
      //     {
      //       field: 'ProductType',
      //       headerName: 'Product Type',
      //       columnGroupShow: 'open',
      //       editable: false,
      //       filter: 'agTextColumnFilter',
      //       minWidth: 200,
      //       flex: 0
      //     },
      //   ]
      // },
      {
        headerName: 'Vendor',
        children: [
          {
            field: 'VendorBillingAlias',
            headerName: 'VBA',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 190,
            flex: 0
          },
          {
            field: 'VendorAccountName',
            headerName: 'Charge Code Vendor',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 170,
            flex: 0
          },

        ]
      }
    ];

    this.chargeCodeForm = this.fb.group({
      chargeCode: new FormControl('', [Validators.required]),
      chargeCodeTypeId: new FormControl('', [Validators.required]),
      chargeCodeName: new FormControl('', [Validators.required, Validators.maxLength(150)]),
      chargeCodeOccurrenceId: new FormControl('', [Validators.required]),
      chargeTypeId: new FormControl('', [Validators.required]),
      description: new FormControl('', [Validators.maxLength(255)]),
    });
  }

  parentChargeCodeData: any = {
    vendorBillingAliasId: 0,
  }

  refreshDropdown() {
    let passData = {
      IsOnlyActiveNeed: true
    }
    this.locationService.getChargeCodeTypes(passData).subscribe((data) => {
      if (data.Success) {
        this.chargeCodeTypes = data.Data.$values;
        this.chargeCodeTypes.forEach((x: any) => {
          x['disabled'] = x.Name == 'System Adjustment';
        });
      }
    });
    this.getChargeCodeOccurrence();
    let id = this.fetchIdByName(this.chargeCodeTypes, this.f.chargeCodeTypeId.value);
    if (id)
      this.getTaxRegulatoryTypes(id);

  }

  onAgGridReady(params: any) {
    this.gridApi = params;
    params.getToolPanelInstance('filters')!.expandFilters();
  }

  ngOnInit(): void {
    this.chargecodeContextNew();
    this.getChargeCodeOccurrence();
    let passData = {
      IsOnlyActiveNeed: true
    }
    this.locationService.getChargeCodeTypes(passData).subscribe((data) => {
      if (data.Success) {
        this.chargeCodeTypes = data.Data.$values;

        this.chargeCodeTypes.forEach((x: any) => {
          x['disabled'] = x.Name == 'System Adjustment';
        });
      }
    });
  }
  onSelectionChanged(event: string | any[]) {
    if ((event[0] && event[0].BillingId == '') || (event[0] && event[0].BillingId == null)) {
      this.openDialog = true;
      this.showSaveButton = false;
    } else {
      this.openDialog = false;
      this.showSaveButton = true;
    }
    this.chargeCodeForm.reset();

    if (event[0].ChargeCodeId !== null) {
      this.parentChargeCodeData['chargeCodeId'] = event[0].ChargeCodeId;
      this.chargeCodeId = event[0].ChargeCodeId;
    }

    this.VendorBillingAliasId = event && event[0] ? event[0].VendorBillingAliasId : 0;
    this.parentChargeCodeData['vendorBillingAliasId'] = this.VendorBillingAliasId;
    this.chargeCodeContextSel = event[0];
    //this.getParentChargeCode();
    this.getAdditionalBillDetail(event[0]);
    this.disabledAssignmentData = event && event.length == 0 ? true : false;
    this.parentChargeRowData = event && event.length == 0 ? [] : ''
    this.gridApi?.setFilterModel(null);
  }

  assignParent() {
    this.setFormValue('chargeCodeTypeId', this.parentChargeValues.ChargeCodeType);
    this.setFormValue('chargeCodeOccurrenceId', this.parentChargeValues.ChargeCodeOccurrenceId);
    this.getTaxRegulatoryTypes(this.parentChargeValues.ChargeCodeTypeId);
    this.setFormValue('chargeTypeId', this.parentChargeValues.ChargeType);
    this.setFormValue('description', this.additionalBillData.ChargeNotes);
    this.disabledAssignmentData = true;
    this.parentChargeId = this.parentChargeValues.ChargeCodeId;

  }
  setFormValue(key: string, data: string) {
    if (this.f[key]) {
      this.f[key].setValue(data);
    }
  }
  parentChargeCodeChange(event: string | any[]) {
    this.parentChargeCodeSelected = event.length > 0 ? true : false;
    this.parentChargeValues = event[0]?.data;
    this.disabledAssignmentData = event && event.length == 0 ? false : true;
    if (event && event?.length == 0 && this.chargeCodeContextSel) {
      this.setFormValue('chargeCode', this.chargeCodeContextSel.ChargeCode);
    }

  }
  getParentChargeCode() {
    this._unsubscribeParent.next(null);
    this.sandBoxService.ChargeCode(this.parentChargeCodeData).pipe(takeUntil(this._unsubscribeParent))
      .subscribe((data: any) => {
        if (data.Success) {
          this.parentChargeRowData = this.processData(data.Data.$values);
        }
      });
  }
  processData(data: any[]) {
    const flattenedData: any[] = [];
    const flattenRowRecursive = (row: any, parentPath: string[]) => {
      const dataPath = [...parentPath, row.ChargeCodeId];
      flattenedData.push({ ...row, dataPath });
      if (row.SubChargeCode && row.SubChargeCode.$values.length) {
        row.SubChargeCode.$values.forEach((underling: any) =>
          flattenRowRecursive(underling, dataPath)
        );
      }
    };
    data.forEach((row) => flattenRowRecursive(row, []));
    return flattenedData;
  }

  updateChargeCode() {
    this.isChargeCodeFormSubmit = true;
    if (this.chargeCodeForm.valid) {
      this.saveButtonDisabled = true;

      let data = this.chargeCodeForm.getRawValue();
      data['chargeCodeTypeId'] = this.fetchIdByName(this.chargeCodeTypes, this.chargeCodeForm.value.chargeCodeTypeId)
      data['chargeTypeId'] = this.fetchIdByName(this.taxTypes, this.chargeCodeForm.value.chargeTypeId)
      data['chargeCode'] = this.additionalBillData.ChargeCode;
      data['ChargeCodeDisplayName'] = this.additionalBillData.ChargeCode;
      data['status'] = true;
      data['SBInvoiceIdToUpdate'] = this.sandBoxGridRowData.SBInvoiceId;
      data['vendorBillingAliasId'] = this.VendorBillingAliasId ? this.VendorBillingAliasId : null;
      data['sbChargeDetailId'] = this.SBChargeDetailIds;
      data['parentChargeCodeId'] = this.parentChargeId;
      data['chargeCodeOriginId'] = this.chargeCodeContextSel.ChargeCodeOriginId;


      if (checkIsValueExists(this.additionalBillData.DistributionRuleNeeded) || checkIsValueExistswithZero(this.additionalBillData.DistributionRuleId)) {
        let errorData: any = {
          messgeType: "error",
          title: "Attention",
          titleClass: "text-c-blue",
          icon: "fas fa-question-circle",
          iconClass: "text-c-blue f-70",
          message: 'You are removing the Distribution from this service-level Charge Code.',
          okBtnName: 'Close & Review',
          closeBtnName: 'Proceed'
        }
        const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
        dialogRef.afterClosed().subscribe(result => {
          if (result == false) {
            this.updateChargeCodeFn(data, true);
          } else {
            this.saveButtonDisabled = false;
          }
        });
      } else {
        this.updateChargeCodeFn(data);
      }
    }
  }


  updateChargeCodeFn(data: { [x: string]: boolean; }, recall = false) {
    if (recall) {
      data['IsAddDistribution'] = false;
    }
    this.locationService.putChargecodeUrl(this.chargeCodeContextSel.ChargeCodeId, data).subscribe({
      next: data => {
        this.saveButtonDisabled = false;
        if (data.Success) {
          let errorData: any = {
            messgeType: "error",
            title: "Attention",
            titleClass: "text-c-blue",
            icon: "fas fa-exclamation-triangle",
            iconClass: "text-c-blue f-70",
            message: 'Successfully saved' //if messges is multiple use array
          }
          const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
          dialogRef.afterClosed().subscribe(result => {
          });
          this.getParentChargeCode();
          this.chargeCodeForm.reset();
          this.isChargeCodeFormSubmit = false;
          this.setFormValue('chargeCode', this.additionalBillData.ChargeCode);
          this.setFormValue('chargeCodeName', this.additionalBillData.ChargeCodeName);
          this.setFormValue('chargeCodeTypeId', this.additionalBillData.ChargeCodeTypeId);


          this.disabledAssignmentData = false;
          this.chargecodeContextNew();
          this.onSaveRedirect.emit(true);

        } else {

          if (data?.Data?.IsPrimaryChargeCodeGroupFound) {
            const dialogRef = this.dialog.open(UpdateChargeCodeGroupComponent, {
              width: '820px',
              panelClass: 'addVendorProduct',
              data: {
                colseButton: true,
                disableClose: true,
                vendorTypeName: data?.Data?.vendorTypeName
              }
            });
            dialogRef.afterClosed().subscribe((result) => {

              if (result) {
                this.updateChargeCode();
              }
            });
          } else {
            let errorData: any = {
              messgeType: "error",
              title: "Attention",
              titleClass: "text-c-blue",
              icon: "fas fa-exclamation-triangle",
              iconClass: "text-c-blue f-70",
              message: data.Message,

            }
            const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
            dialogRef.afterClosed().subscribe(result => {
              this.chargecodeContextNew();
            });

          }
        }
      },
      error: error => {
      }
    });
  }

  saveChargeCode() {
    this.isChargeCodeFormSubmit = true;
    if (this.chargeCodeForm.valid) {
      this.saveButtonDisabled = true;

      let data = this.chargeCodeForm.getRawValue();
      data['sbInvoiceId'] = this.sandBoxGridRowData.SBInvoiceId;
      data['sbChargeDetailId'] = this.SBChargeDetailIds;
      data['status'] = true;
      data['chargeCodeTypeId'] = this.fetchIdByName(this.chargeCodeTypes, this.chargeCodeForm.value.chargeCodeTypeId)
      data['chargeTypeId'] = this.fetchIdByName(this.taxTypes, this.chargeCodeForm.value.chargeTypeId)

      if (!this.isMultipleCreate) {
        data['chargeCode'] = this.additionalBillData.ChargeCode;
        data['ChargeCodeDisplayName'] = this.additionalBillData.ChargeCode;
        data['vendorBillingAliasId'] = this.VendorBillingAliasId ? this.VendorBillingAliasId : null;
        data['parentChargeCodeId'] = this.parentChargeId;
      } else {
        data['SBChargeDetailIdsForCC'] = this.SBChargeDetailIdsForCC;
      }

      if (this.isMultipleCreate) {
        delete data['chargeCode'];
        delete data['chargeCodeName'];
        delete data['description'];
        delete data['ChargeCodeDisplayName'];
        delete data['vendorBillingAliasId'];
        delete data['parentChargeCodeId'];
        delete data['status'];

      }

      this.locationService.addChargeCode(data, this.isMultipleCreate).subscribe({
        next: data => {
          this.saveButtonDisabled = false;
          if (data.Success) {
            let errorData: any = {
              messgeType: "error",
              title: "Attention",
              titleClass: "text-c-blue",
              icon: "fas fa-exclamation-triangle",
              iconClass: "text-c-blue f-70",
              message: 'Successfully saved' //if messges is multiple use array
            }
            const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
            dialogRef.afterClosed().subscribe(result => {
            });
            this.getParentChargeCode();
            this.chargeCodeForm.reset();
            this.isChargeCodeFormSubmit = false;
            this.setFormValue('chargeCode', this.additionalBillData.ChargeCode);
            this.setFormValue('chargeCodeName', this.additionalBillData.ChargeCodeName);
            this.disabledAssignmentData = false;
            this.chargecodeContextNew();

            this.onSaveRedirect.emit(true);
          } else {
            let errorData: any = {
              messgeType: "error",
              title: "Attention",
              titleClass: "text-c-blue",
              icon: "fas fa-exclamation-triangle",
              iconClass: "text-c-blue f-70",
              message: data.Message//if messges is multiple use array
            }
            const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
            dialogRef.afterClosed().subscribe(result => {
              this.chargecodeContextNew();
            });
          }
          if(data?.Other?.NeedToCheckNextStep) {
            this.sandBoxService.getInvoiceStep(this.sandBoxGridRowData.SBInvoiceId).subscribe(()=> {
            })
          }
        },
        error: error => {
          this.saveButtonDisabled = false;
        }
      });
    }
  }

  saveAndAddDistribution() {
    if (this.openDialog && (this.chargeCodeForm.value.chargeCodeTypeId == "Product" || this.chargeCodeForm.value.chargeCodeTypeId == "Feature" || this.chargeCodeForm.value.chargeCodeTypeId == "Usage" || this.chargeCodeForm.value.chargeCodeTypeId == "Equipment")) {
      const dialogRef = this.dialog.open(ChargeCodeAssignmentDialogComponent, {
        width: '700px',
        data: {
          msg1: 'Please review the Charge Code Type and Charge Type. Incorrect Charge Code assignment can result in unbelievably bad data.',
          btnMsg: 'This is correct, please save it!'
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          // code for redirecting tab 4
          this.isChargeCodeFormSubmit = true;
          if (this.chargeCodeForm.valid) {
            this.saveButtonDisabledForDistribution = true;

            let data = this.chargeCodeForm.getRawValue();
            data['chargeCodeTypeId'] = this.fetchIdByName(this.chargeCodeTypes, this.chargeCodeForm.value.chargeCodeTypeId)
            data['chargeTypeId'] = this.fetchIdByName(this.taxTypes, this.chargeCodeForm.value.chargeTypeId)
            data['status'] = true;
            data['sbInvoiceId'] = this.sandBoxGridRowData.SBInvoiceId;
            data['sbChargeDetailId'] = this.SBChargeDetailIds;
            data['IsAddDistribution'] = true;

            if (!this.isMultipleCreate) {

              data['chargeCode'] = this.additionalBillData.ChargeCode;
              data['ChargeCodeDisplayName'] = this.additionalBillData.ChargeCode;
              data['vendorBillingAliasId'] = this.VendorBillingAliasId ? this.VendorBillingAliasId : null;
              data['parentChargeCodeId'] = this.parentChargeId;
            } else {
              data['SBChargeDetailIdsForCC'] = this.SBChargeDetailIdsForCC;
            }

            if (this.isMultipleCreate) {
              delete data['chargeCode'];
              delete data['chargeCodeName'];
              delete data['description'];
              delete data['ChargeCodeDisplayName'];
              delete data['vendorBillingAliasId'];
              delete data['parentChargeCodeId'];
              delete data['status'];

            }

            this.locationService.addChargeCode(data, this.isMultipleCreate).subscribe({
              next: data => {
                this.saveButtonDisabledForDistribution = false;
                if (data.Success) {
                  let errorData: any = {
                    messgeType: "error",
                    title: "Attention",
                    titleClass: "text-c-blue",
                    icon: "fas fa-exclamation-triangle",
                    iconClass: "text-c-blue f-70",
                    message: 'Successfully saved' //if messges is multiple use array
                  }
                  const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
                  dialogRef.afterClosed().subscribe(result => {
                  });
                  this.getParentChargeCode();
                  this.chargeCodeForm.reset();
                  this.isChargeCodeFormSubmit = false;
                  this.setFormValue('chargeCode', this.additionalBillData.ChargeCode);
                  this.setFormValue('chargeCodeName', this.additionalBillData.ChargeCodeName);
                  this.disabledAssignmentData = false;
                  this.chargecodeContextNew();

                  this.onSaveRedirect.emit(true);
                } else {
                  let errorData: any = {
                    messgeType: "error",
                    title: "Attention",
                    titleClass: "text-c-blue",
                    icon: "fas fa-exclamation-triangle",
                    iconClass: "text-c-blue f-70",
                    message: data.Message//if messges is multiple use array
                  }
                  const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
                  dialogRef.afterClosed().subscribe(result => {
                    this.chargecodeContextNew();
                  });
                }
                if(data?.Other?.NeedToCheckNextStep) {
                  this.sandBoxService.getInvoiceStep(this.sandBoxGridRowData.SBInvoiceId).subscribe(()=> {
                  })
                }
              },
              error: error => {
                this.saveButtonDisabledForDistribution = false;
              }
            });
          }
        }
      });
    } else {

      this.isChargeCodeFormSubmit = true;
      if (this.chargeCodeForm.valid) {
        this.saveButtonDisabledForDistribution = true;

        let data = this.chargeCodeForm.getRawValue();
        data['chargeCodeTypeId'] = this.fetchIdByName(this.chargeCodeTypes, this.chargeCodeForm.value.chargeCodeTypeId)
        data['chargeTypeId'] = this.fetchIdByName(this.taxTypes, this.chargeCodeForm.value.chargeTypeId)
        data['status'] = true;
        data['sbInvoiceId'] = this.sandBoxGridRowData.SBInvoiceId;
        data['sbChargeDetailId'] = this.SBChargeDetailIds;
        data['IsAddDistribution'] = true;

        if (!this.isMultipleCreate) {

          data['chargeCode'] = this.additionalBillData.ChargeCode;
          data['ChargeCodeDisplayName'] = this.additionalBillData.ChargeCode;
          data['vendorBillingAliasId'] = this.VendorBillingAliasId ? this.VendorBillingAliasId : null;
          data['parentChargeCodeId'] = this.parentChargeId;
        } else {
          data['SBChargeDetailIdsForCC'] = this.SBChargeDetailIdsForCC;
        }

        if (this.isMultipleCreate) {
          delete data['chargeCode'];
          delete data['chargeCodeName'];
          delete data['description'];
          delete data['ChargeCodeDisplayName'];
          delete data['vendorBillingAliasId'];
          delete data['parentChargeCodeId'];
          delete data['status'];
        }

        this.locationService.addChargeCode(data, this.isMultipleCreate).subscribe({
          next: data => {
            this.saveButtonDisabledForDistribution = false;
            if (data.Success) {
              let errorData: any = {
                messgeType: "error",
                title: "Attention",
                titleClass: "text-c-blue",
                icon: "fas fa-exclamation-triangle",
                iconClass: "text-c-blue f-70",
                message: 'Successfully saved' //if messges is multiple use array
              }
              const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
              dialogRef.afterClosed().subscribe(result => {
              });
              this.getParentChargeCode();
              this.chargeCodeForm.reset();
              this.isChargeCodeFormSubmit = false;
              this.setFormValue('chargeCode', this.additionalBillData.ChargeCode);
              this.setFormValue('chargeCodeName', this.additionalBillData.ChargeCodeName);
              this.disabledAssignmentData = false;
              this.chargecodeContextNew();

              this.onSaveRedirect.emit(true);
            } else {
              let errorData: any = {
                messgeType: "error",
                title: "Attention",
                titleClass: "text-c-blue",
                icon: "fas fa-exclamation-triangle",
                iconClass: "text-c-blue f-70",
                message: data.Message//if messges is multiple use array
              }
              const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
              dialogRef.afterClosed().subscribe(result => {
                this.chargecodeContextNew();
              });
            }
            if(data?.Other?.NeedToCheckNextStep) {
              this.sandBoxService.getInvoiceStep(this.sandBoxGridRowData.SBInvoiceId).subscribe(()=> {
              })
            }
          },
          error: error => {
            this.saveButtonDisabledForDistribution = false;
          }
        });
      }
    }
  }

  updateAddDistribution() {

    if (this.openDialog && (this.chargeCodeForm.value.chargeCodeTypeId == "Product" || this.chargeCodeForm.value.chargeCodeTypeId == "Feature" || this.chargeCodeForm.value.chargeCodeTypeId == "Usage" || this.chargeCodeForm.value.chargeCodeTypeId == "Equipment")) {
      const dialogRef = this.dialog.open(ChargeCodeAssignmentDialogComponent, {
        width: '700px',
        data: {
          msg1: 'Please review the Charge Code Type and Charge Type. Incorrect Charge Code assignment can result in unbelievably bad data.',
          btnMsg: 'This is correct, please save it!'
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          // code for redirecting tab 4
          this.isChargeCodeFormSubmit = true;
          if (this.chargeCodeForm.valid) {
            this.saveButtonDisabledForDistribution = true;
            if (checkIsValueExists(this.additionalBillData.DistributionRuleNeeded) || checkIsValueExistswithZero(this.additionalBillData.DistributionRuleId)) {
              let errorData: any = {
                messgeType: "error",
                title: "Attention",
                titleClass: "text-c-blue",
                icon: "fas fa-question-circle",
                iconClass: "text-c-blue f-70",
                message: 'You have added this service-level Charge Code for Distribution.',
                okBtnName: 'Close & Review',
                closeBtnName: 'Proceed'
              }
              const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
              dialogRef.afterClosed().subscribe(result => {
                if (result == false) {
                  this.updateAddDistributionFn();
                }
              })
            }  else {
              this.updateAddDistributionFn();
            }
          }
        }
      });
    } else {
      this.isChargeCodeFormSubmit = true;
      if (this.chargeCodeForm.valid) {
        this.saveButtonDisabledForDistribution = true;
        if (checkIsValueExists(this.additionalBillData.DistributionRuleNeeded) || checkIsValueExistswithZero(this.additionalBillData.DistributionRuleId)) {
          let errorData: any = {
            messgeType: "error",
            title: "Attention",
            titleClass: "text-c-blue",
            icon: "fas fa-question-circle",
            iconClass: "text-c-blue f-70",
            message: 'You have added this service-level Charge Code for Distribution.',
            okBtnName: 'Close & Review',
            closeBtnName: 'Proceed'
          }
          const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
          dialogRef.afterClosed().subscribe(result => {
            if (result == false) {
              this.updateAddDistributionFn();
            } else {
              this.saveButtonDisabledForDistribution = false;
            }
          })
        } else {
          this.updateAddDistributionFn();
        }

      }
    }

  }

  updateAddDistributionFn() {
    let data = this.chargeCodeForm.getRawValue();
    data['chargeCodeTypeId'] = this.fetchIdByName(this.chargeCodeTypes, this.chargeCodeForm.value.chargeCodeTypeId)
    data['chargeTypeId'] = this.fetchIdByName(this.taxTypes, this.chargeCodeForm.value.chargeTypeId)
    data['chargeCode'] = this.additionalBillData.ChargeCode;
    data['ChargeCodeDisplayName'] = this.additionalBillData.ChargeCode;
    data['status'] = true;
    data['SBInvoiceIdToUpdate'] = this.sandBoxGridRowData.SBInvoiceId;
    data['vendorBillingAliasId'] = this.VendorBillingAliasId ? this.VendorBillingAliasId : null;
    data['sbChargeDetailId'] = this.SBChargeDetailIds;
    data['parentChargeCodeId'] = this.parentChargeId;
    data['chargeCodeOriginId'] = this.chargeCodeContextSel.ChargeCodeOriginId;
    data['IsAddDistribution'] = true;

    this.locationService.putChargecodeUrl(this.chargeCodeContextSel.ChargeCodeId, data).subscribe({
      next: data => {
        this.saveButtonDisabledForDistribution = false;
        if (data.Success) {
          let errorData: any = {
            messgeType: "error",
            title: "Attention",
            titleClass: "text-c-blue",
            icon: "fas fa-exclamation-triangle",
            iconClass: "text-c-blue f-70",
            message: 'Successfully saved' //if messges is multiple use array
          }
          const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
          dialogRef.afterClosed().subscribe(result => {
          });
          this.getParentChargeCode();
          this.chargeCodeForm.reset();
          this.isChargeCodeFormSubmit = false;
          this.setFormValue('chargeCode', this.additionalBillData.ChargeCode);
          this.setFormValue('chargeCodeName', this.additionalBillData.ChargeCodeName);
          this.setFormValue('chargeCodeTypeId', this.additionalBillData.ChargeCodeType);
          this.disabledAssignmentData = false;
          this.chargecodeContextNew();
          this.onSaveRedirect.emit(true);

        } else {

          if (data?.Data?.IsPrimaryChargeCodeGroupFound) {
            const dialogRef = this.dialog.open(UpdateChargeCodeGroupComponent, {
              width: '820px',
              panelClass: 'addVendorProduct',
              data: {
                colseButton: true,
                disableClose: true,
                vendorTypeName: data?.Data?.vendorTypeName
              }
            });
            dialogRef.afterClosed().subscribe((result) => {

              if (result) {
                this.updateChargeCode();
              }
            });
          } else {
            let errorData: any = {
              messgeType: "error",
              title: "Attention",
              titleClass: "text-c-blue",
              icon: "fas fa-exclamation-triangle",
              iconClass: "text-c-blue f-70",
              message: data.Message//if messges is multiple use array
            }
            const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
            dialogRef.afterClosed().subscribe(result => {
              this.chargecodeContextNew();
            });
          }

        }
        if(data?.Other?.NeedToCheckNextStep) {
          this.sandBoxService.getInvoiceStep(this.sandBoxGridRowData.SBInvoiceId).subscribe(()=> {
          })
        }
      },
      error: error => {
      }
    });
  }

  getAdditionalBillDetail(event?: any) {
    if (this.chargeCodeContextSel?.SBChargeDetailId) {
      this._unsubscribeBillDetail.next(null);
      this.sandBoxService.ChargeCodeContextDetails(this.chargeCodeContextSel.SBChargeDetailId).pipe(takeUntil(this._unsubscribeBillDetail))
        .subscribe((data: any) => {
          if (data.Success) {
            this.additionalBillData = data.Data;
            this.additionalBillData['Charges'] = data.Data.Charges ? parseFloat(data.Data.Charges).toFixed(2) : '0.00';

            this.setFormValue('chargeCode', this.isMultipleCreate ? 'Multiple Charge Codes selected' : this.additionalBillData.ChargeCode);
            this.setFormValue('chargeCodeName', this.isMultipleCreate ? 'Multiple Charge Codes selected' : this.additionalBillData.ChargeCodeName);

            if (this.isMultipleCreate) {
              this.setFormValue('description', 'Multiple Charge Codes selected this cannot be used');

            }
            if (event.ChargeCodeTypeId) {
              this.setFormValue('chargeCodeTypeId', event.ChargeCodeType);
              this.f.chargeTypeId.setValue('');
              this.getTaxRegulatoryTypes(event.ChargeCodeTypeId);
              this.setFormValue('chargeTypeId', event.ChargeType);
              this.setFormValue('chargeCodeOccurrenceId', event.ChargeCodeOccurrenceId);
            }
            this.additionalBillData['Charges'] = data.Data.Charges ? this.overviewData.CurrencySymbol + parseFloat(data.Data.Charges).toFixed(2) : `${this.overviewData.CurrencySymbol}0.00`;
            this.additionalBillData['Charges'] = data.Data?.Charges.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
          }
        });
    } else {
      this.additionalBillData = {}
    }
  }
  getChargeCodeOccurrence() {
    this.locationService.getChargeCodeOccurrence().subscribe((data) => {
      if (data && data.$values) {
        this.codeOccurence = data.$values;
      }
    });
  }


  chargecodeContextNew() {

    if (!checkIsValueExists(this.sandBoxGridRowData.SBInvoiceId)) {
      return;
    }

    this.isMultipleCreate = this.step3mainData.length > 1;
    let data
    if (this.isMultipleCreate) {
      data = {
        'SBChargeDetailIdsForCC': this.SBChargeDetailIdsForCC
      };
    } else if (this.step3mainData?.ChargeCodeUnformatted && this.step3mainData?.SBChargeDetailId == null) {
      data = {
        'chargeCodeUnformatted': this.step3mainData?.ChargeCodeUnformatted
      };
    }

    if (data) {
      this._unsubscribeCharge.next(null);
      this.sandBoxService.ChargeCodeContextNew(this.sandBoxGridRowData.SBInvoiceId, data).pipe(takeUntil(this._unsubscribeCharge))
        .subscribe((data: any) => {

          if (data.Success) {
            this.rowData = data.Data.$values;
            if (this.rowData[0]?.BillingId == '' || this.rowData[0]?.BillingId == null) {
              this.openDialog = true;
              this.showSaveButton = false;
            } else {
              this.openDialog = false;
              this.showSaveButton = true;
            }
            this.SBChargeDetailIds = _.map(this.rowData, (x: any) => x.SBChargeDetailId)
            let statusList = _.map(this.rowData, (x: any) => x.Status);
            this.isDisableSave = statusList.every((x) => x == 'Assigned') ? true : false;
            if (this.rowData.length > 0)
              this.rowData[0]['isChecked'] = true;
          }
        });
    }
  }

  onChargeCodeTypeChange() {
    if (this.f.chargeCodeTypeId.valid && this.f.chargeCodeTypeId.value) {
      // const id = Number(this.f.chargeCodeTypeId.value);
      let id = this.fetchIdByName(this.chargeCodeTypes, this.f.chargeCodeTypeId.value);
      this.f.chargeTypeId.setValue('');
      this.getTaxRegulatoryTypes(id);
    } else {
      this.taxTypes = [];
      this.f.chargeTypeId.setValue('');
    }
    if(this.f.chargeCodeTypeId.value == 'Usage') {
      const usageId = this.codeOccurence.find((item: any) => item.Occurrence === 'Usage')?.Id;
      this.f.chargeCodeOccurrenceId.setValue(usageId);
    } else {
      this.f.chargeCodeOccurrenceId.setValue(null);
    }
  }
  getTaxRegulatoryTypes(id: any) {
    let passData = {
      IsOnlyActiveNeed: true
    }
    this.locationService.getTaxRegulatoryTypes(id, passData).subscribe((data) => {
      if (data.Success) {
        this.taxTypes = data.Data.$values;
        if (this.f.chargeCodeTypeId.value && !this.f.chargeTypeId.value) {
          this.f.chargeTypeId.setValue(this.f.chargeCodeTypeId.value)
        }
      } else {
        this.taxTypes = [];
      }
    });
  }

  parentgetTaxRegulatoryTypes(id: any) {
    this.locationService.getTaxRegulatoryTypes(id).subscribe((data) => {
      if (data.Success) {
        this.parenttaxTypes = data.Data.$values;
      } else {
        this.parenttaxTypes = [];
      }
    });
  }
  get f() : any{
    return this.chargeCodeForm.controls;
  }


  openDialogChargeCode(): void {
    this.dialog.open(this.ChargeCodeAssignment, {
      width: '900px',
      data: {
        colseButton: true,
      }
    });
  }

  openDialogChargeCodeMulti(): void {
    this.dialog.open(this.ChargeCodeAssignmentMulti, {
      width: '970px',
      data: {
        colseButton: true,
      }
    });
  }

  ngOnDestroy() {
    this._unsubscribeBillDetail.next(null );
    this._unsubscribeBillDetail.complete();
    this._unsubscribeCharge.next(null);
    this._unsubscribeCharge.complete();
    this._unsubscribeParent.next(null);
    this._unsubscribeParent.complete();
  }

  fetchIdByName(array: any[], name: string) {
    const id = array.find((item: { Name: string; }) => item.Name === name)?.Id;
    return id;
  }
}
