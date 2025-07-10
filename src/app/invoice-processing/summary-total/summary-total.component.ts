import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ValidateTooltipDialogComponent } from './validate-tooltip-dialog/validate-tooltip-dialog.component';
import _ from 'lodash';
import { SandBoxService } from 'src/app/services/sandbox.service';
import { VariableManageService } from 'src/app/services/variable-manage.service';
import { checkIsValueExists, isValueExist } from 'src/app/services/helper';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { SharedModule } from 'src/app/demo/shared/shared.module';

@Component({
  selector: 'app-summary-total',
  templateUrl: './summary-total.component.html',
  styleUrls: ['./summary-total.component.scss'],
  imports: [SharedModule, PrimgModule],
})
export class SummaryTotalComponent implements OnInit {

  editEnabled = false;
  loadStepOneData = false;
  stepOneData: any;
  summaryTotalForm: any;
  saveButtonLoader = false;
  checkMark = false;
  @Input() overviewData: any;
  @Input() sandBoxGridData: any;
  @Input() sandBoxGridRowData: any;
  @Output() overviewDataOP: EventEmitter<any> = new EventEmitter<any>();
  @Output() clickOnSaved: EventEmitter<any> = new EventEmitter<any>();
  @Output() step1Done: EventEmitter<any> = new EventEmitter<any>();
  @Output() callOverview: EventEmitter<any> = new EventEmitter<any>();
  
  @Input() recordPublishedOrCompleted: any;
  @ViewChild('ccText') ccText!: TemplateRef<any>;
  greenCheckShow = false;
  isDisablePayPastDue: boolean = false;
  ispastdueamountadded: any;
  iscreditBalanceSBChargeDetailadded: any;

  amtToPayMinus = false;
  constructor(
    public sandBoxService: SandBoxService,
    private _formBuilder: FormBuilder,
    public dialog: MatDialog,
    public variableManageService: VariableManageService
  ) { }

  formSet() {
    this.summaryTotalForm = this._formBuilder.group({
      PayPastDue: new FormControl(false),
      PreviousBillBalance: new FormControl(null),
      PaymentAmount: new FormControl(''),
      TotalAdjustment: new FormControl(''),
      PastDueAmount: new FormControl(''),
      TotalCurrentCharges: new FormControl(''),
      TotalDueAmount: new FormControl(''),
      AmountToPay: new FormControl(''),
    });
  }
  ngOnInit(): void {
    this.formSet();
    this.getValidationtotalsummary();
  }

  getValidationtotalsummary() {
    if (!checkIsValueExists(this.sandBoxGridRowData.SBInvoiceId)) {
      return;
    }
    this.stepOneData = '';
    this.loadStepOneData = true;

    this.sandBoxService.getValidationtotalsummary(this.sandBoxGridRowData.SBInvoiceId).subscribe((data: any) => {
      if (data.Success) {
        this.stepOneData = data.Data;
        this.ispastdueamountadded = data.Other.ispastdueamountadded;
        this.iscreditBalanceSBChargeDetailadded = data.Other.iscreditBalanceSBChargeDetailadded;

        this.setValues(this.stepOneData);
        if(this.iscreditBalanceSBChargeDetailadded || this.ispastdueamountadded) {
          this.callOverview.emit(true);
        }
        this.loadStepOneData = false;
      } else {
        this.loadStepOneData = false;
      }
    });


  }

