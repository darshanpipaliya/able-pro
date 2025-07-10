import { Component, Inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AddNewChargeCodePopupComponent } from './add-new-charge-code-popup/add-new-charge-code-popup.component';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import * as _ from 'lodash';
import { ChargeCodeAssignmentDialogComponent } from './charge-code-assignment-dialog/charge-code-assignment-dialog.component';
import { LocationService } from 'src/app/services/location.service';
import { SandBoxService } from 'src/app/services/sandbox.service';
import { checkIsValueExists, isValueExist } from 'src/app/services/helper';
import { ErrorWarningPopupComponent } from 'src/app/common/error-warning-popup/error-warning-popup.component';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { AgGridModule } from 'ag-grid-angular';
import { AgGridTableComponent } from 'src/app/common/ag-grid-table/ag-grid-table.component';

@Component({
  selector: 'app-add-correction',
  templateUrl: './add-correction.component.html',
  styleUrls: ['./add-correction.component.scss'],
  imports: [SharedModule, PrimgModule, AgGridModule, AgGridTableComponent]
})
export class AddCorrectionComponent implements OnInit {
  public columnDefs1;
  public columnDefs;
  subAccounts: any;
  rowData: any = [];
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
  isAllowTab;
  chargeCodeTypes: any = [];
  vendors: any = [];
  billingAlias: any = [];

  sideBar = {
    toolPanels: [{ id: 'columns',
      labelDefault: 'Columns',
      labelKey: 'columns',
      iconKey: 'columns',
      toolPanel: 'agColumnsToolPanel',
      toolPanelParams: {
        suppressRowGroups: true,
        suppressValues: true,
        suppressPivotMode: true
      }}, 'filters']
  };
  @ViewChild('tooltipText') tooltipText!: TemplateRef<any>;
  @ViewChild('chargeLocationtooltip') chargeLocationtooltip!: TemplateRef<any>;
  @ViewChild('vendorText') vendorText!: TemplateRef<any>;


  private _unsubscribeUnit: Subject<any> = new Subject<any>();
  private _unsubscribeParent: Subject<any> = new Subject<any>();
  private _unsubscribeVBAbyChargeCode: Subject<any> = new Subject<any>();

  taxTypes: any = [];
  selectedRecord;
  SBInvoiceId: any;
  measureList:any = [];
  locations:any = [];
  isChargeCodeFormSubmit: boolean = false;
  private gridApi!: any;
  selectedCode: any = [];
  rowData1:any = [];
  public getDataPath: any = (data: any) => data.dataPath;

  chargecodeForm: FormGroup;
  saveButtonLoadder = false;
  saveButtonLoadder2 = false;
  chargeCodeType: any;
  openAssignmentDialog: boolean = false;
  showSaveButton: boolean = false;
  public VendorAccountId;
  public VendorBillingAliasId;
  public sandboxGridValue;
  public overviewData;

