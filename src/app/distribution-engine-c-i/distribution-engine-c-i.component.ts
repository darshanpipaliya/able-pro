import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import _ from 'lodash';
import { MatDialog } from '@angular/material/dialog';
import moment from 'moment';
import { SandBoxService } from '../services/sandbox.service';
import { InvoiceService } from '../services/invoice.service';
import { WirelineService } from '../services/wireline.service';
import { ErrorWarningPopupComponent } from '../common/error-warning-popup/error-warning-popup.component';
import { ChargeCodeAssignmentDialogComponent } from '../common/charge-code-assignment-dialog/charge-code-assignment-dialog.component';
import { SharedModule } from '../demo/shared/shared.module';
import { InvoiceOverviewIComponent } from '../common/invoice-overview-i/invoice-overview-i.component';
import { AgGridTableComponent } from '../common/ag-grid-table/ag-grid-table.component';
import { PrimgModule } from '../demo/shared/primeng.module';
import { InventoryServiceNumberComponent } from './inventory-service-number/inventory-service-number.component';

@Component({
  selector: 'app-distribution-engine-c-i',
  templateUrl: './distribution-engine-c-i.component.html',
  styleUrls: ['./distribution-engine-c-i.component.scss'],
  standalone: true,
  providers: [SandBoxService, WirelineService],
  imports: [SharedModule, PrimgModule , AgGridTableComponent, InvoiceOverviewIComponent, InventoryServiceNumberComponent]
})
export class DistributionEngineCIComponent implements OnInit {
  public sideBar;
  sbInvoiceId: any;
  columnSecAccount: any;
  distributionForm: any;
  submitted = false;
  matchRecord = [];
  tableData: any;
  cols: any[];
  @Input() clickedRecord: any;
  @Input() gridRowData: any;
  @Output() redirectTab: EventEmitter<any> = new EventEmitter<any>();
  public saveButtonLoadder: Boolean = false;
  @Input() overViewData: any;
  @Input() isForEditDistribution: any;
  selected = 0;
  @ViewChild('BillingIDInvoice') BillingIDInvoice!: TemplateRef<any>;
  stopSpinner: boolean = false;
  private _unsubscribeInventory: Subject<any> = new Subject<any>();
  @ViewChild('DistributionLevel') DistributionLevel!: TemplateRef<any>;
  @ViewChild('DistributionType') DistributionType!: TemplateRef<any>;
  @ViewChild('DistributionOrigin') DistributionOrigin!: TemplateRef<any>;
  @ViewChild('DistributionMethod') DistributionMethod!: TemplateRef<any>;
  private _unsubscribeChangelog: Subject<any> = new Subject<any>();
  isDisableRule = true;
  loadChangelog = false;

  public columnDefs;
  public columnSubAccount;
  inventoryIds = [];
  rowDataInventory = [];
  selectedInventoryData = []; 

  rowData: any = [];
  rowSelection = 'multiple';
  rowData2: any = [];
  defaultColDef = {
    editable: true,
    sortable: true,
    minWidth: 100,
    resizable: true,
    floatingFilter: true,
    flex: 1,
  };

  gridOptions = {
    rowSelection: {
      type: 'multiple',
      enableClickSelection: true
    },
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
    minWidth: 280,
    resizable: true,
    checkboxSelection: true,
    editable: false
  };

  public getDataPath: any = (data: any) => data.dataPath;
  distributionLevels:any = [];
  distributionOrigin:any = [];
  distributionType:any = [];
  distributionMethod:any = [];
  distributionMethodAll:any = [];
  private _unsubscribeBillDetail: Subject<any> = new Subject<any>();
  public additionalBillData: any;
  public disType: any;
  public matchMethod: any;
  public distributionMethodTypeBillingAccountHierarchyIds: any;
  public distributionMethodTypeInventoryIds:any = [];
  public selectedOrigin: any;
  public selectedMethod: any;
  public responseData: any;
  public distributionDetail: any;
  public isDisableSave = false;
  columnBillInv: any;
  columns: any = [];
  public allDistributionTypes: any = [];

  private _unsubscribeLocation: Subject<any> = new Subject<any>();
  private _unsubscribeRule: Subject<any> = new Subject<any>();
  private _unsubscribeMethod: Subject<any> = new Subject<any>();
  private _unsubscribeOrigin: Subject<any> = new Subject<any>();
  private _unsubscribeSubacc: Subject<any> = new Subject<any>();
  private _unsubscribeBId: Subject<any> = new Subject<any>();
  displayRule = undefined;

  @ViewChild('RuleInfo') RuleInfo!: TemplateRef<any>;
  public isVendorGlobalDisabled: boolean = false;