  setValues(data: any) {
    // data.PastDueAmount = isValueExist(data?.PastDueAmount) ? data?.PastDueAmount?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : '0.00';
    // data.PreviousBillBalance = isValueExist(data?.PreviousBillBalance) ? data?.PreviousBillBalance?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : '0.00';
    // data.PaymentAmount = isValueExist(data?.PaymentAmount) ? data?.PaymentAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : '0.00';
    // data.TotalAdjustment = isValueExist(data?.TotalAdjustment) ? data?.TotalAdjustment.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : '0.00';
    // data.PastDueAmount = isValueExist(data?.PastDueAmount) ? data?.PastDueAmount?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : '0.00';
    // data.PreviousBillBalance = isValueExist(data?.PreviousBillBalance) ? data?.PreviousBillBalance?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : '0.00';
    // data.PaymentAmount = isValueExist(data?.PaymentAmount) ? data?.PaymentAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : '0.00';
    // data.TotalAdjustment = isValueExist(data?.TotalAdjustment) ? data?.TotalAdjustment.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : '0.00';
    // data.TotalCurrentCharges = isValueExist(data.TotalCurrentCharges) ? data.TotalCurrentCharges.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : '0.00';
    // data.TotalDueAmount = isValueExist(data.TotalDueAmount) ? data.TotalDueAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : '0.00';
    // data.AmountToPay = isValueExist(data.AmountToPay) ? data.AmountToPay.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : '0.00';

    // data.AmountToPay = checkIsValueExistswithZero(data.AmountToPay) ? this.hasSingleDigitAfterDecimal(data.AmountToPay) ? Number(data.AmountToPay).toFixed(2).toString() : data.AmountToPay : '0.00';
 
    // data.PastDueAmount = checkIsValueExistswithZero(data.PastDueAmount) ? this.hasSingleDigitAfterDecimal(data.PastDueAmount) ? Number(data.PastDueAmount).toFixed(2).toString() : data.PastDueAmount : '0.00';
    // data.PaymentAmount = checkIsValueExistswithZero(data.PaymentAmount) ? this.hasSingleDigitAfterDecimal(data.PaymentAmount) ? Number(data.PaymentAmount).toFixed(2).toString() : data.PaymentAmount : '0.00';
    // data.PreviousBillBalance = checkIsValueExistswithZero(data.PreviousBillBalance) ? this.hasSingleDigitAfterDecimal(data.PreviousBillBalance) ? Number(data.PreviousBillBalance).toFixed(2).toString() : data.PreviousBillBalance : '0.00';
    // data.TotalAdjustment = checkIsValueExistswithZero(data.TotalAdjustment) ? this.hasSingleDigitAfterDecimal(data.TotalAdjustment) ? Number(data.TotalAdjustment).toFixed(2).toString() : data.TotalAdjustment : '0.00';
    // data.TotalCurrentCharges = checkIsValueExistswithZero(data.TotalCurrentCharges) ? this.hasSingleDigitAfterDecimal(data.TotalCurrentCharges) ? Number(data.TotalCurrentCharges).toFixed(2).toString() : data.TotalCurrentCharges : '0.00';
    // data.TotalDueAmount = checkIsValueExistswithZero(data.TotalDueAmount) ? this.hasSingleDigitAfterDecimal(data.TotalDueAmount) ? Number(data.TotalDueAmount).toFixed(2).toString() : data.TotalDueAmount : '0.00';
   
    data.AmountToPay = isValueExist(data.AmountToPay) ? data.AmountToPay : 0;
 
    data.PastDueAmount = isValueExist(data.PastDueAmount) ? data.PastDueAmount : 0;
    data.PaymentAmount = isValueExist(data.PaymentAmount) ? data.PaymentAmount : 0;
    data.PreviousBillBalance = isValueExist(data.PreviousBillBalance) ? data.PreviousBillBalance : 0;
    data.TotalAdjustment = isValueExist(data.TotalAdjustment) ? data.TotalAdjustment : 0;
    data.TotalCurrentCharges = isValueExist(data.TotalCurrentCharges) ? data.TotalCurrentCharges : 0;
    data.TotalDueAmount = isValueExist(data.TotalDueAmount) ? data.TotalDueAmount : 0;

    this.setValueInFormControl('PayPastDue', data.PayPastDue);
    this.setValueInFormControl('PreviousBillBalance', data.PreviousBillBalance ? data.PreviousBillBalance : '0.00');
    this.setValueInFormControl('PaymentAmount', data.PaymentAmount ? data.PaymentAmount : '0.00');
    this.setValueInFormControl('TotalAdjustment', data.TotalAdjustment ? data.TotalAdjustment : '0.00');
    this.setValueInFormControl('TotalCurrentCharges', data.TotalCurrentCharges ? data.TotalCurrentCharges : '0.00');
    this.setValueInFormControl('TotalDueAmount', data.TotalDueAmount ? data.TotalDueAmount : '0.00');

    this.setValueInFormControl('PastDueAmount', data.PastDueAmount);
    this.setValueInFormControl('AmountToPay', data.AmountToPay);

    // this.setValueInFormControl('AmountToPay', data.AmountToPay ? this.isDecimal(data.AmountToPay) ? data.AmountToPay : Number(data.AmountToPay) > 0 ? this.roundToTwoDecimalPlaces(Number(data.AmountToPay)) : '0.00' : '0.00');
    if (data?.PastDueAmount == '0' || data?.PastDueAmount == '0.00' || data?.PastDueAmount == 0 || data?.PastDueAmount != 0) {
      this.isDisablePayPastDue = true;
    } else {
      this.isDisablePayPastDue = false;
    }

  }

  hasSingleDigitAfterDecimal(value: any) {
    const regex = /^\d+\.\d$/; // Matches numbers with exactly one digit after the decimal
    return regex.test(value.toString());
  }

  setValueInFormControl(key: any, value: any) {
    this.f[key].setValue(value);
  }

  get f() {
    return this.summaryTotalForm.controls;
  }


  ValidateTooltip() {
    const dialogRef = this.dialog.open(ValidateTooltipDialogComponent, {
      width: '900px',
      panelClass: 'addVendorProduct',
      data: {
        colseButton: true,
      }
    });
    dialogRef.afterClosed().subscribe((result) => {
    });
  }

  roundToTwoDecimalPlaces = (value: number) => {
    return (value.toFixed(2));
  };

