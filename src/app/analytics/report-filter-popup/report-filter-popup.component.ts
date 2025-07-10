import { Component, Inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import _, { cloneDeep } from 'lodash';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ManageService } from 'src/app/services/manage.service';
import { LocationService } from 'src/app/services/location.service';
import { isValueExist, rolePermission } from 'src/app/services/helper';
import { ErrorWarningPopupComponent } from 'src/app/common/error-warning-popup/error-warning-popup.component';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { AgGridTableComponent } from 'src/app/common/ag-grid-table/ag-grid-table.component';
import { AgGridModule } from 'ag-grid-angular';
import { DatePipe } from '@angular/common';
import { CustomPipe } from 'src/app/custom-pipe/date.pipe';

@Component({
  selector: 'app-report-filter-popup',
  templateUrl: './report-filter-popup.component.html',
  styleUrls: ['./report-filter-popup.component.scss'],
  imports: [SharedModule, PrimgModule, AgGridModule],
  providers: [
    ManageService,DatePipe,CustomPipe
  ]
})
export class ReportFilterPopupComponent implements OnInit {
  rowData: any;
  InvoicePeroid: any;
  customerList: any = [];
  billingAccount: any = [];
  companies: any = [];
  loadingInvoicePeriod = false;
  loadingCustomer = false;
  loadingCompanyList = false;
  loadingPayableAcc = false;
  vendorsList: any = [];
  reportsInvoiceMonthsList: any = [];
  loadingVendorsList: any = false;
  loadingReportsInvoiceMonthsList: any = false;
  isSaveClicked = false;

  tem = 'all';
  columnDefs: any;

  columnSpndByCT: any;
  columnSpndByCTName = 'SpendByChargeType'

  columnSpndByVP: any;
  columnSpndByVPName = 'RecurringSpendByVendorProduct'

  columnSpndByST: any;
  columnSpndBySTName = 'RecurringSpendByServiceType'

  columnAllSpndByVP: any;
  columnAllSpndByVPName = 'AllSpendByVendorProduct'

  columnImportReport: any;
  columnImportReportName = 'ImportReport'

  columnVPByContract: any;
  columnVPByContractName = 'VendorProductsByContract'

  columnInvVarByCC: any;
  columnInvVarByCCName = 'InventoryVarianceByChargeCode'

  columnInvWithNotes: any;
  columnInvWithNotesName = 'InvoiceWithNotes'

  columnInvtryWithNotes: any;
  columnInvtryWithNotesName = 'InventoryWithNotes'

  columnAdtVPWith: any;
  columnAdtVPWithName = 'VendorProductsWithNoOrExpiredContract'

  columnActiveInvWithNoSpend: any;
  columnActiveInvWithNoSpendName = 'ActiveInventoryMoreThan30DaysWithNoSpend'

  columnInvPendingActivationWithNoSpend: any;
  columnInvPendingActivationWithNoSpendName = 'PendingActivationInventoryMoreThan30DaysWithNoSpend'

  columnInvPendingDiscWithNoSpend: any;
  columnInvPendingDiscWithNoSpendName = 'PendingDisconnectionInventoryMoreThan30DaysWithNoSpend'

  columnInvPendingDiscWithSpend: any;
  columnInvPendingDiscWithSpendName = 'PendingDisconnectionInventoryMoreThan30DaysWithSpend'

  columnData: any;

  rName: any = '';
  monthList = Array.from({ length: 12 }, (_, i) => ({
    monthId: i + 1,
    month: new Date(0, i).toLocaleString('default', { month: 'short' }),
  }));

