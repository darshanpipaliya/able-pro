import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ChargeCodeAssDailogComponent } from './charge-code-ass-dailog/charge-code-ass-dailog.component';
import * as _ from 'lodash';
import { AddNewChargeCodePopupComponent } from '../isd-by-billing-id/add-correction/add-new-charge-code-popup/add-new-charge-code-popup.component';
import { ChargeCodeAssignmentDialogComponent } from '../isd-by-billing-id/add-correction/charge-code-assignment-dialog/charge-code-assignment-dialog.component';
import { SandBoxService } from 'src/app/services/sandbox.service';
import { ErrorWarningPopupComponent } from 'src/app/common/error-warning-popup/error-warning-popup.component';
import { checkIsValueExists } from 'src/app/services/helper';
import { LocationService } from 'src/app/services/location.service';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { AgGridTableComponent } from 'src/app/common/ag-grid-table/ag-grid-table.component';
import { ChargeCodeAssignmentPtable2Component } from '../charge-code-assignment-ptable2/charge-code-assignment-ptable2.component';

@Component({
  selector: 'app-charge-code-assignment2',
  templateUrl: './charge-code-assignment2.component.html',
  styleUrls: ['./charge-code-assignment2.component.scss'],
  imports: [SharedModule, PrimgModule,AgGridTableComponent, ChargeCodeAssignmentPtable2Component]
})
export class ChargeCodeAssignment2Component implements OnInit {

  public columnDefs1;
  public columnDefs2;
  private gridApi!: any;
  @Input() sandBoxGridRowData: any;
  @Output() onSaveRedirect: EventEmitter<any> = new EventEmitter<any>();
  @Input() recordPublishedOrCompleted: any;
  @Input() overviewData: any;
  @Input() sbChargeDetailId: any;

  rowData: any = [];
  chargeCodeRowdata: any = [];
  rowSelection = 'multiple';
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
  private _unsubscribeChargeCode: Subject<any> = new Subject<any>();
  private _unsubscribeBlankChargeCode: Subject<any> = new Subject<any>();
  private _unsubscribeBillDetail: Subject<any> = new Subject<any>();
  private _unsubscribeCharge: Subject<any> = new Subject<any>();
  public getDataPath: any = (data: any) => data.dataPath;
  chargeCodeForm: FormGroup;
  taxTypes: any = [];
  selectedRow: any;
  VendorBillingAliasId: any = 0;
  chargeCodeSelected = false;
  saveButtonDisabled = false;
  saveButtonDisabledForDistribution: boolean = false;
  openDialog: boolean = false;
  showSaveButton: boolean = false;
  selectedChargeCode: any;
  