  clickToYesNo(e: any) {
    if(!this.iscreditBalanceSBChargeDetailadded) {
      const removeCommasAndConvert = (value: string) => {
        if (value) {
          value = value.toString();
          return value?.includes(',') ? parseFloat(value.replace(/,/g, '')) : Number(value);
        } else {
          return 0;
        }
      };

      const formatWithCommas = (value: { toString: () => string; }) => {
        if (value) {
          return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        } else {
          return 0;
        }
      };

      this.setValueInFormControl('PayPastDue', e);

      let amountToPay = removeCommasAndConvert(this.f.AmountToPay.value);
      let pastDueAmount = removeCommasAndConvert(this.f.PastDueAmount.value);

      if (e) {
        if (pastDueAmount > 0) {
          if (!this.ispastdueamountadded || this.amtToPayMinus) {
            amountToPay += pastDueAmount;
            amountToPay = amountToPay < 0 ? 0 : amountToPay;
            this.setValueInFormControl('AmountToPay', amountToPay.toFixed(2));
            this.amtToPayMinus = false;
          }
        }
      } else {
        if (this.ispastdueamountadded) {
          if (pastDueAmount > 0) {
            amountToPay -= pastDueAmount;
            amountToPay = amountToPay < 0 ? 0 : amountToPay;

            this.setValueInFormControl('AmountToPay', amountToPay.toFixed(2));
            this.amtToPayMinus = true;
          }
        } else {
          let initialAmount = checkIsValueExists(this.stepOneData.AmountToPay) ? this.stepOneData.AmountToPay : '0.00';
          initialAmount = removeCommasAndConvert(initialAmount);
          initialAmount = initialAmount < 0 ? 0 : initialAmount;

          this.setValueInFormControl('AmountToPay', initialAmount.toFixed(2));
          this.amtToPayMinus = false;
        }
      }
    }
  }

  saveSummaryTotal() {
    if (this.summaryTotalForm.valid) {
      this.save();
    }
  }

  openPopup() {
    this.dialog.open(this.ccText, {
      width: '900px',
      data: {
        colseButton: true,
      }
    });
  }

  isDecimal(num: number) {
    if (num == 0) {
      return false;
    } else {
      return num.toString().includes('.');
    }
  }

  save() {

    // Function to remove commas and return value or null if empty
    // const removeCommas = (value) => value.includes(',') ? value.replace(/,/g, '') : value;
    // const processValue = (value) => value ? removeCommas(value) : null;

    // Extract and process values
    // const amtToPay = processValue(this.f.AmountToPay.value);
    // const PreviousBillBalance = processValue(this.f.PreviousBillBalance.value);
    // const PaymentAmount = processValue(this.f.PaymentAmount.value);
    // const TotalAdjustment = processValue(this.f.TotalAdjustment.value);
    // const PastDueAmount = processValue(this.f.PastDueAmount.value);
    // const TotalCurrentCharges = processValue(this.f.TotalCurrentCharges.value);
    // const TotalDueAmount = processValue(this.f.TotalDueAmount.value);

    // Construct the data object
    const data = {
      'PayPastDue': this.f.PayPastDue.value,
      'PreviousBillBalance': this.f.PreviousBillBalance.value,
      'PaymentAmount': this.f.PaymentAmount.value,
      'TotalAdjustment': this.f.TotalAdjustment.value,
      'PastDueAmount': this.f.PastDueAmount.value,
      'TotalCurrentCharges': this.f.TotalCurrentCharges.value,
      'TotalDueAmount': this.f.TotalDueAmount.value,
      'AmountToPay': this.f.AmountToPay.value
    };

    this.saveButtonLoader = true;
    this.sandBoxService.validationtotalsummary(this.sandBoxGridRowData.SBInvoiceId, data).subscribe((data: any) => {
      this.saveButtonLoader = false;
      if(data?.Other?.NeedToCheckNextStep) {
        this.sandBoxService.getInvoiceStep(this.sandBoxGridRowData.SBInvoiceId).subscribe(()=> {
        })
      }
      if (data && data.Success) {
        this.greenCheckShow = true;
        // let errorData: any = {
        //   messgeType: 'error',
        //   title: 'Attention',
        //   titleClass: 'text-c-blue',
        //   icon: 'fas fa-exclamation-circle',
        //   iconClass: 'text-c-blue f-70',
        //   message: data.Message
        // };
        // const dialogRef = this.dialog.open(ErrorWarningPopupComponent, {
        //   panelClass: 'error-warning',
        //   data: errorData,
        // });

        this.editEnabled = false;
        // Refresh the validation summary data to get updated flags
        this.getValidationtotalsummary();
        this.sandBoxService.getInvoiceOverview(this.sandBoxGridRowData.SBInvoiceId).subscribe((dataa: any) => {
          if (dataa?.Data) {
            dataa.Data.InvoiceProcessingStepsData.VBAAssignment = false;
            this.step1Done.emit(true);
            this.overviewDataOP.emit(dataa.Data);
            this.clickOnSaved.emit(true);
          }

          
        });
      }
    }, error => {

    });

  }

}