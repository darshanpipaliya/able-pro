import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import moment from 'moment';
import { ErrorWarningPopupComponent } from 'src/app/common/error-warning-popup/error-warning-popup.component';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { ContractService } from 'src/app/services/contract.service';
import { checkIsValueExists, isValueExist } from 'src/app/services/helper';
import { ManageService } from 'src/app/services/manage.service';

@Component({
  selector: 'app-replace-contract-dialog',
  templateUrl: './replace-contract-dialog.component.html',
  styleUrls: ['./replace-contract-dialog.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    SharedModule
  ]
})
export class ReplaceContractDialogComponent implements OnInit {

  public sideBar: any;
  public columnDefs: any;
  public rowSelection = 'single';
  customers: any = [];
  defaultColDef = {
    sortable: true,
    minWidth: 100,
    filter: true,
    resizable: true,
    floatingFilter: true,
    flex: 1,
  };
  public templateRef: any;

  rowData: any = [];
  replaceRowData: any = [];
  dialogData: any;
  checkedData: any;
  rowDetailData: any;
  replacedContractId: any;
  saveButtonLoader: boolean = false;

  @ViewChild('ReplaceContractooltip') ReplaceContractooltip!: TemplateRef<any>;

  constructor(public dialog: MatDialog,
    public dialogRef: MatDialogRef<ReplaceContractDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: any,
    private manageService: ManageService,
    private contractService: ContractService) {

    this.dialogData = data.data;
    this.rowData = [data.data];
    
    this.rowDetailData = data.rowDetailData;
    dialogRef.disableClose = true;
  }

  openDialog() {
    this.templateRef = this.dialog.open(this.ReplaceContractooltip, {
      width: '900px'
    });

  }