  allSelectedRowsBillId = false;
  constructor(public dialog: MatDialog,
    private fb: FormBuilder,
    private dialogref: MatDialogRef<AddCorrectionComponent>, 
    private locationService: LocationService, @Inject(MAT_DIALOG_DATA) data: any, public sandBoxService: SandBoxService) {

    this.selectedRecord = data.selected;
    this.sandboxGridValue = data.sandBoxGridRowData;
    this.overviewData = data.overviewData;
    dialogref.disableClose = true;
    this.VendorBillingAliasId = data.sandBoxGridRowData.VendorBillingAliasId;
    this.VendorAccountId = data.sandBoxGridRowData.VendorAccountId;

    if(this.selectedRecord.length == 0) {
      this.VendorBillingAliasId = data.sandBoxGridRowData.VendorBillingAliasId;
      this.VendorAccountId = data.sandBoxGridRowData.VendorAccountId;
    } else if(this.selectedRecord.length == 1) {
      this.VendorBillingAliasId = this.selectedRecord[0].VendorBillingAliasId;
      this.VendorAccountId = this.selectedRecord[0].VendorAccountId;
    } else {
      if (data.fromTabC) {
        // changes in api so changed code
        // let items:any = [];
        // _.forEach(this.selectedRecord, (n: any) => {
        //   _.forEach(n.sBChargeValidationsByChargeCodeDataDtos.$values, (j: any) => {
        //     items.push(j);
        //   });
        // });

        const vendorAcc = _.countBy(this.selectedRecord, 'VendorAccountId');
        this.VendorAccountId = _.maxBy(Object.keys(vendorAcc), (id) => vendorAcc[id]); 
        const vendorBillingAlias = _.countBy(this.selectedRecord, 'VendorBillingAliasId');
        this.VendorBillingAliasId = _.maxBy(Object.keys(vendorBillingAlias), (id) => vendorBillingAlias[id]);

      } else {
        const vendorAcc = _.countBy(this.selectedRecord, 'VendorAccountId');
        this.VendorAccountId = _.maxBy(Object.keys(vendorAcc), (id) => vendorAcc[id]); 

        const vendorBillingAlias = _.countBy(this.selectedRecord, 'VendorBillingAliasId');
        this.VendorBillingAliasId = _.maxBy(Object.keys(vendorBillingAlias), (id) => vendorBillingAlias[id]);
      }
    }

    if(this.selectedRecord && this.selectedRecord.length > 0)
      this.allSelectedRowsBillId = _.every(this.selectedRecord, (x: any) => isValueExist(x.BillingId));
   
    if(this.selectedRecord && this.selectedRecord.length == 1){
      if(this.selectedRecord[0]?.BillingId == null || this.selectedRecord[0]?.BillingId == ''){
        this.openAssignmentDialog = true;
        this.showSaveButton = false;
      } else {
        this.openAssignmentDialog = false;
        this.showSaveButton = true;
      }
    } else {
      const findObj = _.find(this.selectedRecord,(res: any)=>{
        return res.BillingId == null || res.BillingId == '';
      })
      if(findObj){
        this.openAssignmentDialog = true;
        this.showSaveButton = false;
      } else {
        this.openAssignmentDialog = false;
        this.showSaveButton = true;
      }
    }
    this.SBInvoiceId = data.SBInvoiceId;
    this.isAllowTab = data.fromTabC;
  

    this.columnDefs = [
      {
        headerCheckboxSelection: false,
        checkboxSelection: true,
        floatingFilter: true,
        suppressMenu: true,
        minWidth: 150,
        maxWidth: 50,
        width: 100,
        flex: 0,
        resizable: true,
        sortable: false,
        filter: false,
        suppressColumnsToolPanel: true,
      },
      // {
      //   headerName: 'Charge Code Name',
      //   field: 'ChargeCodeName',
      //   columnGroupShow: 'open',
      //   editable: false,
      //   filter: 'agTextColumnFilter',
      //   minWidth: 250,
      //   flex: 0
      // },
      {
        headerName: 'VBA',
        field: 'VendorBillingAliasName',
        columnGroupShow: 'close',
        editable: false,
        filter: 'agTextColumnFilter',
        minWidth: 200,
        flex: 0
      },
      {
        headerName: 'Vendor',
        field: 'VendorAccountName',
        columnGroupShow: 'close',
        editable: false,
        filter: 'agTextColumnFilter',
        minWidth: 200,
        flex: 0
      },
      {
        headerName: 'Charge Code Name',
        field: 'ChargeCodeName',
        columnGroupShow: 'close',
        editable: false,
        filter: 'agTextColumnFilter',
        minWidth: 200,
        flex: 0
      },
      {
        headerName: 'Charge Code',
        field: 'ChargeCodeNm',
        columnGroupShow: 'close',
        editable: false,
        filter: 'agTextColumnFilter',
        minWidth: 200,
        flex: 0
      },
      {
        field: 'ChargeCodeTypeName',
        headerName: 'Charge Code Type',
        columnGroupShow: 'close',
        editable: false,
        filter: 'agTextColumnFilter',
        minWidth: 200,
        flex: 0
      },
      {
        field: 'ChargeTypeName',
        headerName: 'Charge Type',
        columnGroupShow: 'close',
        editable: false,
        filter: 'agTextColumnFilter',
        minWidth: 200,
        flex: 0
      },
      {
        headerName: 'Charge Code Occurence',
        field: 'ChargeCodeOccurrenceName',
        columnGroupShow: 'close',
        editable: false,
        filter: 'agTextColumnFilter',
        minWidth: 250,
        flex: 0
      },

    ];

    this.columnDefs1 = [
      {
        headerName: 'Vendor',
        children: [
          {
            field: 'VendorBillingAlias',
            headerName: 'Vendor Billing Alias By Charge Code',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 310,
            flex: 0
          },
          {
            field: 'VendorAccountName',
            headerName: 'Child Vendor',
            filter: 'agTextColumnFilter',
            minWidth: 150,
            flex: 0,
            cellEditor: 'agRichSelectCellEditor',
            // cellEditorParams: {
            //   values: this.renderVendor
            // },
          }
        ],
      },
      {
        headerName: 'Detail',
        children: [
          {
            field: 'CountOfChargeCode',
            headerName: 'Count Of Charge Codes',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agTextColumnFilter',
            minWidth: 250,
            flex: 0,
            valueGetter(params: any) {
              if (params?.data?.CountOfChargeCode) {
                return params?.data?.CountOfChargeCode.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
              }
              return '';
            }
          },
          {
            field: 'TotalAmount',
            headerName: 'Total Amount',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agNumberColumnFilter',
            minWidth: 145,
            flex: 0,
            valueFormatter: (params: any) => this.currencyFormatter(params.data.TotalAmount, this.overviewData?.CurrencySymbol),
            cellStyle: {display: 'flex !important', 'justify-content': 'end','padding-right':'20px'}
          },
          {
            field: 'PercentOfTotal',
            headerName: '% of Total',
            columnGroupShow: 'close',
            editable: false,
            filter: 'agNumberColumnFilter',
            minWidth: 120,
            flex: 0,
            valueFormatter: (params: any) => this.percentageFormatter(params.data.PercentOfTotal, '%'),
          }
        ],
      },

    ];
    this.chargecodeForm = fb.group({
      quantity: new FormControl(1, [Validators.required]),
      unitOfMeasureId: new FormControl(null),
      chargeLocationTypeId: new FormControl('', [Validators.required]),
      chargeAdjustmentNote: new FormControl('', [Validators.required]),
      subaccountNumber1: new FormControl(null),
      charge: new FormControl(null, [Validators.required]),
      origin: new FormControl(!this.selectedRecord[0]?.BillingId ? 'payableAccount' : 'billingId', [Validators.required]),
    });

    if (this.f.origin.value === 'billingId') {
      this.chargecodeForm.get('subaccountNumber1')?.setValidators([Validators.required]);
      this.chargecodeForm.get('subaccountNumber1')?.clearValidators();
    }
  }
  currencyFormatter(currency: any, sign: any) {
    var sansDec = currency.toFixed(2);
    // var formatted = sansDec.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return sign + `${sansDec.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
  }

  
  percentageFormatter(currency: any, sign: any) {
    var sansDec = currency.toFixed(2);
    // var formatted = sansDec.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return `${sansDec.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}` + sign;
  }
  gridOptions = {
    enableFiltering: true,
    headerHeight: 35,
    groupHeaderHeight: 37,
    floatingFiltersHeight: 35
  };