  constructor(private _formBuilder: FormBuilder, public dialog: MatDialog, private sandboxService: SandBoxService, private invoiceService: InvoiceService, private wirelineService: WirelineService) {
    this.sideBar = {
      toolPanels: ['columns', 'filters']
    };
    
    this.columns = [
      { header: 'Rule Status' },
      { header: 'Distribution Level' },
      { header: 'Distribution Type' },
      { header: 'Distribution Origin' },
      { header: 'Distribution Method' },
      { header: 'Rule Option' },
      { header: 'Main Account Number' },
      { header: 'Sub Account Number' },
      { header: 'Billing ID' },
      { header: 'Time & Date' },
      { header: 'Who' }
    ];

    this.columnDefs = [
      
      {
        headerName: 'Accounts',
        children: [
       
          {
            field: 'MainAccountNumber',
            headerName: 'Main Billing Account Number',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 250
          },
          {
            field: 'SubAccountNumber',
            headerName: 'Sub Account Number',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 201
          },
          {
            field: 'PayableAccountNumber',
            headerName: 'Payable Account Number',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 230
          }
        ],
      },
      {
        headerName: 'Charge',
        children: [
          {
            field: 'Charges',
            headerName: 'Charge',
            columnGroupShow: 'close',
            filter: 'agNumberColumnFilter',
            editable: false,
            minWidth: 130,
            valueFormatter: (params: any) => this.currencyFormatter(params.data?.Charges, this.overViewData.CurrencySymbol),
            cellStyle: {display: 'flex !important', 'justify-content': 'end','padding-right':'50px'},
          }
        ]
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
            minWidth: 210,
          },
          {
            field: 'ChargeCode',
            headerName: 'Charge Code',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 160
          },
          {
            field: 'ChargeCodeType',
            headerName: 'Charge Code Type',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 200,
          },
          {
            field: 'ChargeType',
            headerName: 'Charge Type',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 150
          },
          {
            field: 'ChargeLocationType',
            headerName: 'Charge Location',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 175
          }
        ]
      }
    ];

    this.columnSubAccount = [
      {
        headerName: ' ',
        headerCheckboxSelection: true,
        checkboxSelection: true,
        floatingFilter: true,
        suppressMenu: true,
        minWidth: 50,
        maxWidth: 50,
        width: 50,
        flex: 0,
        resizable: true,
        sortable: true,
        editable: false,
        filter: false,
        suppressColumnsToolPanel: true,
      },
      {
        headerName: 'Inventory',
        children: [
          {
            field: 'SubAccountNumber',
            headerName: 'Sub Account Number',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 201
          },
          {
            field: 'MainAccountNumber',
            headerName: 'Main Account Number',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 250
          },
          {
            field: 'PayableAccountNumber',
            headerName: 'Payable Account Number',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 230
          },
          {
            field: 'BillingIdCount',
            headerName: 'Count of Service Numbers',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 230
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
            minWidth: 130
          }
        ]
      }
    ];

    this.columnBillInv = [
      {
        headerName: ' ',
        headerCheckboxSelection: true,
        checkboxSelection: true,
        floatingFilter: true,
        suppressMenu: true,
        minWidth: 50,
        maxWidth: 50,
        width: 50,
        flex: 0,
        resizable: true,
        sortable: true,
        editable: false,
        filter: false,
        suppressColumnsToolPanel: true,
      },
      {
        headerName: 'Inventory',
        children: [
          {
            field: 'ServiceNumber',
            headerName: 'Billing ID',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 128,
            sortingField: 'ServiceNumber'
          }
        ],
      },
      {
        headerName: 'Accounts',
        children: [
          {
            field: 'MainAccountNumber',
            headerName: 'Main Billing Account Number',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 227,
            sortingField: 'MainAccountNumber'
          },
          {
            field: 'SubAccountNumber',
            headerName: 'Sub Account Number',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 179,
            sortingField: 'SubAccountNumber'
          },
          {
            field: 'PayableAccountNumber',
            headerName: 'Payable Account Number',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 202,
            sortingField: 'PayableAccountNumber'
          }
        ]
      },
      {
        headerName: 'Charge',
        children: [
          {
            field: 'TotalCurrentChargesDisplay',
            headerName: 'Charge',
            columnGroupShow: 'close',
            filter: 'agNumberColumnFilter',
            editable: false,
            minWidth: 94,
            sortingField: 'TotalCurrentCharges',
            cellStyle: {display: 'flex !important', 'justify-content': 'end','padding-right':'50px'},
          }
        ]
      },
      {
        headerName: 'Vendor Product',
        children: [
          {
            field: 'VendorProductName',
            headerName: 'Vendor Product',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 150,
            sortingField: 'VendorProductName'
          },
          {
            field: 'ServiceName',
            headerName: 'Service',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 95,
            sortingField: 'ServiceName'
          },
          {
            field: 'ServiceType',
            headerName: 'Service Type',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 126,
            sortingField: 'ServiceType'
          },
          {
            field: 'ProductName',
            headerName: 'Product',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 120,
            sortingField: 'ProductName'
          },
          {
            field: 'ProductType',
            headerName: 'Product Type',
            columnGroupShow: 'open',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 130,
            sortingField: 'ProductType'
          }
        ]
      },
      {
        headerName: 'Status',
        children: [
          {
            field: 'InventoryStatusDisplayText',
            headerName: 'Status',
            columnGroupShow: 'close',
            filter: 'agTextColumnFilter',
            editable: false,
            minWidth: 90,
            sortingField: 'InventoryStatusDisplayText'
          }
        ]
      }
    ];
    
  }

  getDistributionChangelog() {
    if(this.clickedRecord.InvChargeDetailId) {
      this.loadChangelog = true;
      this._unsubscribeChangelog.next(true);
      this.sandboxService.getInvoiceDistributionChangeLog(this.clickedRecord.InvChargeDetailId).pipe(takeUntil(this._unsubscribeChangelog)).subscribe((data: any) => {
        this.loadChangelog = false;
        if(data.Success) {
          this.tableData = data.Data.$values;
        } else {
          this.tableData = [];
        }
      });
    }
  }

  convertToDateTime(date: any) {
    return moment(new Date(date)).format('MM/DD/YYYY h:mm');
  }

  currencyFormatter(currency: any, sign: any) {
    if (currency !== null && currency !== undefined) {
      const formatted = currency.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      return sign + formatted;
    }
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(this.DistributionLevel, {
      width: '900px',
          data: {
            colseButton: true,
          }
    });
  }

  replaceRule() {
    this.isDisableRule = false;
    this.distributionForm.enable();
    this.distributionForm.reset();
    this.isVendorGlobalDisabled = true;
    this.setValueInFormControl('distributionAccountLocationTypeId', 'Customer Specific');
    this.changeType('Customer Specific', true);
    
    // Disable other distribution types except Vendor Product Totals
    this.distributionType.forEach((type: any) => {
      type.disabled = type.Type !== 'Vendor Product Totals';
    });
    
    this.setValueInFormControl('distributionRulesTypeId', 'Vendor Product Totals');
    this.getDisType();
    this.selectedMethod = '';
    this.changeOrigin({ value: 'Vendor Product Totals' }, true);
    this.setValueInFormControl('ruleOption', 'monthly');
    this.setValueInFormControl('ruleStatus', true);
    this.displayRule = undefined;
    this.submitted = false;
    this.rowData = [];
    this.selectedInventoryData = [];
    this.rowData2 = [];
  }
  
  openDisOriginTooltip(): void {
    this.dialog.open(this.DistributionOrigin, {
      width: '900px'});
  }


  openDisMethodTooltip(): void {
    this.dialog.open(this.DistributionMethod, {
      width: '900px'
    });
  }

  openDisTypeTooltip(): void {
    this.dialog.open(this.DistributionType, {
      width: '900px'
    });
  }

  

  openRuleInfoTooltip(): void {
    this.dialog.open(this.RuleInfo, {
      width: '900px'
    });
  }

  clickMainTab(e: any) {
    this.selected = e;
    const interval = setInterval(() => {
        if(this.selected == 1 && ( _.cloneDeep(this.distributionMethodTypeInventoryIds?.length) > 0)) {
          if(this.rowDataInventory.length > 0) {
            let errorData: any = {  
              messgeType: "error",
              title: "Attention",
              titleClass: "text-c-blue",
              icon: "fas fa-exclamation-circle",
              iconClass: "text-c-blue f-70",
              message: 'Would you like to save your selection and continue selecting other Service Numbers?',
              okBtnName: 'Yes, Continue',
              closeBtnName: 'No, Discard Changes'
            }
            const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
            dialogRef.afterClosed().subscribe((result) => {
              if (result == false) {
                this.distributionMethodTypeInventoryIds = [];
                this.rowData.forEach((node: any) => {
                  node['isChecked'] = false;
                });
              } else {
                let arrayTemp = [...this.distributionMethodTypeInventoryIds];
                this.rowData.forEach((node: any) => {
                  const d = arrayTemp.some(r => r === node.InventoryId);
                  node['isChecked'] = d;
                  if(d) {
                    const index = arrayTemp.findIndex(item => item === node.InventoryId);
                    if (index !== -1) {
                      arrayTemp.splice(index, 1);
                    }
                  }
                });
              }
            })
          } else {
            let arrayTemp = [...this.distributionMethodTypeInventoryIds];
            this.rowData.forEach((node: any) => {
              const d = arrayTemp.some(r => r === node.InventoryId);
              node['isChecked'] = d;
              if(d) {
                const index = arrayTemp.findIndex(item => item === node.InventoryId);
                if (index !== -1) {
                  arrayTemp.splice(index, 1);
                }
              }
            });
          }
        } else if(this.selected == 0 && (_.cloneDeep(this.inventoryIds?.length) > 0)) {
          if(this.rowData.length > 0) {
            let errorData: any = {
              messgeType: "error",
              title: "Attention",
              titleClass: "text-c-blue",
              icon: "fas fa-exclamation-circle",
              iconClass: "text-c-blue f-70",
              message: 'Would you like to save your selection and continue selecting other Service Numbers?',
              okBtnName: 'Yes, Continue',
              closeBtnName: 'No, Discard Changes'
            }
            const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
            dialogRef.afterClosed().subscribe((result) => {
              if (result == false) {
                this.inventoryIds = [];
                this.rowDataInventory.forEach((node: any) => {
                  node['isChecked'] = false;
                });
                this.selectedInventoryData = [];

              } else {
                let inventoryAr = [...this.inventoryIds];
                this.rowDataInventory.forEach((node: any) => {
                  const d = inventoryAr.some(r => r === node.InventoryId);
                  node['isChecked'] = d;
                  if(d) {
                    const index = inventoryAr.findIndex(item => item === node.InventoryId);
                    if (index !== -1) {
                      inventoryAr.splice(index, 1);
                    }
                  }
                });
              }
            })
          } else {
            let inventoryAr = [...this.inventoryIds];
            this.rowDataInventory.forEach((node: any) => {
              const d = inventoryAr.some(r => r === node.InventoryId);
              node['isChecked'] = d;
              if(d) {
                const index = inventoryAr.findIndex(item => item === node.InventoryId);
                if (index !== -1) {
                  inventoryAr.splice(index, 1);
                }
              }
            });
          }
        
        }
        clearInterval(interval);
     
    }, 1000);
  }
  BillingIDInvoiceTooltip(): void {
    this.dialog.open(this.BillingIDInvoice, {
      width: '900px'
    });
  }


  changeMethod(data: any, fromTS = false) {
    if (!fromTS)
      this.displayRule = undefined;

    if (data.value == "Specific Billing ID(s)") {
      this.billingIds();
    } else if (data.value == "Specific Subaccount") {
      this.subAccounts();
    }
    this.selectedMethod = this.distributionMethodAll.find((x: any) => x.Type === this.f.distributionMethodTypeId.value).label;
  }

  changeOrigin(item: any, fromTS = false) {
    if (!fromTS)
      this.displayRule = undefined;
    this.setValueInFormControl('distributionMethodTypeId', '')
    let value = item.value;
    this.matchMethod = [];
    if (this.f.distributionAccountLocationTypeId.value === "Vendor Global" || this.f.distributionAccountLocationTypeId.value === "Customer Global") {
      if (value == "Any Account" || value == "Any Billing ID" || value == "Any Subaccount") {
        this.matchMethod = this.getDistribution(this.distributionMethodAll, ["Origin Account", "Payable Account (all inventory/accounts)"]);
      } else if (value == "Any Payable Account") {
        this.matchMethod = this.getDistribution(this.distributionMethodAll, ["Origin Account"]);
      }
    } else {
      if (value == "Any Payable Account" || value == "Specific Payable Account" || value == "Any Subaccount" || value == "Any Billing ID") {
        this.matchMethod = this.getDistribution(this.distributionMethodAll, ["Specific Subaccount", "Specific Billing ID(s)"]);
      } else if (value == "Specific Subaccount" || value == "Specific Billing ID") {

        this.matchMethod = this.getDistribution(this.distributionMethodAll, ["Payable Account (all inventory/accounts)", "Specific Subaccount", "Specific Billing ID(s)"]);
      }
    }
    this.selectedOrigin = this.distributionOrigin.find((x: any) => x.Type === this.f.distributionOriginLevelTypeId.value)?.label;

  }
  billingIds() {
    this._unsubscribeBId.next(true);
    this.invoiceService.billingIds(this.gridRowData.InvoiceId).pipe(takeUntil(this._unsubscribeBId)).subscribe((response: any) => {
      if (response.Success) {
        this.rowData = this.processData(response.Data.$values);
        if (this.distributionDetail.DistributionMethodInventories.$values.length > 0) {
          this.rowData.forEach((node: any) => {
            const d = this.distributionDetail.DistributionMethodInventories.$values.some((r: any) => r.InventoryId === node.InventoryId
            );
            node['isChecked'] = d;
          });
        }
      }
    })
  }

  processData(data: any[]) {
    const flattenedData: any[] = [];
    const flattenRowRecursive = (row: any, parentPath: string[]) => {
      const dataPath = [...parentPath, row.$id];
      flattenedData.push({ ...row, dataPath });
      if (row.BillingIdChargeCodes && row.BillingIdChargeCodes.$values.length > 0) {
        row.BillingIdChargeCodes.$values.forEach((underling: any) => {
          flattenRowRecursive(underling, dataPath)
        }
        );
      }
    };
    data.forEach((row) => flattenRowRecursive(row, []));
    return flattenedData;
  }

  subAccounts() {
    this._unsubscribeSubacc.next(true);
    this.invoiceService.subAccounts(this.gridRowData.InvoiceId).pipe(takeUntil(this._unsubscribeSubacc)).subscribe((response: any) => {
      if (response.Success) {
        this.rowData2 = response.Data.$values;
        if (this.distributionDetail.DistributionMethodAccounts.$values.length > 0) {
          this.rowData2.forEach((node: any) => {
            const d = this.distributionDetail.DistributionMethodAccounts.$values.some((r: any) => r.BillingAccountHierarchyId === node.BillingAccountHierarchyId
            );
            node['isChecked'] = d;
          });
        }
      }
    });
  }

  distributionAccountLocationTypes() {
    this._unsubscribeLocation.next(true);
    this.sandboxService.distributionAccountLocationTypes().pipe(takeUntil(this._unsubscribeLocation)).subscribe((res: any) => {
      this.distributionLevels = res.Data.$values;
      this.distributionLevels = this.swapFirstAndLast(this.distributionLevels);

      // this.distributionLevels.splice(0, 1)
      // this.distributionLevels = _.cloneDeep(this.distributionLevels);

      this.getDisType();
    })
  }

  ngOnInit(): void {
    this.formSet();

    this.distributionAccountLocationTypes();
    this.distributionRuleTypes();
    this.distributionMethodTypes();

    this.distributionRulesOptions();
    this.getDisType();
    this.getAdditionalDetail();
    if (this.clickedRecord.ChargeCodeType == 'Product' || this.clickedRecord.ChargeCodeType == 'Feature' || this.clickedRecord.ChargeCodeType == 'Usage' || this.clickedRecord.ChargeCodeType == 'Equipment') {
      this.distributionForm.disable();
      this.isDisableSave = true;
    }
    this.getDistributionChangelog();
  }

  getAdditionalDetail() {
    if (this.clickedRecord.SBChargeDetailId)
      this._unsubscribeBillDetail.next(true);
    this.invoiceService.ChargeCodeContextDetails(this.clickedRecord.InvChargeDetailId).pipe(takeUntil(this._unsubscribeBillDetail))
      .subscribe((data: any) => {
        if (data.Success) {
          this.additionalBillData = data.Data;
          this.additionalBillData['Charges'] = data.Data.Charges ? parseFloat(data.Data.Charges).toFixed(2) : '0.00';
          this.additionalBillData['Charges'] = data.Data?.Charges.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
          if (this.clickedRecord.DistributionRuleId !== null) {
            this.invoiceService.distributionDetail(this.clickedRecord.DistributionRuleId).subscribe((res: any) => {

              this.distributionDetail = res.Data;
              // if (this.distributionDetail.DistributionRule.DistributionRulesXOptions.DistributionAccountLocationType.Type !== 'Vendor Global') {

                this.displayRule = this.distributionDetail.DistributionRule.Name;
                this.setValueInFormControl('distributionAccountLocationTypeId', this.distributionDetail.DistributionRule.DistributionRulesXOptions.DistributionAccountLocationType.Type);
                this.setValueInFormControl('distributionRulesTypeId', this.distributionDetail.DistributionRule.DistributionRulesType.Type);
              
                this.changeType(this.distributionDetail.DistributionRule.DistributionRulesXOptions.DistributionAccountLocationType.Type, true);

                this.setValueInFormControl('distributionOriginLevelTypeId', this.distributionDetail.DistributionRule.DistributionRulesXOptions.DistributionOriginLevelType.Type);
                this.changeOrigin({ value: this.distributionDetail.DistributionRule.DistributionRulesXOptions.DistributionOriginLevelType.Type }, true);
                this.setValueInFormControl('distributionMethodTypeId', this.distributionDetail.DistributionRule.DistributionRulesXOptions.DistributionMethodType.Type);
                this.setValueInFormControl('ruleOption', this.distributionDetail.DistributionRule.MonthlyRule == true ? 'monthly' : 'one-time');
                this.setValueInFormControl('ruleStatus', this.distributionDetail.DistributionRule.Status);
                this.changeMethod({ value: this.distributionDetail.DistributionRule.DistributionRulesXOptions.DistributionMethodType.Type }, true);
              // }
            });
            if(this.isDisableRule) {
              this.distributionForm.disable();
            }
          // this.changeType('Vendor Global');
          } else {
            this.isDisableRule = false;
            this.isVendorGlobalDisabled = true;
            this.setValueInFormControl('distributionAccountLocationTypeId', 'Customer Specific');
            this.changeType('Customer Specific', true);
             // Disable other distribution types except Vendor Product Totals
            this.distributionType.forEach((type: any) => {
              type.disabled = type.Type !== 'Vendor Product Totals';
            });
          }
        }
      });
  }
  getDisType() {
    if (this.f.distributionRulesTypeId.value == "Billing ID Totals") {
      this.disType = '% of Billing IDs Total'
    } else if (this.f.distributionRulesTypeId.value == "Billing ID Count") {
      this.disType = 'Across All Billing IDs'
    } else {
      this.disType = '% of Vendor Product'
    }
   
  }

  distributionRulesOptions() {
    this._unsubscribeOrigin.next(true);
    this.sandboxService.distributionOriginLevelType().pipe(takeUntil(this._unsubscribeOrigin)).subscribe((res: any) => {
      this.distributionOrigin = res.Data.$values;

      this.distributionOrigin.forEach((item: any) => {
        if (item.Type == 'Any Billing ID') {
          item.label = "Any Service Number";
        } else if (item.Type == 'Specific Billing ID') {
          item.label = "Specific Service Number";
        } else {
          item.label = item.Type
        }
      });
    });
  }
  onSelectionChangedBillingid(event: any) {
    const selectedInventory:any = [];
    event.forEach((e: any) => {
      selectedInventory.push(e.InventoryId)
    });
    if(this.f.distributionRulesTypeId.value == 'Vendor Product Totals') {
      this.distributionMethodTypeInventoryIds = _.sortedUniq(selectedInventory);
      this.rowData.forEach((node: any) => {
        const d = event.some((r: any) => r === node.InventoryId);
        node['isChecked'] = d;
      });
    } else {
      this.distributionMethodTypeInventoryIds = selectedInventory;
    }
  }

  onGridRecords(event: any) {
    this.rowDataInventory = event;
  }
  // vendor product selection change event
  onSelectionChanged2(event: any) {
    this.selectedInventoryData = event;
    const selectedInventory:any = [];
    event.forEach((e: any) => {
      selectedInventory.push(e.InventoryId)
    });
    this.inventoryIds = _.sortedUniq(selectedInventory);
    // this.rowDataInventory.forEach((node: any) => {
    //   const d = event.some(r => r === node.InventoryId);
    //   node['isChecked'] = d;
    // });
  }
  // sub account selection change event
  onSelectionChanged(event: any) {
    const selectedInventory:any = [];
    event.forEach((e: any) => {
      selectedInventory.push(e.BillingAccountHierarchyId)
    });
    this.distributionMethodTypeBillingAccountHierarchyIds = selectedInventory;
  }
  distributionMethodTypes() {
    this._unsubscribeMethod.next(true);
    this.sandboxService.distributionMethodTypes().pipe(takeUntil(this._unsubscribeMethod)).subscribe((res: any) => {
      this.distributionMethodAll = res.Data.$values;


      this.distributionMethodAll.forEach((item: any) => {
        if (item.Type == "Specific Billing ID(s)") {
          item.label = "Specific Service Number(s)";
        } else {
          item.label = item.Type;
        }
      });
    })
  }
  changeType(value: any, fromTS = false) {
    if (!fromTS)
      this.displayRule = undefined;

    this.matchRecord = [];
    this.setValueInFormControl('distributionOriginLevelTypeId', '')
    this.setValueInFormControl('distributionMethodTypeId', '')
    if (value === "Vendor Global" || value === "Customer Global") {
      this.matchRecord = this.getDistribution(this.distributionOrigin, ["Any Account", "Any Payable Account", "Any Subaccount", "Any Billing ID"]);
    } else {
      this.matchRecord = this.getDistribution(this.distributionOrigin, ["Any Payable Account", "Any Subaccount", "Any Billing ID", "Specific Subaccount", "Specific Billing ID", "Specific Payable Account"])
    }
    if (value === "Vendor Global" || value === "Customer Global") {
      if (this.additionalBillData?.BillingId !== null && this.additionalBillData?.BillingId !== "") {
        this.matchRecord = this.getDistribution(this.distributionOrigin, ["Any Billing ID"]);
      } else if (this.additionalBillData?.SubAccountNumber !== null && this.additionalBillData?.SubAccountNumber !== "") {
        this.matchRecord = this.getDistribution(this.distributionOrigin, ["Any Account", "Any Payable Account", "Any Subaccount"]);
      } else {
        this.matchRecord = this.getDistribution(this.distributionOrigin, ["Any Account", "Any Payable Account"]);
      }
    } else {
      if (this.additionalBillData?.BillingId !== null && this.additionalBillData?.BillingId !== "") {
        this.matchRecord = this.getDistribution(this.distributionOrigin, ["Any Billing ID", "Specific Billing ID"]);
      } else if (this.additionalBillData?.SubAccountNumber !== null && this.additionalBillData?.SubAccountNumber !== "") {
        this.matchRecord = this.getDistribution(this.distributionOrigin, ["Any Subaccount", "Specific Subaccount"]);
      } else {
        this.matchRecord = this.getDistribution(this.distributionOrigin, ["Any Payable Account", "Specific Payable Account"]);
      }
    }

  }

  setValueInFormControl(key: any, value: any) {
    this.f[key].setValue(value);
  }

  get f() {
    return this.distributionForm.controls;
  }

  getDistribution(roles: any, filter: any) {
    return roles.filter((name: any) => filter.includes(name.Type));
  }

  distributionRuleTypes() {
    this._unsubscribeRule.next(true);
    this.sandboxService.distributionRuleTypes().pipe(takeUntil(this._unsubscribeRule)).subscribe((res: any) => {
      let data = this.swapFirstAndLast(res.Data.$values);
      _.map(data, (x: any) => {
        if (x.Type == "Billing ID Totals") {
          x.label = '% of Billing IDs Total'
        } else if (x.Type == "Billing ID Count") {
          x.label = 'Across All Billing IDs'
        } else {
          x.label = '% of Vendor Product'
        }
        x.disabled = false;
      })

      this.distributionType = data;
    })
  }

  swapFirstAndLast(arr: any) {
    if (arr.length < 2) {
      return arr;
    }
    [arr[0], arr[arr.length - 1]] = [arr[arr.length - 1], arr[0]];
    return arr;
  }

  invoiceOverviewDataOutput(data: any) {
    this.overViewData = data;
  }

  formSet() {
    this.distributionForm = this._formBuilder.group({
      distributionAccountLocationTypeId: new FormControl(''),
      distributionRulesTypeId: new FormControl("", [Validators.required]),
      distributionOriginLevelTypeId: new FormControl('', [Validators.required]),
      distributionMethodTypeId: new FormControl('', [Validators.required]),
      ruleStatus: new FormControl(true, [Validators.required]),
      ruleOption: new FormControl('monthly', [Validators.required]),
    });
  }

  formSubmit() {
    this.submitted = true;

    let data: any = {
    }
    if (this.distributionForm.valid) {
      if (this.f?.distributionMethodTypeId?.value == "Specific Billing ID(s)" && this.f?.distributionAccountLocationTypeId?.value == "Customer Specific" && this.f.distributionRulesTypeId.value == 'Vendor Product Totals') {
       
        if (this.distributionMethodTypeInventoryIds == undefined || (this.distributionMethodTypeInventoryIds?.length == 0 && this.inventoryIds.length == 0)) {
          // this.ErrorWarningPopupOpen('Service Number is required')
          let errorData: any = {
            messgeType: "error",
            title: "Attention",
            titleClass: "text-c-blue",
            icon: "fas fa-exclamation-circle",
            iconClass: "text-c-blue f-70",
            message: "No Service Number's have been selected. Please make a selection.",
            okBtnName: 'Close' 
          }
          const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
          
          return
        }
      }

      
      if (this.f?.distributionMethodTypeId?.value == "Specific Billing ID(s)" && this.f?.distributionAccountLocationTypeId?.value == "Customer Specific" && (this.f.distributionRulesTypeId.value == "Billing ID Count" || this.f.distributionRulesTypeId.value == 'Vendor Product Totals')) {
        if (this.distributionMethodTypeInventoryIds?.length == 0 && this.inventoryIds.length == 0) {
          let errorData: any = {
            messgeType: "error",
            title: "Attention",
            titleClass: "text-c-blue",
            icon: "fas fa-exclamation-circle",
            iconClass: "text-c-blue f-70",
            message: "No Billing ID's have been selected. Please make a selection.",
            okBtnName: 'Close'
          }
          const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
          return
        }
      }

      if (this.f?.distributionMethodTypeId?.value == "Specific Subaccount" && this.f?.distributionAccountLocationTypeId?.value == "Customer Specific") {
        if (this.distributionMethodTypeBillingAccountHierarchyIds == undefined || this.distributionMethodTypeBillingAccountHierarchyIds?.length == 0) {
          this.ErrorWarningPopupOpen('Sub Account is required')
          return
        }
      }

      data['status'] = this.f.ruleStatus.value;
      data['invoiceId'] = this.gridRowData.InvoiceId;
      if (this.f.ruleOption.value == 'monthly') {
        data['monthlyRule'] = true;
        data['onetimeRule'] = false;
      } else {
        data['onetimeRule'] = true;
        data['monthlyRule'] = false
      }

      let dbo = this.distributionOrigin.find((f: any) => f.Type === this.f.distributionOriginLevelTypeId.value).Id;
      data['distributionOriginLevelTypeId'] = dbo;

      let dboT = this.distributionMethodAll.find((f: any) => f.Type === this.f.distributionMethodTypeId.value).Id;
      data['distributionMethodTypeId'] = dboT;

      let dboLT = this.distributionLevels.find((f: any) => f.Type === this.f.distributionAccountLocationTypeId.value).Id;
      data['distributionAccountLocationTypeId'] = dboLT;

      let dboRT = this.distributionType.find((f: any)  => f.Type === this.f.distributionRulesTypeId.value).Id;
      data['distributionRulesTypeId'] = dboRT;

      if (this.f?.distributionAccountLocationTypeId?.value == "Customer Specific" || this.f?.distributionAccountLocationTypeId?.value == "Customer Global") {
        data['customerId'] = this.additionalBillData.CustomerAccountId
      }

      if (this.f?.DistributionOriginLevelTypeId?.value == "Any Subaccount") {
        data['distributionOriginLevelTypeIsAnySubAccount'] = true
      }

      data['distributionMethodTypeBillingAccountHierarchyIds'] = this.distributionMethodTypeBillingAccountHierarchyIds !== undefined ? this.distributionMethodTypeBillingAccountHierarchyIds : null;
     
      if(this.f?.distributionMethodTypeId?.value == 'Specific Billing ID(s)' && this.f?.distributionAccountLocationTypeId?.value == 'Customer Specific' && (this.f.distributionRulesTypeId.value == 'Billing ID Count' || this.f.distributionRulesTypeId.value == 'Vendor Product Totals'
      ) && this.inventoryIds.length > 0) {
        this.selectedInventoryData = _.sortedUniq(this.selectedInventoryData) 
        const result = _.map(this.selectedInventoryData, item => _.mapValues(_.pick(item, ['InventoryId', 'VendorProductInventoryId']), (value, key) => {
          return value;
        }));
        data['inventoryIds'] =_.sortedUniq(result);
      }
      if (this.f?.distributionMethodTypeId.value == "Origin Account") {
        data['distributionMethodTypeBillingAccountHierarchyIds'] = [this.additionalBillData.BillingAccountHierarchyId]
      } else if (this.f?.distributionMethodTypeId.value == "Payable Account (all inventory/accounts)") {
        data['distributionMethodTypeBillingAccountHierarchyIds'] = [this.overViewData.PayableBillingAccountHierarchyId];
      }

      data['distributionMethodTypeInventoryIds'] = this.distributionMethodTypeInventoryIds !== undefined && this.distributionMethodTypeInventoryIds?.length > 0 ? [...new Set(this.distributionMethodTypeInventoryIds)] : null;
      data['distributionOriginLevelTypeBillingAccountHierarchyIds'] = null;
      if (this.f?.distributionOriginLevelTypeId.value == "Specific Payable Account" || this.f?.distributionOriginLevelTypeId.value == "Any Payable Account") {
        data['distributionOriginLevelTypeBillingAccountHierarchyIds'] = [this.overViewData.PayableBillingAccountHierarchyId];
      }

      if (this.f.distributionOriginLevelTypeId.value === 'Specific Subaccount') {
        data['distributionOriginLevelTypeBillingAccountHierarchyIds'] = [this.additionalBillData.BillingAccountHierarchyId];
      }

      if (this.isForEditDistribution) {
        data['isFromNewRule'] = false;
      } else {
        data['isFromNewRule'] = true;
      }

      data['distributionRuleId'] = this.clickedRecord.DistributionRuleId;
      data['InvoiceChargeDetailId'] = this.additionalBillData.InvChargeDetailId;

      data['distributionOriginLevelTypeInventoryIds'] = null;
      if (this.f.distributionOriginLevelTypeId.value === 'Specific Billing ID') {
        data['distributionOriginLevelTypeInventoryIds'] = [this.additionalBillData.InventoryId];
      }

      if (this.displayRule) {
        data['distributionRuleName'] = this.displayRule
      } else {
        data['distributionRuleName'] = (this.disType) + (this.f?.distributionAccountLocationTypeId?.value ? '/' + this.f?.distributionAccountLocationTypeId?.value :
          '') + (this.selectedOrigin ? '/' + this.selectedOrigin : '') + (this.selectedMethod ? '/' + this.selectedMethod :
            '') + ('/' + this.additionalBillData?.ChargeCodeName) + (this.additionalBillData?.VendorAccountName ? '/' +
              this.additionalBillData?.VendorAccountName : '') + (this.f.distributionAccountLocationTypeId.value == "Customer Global" ||
                this.f.distributionAccountLocationTypeId?.value == "Customer Specific" ? '/' +
              this.additionalBillData?.CustomerAccountName : '')
      }
      data['chargeCodeId'] = this.clickedRecord.ChargeCodeId;
     
      if (this.f.distributionAccountLocationTypeId.value == "Vendor Global") {
        let errorData: any = {
          messgeType: 'error',
          closeBtnName: 'This is correct, please save it!',
          okBtnName: 'Close & Review',
          title: 'Attention',
          titleClass: 'text-c-blue',
          icon: 'fas fa-question-circle',
          iconClass: 'text-c-blue f-70',
          message: `Vendor Global Rules will apply to all customers with the Vendor and the Charge Code in this rule. Please ensure this should be a rule for ALL customers.`,
        };

        const dialogRef = this.dialog.open(ErrorWarningPopupComponent, {
          panelClass: 'error-warning',
          data: errorData,
        });
        dialogRef.afterClosed().subscribe((result) => {
          if (result == false) {
            this.saveDistribution(data);
          }
        });
      } else {
        this.saveDistribution(data);
      }
    }
  }
  saveDistribution(data: any) {
    this.saveButtonLoadder = true;
    this.invoiceService.addDistributionRules(this.gridRowData.InvoiceId, data).subscribe((res: any) => {
      this.saveButtonLoadder = false;

      if (res.Success) {
        let errorData: any = {
          messgeType: "error",
          title: "Attention",
          titleClass: "text-c-blue",
          icon: "fas fa-exclamation-circle",
          iconClass: "text-c-blue f-70",
          message: res.Message
        }
        const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
        dialogRef.afterClosed().subscribe(res => {
          this.redirectTab.emit({ type: 'grid' });
        })
      } else {

        this.responseData = res.Data;
        if (!this.responseData?.ValidationKey) {
          this.ErrorWarningPopupOpen(res.Message);
          return
        }
        if (this.responseData.ValidationKey == 'SameHierarchyAndInactiveDistributionRule') {
          this.popup({ msg1: res.Message, btnMsg: 'This is correct, please save it!', payload: data })
        } else if (this.responseData.ValidationKey == 'LowerHierarchy') {
          this.popup({ msg1: res.Message, btnMsg: 'Yes I meant to do this...', payload: data })
        } else if (this.responseData.ValidationKey == 'HigerHierarchy') {
          this.popup({ msg1: res.Message, btnMsg: 'This is correct, use it!', payload: data })
        } else if (this.responseData.ValidationKey == 'BlankBillingID') {
          let errorData: any = {
            messgeType: 'error',
            okBtnName: 'Add New Rule',
            closeBtnName: '',
            title: 'Attention',
            titleClass: 'text-c-blue',
            icon: 'fas fa-question-circle',
            iconClass: 'text-c-blue f-70',
            message: res.Message,
          };
          const dialogRef = this.dialog.open(ErrorWarningPopupComponent, {
            width: '700px',
            data: errorData,
          });
          dialogRef.afterClosed().subscribe((result) => {
            this.getAdditionalDetail();
          });
        } else if (this.responseData.ValidationKey == 'NotBlankBillingID') {
          this.popup({ msg1: res.Message, btnMsg: 'This is correct, please remove it!', payload: data })
        }
      }
    })
  }

  ErrorWarningPopupOpen(message: any) {
    let errorData: any = {
      messgeType: "error",
      title: "Attention",
      titleClass: "text-c-blue",
      icon: "fas fa-exclamation-circle",
      iconClass: "text-c-blue f-70",
      message: message
    }
    const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
    return true
  }

  popup(data: any) {
    const dialogRef = this.dialog.open(ChargeCodeAssignmentDialogComponent, {
      width: '700px',
      data: data
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        let payload = data.payload;
        payload['ValidateKey'] = this.responseData.ValidationKey;
        payload['DistributionRuleIdToInactive'] = this.responseData.DistributionRuleIdToInactive;
        this.saveDistribution(payload)
      }
    });
  }

}