  replaceContract() {
    if (checkIsValueExists(this.checkedData)) {
      // this.saveButtonLoader = true;
      
      const formData = new FormData();
      formData.append('CurrencyId', isValueExist(this.rowDetailData.CurrencyId));
      formData.append('DocumentType', isValueExist(this.checkedData[0].Overview.DocumentType));
      formData.append('CustomerId', isValueExist(this.checkedData[0].Overview.CustomerId));
      formData.append('VendorId', isValueExist(this.checkedData[0].Overview.VendorId));
      // formData.append('CompanyId', isValueExist(this.checkedData[0].Overview.CompanyId));
      if(isValueExist(this.checkedData[0].Overview.CompanyId)) {
        formData.append('CompanyId', this.checkedData[0]?.Overview?.CompanyId);
      }
      formData.append('DocumentName', isValueExist(this.checkedData[0].Overview.DocumentName));
      formData.append('VendorDocumentName', isValueExist(this.checkedData[0].Overview.VendorDocumentName));
      formData.append('InternalDocumentNumber', isValueExist(this.checkedData[0].Overview.InternalDocumentNumber));
      formData.append('VendorDocumentNumber', isValueExist(this.checkedData[0].Overview.VendorDocumentNumber));
      formData.append('Active', this.checkedData[0].Overview.Status ? this.checkedData[0].Overview.Status : true);
      formData.append('Description', isValueExist(this.checkedData[0].Overview.Discription));
      formData.append('AnnualRevenueCommitment', isValueExist(this.checkedData[0].Commitments.AnnualRevenueAmount));
      formData.append('MonthlyRevenueCommitment', isValueExist(this.checkedData[0].Commitments.MonthlyRevenueAmount));
      formData.append('InventoryCommitment', isValueExist(this.checkedData[0].Commitments.InventoryCommitmentAmount));
      formData.append('OtherCommitment', isValueExist(this.checkedData[0].Commitments.OtherAmount));
      // formData.append('CommitmentNotes', isValueExist(this.checkedData[0].CommitmentNotes));
      formData.append('ServiceDiscount', isValueExist(this.checkedData[0].Discounts.ServiceDiscount));
      formData.append('EquipmentDiscount', isValueExist(this.checkedData[0].Discounts.EquipmentDiscount));
      formData.append('FeatureDiscount', isValueExist(this.checkedData[0].Discounts.FeatureDiscount));
      formData.append('OtherDiscount', isValueExist(this.checkedData[0].Discounts.OtherDiscount));
      // formData.append('DiscountNotes', isValueExist(this.checkedData[0].DiscountNotes));
      formData.append('InstallationFees', isValueExist(this.checkedData[0].Fees.InstallationFees));
      formData.append('ActivationFees', isValueExist(this.checkedData[0].Fees.ActivationFees));
      formData.append('ConstructionFees', isValueExist(this.checkedData[0].Fees.ConstructionFees));
      formData.append('OtherFees', isValueExist(this.checkedData[0].Fees.OtherFees));
      // formData.append('FeeNotes', isValueExist(this.checkedData[0].FeeNotes));
      formData.append('AutoRenewal', isValueExist(this.checkedData[0].Terms.AutoRenewal) ? this.checkedData[0].Terms.AutoRenewal : true);
      formData.append('NoticePeriodId', isValueExist(this.checkedData[0].Terms.NoticePeriodId));
      formData.append('ReminderDaysAlarmId', isValueExist(this.checkedData[0].Terms.ReminderPeriodId));
      formData.append('CustomPaymentTerms', isValueExist(this.checkedData[0].Terms.CustomPaymentTerms));
      // formData.append('TermNotes', isValueExist(this.checkedData[0].TermNotes));
      formData.append('EarlyTerminationFee', isValueExist(this.checkedData[0].Termination.EarlyTerminationPenalty));
      formData.append('TerminationFees', isValueExist(this.checkedData[0].Termination.TerminationFees));
      // formData.append('TerminationNotes', isValueExist(this.checkedData[0].TerminationNotes));
      // formData.append('ActivationCreditAmount', isValueExist(this.checkedData[0].ActivationCreditAmount));
      formData.append('SpendCreditAmount', isValueExist(this.checkedData[0].Credits.SpendCreditAmount));
      formData.append('OtherCreditAmount', isValueExist(this.checkedData[0].Credits.OtherCreditAmount));
      formData.append('GuaranteedCreditAmount', isValueExist(this.rowDetailData['Credits']['GuaranteedCreditAmount']));
      // formData.append('NumberOfActivationFees', isValueExist(this.checkedData[0].NumberOfActivationFees));
      formData.append('NumberOfTerminationWaivers', isValueExist(this.checkedData[0].Credits.NoOfTerminationFeesWaivers));
      formData.append('NumberOfJointActtermFees', isValueExist(this.checkedData[0].Credits.NoOfJointActivationTerminationFeeWaivers));
      // formData.append('CreditNotes', isValueExist(this.checkedData[0].CreditNotes));

      if (this.checkedData[0].Terms.StartDate) {
        // formData.append('StartDate', moment(this.checkedData[0].Terms.StartDate).format('MM/DD/YYYY'));
        formData.append('StartDate', isValueExist(this.onselectSetDate(this.checkedData[0].Terms.StartDate, '-')));
      }

      if (this.checkedData[0].Terms.EndDate) {
        // formData.append('EndDate', moment(this.checkedData[0].Terms.EndDate).format('MM/DD/YYYY'));
        formData.append('EndDate', isValueExist(this.onselectSetDate(this.checkedData[0].Terms.EndDate, '-')));
      }

      if (this.checkedData[0].CurrencyId) {
        formData.append('CurrencyId', this.checkedData[0].CurrencyId);
      }

      formData.append('Label', isValueExist(this.checkedData[0].Overview.Label));

      let data: any = {};
      data['ReplaceContract'] = true;
      formData.append('ReplaceContract', data.ReplaceContract);
      formData.append('ParentContractId', this.checkedData[0].Id);

      this.contractService.saveContract(formData).subscribe((res) => {
        this.saveButtonLoader = false;

        if (res['Success']) {
          this.replacedContractId = res.Data.Id;
          this.errorPopup(res);
        } else {
          this.errorPopup(res);
        }
      }, error => {
        this.saveButtonLoader = false;
        this.errorPopup(error);
      });
    } else {
      const response = {
        'Message': 'Please select one Contract.'
      }
      this.errorPopup(response, false);
  }
}

closeModal() {
  this.templateRef.close();
}

ngOnInit(): void {
  this.setReplaceTable();
  this.getReplaceContractGrid();
}

getReplaceContractGrid(){
  this.contractService.getReplaceContractGrid(this.rowData[0].ContractId).subscribe((res: any) => {
    if(res.Success){
      this.replaceRowData = res.Data.$values;
    } else {
      this.replaceRowData = [];
    }
  });
}

setReplaceTable() {
  this.columnDefs = [
    {
      headerName: ' ',
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
      suppressColumnsToolPanel: true
    },
    {
      headerName: 'Vendor',
      children: [
        {
          field: 'Overview.VendorName',
          headerName: 'Vendor',
          columnGroupShow: 'open',
          filter: 'agTextColumnFilter',
          editable: false,
          minWidth: 101
        },
      ],
    },
    {
      headerName: 'Organization',
      children: [
        {
          field: 'Overview.CustomerName',
          headerName: 'Customer',
          columnGroupShow: 'close',
          filter: 'agTextColumnFilter',
          editable: false,
          minWidth: 200
        },
        {
          field: 'Overview.CompanyName',
          headerName: 'Company',
          columnGroupShow: 'close',
          filter: 'agTextColumnFilter',
          editable: false,
          minWidth: 200
        }
      ],
    },
    {
      headerName: 'Overview',
      children: [
        {
          field: 'Overview.DocumentType',
          headerName: 'Type of Document',
          columnGroupShow: 'close',
          filter: 'agTextColumnFilter',
          editable: false,
          minWidth: 178
        },
        {
          field: 'Overview.DocumentName',
          headerName: 'Name',
          columnGroupShow: 'close',
          filter: 'agTextColumnFilter',
          editable: false,
          minWidth: 200
        },
        {
          field: 'Overview.StatusDisplay',
          headerName: 'Status',
          columnGroupShow: 'close',
          filter: 'agTextColumnFilter',
          editable: false,
          minWidth: 94
        },
        {
          field: 'Overview.InternalDocumentNumber',
          headerName: 'Internal Contract Number',
          columnGroupShow: 'open',
          filter: 'agTextColumnFilter',
          editable: false,
          minWidth: 240
        }
      ],
    },
    {
      headerName: 'Terms',
      children: [
        {
          field: 'Terms.StartDate',
          headerName: 'Start Date',
          columnGroupShow: 'close',
          filter: 'agTextColumnFilter',
          editable: false,
          minWidth: 121,
          valueGetter(params: any) {
            if (params.data?.Terms.StartDate) {
              return moment(params.data && params.data?.Terms.StartDate).format('MM/DD/YYYY');
            }
            return '';
          }
        },
        {
          field: 'Terms.EndDate',
          headerName: 'End Date',
          columnGroupShow: 'close',
          filter: 'agTextColumnFilter',
          editable: false,
          minWidth: 114,
          valueGetter(params: any) {
            if (params.data?.Terms.EndDate) {
              return moment(params.data && params.data?.Terms.EndDate).format('MM/DD/YYYY');
            }
            return '';
          }
        },
        {
          field: 'Terms.ContractTermDisplay',
          headerName: 'Contract Term',
          columnGroupShow: 'close',
          filter: 'agTextColumnFilter',
          editable: false,
          minWidth: 149
        },
        {
          field: 'Terms.MonthsRemaining',
          headerName: 'Months Remaining',
          columnGroupShow: 'close',
          filter: 'agTextColumnFilter',
          editable: false,
          minWidth: 181
        },
        {
          field: 'Terms.NoticePeriod',
          headerName: 'Notice Period',
          columnGroupShow: 'open',
          filter: 'agTextColumnFilter',
          editable: false,
          minWidth: 145
        },
        {
          field: 'Terms.RemainingDays',
          headerName: 'Reminder Period',
          columnGroupShow: 'open',
          filter: 'agTextColumnFilter',
          editable: false,
          minWidth: 175
        },
        {
          field: 'Terms.AutoRenewalDisplay',
          headerName: 'Auto-Renewal',
          columnGroupShow: 'open',
          filter: 'agTextColumnFilter',
          editable: false,
          minWidth: 139
        }
      ],
    }
  ];
}

onselectSetDate($event: any, regex = '/') {
  if (!$event) {
    return;
  }
  if ($event && !$event.toString().includes('/')) {
    let d = new Date($event);
    
    let dd = d.getDate();
    let mm = d.getMonth() + 1;
    let yy = d.getFullYear();

    let userAgent = navigator.userAgent;
    let browserName;

    if (userAgent.match(/chrome|chromium|crios/i)) {
      browserName = "chrome";
    } else if (userAgent.match(/firefox|fxios/i)) {
      browserName = "firefox";
    } else if (userAgent.match(/safari/i)) {
      browserName = "safari";
    } else if (userAgent.match(/opr\//i)) {
      browserName = "opera";
    } else if (userAgent.match(/edg/i)) {
      browserName = "edge";
    } else {
      browserName = "No browser detection";
    }

    if (browserName === 'firefox' || browserName === 'safari') {
      return isValueExist(this.manageService.convertDate(`${mm}-${dd}-${yy}`, 'saveDatePicker', regex));
    } else {
      return isValueExist(this.manageService.convertDate(`${mm}-${dd}-${yy}T0000`, 'saveDatePicker', regex));
    }
  } else {
    return isValueExist(this.manageService.convertDate(`${$event}T0000`, 'saveDatePicker', regex));
  }
}

onSelectionChanged(event: any) {
  this.checkedData = event;
}

errorPopup(data: any, popupCloseToRefresh = true) {
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
  dialogRef.afterClosed().subscribe((result) => {
    if (popupCloseToRefresh) {
      this.dialogRef.close(this.replacedContractId);
    }
  });
}

}