  requestArray: any;
  public templateRef: any;
  isCompanyFormSubmit: boolean = false;
  temRoles: boolean = false;
  private _unsubscribeVendor: Subject<any> = new Subject<any>();
  private _unsubscribeVendorProductTypesDetails: Subject<any> = new Subject<any>();
  @ViewChild('ReplaceContractooltip') ReplaceContractooltip!: TemplateRef<any>;
  public form = new FormGroup({
    customerId: new FormControl(null, []),
    VendorId: new FormControl(null, []),
    CompanyId: new FormControl(null, []),
    BillingAccountHierarchyId: new FormControl(null, []),
    Period: new FormControl(null, []),
    withTotals: new FormControl(null, []),
    invoiceMonth: new FormControl(null, []),
    vendorProductTypeId: new FormControl(null),
    noteStatus: new FormControl(true),
  });
  saveButtonLoadder = false;
  private _unsubscribeInvoicePeriod: Subject<any> = new Subject<any>();
  vendorProductDetails: any = [];
  loadingVendorproducttypes = false;
  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
    public dialog: MatDialog,
     public manageService: ManageService,
    private dialogRef: MatDialogRef<ReportFilterPopupComponent>,
    public locationService: LocationService) {
    this.rowData = data.data;
    dialogRef.disableClose = true;
    if (data.selectedTem !== 'all') {
      this.tem = data.selectedTem;
    }

    if (data.isClickedSave) {
      this.isSaveClicked = data.isClickedSave;
    }

    // Reusable column definitions
    const generalColumns = [
      { field: 'CustomerAccountName', headerName: 'Customer' },
      { field: 'CompanyName', headerName: 'Company' },
      { field: 'VendorAccountName', headerName: 'Vendor' },
      { field: 'PayableAccountNumber', headerName: 'Payable Account' },
      { field: 'PayableBillingAccountStatusDisplay', headerName: 'Account Status' },
    ];

    const spendColumns: any[] = [];

    const inventoryColumns = [
      { field: 'ServiceNumber', headerName: 'Service Number' },
      { field: 'VendorProductTypeName', headerName: 'Vendor Product' },
      { field: 'TotalCurrentCharges', headerName: 'Total Current Charges' },
      { field: 'LastInvoiceDate', headerName: 'Last Invoice Date' },
      { field: 'VPInventoryStatusDisplay', headerName: 'Vendor Product Status' },
      { field: 'ServiceStartDate', headerName: 'Service Start Date' },
      { field: 'ServiceEndDate', headerName: 'Disconnection Date' },
      { field: 'InvoiceCyclesRemaining', headerName: 'Invoice Cycles Remaining' },
    ];

    const locationColumns = [
      { field: 'LocationName', headerName: 'Location Name' },
      { field: 'LocationCode', headerName: 'Location Code' },
      { field: 'Address1', headerName: 'Address One' },
      { field: 'Address2', headerName: 'Address Two' },
      { field: 'City', headerName: 'City' },
      { field: 'StateName', headerName: 'State/Province/Region' },
      { field: 'PostalCode', headerName: 'Zip/Postal Code' },
      { field: 'CountryName', headerName: 'Country' },
    ];

    const locationStatus = [
      { field: 'LocationStatus', headerName: 'Location Status' }
    ];

    const notesColumns = [
      { field: 'NoteText', headerName: 'Notes' },
      { field: 'NoteCreationDate', headerName: 'Note Date' },
      { field: 'NoteStatusDisplayText', headerName: 'Note Status' },
      { field: 'IsAttachmentDisplay', headerName: 'Attachment' },
      { field: 'NoteCreatedByUser', headerName: 'Name' },
    ];

    // Dynamic column configurations
    this.columnSpndByCT = [
      { headerName: 'General', children: generalColumns },
      {
        headerName: 'Charge Code',
        children: [
          { field: 'ChargeCodeTypeName', headerName: 'Charge Code Type' },
          { field: 'ChargeTypeName', headerName: 'Charge Type' },
        ],
      },
      { headerName: 'Spend', children: spendColumns },
    ];

    this.columnSpndByVP = [
      { headerName: 'General', children: generalColumns },
      {
        headerName: 'Vendor Product',
        children: [{ field: 'VendorProductTypeName', headerName: 'Vendor Product' }],
      },
      { headerName: 'Spend', children: spendColumns },
      { headerName: 'Count', children: [] },
    ];

    this.columnSpndByST = [
      { headerName: 'General', children: generalColumns },
      {
        headerName: 'Service',
        children: [
          { field: 'ServiceName', headerName: 'Service' },
          { field: 'ServiceTypeName', headerName: 'Service Type' },
        ],
      },
      { headerName: 'Spend', children: spendColumns },
    ];

    this.columnInvWithNotes = [
      { headerName: 'General', children: generalColumns },
      {
        headerName: 'Invoice',
        children: [
          { field: 'InvoiceDate', headerName: 'Invoice Date' },
          { field: 'InvoiceStatusDisplay', headerName: 'Invoice Status' },
          { field: 'InvoiceNumber', headerName: 'Invoice Number' },
          { field: 'InvoiceNoteCreatedDate', headerName: 'Note Date' },
          { field: 'Notes', headerName: 'Notes' },
          { field: 'IsAttachmentDisplay', headerName: 'Attachment Y/N' },
          { field: 'NotesTags', headerName: 'Note Tags' },
          { field: 'NotesTicketNumber', headerName: 'Ticket Number' },
          { field: 'InvoiceNoteCreatedBy', headerName: 'Name' },
        ],
      },
    ];

    this.columnInvtryWithNotes = [
      { headerName: 'General', children: generalColumns },
      { headerName: 'Inventory', children: inventoryColumns },
      { headerName: 'Location', children: locationColumns },
      {
        headerName: 'User',
        children: [
          { field: 'PeopleName', headerName: 'User Name' },
          { field: 'PeopleEmail', headerName: 'User Email' },
        ],
      },
      { headerName: 'Notes', children: notesColumns },
    ];

    this.columnAdtVPWith = [
      { headerName: 'General', children: generalColumns },
      { headerName: 'Inventory', children: inventoryColumns },
      {
        headerName: 'Contract',
        children: [
          { field: 'ContractName', headerName: 'Contract Name' },
          { field: 'InternalContractNumber', headerName: 'Internal Contract Number' },
          { field: 'VendorContractNumber', headerName: 'Vendor Contract Number' },
          { field: 'ContractStatusDisplay', headerName: 'Contract Status' },
          { field: 'ContractEndDate', headerName: 'Contract End Date' },
          { field: 'ContractTermDisplay', headerName: 'Contract Term' },
          { field: 'ContractMonthsRemaining', headerName: 'Months Remaining' },
        ],
      },
    ];

    this.columnAllSpndByVP = [
      { headerName: 'General', children: generalColumns },
      {
        headerName: 'Inventory',
        children: [
          { field: 'ServiceNumber', headerName: 'Service Number' },
          { field: 'VendorProductTypeName', headerName: 'Vendor Product' },
          { field: 'ServiceName', headerName: 'Service' },
          { field: 'ServiceTypeName', headerName: 'Service Type' },
          { field: 'ProductName', headerName: 'Product' },
          { field: 'ProductTypeName', headerName: 'Product Type' },
          { field: 'InventoryStatus', headerName: 'Inventory Status' },
          { field: 'ServiceStartDate', headerName: 'Service Start Date' },
          { field: 'DisconnectionDate', headerName: 'Disconnection Date' },
        ]
      },
      { headerName: 'Location', children: [...locationColumns, ...locationStatus] },
      {
        headerName: 'User',
        children: [
          { field: 'UserName', headerName: 'User Name' },
          { field: 'UserEmail', headerName: 'User Email' },
          { field: 'PeopleApproverNames', headerName: 'Approver' },
        ]
      },
      { headerName: 'Spend', children: spendColumns },
      // { headerName: 'Count', children: [] },
    ];

    this.columnImportReport = [
      {
        headerName: 'General', children: [
          { field: 'VendorAccountName', headerName: 'Vendor' },
          { field: 'AccountNumber', headerName: 'Account Number' },
          { field: 'InvoiceDate', headerName: 'Invoice Date' },
          { field: 'DueDate', headerName: 'Due Date' },
          { field: 'PaymentAmountDisplay', headerName: 'Pmts Posted' },
          { field: 'BalanceFwdDisplay', headerName: 'Balance Fwd' },
          { field: 'TotalDueDisplay', headerName: 'Total Due' },
          { field: 'TotalCurrentChargesDisplay', headerName: 'Current Charges' },
          { field: 'InvoiceNumber', headerName: 'Invoice Number' },
          { field: 'CustomerName', headerName: 'Organization' },
          { field: 'CompanyName', headerName: 'Location Code' },
          { field: 'LocationName', headerName: 'Location Name' },
          { field: 'ServiceNumber', headerName: 'Inventory Item' },
          { field: 'InventoryType', headerName: 'Inventory Type' },
          { field: 'ChargeCodeType', headerName: 'Charge Type' },
          { field: 'AmountDisplay', headerName: 'Amount' },
          { field: 'Address1', headerName: 'Address One' },
          { field: 'Address2', headerName: 'Address Two' },
          { field: 'City', headerName: 'City' },
          { field: 'State', headerName: 'State' },
          { field: 'PostalCode', headerName: 'Zip' },
          { field: 'Country', headerName: 'Country' },
          { field: 'ContactDept', headerName: 'Contact Dept' },
          { field: 'GL1', headerName: 'GL1' },
          { field: 'Email', headerName: 'Email' },
        ]
      },

    ];

    this.columnVPByContract = [
      {
        headerName: 'General',
        children: [
          { field: 'CustomerAccountName', headerName: 'Customer' },
          { field: 'CompanyName', headerName: 'Company' },
          { field: 'VendorAccountName', headerName: 'Vendor' },
        ]
      },
      {
        headerName: 'Contract',
        children: [
          { field: 'ContractName', headerName: 'Contract Name' },
          { field: 'InternalContractNumber', headerName: 'Internal Contract Number' },
          { field: 'VendorContractNumber', headerName: 'Vendor Contract Number' },
          { field: 'ContractStatusDisplay', headerName: 'Contract Status' },
          { field: 'ContractEndDate', headerName: 'Contract End Date' },
          { field: 'ContractTermDisplay', headerName: 'Contract Term' },
          { field: 'ContractMonthsRemaining', headerName: 'Months Remaining' },
        ]
      },
      {
        headerName: 'Inventory',
        children: [
          { field: 'ServiceNumber', headerName: 'Service Number' },
        ]
      },
      {
        headerName: 'Vendor Product',
        children: [
          { field: 'VendorProductTypeName', headerName: 'Vendor Product' },
          { field: 'ServiceName', headerName: 'Service' },
          { field: 'ServiceTypeName', headerName: 'Service Type' },
          { field: 'ProductName', headerName: 'Product' },
          { field: 'ProductTypeName', headerName: 'Product Type' },
          { field: 'VendorProductStatus', headerName: 'Vendor Product Status' },
        ]
      },
      { headerName: 'Location', children: [...locationColumns, ...locationStatus] },
      {
        headerName: 'User',
        children: [
          { field: 'UserName', headerName: 'User Name' },
          { field: 'UserEmail', headerName: 'User Email' },
          { field: 'PeopleApproverNames', headerName: 'Approver' },
        ]
      },
      { headerName: 'Spend', children: spendColumns },
    ];

    this.columnInvVarByCC = [
      { headerName: 'General', children: generalColumns },
      {
        headerName: 'Inventory',
        children: [
          { field: 'ServiceNumber', headerName: 'Service Number' },
        ]
      },
      {
        headerName: 'Charge Code',
        children: [
          { field: 'ChargeCodeName', headerName: 'Charge Code Name' },
          { field: 'ChargeCode', headerName: 'Charge Code' },
          { field: 'ChargeCodeTypeName', headerName: 'Charge Code Type' },
          { field: 'ChargeTypeName', headerName: 'Charge Type' },
        ]
      },
      {
        headerName: 'Vendor Product',
        children: [
          { field: 'VendorProductTypeName', headerName: 'Vendor Product' },
          { field: 'ServiceName', headerName: 'Service' },
          { field: 'ServiceTypeName', headerName: 'Service Type' },
          { field: 'ProductName', headerName: 'Product' },
          { field: 'ProductTypeName', headerName: 'Product Type' },
          { field: 'VendorProductStatus', headerName: 'Vendor Product Status' },
          { field: 'ServiceStartDate', headerName: 'Start Date' },
          { field: 'ServiceEndDate', headerName: 'Disconnection Date' },
        ]
      },
      { headerName: 'Location', children: [...locationColumns, ...locationStatus] },
      {
        headerName: 'User',
        children: [
          { field: 'UserName', headerName: 'User Name' },
          { field: 'UserEmail', headerName: 'User Email' },
          { field: 'PeopleApproverNames', headerName: 'Approver' },
        ]
      },
      { headerName: 'Spend', children: spendColumns },


    ];

    this.columnActiveInvWithNoSpend = [
      { headerName: 'General', children: generalColumns },
      {
        headerName: 'Inventory',
        children: [{ field: 'ServiceNumber', headerName: 'Service Number' }],
      },
      // {
      //   headerName: 'Charge Code',
      //   children: [
      //     { field: 'ChargeCodeName', headerName: 'Charge Code Name' },
      //     { field: 'ChargeCode', headerName: 'Charge Code' },
      //     { field: 'ChargeCodeTypeName', headerName: 'Charge Code Type' },
      //     { field: 'ChargeTypeName', headerName: 'Charge Type' },
      //   ]
      // },
      {
        headerName: 'Vendor Product',
        children: [
          { field: 'VendorProductTypeName', headerName: 'Vendor Product' },
          { field: 'ServiceName', headerName: 'Service' },
          { field: 'ServiceTypeName', headerName: 'Service Type' },
          { field: 'ProductName', headerName: 'Product' },
          { field: 'ProductTypeName', headerName: 'Product Type' },
          { field: 'VPInventoryStatusDisplay', headerName: 'Vendor Product Status' },
          { field: 'ServiceStartDate', headerName: 'Start Date' },
        ]
      },
      { headerName: 'Location', children: [...locationColumns, ...locationStatus] },
      {
        headerName: 'User',
        children: [
          { field: 'UserName', headerName: 'User Name' },
          { field: 'UserEmail', headerName: 'User Email' },
          { field: 'PeopleApproverNames', headerName: 'Approver' },
        ]
      },
      {
        headerName: 'Spend',
        children: [
          { field: 'LastInvoicePeriod', headerName: 'Last Spend Period' },
          { field: 'LastSpendChargesDisplay', headerName: 'Spend' },
        ]
      },

    ];
    this.columnInvPendingActivationWithNoSpend = [
      { headerName: 'General', children: generalColumns },
      {
        headerName: 'Inventory',
        children: [{ field: 'ServiceNumber', headerName: 'Service Number' }],
      },
      // {
      //   headerName: 'Charge Code',
      //   children: [
      //     { field: 'ChargeCodeName', headerName: 'Charge Code Name' },
      //     { field: 'ChargeCode', headerName: 'Charge Code' },
      //     { field: 'ChargeCodeTypeName', headerName: 'Charge Code Type' },
      //     { field: 'ChargeTypeName', headerName: 'Charge Type' },
      //   ]
      // },
      {
        headerName: 'Vendor Product',
        children: [
          { field: 'VendorProductTypeName', headerName: 'Vendor Product' },
          { field: 'ServiceName', headerName: 'Service' },
          { field: 'ServiceTypeName', headerName: 'Service Type' },
          { field: 'ProductName', headerName: 'Product' },
          { field: 'ProductTypeName', headerName: 'Product Type' },
          { field: 'VPInventoryStatusDisplay', headerName: 'Vendor Product Status' },
          { field: 'NOOfDaysFromStatusChange', headerName: 'Days Not Billing' },
          { field: 'ServiceStartDate', headerName: 'Start Date' },
          { field: 'ServiceEndDate', headerName: 'Disconnection Date' },
        ]
      },
      { headerName: 'Location', children: [...locationColumns, ...locationStatus] },
      {
        headerName: 'User',
        children: [
          { field: 'UserName', headerName: 'User Name' },
          { field: 'UserEmail', headerName: 'User Email' },
          { field: 'PeopleApproverNames', headerName: 'Approver' },
        ]
      },
      {
        headerName: 'Spend',
        children: [
          { field: 'LastInvoicePeriod', headerName: 'Last Spend Period' },
          { field: 'LastSpendChargesDisplay', headerName: 'Spend' },
        ]
      },

    ];
    this.columnInvPendingDiscWithNoSpend = [
      { headerName: 'General', children: generalColumns },
      {
        headerName: 'Inventory',
        children: [{ field: 'ServiceNumber', headerName: 'Service Number' }],
      },
      // {
      //   headerName: 'Charge Code',
      //   children: [
      //     { field: 'ChargeCodeName', headerName: 'Charge Code Name' },
      //     { field: 'ChargeCode', headerName: 'Charge Code' },
      //     { field: 'ChargeCodeTypeName', headerName: 'Charge Code Type' },
      //     { field: 'ChargeTypeName', headerName: 'Charge Type' },
      //   ]
      // },
      {
        headerName: 'Vendor Product',
        children: [
          { field: 'VendorProductTypeName', headerName: 'Vendor Product' },
          { field: 'ServiceName', headerName: 'Service' },
          { field: 'ServiceTypeName', headerName: 'Service Type' },
          { field: 'ProductName', headerName: 'Product' },
          { field: 'ProductTypeName', headerName: 'Product Type' },
          { field: 'VPInventoryStatusDisplay', headerName: 'Vendor Product Status' },
          { field: 'NoOfDaysFromLastBill', headerName: 'Days Since Last Bill' },
          { field: 'ServiceStartDate', headerName: 'Start Date' },
          { field: 'ServiceEndDate', headerName: 'Disconnection Date' },
        ]
      },
      { headerName: 'Location', children: [...locationColumns, ...locationStatus] },
      {
        headerName: 'User',
        children: [
          { field: 'UserName', headerName: 'User Name' },
          { field: 'UserEmail', headerName: 'User Email' },
          { field: 'PeopleApproverNames', headerName: 'Approver' },
        ]
      },
      {
        headerName: 'Spend',
        children: [
          { field: 'LastInvoicePeriod', headerName: 'Last Spend Period' },
          { field: 'LastSpendChargesDisplay', headerName: 'Spend' },
        ]
      },

    ];

    this.columnInvPendingDiscWithSpend = [
      { headerName: 'General', children: generalColumns },
      {
        headerName: 'Inventory',
        children: [{ field: 'ServiceNumber', headerName: 'Service Number' }],
      },
      // {
      //   headerName: 'Charge Code',
      //   children: [
      //     { field: 'ChargeCodeName', headerName: 'Charge Code Name' },
      //     { field: 'ChargeCode', headerName: 'Charge Code' },
      //     { field: 'ChargeCodeTypeName', headerName: 'Charge Code Type' },
      //     { field: 'ChargeTypeName', headerName: 'Charge Type' },
      //   ]
      // },
      {
        headerName: 'Vendor Product',
        children: [
          { field: 'VendorProductTypeName', headerName: 'Vendor Product' },
          { field: 'ServiceName', headerName: 'Service' },
          { field: 'ServiceTypeName', headerName: 'Service Type' },
          { field: 'ProductName', headerName: 'Product' },
          { field: 'ProductTypeName', headerName: 'Product Type' },
          { field: 'VPInventoryStatusDisplay', headerName: 'Vendor Product Status' },
          { field: 'VPInventoryStatusChangeDate', headerName: 'Pending Disconnection Date' },
          { field: 'InvoiceCyclesRemaining', headerName: 'Invoice Cycles Remaining' },
          { field: 'ServiceStartDate', headerName: 'Start Date' },
        ]
      },
      {
        headerName: 'Spend',
        children: [
          { field: 'LastInvoicePeriod', headerName: 'Last Spend Period' },
          { field: 'LastSpendChargesDisplay', headerName: 'Spend' },
        ]
      },

    ];
  }

  get f(): any {
    return this.form.controls;
  }

  openDialog() {
    this.templateRef = this.dialog.open(this.ReplaceContractooltip, {
      width: '600px'
    });

  }
  closeModal() {
    this.templateRef.close();
  }
  ngOnInit(): void {
    this.temRoles = rolePermission(['TEMAdmin', 'TEMUser', 'TEMManager']);

    // Mapping keys to names
    const keyNameMapping = {
      [this.columnSpndByCTName]: this.columnSpndByCTName,
      [this.columnSpndByVPName]: this.columnSpndByVPName,
      [this.columnSpndBySTName]: this.columnSpndBySTName,
      [this.columnInvWithNotesName]: this.columnInvWithNotesName,
      [this.columnInvtryWithNotesName]: this.columnInvtryWithNotesName,
      [this.columnAdtVPWithName]: this.columnAdtVPWithName,
      [this.columnAllSpndByVPName]: this.columnAllSpndByVPName,
      [this.columnImportReportName]: this.columnImportReportName,
      [this.columnVPByContractName]: this.columnVPByContractName,
      [this.columnInvVarByCCName]: this.columnInvVarByCCName,
      [this.columnActiveInvWithNoSpendName]: this.columnActiveInvWithNoSpendName,
      [this.columnInvPendingActivationWithNoSpendName]: this.columnInvPendingActivationWithNoSpendName,
      [this.columnInvPendingDiscWithNoSpendName]: this.columnInvPendingDiscWithNoSpendName,
      [this.columnInvPendingDiscWithSpendName]: this.columnInvPendingDiscWithSpendName,
    };

    // Assigning the name based on the key
    this.rName = keyNameMapping[this.rowData.data['Key']] || null;


    this.companies = [];
    this.companies.unshift({ 'CompanyName': 'All', 'CompanyID': '' });
    this.f['CompanyId'].setValue(this.companies[0].CompanyID);

    this.billingAccount = [];
    this.billingAccount.unshift({ 'AccountNumber': 'All', 'Id': '' })
    this.f['BillingAccountHierarchyId'].setValue(this.billingAccount[0].Id);

    this.f['withTotals'].setValue(false);

    if (this.rowData.data['Key'] === 'VendorProductsWithNoOrExpiredContract') {
      const data = {
        value: 3
      }
      this.getInvoicePeriod(data)
    }

    if (this.rowData.data['Key'] === 'InvoiceWithNotes' || this.rowData.data['Key'] === 'ImportReport' || this.rowData.data['Key'] === 'InventoryVarianceByChargeCode') {
      this.form.get('invoiceMonth')?.setValidators([Validators.required]);
    } else {
      this.form.get('invoiceMonth')?.setValidators([]);
    }
    this.form.get('invoiceMonth')?.updateValueAndValidity();


    this.getCustomerList();
    this.invoicePeroidFn();
    this.reportsInvoiceMonths();
    this.filterVendorGridByTEMId();

  }

  getVendorProductType() {
    let id: any = this.f.VendorId.value !== '' ? this.f.VendorId.value : null;

    this.loadingVendorproducttypes = true;
    let data = {
      "serviceId": null,
      "serviceTypeId": null,
      "productId": null,
      "productTypeId": null,
      "IndustryId": null,
      "vendorAccountId": id,
    }
    this._unsubscribeVendorProductTypesDetails.next(null);
    this.locationService.getVendorProductTypeList(data).pipe(takeUntil(this._unsubscribeVendorProductTypesDetails)).subscribe((data: any) => {
      if (data.Success) {
        this.vendorProductDetails = data.Data.$values;
        this.loadingVendorproducttypes = false;
      } else {
        this.vendorProductDetails = [];
        this.loadingVendorproducttypes = false;
      }
    }, error => {
      this.vendorProductDetails = [];
      this.loadingVendorproducttypes = false;
    });
  }

  filterVendorGridByTEMId() {
    this.vendorsList = [];
    this.loadingVendorsList = true;
    this._unsubscribeVendor.next(null);
    this.locationService
      .getVendorDropdown()
      .pipe(takeUntil(this._unsubscribeVendor))
      .subscribe({
        next: (data) => {
          if (data && data.Data && data.Data.$values) {
            this.loadingVendorsList = false;
            this.vendorsList = data.Data.$values;
            this.vendorsList.unshift({ 'AccountName': 'All', 'Id': '' })
            this.f['VendorId'].setValue(this.vendorsList[0].Id);
          }
        },
        error: (error) => {
          this.loadingVendorsList = false;
        },
      });
  }

  invoicePeroidFn() {
    this.loadingInvoicePeriod = true;
    this.locationService.getInvoicePreiod().subscribe({
      next: (data: any) => {
        if (data && data.Data && data.Data.$values) {
          this.InvoicePeroid = data.Data.$values;
          this.loadingInvoicePeriod = false;
        } else {
          this.loadingInvoicePeriod = false;
        }
      },
      error: error => {
        this.loadingInvoicePeriod = false;
      }
    });
  }

  getCustomerList() {
    if ((this.isSaveClicked || this.temRoles) && this.tem !== 'all') {
      this.customerList = [];
      this.loadingCustomer = true;
      this.locationService.getCustomerDropdownByNewTEM(this.tem).pipe().subscribe((data) => {
        if (data && data.Data.$values) {
          this.customerList = data.Data.$values;
          this.customerList.unshift({ 'AccountName': 'All', 'Id': '' })
          this.f['customerId'].setValue(this.customerList[0].Id);
          this.loadingCustomer = false;
        } else {
          this.customerList = [];
          this.loadingCustomer = false;
        }
      }, error => {
        this.customerList = [];
        this.loadingCustomer = false;
      });
    } else {
      this.customerList = [];
      this.loadingCustomer = true;
      this.locationService.getCustomerDropDown().pipe().subscribe((data) => {
        if (data && data.$values) {
          this.customerList = data.$values;
          this.customerList.unshift({ 'AccountName': 'All', 'Id': '' })

          this.f['customerId'].setValue(this.customerList[0].Id);
          this.loadingCustomer = false;
        } else {
          this.customerList = [];
          this.loadingCustomer = false;
        }
      }, error => {
        this.customerList = [];
        this.loadingCustomer = false;
      });

    }
  }

  getCompanyByCustomerId(id: any) {

    if (id && id.value === '') {
      this.f['customerId'].setValue('');
    }
    if (id && id.value !== '') {
      this.loadingCompanyList = true;
      this.companies = [];
      this.locationService.getCompanyByCustomerId(id.value).pipe().subscribe((data) => {
        if (data && data.$values && data.$values.length > 0) {
          this.companies = data.$values;
          this.companies.unshift({ 'CompanyName': 'All', 'CompanyID': '' })
          this.f['CompanyId'].setValue(this.companies[0].CompanyID);
          this.loadingCompanyList = false;
        } else {
          this.companies = [];
          this.loadingCompanyList = false;
        }
      }, error => {
        this.companies = [];
        this.loadingCompanyList = false;
      });
    }
  }

  getVendorList() {
    if (!this.f.customerId.value) {
      return;
    }
    this.loadingVendorsList = true;
    this.vendorsList = [];
    this.locationService.getVendorDropdown(false, this.f.customerId.value).pipe().subscribe({
      next: (data) => {
        if (data && data.Data && data.Data.$values) {
          this.loadingVendorsList = false;
          this.vendorsList = data.Data.$values;
          this.vendorsList.unshift({ 'AccountName': 'All', 'Id': '' })
          this.f['VendorId'].setValue(this.vendorsList[0].Id);
        } else {
          this.loadingVendorsList = false;
          this.vendorsList = [];
        }
      },
      error: (error) => {
        this.loadingVendorsList = false;
        this.vendorsList = [];
      },
    });
  }

  reportsInvoiceMonths() {
    this.loadingReportsInvoiceMonthsList = false;
    this.reportsInvoiceMonthsList = [];

    if (this.rowData.data['Key'] === 'InvoiceWithNotes') {
      this.columnData = this.columnInvWithNotes;
    } else if (this.rowData.data['Key'] === 'InventoryWithNotes') {
      this.columnData = this.columnInvtryWithNotes;
    }

    let headerData: any = [];
    let ChildHeaderData: any = [];
    let i = 0;
    let childIndex = 0;
    _.map(this.columnData, (x: any) => {
      if (isValueExist(x.headerName)) {
        i = i + 1;
        headerData.push({ position: i, title: x.headerName });
        if (x.children) {
          _.map(x.children, (y: any) => {
            childIndex = childIndex + 1;
            ChildHeaderData.push({ Position: childIndex, Title: y.headerName, FieldName: y.field, HeaderPosition: i, IsCurrency: y?.IsCurrency ? y?.IsCurrency : false })
          })
        }
      }
    });

    const ExportToExcelData = {
      HeaderData: headerData,
      ChildHeaderData: ChildHeaderData,
      fileName: this.rName,
      sheetName: this.rName,
    }
    let datas = {
      "temAccountId": this.tem !== 'all' ? this.tem : null,
      "customerAccountId": (this.f.customerId.value && this.f.customerId.value !== '') ? this.f.customerId.value : null,
      "companyId": (this.f.CompanyId.value && this.f.CompanyId.value !== '') ? this.f.CompanyId.value : null,
      "vendorAccountId": (this.f.VendorId.value && this.f.VendorId.value !== '') ? this.f.VendorId.value : null,
      "billingAccountHierarchyId": (this.f.BillingAccountHierarchyId.value && this.f.BillingAccountHierarchyId.value !== '') ? this.f.BillingAccountHierarchyId.value : null,
      "exportToExcel": true,
      "reportName": this.rName,
      "invoiceMonth": this.f.invoiceMonth.value ? this.f.invoiceMonth.value : null,
      "withTotals": this.f.withTotals.value ? this.f.withTotals.value : false,
      "ExportToExcelData": ExportToExcelData,
      "vendorProductTypeId": this.f.vendorProductTypeId.value ?? null,
      "noteStatus": this.f.noteStatus.value,
      "invoicePeriodTypeId": this.f.Period.value ?? null
    }
    this.loadingReportsInvoiceMonthsList = true;
    this.locationService.reportsInvoiceMonths(datas).pipe().subscribe({
      next: (data: any) => {  
        if (data && data.Data && data.Data.$values) {
          this.loadingReportsInvoiceMonthsList = false;
          this.reportsInvoiceMonthsList = data.Data.$values;
          this.reportsInvoiceMonthsList = _.map(this.reportsInvoiceMonthsList, (x: any) => {
            let a: any = {};
            a = x;
            a['Id'] = x.DateMonthYear.split('T')[0];
            a['label'] = x.MonthYear;
            return a;
          });
        } else {
          this.loadingReportsInvoiceMonthsList = false;
          this.reportsInvoiceMonthsList = [];
        }
      },
      error: (error) => {
        this.loadingReportsInvoiceMonthsList = false;
        this.reportsInvoiceMonthsList = [];
      },
    });
  }

  getCustomerVendorBillingAccounts() {

    const k = this.rowData.data['Key'] === 'VendorProductsByContract' ? false : true;
    let KeyString: any = '';
    KeyString = '?payableAccount=' + k;

    if (this.f.VendorId.value === '') {
      this.f['VendorId'].setValue('');
    }
    if (this.f.customerId.value === '') {
      this.f['customerId'].setValue('');
    }
    if (this.f.customerId.value || this.f.VendorId.value) {
      KeyString += "&customerId=" + (this.f.customerId.value ?? '') + "&VendorId=" + (this.f.VendorId.value ?? '');
      this.billingAccount = [];
      this.f['vendorProductTypeId'].setValue(null);
      this.loadingPayableAcc = true;
      this.locationService.getCustomerVendorBillingAccounts(KeyString).pipe().subscribe((data) => {
        if (data && data.Data && data.Data.$values) {
          this.billingAccount = data.Data.$values;
          this.billingAccount.unshift({ 'AccountNumber': 'All', 'Id': '' })
          this.f['BillingAccountHierarchyId'].setValue(this.billingAccount[0].Id);
          this.loadingPayableAcc = false;
        } else {
          this.loadingPayableAcc = false;
          this.billingAccount = [];
        }
      });

    }

  }

  download() {
    this.isCompanyFormSubmit = true;

    if (!this.form.valid) {
      return
    }
    if (this.rowData.data['Key'] === 'VendorProductsByContract') {
      const data = {
        value: 3
      }
      this.getInvoicePeriod(data, true);
    } else if (!this.f.invoiceMonth.value && !this.f.Period.value && this.rowData.data['Key'] !== 'VendorProductsWithNoOrExpiredContract') {
      const data = {
        value: 0
      }
      this.getInvoicePeriod(data, true);
    } else if (this.rowData.data['Key'] === 'VendorProductsWithNoOrExpiredContract') {
      const data = {
        value: 3
      }
      this.getInvoicePeriod(data, true);
    } else if (
      (this.rowData.data['Key'] === 'InvoiceWithNotes' ||
        this.rowData.data['Key'] === 'InventoryVarianceByChargeCode') &&
      this.f.invoiceMonth.value) {
      const data = {
        value: null
      }
      this.getInvoicePeriod(data, true);
    } else {
      this.downloadFn();
    }
  }

  getInvoicePeriod($event: any, CallAPI = false) {
    this.columnData = [];

    if (this.rowData.data['Key'] === 'ImportReport') {
      if (!this.f.invoiceMonth.value) {
        return;
      }
    } else {

      let KeyString: string = `?invoicePeriodTypeId=${$event.value ?? ''}`;

      KeyString += "&invoiceMonth=" + (this.f.invoiceMonth.value ?? '') + "&reportId=" + (this.rowData.data.Id ?? '');

      this._unsubscribeInvoicePeriod.next(null);
      this.locationService.getInvoicePeriod(KeyString).pipe(takeUntil(this._unsubscribeInvoicePeriod)).subscribe((data: any) => {
        if (data.Data.InvoiceMonthYears.$values) {
          const d = _.map(data.Data.InvoiceMonthYears.$values, (k: any) => {
            let a: any = {};
            let c = isValueExist(this.manageService.convertDate(k, '', '/'));

            a['date'] = new Date(c).getMonth()+1;
            a['year'] = new Date(c).getFullYear().toString().slice(-2);
            
            return a;
          });

          if (this.rowData.data['Key'] === 'VendorProductsByContract') {
            this.columnVPByContract[6]['children'] = [];
            _.forEach(d, (n: any) => {
              const getMonthName = _.find(this.monthList, (c: any) => c.monthId === n.date)?.month;

              // const currentyear = new Date().getFullYear().toString().slice(-2);
              this.columnVPByContract[6]['children'].push(
                { 'field': 'Month' + n.date + 'ChargeDisplay', 'headerName': getMonthName + '-' + n.year + ' Recurring Charges', 'IsCurrency': true })
              this.columnVPByContract[6]['children'].push(
                { 'field': 'Month' + n.date + 'DiscountsDisplay', 'headerName': getMonthName + '-' + n.year + ' Discount', 'IsCurrency': true })
              this.columnVPByContract[6]['children'].push(
                { 'field': 'Month' + n.date + 'NetChargeDisplay', 'headerName': getMonthName + '-' + n.year + ' Recurring  Net', 'IsCurrency': true })

            })
            this.columnData = this.columnVPByContract;
          } else if (this.rowData.data['Key'] === 'AllSpendByVendorProduct') {
            this.columnAllSpndByVP[4]['children'] = [];
            // this.columnAllSpndByVP[5]['children'] = [];

            _.forEach(d, (n: any) => {
              const getMonthName = _.find(this.monthList, (c: any) => c.monthId === n.date)?.month;
              // const currentyear = new Date().getFullYear().toString().slice(-2);
              this.columnAllSpndByVP[4]['children'].push(
                { 'field': 'Month' + n.date + 'ChargeDisplay', 'headerName': getMonthName + '-' + n.year, 'IsCurrency': true })
              // this.columnAllSpndByVP[5]['children'].push(
              //   { 'field': 'Month' + n.date + 'Count', 'headerName': getMonthName + '-' + n.year })
            })
            this.columnData = this.columnAllSpndByVP;
          } else if (this.rowData.data['Key'] === 'SpendByChargeType') {
            this.columnSpndByCT[2]['children'] = [];
            _.forEach(d, (n: any) => {
              const getMonthName = _.find(this.monthList, (c: any) => c.monthId === n.date)?.month;
              // const currentyear = new Date().getFullYear().toString().slice(-2);
              this.columnSpndByCT[2]['children'].push(
                { 'field': 'Month' + n.date + 'ChargeDisplay', 'headerName': getMonthName + '-' + n.year, 'IsCurrency': true })
            })
            this.columnData = this.columnSpndByCT;
          } else if (this.rowData.data['Key'] === 'RecurringSpendByVendorProduct') {
            this.columnSpndByVP[2]['children'] = [];
            this.columnSpndByVP[3]['children'] = [];
            _.forEach(d, (n: any) => {
              const getMonthName = _.find(this.monthList, (c: any) => c.monthId === n.date)?.month;
              // const currentyear = new Date().getFullYear().toString().slice(-2);
              this.columnSpndByVP[2]['children'].push(
                { 'field': 'Month' + n.date + 'ChargeDisplay', 'headerName': getMonthName + '-' + n.year, 'IsCurrency': true })
              this.columnSpndByVP[3]['children'].push(
                { 'field': 'Month' + n.date + 'Count', 'headerName': 'Count ' + getMonthName + '-' + n.year })
            })
            this.columnData = this.columnSpndByVP;

          } else if (this.rowData.data['Key'] === 'RecurringSpendByServiceType') {
            this.columnSpndByST[2]['children'] = [];
            _.forEach(d, (n: any) => {
              const getMonthName = _.find(this.monthList, (c: any) => c.monthId === n.date)?.month;
              // const currentyear = new Date().getFullYear().toString().slice(-2);
              this.columnSpndByST[2]['children'].push(
                { 'field': 'Month' + n.date + 'ChargeDisplay', 'headerName': getMonthName + '-' + n.year, 'IsCurrency': true })
            })
            this.columnData = this.columnSpndByST;
          } else if (this.rowData.data['Key'] === 'VendorProductsWithNoOrExpiredContract') {
            // const currentyear = new Date().getFullYear().toString().slice(-2);
            this.columnAdtVPWith[1]['children'][2] = {};

            this.columnAdtVPWith[1]['children'][2] = { 'field': 'Month' + d[0]['date'] + 'ChargeDisplay', 'headerName': this.monthList[d[0]['date'] - 1]['month'] + '-' + d[0]['year'] + ' Total Current Charges', 'IsCurrency': true }

            this.columnAdtVPWith[1]['children'][3] = {};
            this.columnAdtVPWith[1]['children'][3] = { 'field': 'Month' + d[1]['date'] + 'ChargeDisplay', 'headerName': this.monthList[d[1]['date'] - 1]['month'] + '-' + d[1]['year'] + ' Total Current Charges', 'IsCurrency': true };

            this.columnAdtVPWith[1]['children'][4] = {};
            this.columnAdtVPWith[1]['children'][4] = { 'field': 'Month' + d[2]['date'] + 'ChargeDisplay', 'headerName': this.monthList[d[2]['date'] - 1]['month'] + '-' + d[2]['year'] + ' Total Current Charges', 'IsCurrency': true };

            this.columnData = this.columnAdtVPWith;
          } else if (this.rowData.data['Key'] === 'InventoryVarianceByChargeCode') {

            this.columnInvVarByCC[6]['children'] = [];

            _.forEach(d, (n: any) => {
              const getMonthName = _.find(this.monthList, (c: any) => c.monthId === n.date)?.month;
              // const currentyear = new Date().getFullYear().toString().slice(-2);
              this.columnInvVarByCC[6]['children'].push(
                { 'field': 'Month' + n.date + 'ChargeDisplay', 'headerName': getMonthName + '-' + n.year, 'IsCurrency': true })
            })

            this.columnInvVarByCC[6]['children'].push(
              { 'field': 'CurrentMonthVarianceDisplay', 'headerName': '$ Variance', 'IsCurrency': true },
              { 'field': 'CurrentMonthVariancePercentDisplay', 'headerName': '% Variance', 'IsPercentage': true }
            );

            this.columnData = this.columnInvVarByCC;

          }

          if (CallAPI) {
            this.downloadFn();
          }
        }
      })
    }

  }

  downloadFn() {
    if (this.rowData.data['Key'] === 'InvoiceWithNotes') {
      this.columnData = this.columnInvWithNotes;
    } else if (this.rowData.data['Key'] === 'InventoryWithNotes') {
      this.columnData = this.columnInvtryWithNotes;
    } else if (this.rowData.data['Key'] === 'ImportReport') {
      this.columnData = this.columnImportReport;
    } else if (this.rowData.data['Key'] === 'ActiveInventoryMoreThan30DaysWithNoSpend') {
      this.columnData = this.columnActiveInvWithNoSpend;
    } else if (this.rowData.data['Key'] === 'PendingActivationInventoryMoreThan30DaysWithNoSpend') {
      this.columnData = this.columnInvPendingActivationWithNoSpend;
    } else if (this.rowData.data['Key'] === 'PendingDisconnectionInventoryMoreThan30DaysWithNoSpend') {
      this.columnData = this.columnInvPendingDiscWithNoSpend;
    } else if (this.rowData.data['Key'] === 'PendingDisconnectionInventoryMoreThan30DaysWithSpend') {
      this.columnData = this.columnInvPendingDiscWithSpend;
    }

    let headerData: any = [];
    let ChildHeaderData: any = [];
    let i = 0;
    let childIndex = 0;
    _.map(this.columnData, (x: any) => {
      if (isValueExist(x.headerName)) {
        i = i + 1;
        headerData.push({ position: i, title: x.headerName });
        if (x.children) {
          _.map(x.children, (y: any) => {
            childIndex = childIndex + 1;
            // ChildHeaderData.push({ Position: childIndex, Title: y.headerName, FieldName: y.field, HeaderPosition: i, IsCurrency: y?.IsCurrency ? y?.IsCurrency : false })
            let obj: any = {
              Position: childIndex, Title: y.headerName, FieldName: y.field, HeaderPosition: i, IsCurrency: y?.IsCurrency ? y?.IsCurrency : false
            }
            if(y.field == 'PaymentAmountDisplay' || y.field == 'BalanceFwdDisplay' || y.field == 'TotalDueDisplay' || y.field == 'TotalCurrentChargesDisplay' || y.field == 'AmountDisplay') {
              obj['IsCurrency'] = true
            }
            if (y.field == 'CurrentMonthVariancePercentDisplay' && this.rowData.data['Key'] === 'InventoryVarianceByChargeCode' ) {
              delete obj['IsCurrency'];
              obj['IsPercentage'] = true
            }
            ChildHeaderData.push(obj)
          })
        }
      }
    });

    const ExportToExcelData = {
      HeaderData: headerData,
      ChildHeaderData: ChildHeaderData,
      fileName: this.rName,
      sheetName: this.rName,
    }

    this.requestArray = {
      "temAccountId": this.tem !== 'all' ? this.tem : null,
      "customerAccountId": (this.f.customerId.value && this.f.customerId.value !== '') ? this.f.customerId.value : null,
      "companyId": (this.f.CompanyId.value && this.f.CompanyId.value !== '') ? this.f.CompanyId.value : null,
      "vendorAccountId": (this.f.VendorId.value && this.f.VendorId.value !== '') ? this.f.VendorId.value : null,
      "billingAccountHierarchyId": (this.f.BillingAccountHierarchyId.value && this.f.BillingAccountHierarchyId.value !== '') ? this.f.BillingAccountHierarchyId.value : null,
      "exportToExcel": true,
      "reportName": this.rName,
      "invoiceMonth": this.f.invoiceMonth.value ? this.f.invoiceMonth.value : null,
      "withTotals": this.f.withTotals.value ? this.f.withTotals.value : false,
      "ExportToExcelData": ExportToExcelData,
      "vendorProductTypeId": this.f.vendorProductTypeId.value ?? null,
      "NoteStatus": this.f.noteStatus.value,
      "invoicePeriodTypeId": this.f.Period.value ?? null
    }

    if ((this.rowData.data['Key'] === 'SpendByChargeType' || this.rowData.data['Key'] === 'RecurringSpendByVendorProduct' ||
      this.rowData.data['Key'] === 'RecurringSpendByServiceType') && this.f.Period.value
    ) {
      const filteredRowData = _.find(this.InvoicePeroid, (c: any) => c.Id === this.f.Period.value)
      this.requestArray['invoicePeriodType'] = filteredRowData.AccountNumber;
      this.requestArray['invoicePeriodTypeId'] = this.f.Period.value;
    }

    this.saveButtonLoadder = true;

    this.locationService.getDownloadReport(this.rowData.data.Id, this.requestArray).pipe()
      .subscribe({
        next: (response: any) => {
          this.saveButtonLoadder = false;

          const contentType = response.headers.get('Content-Type');

          if (contentType && contentType.includes('application/json')) {
            const reader = new FileReader();
            reader.onload = () => {
              const jsonResponse = JSON.parse(reader.result as string);

              if (jsonResponse.Success === false) {
                let errorData: any = {
                  messgeType: 'error',
                  title: 'Attention',
                  titleClass: 'text-c-blue',
                  icon: 'fas fa-exclamation-circle',
                  iconClass: 'text-c-blue f-70',
                  okBtnName: 'Close',
                  message: jsonResponse.Message
                };
                this.dialog.open(ErrorWarningPopupComponent, {
                  panelClass: 'error-warning',
                  data: errorData,
                });

              }
            }
            reader.readAsText(response.body);

          } else if (contentType && contentType.includes('application')) {
            // let bolbUrl = URL.createObjectURL(response);
            // var link = document.createElement("a");
            // link.setAttribute("href", bolbUrl);
            // link.setAttribute("download", this.rName + '.xlsx');
            // link.style.display = "none";
            // document.body.appendChild(link);
            // link.click();
            // document.body.removeChild(link);


            // Response is a file, handle download
            const blob = response.body as Blob;
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;

            // Get filename from content-disposition header if available
            const contentDisposition = response.headers.get('Content-Disposition');
            const fileName = contentDisposition
              ? contentDisposition.split('filename=')[1]?.split(';')[0]?.replace(/"/g, '')
              : this.rName + '.xlsx';

            a.download = fileName;
            a.click();
            window.URL.revokeObjectURL(url);

          }
        }, error: error => {

          this.saveButtonLoadder = false;
          
        }
      });
  }

  ngOnDestroy(): void {
    this._unsubscribeInvoicePeriod.next(null);
    this._unsubscribeInvoicePeriod.complete();
  }

  setTemId(){
    const TemID = _.find(this.customerList, (c: any) => c.Id === this.f.customerId.value).TemAccountID;
    this.tem = TemID;
  }
}