  ChargeCodeData: any = {
    vendorBillingAliasId: 0
  }
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
    minWidth: 280,
    cellStyle: {
      display: "flex",
      'vertical-align': "middle"
    },
  };
  additionalBillData: any;
  chargeCodeTypes: any = [];
  onAgGridReady(params: any) {
    this.gridApi = params;
    params.getToolPanelInstance('filters')!.expandFilters();
  }
  chargeCodeId: any = 0;
  constructor(public sandboxService: SandBoxService, public fb: FormBuilder, public dialog: MatDialog,
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
            cellRenderer: function (params: any) {
              return  params.data.AccrossInventory == true ? params.data.BillingId + '<div><button class="btn btn-primary grid-cell-btn" style="padding: 2px 8px; font-size: 10px; position: relative; top: -1px; margin-left: 5px;">Added</button></div>' : params.data.BillingId
            }
          },
          // {
          //   field: 'ServiceNumber',
          //   headerName: 'Service Number',
          //   columnGroupShow: 'close',
          //   editable: false,
          //   filter: 'agTextColumnFilter',
          //   minWidth: 150,
          //   flex: 0
          // },
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
            field: 'ChargeCode',
            headerName: 'Charge Code',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 150,
            flex: 0
          },
          {
            field: 'ChargeCodeName',
            headerName: 'Charge Code Name',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            width: 195,
            minWidth: 195,
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
            field: 'ChargesDisplay', // changed key for formatting value. ex: $1,000.00 => Mihir
            headerName: 'Charges',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 120,
            maxWidth: 120,
            flex: 0,
            cellStyle: {display: 'flex !important', 'justify-content': 'end','padding-right':'30px'},
          },
          {
            field: 'ChargeLocationType',
            headerName: 'Charge Location',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 150,
            flex: 0
          },
          {
            field: 'DistributionRuleName',
            headerName: 'Distribution Rule',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 150,
            maxWidth: 200,
            flex: 0
          },
          {
            field: 'Prorated',
            headerName: 'Prorated',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 100,
            width: 130,
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
      //       minWidth: 150,
      //       maxWidth: 200,
      //       flex: 0
      //     },
      //     {
      //       field: 'Service',
      //       headerName: 'Service',
      //       columnGroupShow: 'open',
      //       editable: false,
      //       filter: 'agTextColumnFilter',
      //       minWidth: 150,
      //       maxWidth: 200,
      //       flex: 0
      //     },
      //     {
      //       field: 'ServiceType',
      //       headerName: 'Service Type',
      //       columnGroupShow: 'open',
      //       editable: false,
      //       filter: 'agTextColumnFilter',
      //       minWidth: 150,
      //       maxWidth: 200,
      //       flex: 0
      //     },
      //     {
      //       field: 'Product',
      //       headerName: 'Product',
      //       columnGroupShow: 'open',
      //       editable: false,
      //       filter: 'agTextColumnFilter',
      //       minWidth: 150,
      //       maxWidth: 200,
      //       flex: 0
      //     },
      //     {
      //       field: 'ProductType',
      //       headerName: 'Product Type',
      //       columnGroupShow: 'open',
      //       editable: false,
      //       filter: 'agTextColumnFilter',
      //       minWidth: 150,
      //       maxWidth: 200,
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
            minWidth: 200,
            width: 200,
            flex: 0
          },
          {
            field: 'ChargeDescription3',
            headerName: 'Charge Description 3',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 200,
            width: 200,
            flex: 0
          },
          {
            field: 'ChargeDescription4',
            headerName: 'Charge Description 4',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 200,
            width: 200,
            flex: 0
          },
          {
            field: 'ChargeDescription5',
            headerName: 'Charge Description 5',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 200,
            width: 200,
            flex: 0
          },
          {
            field: 'ChargeDescription6',
            headerName: 'Charge Description 6',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 200,
            width: 200,
            flex: 0
          },
          {
            field: 'ChargeDescription7',
            headerName: 'Charge Description 7',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 200,
            width: 200,
            flex: 0
          },
          {
            field: 'ChargeDescription8',
            headerName: 'Charge Description 8',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 200,
            width: 200,
            flex: 0
          },
          {
            field: 'ChargeDescription9',
            headerName: 'Charge Description 9',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 200,
            width: 200,
            flex: 0
          },
          {
            field: 'ChargeDescription10',
            headerName: 'Charge Description 10',
            columnGroupShow: 'open',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 205,
            width: 205,
            flex: 0
          }
        ],
      }
    ];

    this.columnDefs2 = [
      {
        headerName: 'Charge Code Details',
        children: [ 
          {
            field: 'ChargeCodeType',
            headerName: 'Charge Code Type',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 150,
            flex: 0
          },
          {
            field: 'ChargeType',
            headerName: 'Charge Type',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 150,
            flex: 0,
          },
          {
            field: 'ChargeCodeOccurrence',
            headerName: 'Charge Occurrence',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 150,
            flex: 0
          },
        ]
      },
      {
        headerName: 'Vendor',
        children: [ 
          {
            field: 'VendorBillingAlias',
            headerName: 'VBA',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 150,
            flex: 0
          },
          {
            field: 'VendorAccountName',
            headerName: 'Vendor',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 150,
            flex: 0
          },
        ]
      }
    ];

    this.chargeCodeForm = this.fb.group({
      chargeCodeTypeId: new FormControl('', [Validators.required]),
      chargeTypeId: new FormControl('', [Validators.required])
    });
  }

  AddNewChargeCode() {
    const dialogRef = this.dialog.open(AddNewChargeCodePopupComponent, {
      width: '640px',
      data: {
        redirectFromTabB: true,
        VendorAccountId: this.rowData[0].VendorAccountId,
        VendorBillingAliasId: this.rowData[0].VendorBillingAliasId,
        VendorAccountName: this.rowData[0].VendorAccountName,
        VendorBillingAliasName: this.rowData[0].VendorBillingAliasName,
        SBInvoiceId: this.sandBoxGridRowData.SBInvoiceId
      }
    });
    dialogRef.afterClosed().subscribe((result) => {
      // this.getChargeCodeContextBlank();
      
      if(result?.fromAdd) {

        let data: any = {};
        data['VendorBillingAliasId'] = result.data.VendorBillingAliasId;
        data['ChargeCodeId'] = result.data.Id;

        this.selectedChargeCode = data;
        this.saveAndAddDistribution(); 
      } else {
        this.getBlankAssignment();
      }

    })
  }

  ngOnInit(): void {
    this.getChargeCodeContextBlank();
  
    let passData = {
      IsOnlyActiveNeed: true
    }
    this.locationService.getChargeCodeTypes(passData).subscribe((data) => {
      if (data.Success) {
        this.chargeCodeTypes = data.Data.$values;
      }
    });
  }

  addChargeCodeDialog() {
    const dialogRef = this.dialog.open(ChargeCodeAssDailogComponent, {
      data: {
        chargeCodeType: this.chargeCodeTypes,
        vendorBillingAliasId: this.VendorBillingAliasId,
        chargeCode: this.additionalBillData.ChargeCode
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      this.getBlankAssignment();
    })
  }

  onSelectionChanged(event: any) {
    if((event[0] && event[0].BillingId == '') || (event[0] && event[0].BillingId == null)){
      this.openDialog = true;
      this.showSaveButton = false;
    } else {
      this.openDialog = false;
      this.showSaveButton = true;
    }
      this.VendorBillingAliasId = event[0]?.VendorBillingAliasId ? event[0]?.VendorBillingAliasId : 0;
      this.ChargeCodeData['vendorBillingAliasId'] = this.VendorBillingAliasId;
      if(event[0].ChargeCodeId !== null)
      {
        this.ChargeCodeData['chargeCodeId'] = event[0].ChargeCodeId;
        this.chargeCodeId =event[0].ChargeCodeId;
      }
      this.selectedRow = event[0];
      this.getAdditionalBillDetail();
      this.chargeCodeForm.reset();
      this.gridApi.setFilterModel(null);
      this.chargeCodeRowdata = event && event.length == 0 ? [] : '';
  }
  onChargeCodeTypeChange(data: any) {
    if (this.f.chargeCodeTypeId.valid && this.f.chargeCodeTypeId.value) {
      const id = Number(this.f.chargeCodeTypeId.value);
      this.f.chargeTypeId.setValue('');
      this.getTaxRegulatoryTypes(id);
    } else {
      this.taxTypes = [];
      this.f.chargeTypeId.setValue('');
    }
  }
  
  getTaxRegulatoryTypes(id: any) {
    let passData = {
      IsOnlyActiveNeed: true
    }
    this.locationService.getTaxRegulatoryTypes(id, passData).subscribe((data) => {
      if (data.Success) {
        this.taxTypes = data.Data.$values;
      } else {
        this.taxTypes = [];
      }
    });
  }
  getAdditionalBillDetail() {
    if(this.selectedRow?.SBChargeDetailId) {
      this._unsubscribeBillDetail.next(null);
      this.sandboxService.ChargeCodeContextDetails(this.selectedRow.SBChargeDetailId).pipe(takeUntil(this._unsubscribeBillDetail))
      .subscribe((data: any) => {
        if(data.Success) {
          this.additionalBillData = data.Data;
          this.getBlankAssignment();
          this.additionalBillData['Charges'] = data.Data.Charges ? this.overviewData?.CurrencySymbol + parseFloat(data.Data.Charges).toFixed(2) : `${this.overviewData?.CurrencySymbol}0.00`;
          this.additionalBillData['Charges'] = data.Data?.Charges.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }
      });
    } else {
      this.additionalBillData = {}
    }
  }
  getChargeCodeContextBlank() {
    if (!checkIsValueExists(this.sandBoxGridRowData.SBInvoiceId)) {
      return;
    }
    this._unsubscribeChargeCode.next(null);
     let data = {
      sbChargeDetailsID: this.sbChargeDetailId
    }
    this.sandboxService.ChargeCodeContextBlank(this.sandBoxGridRowData.SBInvoiceId, data).pipe(takeUntil(this._unsubscribeChargeCode))
    .subscribe(
      async (data: any) => {
        this.rowData = data.Data.$values;
        if(this.rowData[0]?.BillingId == '' || this.rowData[0]?.BillingId == null){
          this.openDialog = true;
          this.showSaveButton = false;
        } else {
          this.openDialog = false;
          this.showSaveButton = true;
        }
        _.map(this.rowData, (x: any) => {
          const a = x;
          a['Charges'] = (x.Charges) ? this.overviewData?.CurrencySymbol + parseFloat(x['Charges']).toFixed(2) : `${this.overviewData?.CurrencySymbol}0.00`;
          return a;
        });
        if (this.rowData && this.rowData[0]) {
          this.rowData[0]['isChecked'] = true;
        }
      });
  }

  getBlankAssignment() {
    this._unsubscribeBlankChargeCode.next(null);
   
    this.sandboxService.ChargeCode(this.ChargeCodeData).pipe(takeUntil(this._unsubscribeBlankChargeCode))
    .subscribe(
      async (data: any) => {
        this.chargeCodeRowdata = this.processData(data.Data.$values);
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
  get f(): any {
    return this.chargeCodeForm.controls;
  }

  searchChargeCode() {
    let chargeCodeTypeName;
    let chargeTypeName;
    if(this.f.chargeCodeTypeId.value) {
      chargeCodeTypeName =  _.find(this.chargeCodeTypes, (x: any) => x.Id == this.f.chargeCodeTypeId.value).Name;
    }

    if(this.f.chargeTypeId.value) {
      chargeTypeName =  _.find(this.taxTypes, (x: any) => x.Id == this.f.chargeTypeId.value).Name;
    }

    var hardcodedFilter = {
      ChargeCodeType: { type: 'equals', filter: chargeCodeTypeName },
      ChargeType: { type: 'equals', filter: chargeTypeName }
    };
    this.gridApi.setFilterModel(hardcodedFilter);
  }

  onChargeCodeChange(data: any) {
    this.chargeCodeSelected = data.length > 0 ? true : false;
    this.selectedChargeCode = data[0].data;
  }

  assignBlankChangeCode() {
    this.saveButtonDisabled = true;
    let passData = {
      vendorBillingAliasId: this.selectedChargeCode.VendorBillingAliasId,
      chargeCodeId: this.selectedChargeCode.ChargeCodeId,
      sbChargeDetailId: [this.additionalBillData.SBChargeDetailId]
    }
    this._unsubscribeCharge.next(null);
    this.sandboxService.AssignBlankChangeCode(this.sandBoxGridRowData.SBInvoiceId, passData).pipe(takeUntil(this._unsubscribeCharge))
    .subscribe({
      next: (data: any) => {
        this.saveButtonDisabled = false;

        let errorData: any = {
          messgeType: 'error',
          title: 'Attention',
          titleClass: 'text-c-blue',
          icon: 'fas fa-exclamation-circle',
          iconClass: 'text-c-blue f-70',
          message: data.Message
        };
        this.dialog.open(ErrorWarningPopupComponent, {
          panelClass: 'error-warning',
          data: errorData,
        });

        this.getChargeCodeContextBlank();
        this.onSaveRedirect.emit(true);
        if(data?.Other?.NeedToCheckNextStep) {
          this.sandboxService.getInvoiceStep(this.sandBoxGridRowData.SBInvoiceId).subscribe(()=> {
          })
        }
      }
    });
  }

  saveAndAddDistribution() {

    if (this.openDialog && (this.selectedChargeCode?.ChargeCodeType == 'Product' || this.selectedChargeCode?.ChargeCodeType == 'Feature' || this.selectedChargeCode?.ChargeCodeType == 'Usage' || this.selectedChargeCode?.ChargeCodeType == 'Equipment')) {
      const dialogRef = this.dialog.open(ChargeCodeAssignmentDialogComponent, {
        width: '700px',
        data: {
          msg1: 'Please review the Charge Code Type and Charge Type. Incorrect Charge Code assignment can result in unbelievably bad data.',
          btnMsg: 'This is correct, please save it!'
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.saveButtonDisabledForDistribution = true;
          let passData = {
            vendorBillingAliasId: this.selectedChargeCode.VendorBillingAliasId,
            chargeCodeId: this.selectedChargeCode.ChargeCodeId,
            sbChargeDetailId: [this.additionalBillData.SBChargeDetailId],
            IsAddDistribution: true
          }
          this._unsubscribeCharge.next(null);
          this.sandboxService.AssignBlankChangeCode(this.sandBoxGridRowData.SBInvoiceId, passData).pipe(takeUntil(this._unsubscribeCharge))
          .subscribe({
            next: (data: any) => {
              this.saveButtonDisabledForDistribution = false;
    
              let errorData: any = {
                messgeType: 'error',
                title: 'Attention',
                titleClass: 'text-c-blue',
                icon: 'fas fa-exclamation-circle',
                iconClass: 'text-c-blue f-70',
                message: data.Message
              };
              const dialogRef = this.dialog.open(ErrorWarningPopupComponent, {
                panelClass: 'error-warning',
                data: errorData,
              });
    
              this.getChargeCodeContextBlank();
              this.onSaveRedirect.emit(true);
              if(data?.Other?.NeedToCheckNextStep) {
                this.sandboxService.getInvoiceStep(this.sandBoxGridRowData.SBInvoiceId).subscribe(()=> {
                })
              }
            }
          });
         }
      });
    } else {
      this.saveButtonDisabledForDistribution = true;
      let passData = {
        vendorBillingAliasId: this.selectedChargeCode.VendorBillingAliasId,
        chargeCodeId: this.selectedChargeCode.ChargeCodeId,
        sbChargeDetailId: [this.additionalBillData.SBChargeDetailId],
        IsAddDistribution: true
      }
      this._unsubscribeCharge.next(null);
      this.sandboxService.AssignBlankChangeCode(this.sandBoxGridRowData.SBInvoiceId, passData).pipe(takeUntil(this._unsubscribeCharge))
      .subscribe({
        next: (data: any) => {
          this.saveButtonDisabledForDistribution = false;

          let errorData: any = {
            messgeType: 'error',
            title: 'Attention',
            titleClass: 'text-c-blue',
            icon: 'fas fa-exclamation-circle',
            iconClass: 'text-c-blue f-70',
            message: data.Message
          };
          const dialogRef = this.dialog.open(ErrorWarningPopupComponent, {
            panelClass: 'error-warning',
            data: errorData,
          });

          this.getChargeCodeContextBlank();
          this.onSaveRedirect.emit(true);
          if(data?.Other?.NeedToCheckNextStep) {
            this.sandboxService.getInvoiceStep(this.sandBoxGridRowData.SBInvoiceId).subscribe(()=> {
            })
          }
        }
      });
    }
  }

  ngOnDestroy() {
    this._unsubscribeBillDetail.next(null);
    this._unsubscribeBillDetail.complete();
    this._unsubscribeCharge.next(null);
    this._unsubscribeCharge.complete();
    this._unsubscribeChargeCode.next(null);
    this._unsubscribeChargeCode.complete();
    this._unsubscribeBlankChargeCode.next(null);
    this._unsubscribeBlankChargeCode.complete();
  }
}