  tooltipRef: any;

  openDialog(): void {
    this.tooltipRef = this.dialog.open(this.tooltipText, {
      width: '700px',
          data: {
            colseButton: true,
          }
    });
  }

  openDialogVBA() {
    this.tooltipRef = this.dialog.open(this.vendorText, {
      width: '700px',
          data: {
            colseButton: true,
          }
    });
  }

  openDialogCL(): void {
    this.tooltipRef = this.dialog.open(this.chargeLocationtooltip, {
      width: '800px',
          data: {
            colseButton: true,
          }
    });
  }

  closeDialog() {
    this.dialogref.close()
  }

  closeDialogTooltip() {
    this.tooltipRef.close()
  }
  searchChargeCode() {
    let chargeCodeTypeName;
    let chargeTypeName;
    if (this.f.chargeCodeTypeId.value) {
      chargeCodeTypeName = _.find(this.chargeCodeTypes, (x: any) => x.Id == this.f.chargeCodeTypeId.value).Name;
    }

    if (this.f.chargeTypeId.value) {
      chargeTypeName = _.find(this.taxTypes, (x: any) => x.Id == this.f.chargeTypeId.value).Name;
    }

    var filterValue = {
      ChargeCodeType: { type: 'equals', filter: chargeCodeTypeName },
      ChargeType: { type: 'equals', filter: chargeTypeName }
    };
    this.gridApi.setFilterModel(filterValue);
  }
  get f() : any{
    return this.chargecodeForm.controls;
  }

  get form() : any{
    return this.chargecodeForm;
  }

  getChargeCodeTypes() {
    let passData = {
      IsOnlyActiveNeed: true
    }
    this.locationService.getChargeCodeTypes(passData).subscribe((data) => {
      if (data) {
        this.chargeCodeTypes = data.Data.$values;
      }
    });
  }

  getSubAccountDropDown() {
    this.sandBoxService.subAccountDropDown(this.SBInvoiceId).subscribe((data: any) => {
      if (data.Success) {
        this.subAccounts = data.Data.$values;
      }
    });

  }

  checkValue(event: any) {
    if (event.target.value < 0) {
      event.target.value = 1;
    }
  }

  getParentChargeCode() {
    this._unsubscribeParent.next(null);

    let parentChargeCodeData = {
      VendorAccountId: isValueExist(this.VendorAccountId, true),
      VendorBillingAliasId: this.VendorBillingAliasId
    }
    this.locationService.getChargecodesLogged(parentChargeCodeData).pipe(takeUntil(this._unsubscribeParent))
      .subscribe((data: any) => {
        if (data.Success) {
          this.rowData = data.Data.$values;
        }
      });


    this._unsubscribeVBAbyChargeCode.next(null);
    this.sandBoxService.getVBAbyChargeCode(this.SBInvoiceId)
      .pipe(takeUntil(this._unsubscribeVBAbyChargeCode))
      .subscribe((data: any) => {
        if (data && data.Success) {
          this.rowData1 = data.Data.$values;
        } else {
          this.rowData1 = [];
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

  radioChangeOrigin(e: any) {
    if (e.value === "subAccount" && this.subAccounts && this.subAccounts.length > 0) {
      this.chargecodeForm.get('subaccountNumber1')?.setValidators([]);
      this.chargecodeForm.get('subaccountNumber1')?.clearValidators();
    } else {
      this.chargecodeForm.get('subaccountNumber1')?.setValidators([Validators.required]);
      this.chargecodeForm.get('subaccountNumber1')?.clearValidators();
    }

    if (e.value === 'payableAccount' || e.value === 'subAccount') {
      this.locations = this.locations.map((l: any) => {
        let a: any = {};
        a = l;
        if (a['Type'] === 'Service Level') {
          a['disabled'] = true;
          this.f.chargeLocationTypeId.setValue('');
        } else {
          a['disabled'] = false;
        }
 
        return a;
      })
    } else {
      this.locations = this.locations.map((l: any) => {
        let a: any = {};
        a = l;
        a['disabled'] = false;
        return a;
      })
    }
  }

  submitForm() {

    this.isChargeCodeFormSubmit = true;
    if (this.chargecodeForm.valid) {
      delete this.form.value.chargeCodeTypeId;
      delete this.form.value.chargeTypeId;
      delete this.form.value.origin;

      if (!this.selectedCode.length) {
        let errorData: any = {
          messgeType: "error",
          title: "Attention",
          titleClass: "text-c-blue",
          icon: "fas fa-exclamation-triangle",
          iconClass: "text-c-blue f-70",
          message: 'Please select a Charge Code'
        }
        const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
        dialogRef.afterClosed().subscribe(result => {

        });
      } else {
        let data = this.chargecodeForm.value;
        data['vendorBillingAlias'] = (this.selectedCode[0] && this.selectedCode[0].VendorBillingAliasName) ? this.selectedCode[0].VendorBillingAliasName : null;
        data['vendorBillingAliasId'] = (this.selectedCode[0] && this.selectedCode[0].VendorBillingAliasId) ? this.selectedCode[0].VendorBillingAliasId : null;
       
        this.selectedCode && this.selectedCode[0] ? data['chargeCodeId'] = this.selectedCode[0].ChargeCodeId : '';
        // if (this.f.origin.value == 'subAccount') {
        //   this.f.subaccountNumber1.value ? data['subaccountNumber1'] = this.f.subaccountNumber1.value : '';
        // } else {
        //   data['subaccountNumber1'] ? delete data['subaccountNumber1'] : '';
        // }
        // data['AccountNumber'] = this.f.subaccountNumber1.value ? this.f.subaccountNumber1.value : this.selectedRecord[0].MainAccountNumber;
        if(this.selectedRecord?.length == 0) {
          data['AccountNumber'] = this.f.subaccountNumber1.value ? this.f.subaccountNumber1.value : this.sandboxGridValue.PayableBillingAccountNumber
        } else {
          data['AccountNumber'] = this.f.subaccountNumber1.value ? this.f.subaccountNumber1.value : this.selectedRecord[0].MainAccountNumber
        }

        delete data['subaccountNumber1'];
        data['inventoryId'] = [];
        data['SBChargeDetailIds'] = [];
        this.selectedRecord.forEach((element: any) => {

          if (element.SBChargeDetailId) {
            data['SBChargeDetailIds'].push(element.SBChargeDetailId)
          } else {
            data['inventoryId'].push(element.InventoryId)
          }
        });
        data['inventoryId'] = Array.from(data['inventoryId']);
        if (!checkIsValueExists(data['inventoryId'])) {
          delete data['inventoryId'];
          data['sbChargeDetailIds'] = this.selectedRecord[0].SBChargeDetailId;
        }

        if (this.f.origin.value == 'billingId' || this.f.origin.value == 'payableAccount') {
          data['IsPayableAndBillingAccount'] = true;
        } else {
          data['IsPayableAndBillingAccount'] = false;
        }

        this.saveButtonLoadder = true;
        this.sandBoxService.addCorrection(this.SBInvoiceId, data).pipe(takeUntil(this._unsubscribeParent))
          .subscribe((data: any) => {
            this.saveButtonLoadder = false;

            if (data.Success) {
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
                this.dialogref.close();
              });
            } else {
              this.saveButtonLoadder = false;
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
                  
                });
            }

            if(data?.Other?.NeedToCheckNextStep) {
              this.sandBoxService.getInvoiceStep(this.SBInvoiceId).subscribe(()=> {
              })
            }
          }, error => { })

      }

    }
  }

  saveAndAddDistribution() {
   
    if (this.openAssignmentDialog && (this.selectedCode[0]?.ChargeCodeTypeName == 'Product' || this.selectedCode[0]?.ChargeCodeTypeName == 'Feature' || this.selectedCode[0]?.ChargeCodeTypeName == 'Usage' || this.selectedCode[0]?.ChargeCodeTypeName == 'Equipment')) {

      const dialogRef = this.dialog.open(ChargeCodeAssignmentDialogComponent, {
        width: '700px',
        data: {
          msg1: 'Please review the Charge Code Type and Charge Type.',
          msg2: 'Incorrect Charge Code can result in very bad data and will require a distribution rule to be built in later steps.',
          btnMsg: 'Assignment is correct, please save it!'
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.isChargeCodeFormSubmit = true;
          if (this.chargecodeForm.valid) {
            delete this.form.value.chargeCodeTypeId;
            delete this.form.value.chargeTypeId;
            delete this.form.value.origin;

            if (!this.selectedCode.length) {
              let errorData: any = {
                messgeType: "error",
                title: "Attention",
                titleClass: "text-c-blue",
                icon: "fas fa-exclamation-triangle",
                iconClass: "text-c-blue f-70",
                message: 'Please select a Charge Code'
              }
              const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
              dialogRef.afterClosed().subscribe(result => {

              });
            } else {
              let data = this.chargecodeForm.value;
              data['vendorBillingAlias'] = (this.selectedCode[0] && this.selectedCode[0].VendorBillingAliasName) ? this.selectedCode[0].VendorBillingAliasName : null;
              data['vendorBillingAliasId'] = (this.selectedCode[0] && this.selectedCode[0].VendorBillingAliasId) ? this.selectedCode[0].VendorBillingAliasId : null;
              this.selectedCode && this.selectedCode[0] ? data['chargeCodeId'] = this.selectedCode[0].ChargeCodeId : '';
              data['AccountNumber'] =  this.f.subaccountNumber1.value ? this.f.subaccountNumber1.value : this.selectedRecord[0].MainAccountNumber;

              delete data['subaccountNumber1'];
              data['inventoryId'] = [];
              data['SBChargeDetailIds'] = [];
              this.selectedRecord.forEach((element: any) => {

                if (element.SBChargeDetailId) {
                  data['SBChargeDetailIds'].push(element.SBChargeDetailId)
                } else {
                  data['inventoryId'].push(element.InventoryId)
                }
              });

              if (!checkIsValueExists(data['inventoryId'])) {
                delete data['inventoryId'];
                data['sbChargeDetailIds'] = this.selectedRecord[0]?.SBChargeDetailId;
              }

              if (this.f.origin.value == 'billingId' || this.f.origin.value == 'payableAccount') {
                data['IsPayableAndBillingAccount'] = true;
              } else {
                data['IsPayableAndBillingAccount'] = false;
              }
              data['IsAddDistribution'] = true;
              this.saveButtonLoadder2 = true;
            
              this.sandBoxService.addCorrection(this.SBInvoiceId, data).pipe(takeUntil(this._unsubscribeParent))
                .subscribe((data: any) => {
                  this.saveButtonLoadder2 = false;

                  if (data.Success) {
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
                      this.dialogref.close();
                    });
                  } else {
                    this.saveButtonLoadder2 = false;
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
                    });
                  }

                  if(data?.Other?.NeedToCheckNextStep) {
                    this.sandBoxService.getInvoiceStep(this.SBInvoiceId).subscribe(()=> {
                    })
                  }
                }, error => { })
            }
          }
        }
      });
    } else {
      this.isChargeCodeFormSubmit = true;
      if (this.chargecodeForm.valid) {
        delete this.form.value.chargeCodeTypeId;
        delete this.form.value.chargeTypeId;
        delete this.form.value.origin;

        if (!this.selectedCode.length) {
          let errorData: any = {
            messgeType: "error",
            title: "Attention",
            titleClass: "text-c-blue",
            icon: "fas fa-exclamation-triangle",
            iconClass: "text-c-blue f-70",
            message: 'Please select a Charge Code'
          }
          const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
          dialogRef.afterClosed().subscribe(result => {

          });
        } else {
          let data = this.chargecodeForm.value;
          data['vendorBillingAlias'] = (this.selectedCode[0] && this.selectedCode[0].VendorBillingAliasName) ? this.selectedCode[0].VendorBillingAliasName : null;
          data['vendorBillingAliasId'] = (this.selectedCode[0] && this.selectedCode[0].VendorBillingAliasId) ? this.selectedCode[0].VendorBillingAliasId : null;
          this.selectedCode && this.selectedCode[0] ? data['chargeCodeId'] = this.selectedCode[0].ChargeCodeId : '';
  
          if(this.selectedRecord?.length == 0) {
            data['AccountNumber'] = this.f.subaccountNumber1.value ? this.f.subaccountNumber1.value : this.sandboxGridValue.PayableBillingAccountNumber
          } else {
            data['AccountNumber'] = this.f.subaccountNumber1.value ? this.f.subaccountNumber1.value : this.selectedRecord[0].MainAccountNumber
          }
          delete data['subaccountNumber1'];
          data['inventoryId'] = [];
          data['SBChargeDetailIds'] = [];
          this.selectedRecord.forEach((element: any) => {

            if (element.SBChargeDetailId) {
              data['SBChargeDetailIds'].push(element.SBChargeDetailId)
            } else {
              data['inventoryId'].push(element.InventoryId)
            }
          });

          if (!checkIsValueExists(data['inventoryId'])) {
            delete data['inventoryId'];
            data['sbChargeDetailIds'] = this.selectedRecord[0].SBChargeDetailId;
          }

          if (this.f.origin.value == 'billingId' || this.f.origin.value == 'payableAccount') {
            data['IsPayableAndBillingAccount'] = true;
          } else {
            data['IsPayableAndBillingAccount'] = false;
          }
          data['IsAddDistribution'] = true;
          this.saveButtonLoadder2 = true;

        
          this.sandBoxService.addCorrection(this.SBInvoiceId, data).pipe(takeUntil(this._unsubscribeParent))
            .subscribe((data: any) => {
              this.saveButtonLoadder2 = false;

              if (data.Success) {
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
                  this.dialogref.close();
                });
              } else {
                this.saveButtonLoadder2 = false;
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
                });
              }
              if(data?.Other?.NeedToCheckNextStep) {
                this.sandBoxService.getInvoiceStep(this.SBInvoiceId).subscribe(()=> {
                })
              }
            }, error => { })
        }
      }
    }
  }

  parentChargeCodeChange(event: any) {
    this.selectedCode = event;
    if(this.selectedRecord && this.selectedRecord.length == 1){
      if(this.selectedRecord[0].BillingId == null || this.selectedRecord[0].BillingId == ''){
        this.openAssignmentDialog = true;
        this.showSaveButton = false;
      } else {
        this.openAssignmentDialog = false;
        this.showSaveButton = true;
      }
    }
    this.selectedCode[0].ChargeCodeTypeName == 'Usage' ? this.chargeCodeType = true : this.chargeCodeType = false;
    if (this.chargeCodeType) {
      this.chargecodeForm.get('unitOfMeasureId')?.setValidators([Validators.required]);
      this.chargecodeForm.get('unitOfMeasureId')?.clearValidators();
    } else {
      this.chargecodeForm.get('unitOfMeasureId')?.setValidators([]);
      this.chargecodeForm.get('unitOfMeasureId')?.clearValidators();
    }
  }

  ngOnInit(): void {
    this.getunitOfMeasures();
    this.getChargeCodeTypes();
    this.getParentChargeCode();
    this.getSubAccountDropDown();
    this.chargeLocationTypes();
    this.getVendorsForUser();

  }
  getVendorsForUser() {
    this.locationService.getVendorDropdown().subscribe((data) => {
      if (data && data.Data.$values) {
        this.vendors = data.Data.$values;
      }
    });
  }

  getVendorBillingAlias(id: any) {
    this.locationService.getVendorBillingAlias(id).subscribe((data) => {
      if (data && data.$values) {
        this.billingAlias = data.$values;
      }
    });
  }
  chargeLocationTypes() {
    this.sandBoxService.chargeLocationTypes().subscribe((res: any) => {
      if (res.Success) {
        this.locations = res.Data.$values;
        this.locations = this.locations.map((l: any) => {
          let a: any = {};
          a = l;
          if (a['Type'] === 'Service Level' && !this.selectedRecord[0]?.BillingId ) {
              a['disabled'] = true;
          } else {
            a['disabled'] = false;
          }         
          return a;
        })

        if (this.allSelectedRowsBillId) {
          this.f.chargeLocationTypeId.setValue(1000);
        }
        
        if(this.selectedRecord?.length == 0) {
          this.f.chargeLocationTypeId.setValue(1001);
        }
      }
    })
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

  AddNewChargeCode() {
    const dialogRef = this.dialog.open(AddNewChargeCodePopupComponent, {
      width: '600px',
      data: {
        VendorAccountId: this.VendorAccountId,
        VendorBillingAliasId: this.VendorBillingAliasId,
        SBInvoiceId: this.SBInvoiceId
      }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      this.getParentChargeCode();
    })
  }


  getunitOfMeasures() {
    this._unsubscribeUnit.next(null);
    this.sandBoxService.getunitOfMeasures().pipe(takeUntil(this._unsubscribeUnit))
      .subscribe((data: any) => {
        if (data.Success) {

          this.measureList = data.Data.$values;
        }
      });
  }

  ngOnDestroy() {
    this._unsubscribeUnit.next(null);
    this._unsubscribeUnit.complete();
    this._unsubscribeParent.next(null);
    this._unsubscribeParent.complete();
    this._unsubscribeVBAbyChargeCode.next(null);
    this._unsubscribeVBAbyChargeCode.complete();
  }
}
