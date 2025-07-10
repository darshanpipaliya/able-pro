import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import * as _ from 'lodash';
import { LocationService } from 'src/app/services/location.service';
import { ManageService } from 'src/app/services/manage.service';
import { VariableManageService } from 'src/app/services/variable-manage.service';
import { isValuesUndefined, rolePermission } from 'src/app/services/helper';
import { ErrorWarningPopupComponent } from 'src/app/common/error-warning-popup/error-warning-popup.component';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
@Component({
  selector: 'app-add-forecasting-record-dialog',
  templateUrl: './add-forecasting-record-dialog.component.html',
  styleUrls: ['./add-forecasting-record-dialog.component.scss'],
  imports: [SharedModule, PrimgModule]
})
export class AddForecastingRecordDialogComponent implements OnInit {
  allCustomerSub: Subscription;
  vendorsSub: Subscription;
  customerList: any = [];
  vendorsList: any = [];
  billingAccount: any;
  addInvoiceRetrivalForm: FormGroup;
  submitted: boolean = false;
  VendorId: any;
  CutomerId: any;
  fetchDateData: any;
  @Input() rowData: any;
  @Input() selectedTemRetrival: any;
  @Input() patchValue: any;
  @Input() pageName: any;
  @Input() tabTypes: any;

  @Output() onUserAddEvent: EventEmitter<any> = new EventEmitter();
  @Output() openEditBillingTab: EventEmitter<any> = new EventEmitter();
  @Output() onComponentDestroy: EventEmitter<any> = new EventEmitter();
  @Output() currentOpenEditPage: EventEmitter<any> = new EventEmitter<any>()
  @Output() fromSandbox: EventEmitter<any> = new EventEmitter<any>();
  loadingVendorsList: boolean = false;

  saveButtonLoadder = false;
  isSuperTEMAdmin: boolean = false;
  isSuperTEMManager: boolean = false;
  isSuperTEMUser: boolean = false;
  hasSsuperTemUsers: boolean = false;

  tems: any = [];
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  private _unsubscribeAllTEMList: Subject<any> = new Subject<any>();
  private _unsubscribeAllBillingAccount: Subject<any> = new Subject<any>();
  private _unsubscribeAllCustomer: Subject<any> = new Subject<any>();
  private _unsubscribeAllVendor: Subject<any> = new Subject<any>();
  private _unsubscribeVendor: Subject<any> = new Subject<any>();

  billDay: any;
  @Output() addNewInvoice: EventEmitter<any> = new EventEmitter();

  constructor(
    public dialog: MatDialog,
    private fb: FormBuilder,
    private locationService: LocationService,
    private datePipe: DatePipe,
    public manageService: ManageService,
    public variableManageService: VariableManageService,
  ) { }

  public customerId: any;
  public startDate: any;
  public endDate: any;
  public payableId: any;

  ngOnInit(): void {

    this.hasSsuperTemUsers = rolePermission(['SuperTEMAdmin', 'SuperTEMManager', 'SuperTEMUser']);
    this.currentOpenEditPage.emit(false);
    this.addInvoiceRetrivalForm = this.fb.group({
      TEM: new FormControl(''),
      customerAccountId: new FormControl('', [Validators.required]),
      vendorAccountId: new FormControl('', [Validators.required]),
      billingAccountId: new FormControl('', [Validators.required]),
      invoiceBillDate: new FormControl('', [Validators.required]),
    });

    this.isSuperTEMAdmin = this.locationService.isUserHasSuperTEMAdminRole();
    this.isSuperTEMManager = this.locationService.isUserHasSuperTEMManagerRole();
    this.isSuperTEMUser = this.locationService.isUserHasSuperTEMUserRole();

    this.getCustomerList();
    this.getVendorList();
    // this.getvendorsSubList();
    let cId = this.rowData.customerAccountId ? this.rowData.customerAccountId : this.rowData.CustomerAccountId ? this.rowData.CustomerAccountId : '';
    if (this.rowData) {
      this.addInvoiceRetrivalForm.patchValue(this.rowData);
      this.CutomerId = cId;
      this.VendorId = this.rowData.vendorAccountId ? this.rowData.vendorAccountId : this.rowData.VendorAccountId ? this.rowData.VendorAccountId : '';

      if (this.CutomerId || this.VendorId) {
        this.getCustomerVendorBillingAccounts(true);
      }
    }

    if (this.patchValue) {

      let date = this.rowData.InvoiceBillDate.split("T")[0];
      let val = date.split('-');
      this.startDate = val[0] + '-' + val[1] + '-01';
      this.endDate = val[0] + '-' + val[1] + this.getLastDateOfMonth(val[0], val[1]);
      // this.addInvoiceRetrivalForm.patchValue({ 'customerAccountId': this.rowData.CustomerAccountId })
      this.addInvoiceRetrivalForm.patchValue({ 'vendorAccountId': this.rowData.VendorAccountId })

      this.addInvoiceRetrivalForm.patchValue({ 'invoiceBillDate': this.rowData.InvoiceBillDate ? this.manageService.convertDate(this.rowData.InvoiceBillDate, '', '/') : '' })
    }
  }
  getLastDateOfMonth(year: any, month: any) {    
    const date = new Date(year, month, 0);  
    return `-${date.getDate()}`;
  }
  ngOnChanges(changes: SimpleChanges) {
    this.selectedTemRetrival = changes['selectedTemRetrival'].currentValue;
    this.getCustomerList();
  }

  

  // getvendorsSubList() {
  //   this._unsubscribeAllVendor.next();
  //   this.vendorsSub = this.locationService.getVendorDropdown().pipe(takeUntil(this._unsubscribeAllVendor)).subscribe((data) => {
  //     if (data && data.Data.$values) {
  //       this.vendorsList = data.Data.$values;
  //     }
  //   });
  // }
  getCustomerList() {
    
    this.customerList = [];
    if (this.selectedTemRetrival && this.selectedTemRetrival === "all") {
      this._unsubscribeAllCustomer.next(null);
      this.allCustomerSub = this.locationService.getCustomerDropDown().pipe(takeUntil(this._unsubscribeAllCustomer)).subscribe((data) => {
        if (data && data.$values) {
          this.customerList = data.$values;
          if (this.patchValue) {
            this.addInvoiceRetrivalForm.patchValue({ 'customerAccountId': this.rowData.CustomerAccountId ? this.rowData.CustomerAccountId : this.customerId })
          }
        }
      });
    } else {
      this.locationService.getCustomerDropdownByNewTEM(this.selectedTemRetrival).subscribe((data) => {
        if (data && data.Data.$values) {
          this.customerList = data.Data.$values;
        }
      });
    }
  }

  getCustomerVendorBillingAccounts(openFromChngeTab: Boolean = false) {
    if (!openFromChngeTab) {
      this.addInvoiceRetrivalForm.controls['billingAccountId'].setValue('');
    }
    let KeyString: any = '';
    KeyString = '?payableAccount=true';
    if (this.CutomerId || this.VendorId) {
      KeyString += "&customerId=" + (this.CutomerId ?? '') + "&VendorId=" + (this.VendorId ?? '');
    }
    this.billDay = '';
    this._unsubscribeAllBillingAccount.next(null);
    this.locationService.getCustomerVendorBillingAccounts(KeyString).pipe(takeUntil(this._unsubscribeAllBillingAccount)).subscribe((data) => {
      if (data && data.Data.$values) {
        this.billingAccount = data.Data.$values;
        this.billingAccount = this.billingAccount.map((r: any) => {
          let a: any = {};
          a = r;
          a['value'] = r.BillingAccount.$values[0].Id;
          return a;
        })
        if (this.patchValue) {
          let record = this.billingAccount.find((x: any) => x.AcctNumberUnformatted == this.rowData.PayableBillingAccountNumberUnformatted);
          this.addInvoiceRetrivalForm.patchValue({ 'billingAccountId': record?.value });
          this.customerId = record.CustomerAccountId;
          this.addInvoiceRetrivalForm.patchValue({ 'customerAccountId': this.rowData.CustomerAccountId ? this.rowData.CustomerAccountId : this.customerId })
          this.payableId = record.value;
        }
      }
      if (openFromChngeTab) {
        this.fetchDates();
      }
    });
  }
  get f() {
    return this.addInvoiceRetrivalForm.controls;
  }
  onCutomerChange(data: any) {
    this.CutomerId = data;
    this.getCustomerVendorBillingAccounts();
  }
  getVendorList(Parent?: any, CustomerAccountId?: any, openFromChngeTab: Boolean = false) {
    if (!openFromChngeTab) {
      this.addInvoiceRetrivalForm.controls['vendorAccountId'].setValue('');
    }
    this.vendorsList = [];
    this.loadingVendorsList = true;
    this._unsubscribeVendor.next(null);
    this.locationService
      .getVendorDropdown(Parent, CustomerAccountId)
      .pipe(takeUntil(this._unsubscribeVendor))
      .subscribe({
        next: (data) => {
          if (data && data.Success) {
            this.vendorsList = data.Data?.$values;
            this.loadingVendorsList = false;
          } else {
            this.vendorsList = [];
            this.loadingVendorsList = false;
          }
        },
        error: (error) => {
          this.vendorsList = [];
          this.loadingVendorsList = false;
        },
      });
  }
  onVendorChange(data: any) {

    this.VendorId = data;
    this.getCustomerVendorBillingAccounts();
  }

  fetchDates() {

    const bID = this.addInvoiceRetrivalForm.value.billingAccountId;
    let billDayF;
    if (bID) {
      billDayF = this.billingAccount.find((n: any) => {
        return n.BillingAccount.$values[0].Id.toString() === bID.toString();
      })
    }

    this.billDay = (billDayF) ? billDayF['BillingAccount'].$values[0].InvoiceBillDay : '';
    if (this.addInvoiceRetrivalForm.value.billingAccountId) {
      var today = new Date();
      var dd = String(today.getDate()).padStart(2, '0');
      var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
      var yyyy = today.getFullYear();

      var td = yyyy + '-' + mm + '-' + dd;
      const data = {
        billingAccountId: this.addInvoiceRetrivalForm.value.billingAccountId,
        invoiceDate: td,
      };
      // this.addInvoiceRetrivalForm.controls['InvoiceMonthYear'].setValue('');
      // this.addInvoiceRetrivalForm.controls['invoiceExpectedDate'].setValue('');
      // this.addInvoiceRetrivalForm.controls['invoiceRetrievalDate'].setValue('');
      // this.allCustomerSub = this.locationService.getInvoiceFetchDate(data).subscribe((datas) => {
      //   if (datas) {
      //     this.fetchDateData = datas;
      //     if (this.fetchDateData) {
      //       this.addInvoiceRetrivalForm.controls['invoiceExpectedDate'].setValue(this.fetchDateData.invoiceExpectedDate ? this.manageService.convertDate(this.fetchDateData.invoiceExpectedDate) : '')
      //       this.addInvoiceRetrivalForm.controls['invoiceRetrievalDate'].setValue(this.fetchDateData.invoiceRetrievalDate ? this.manageService.convertDate(this.fetchDateData.invoiceRetrievalDate) : '')
      //     }
      //   }
      // }, error => {
      //   if (error.status === 404 && error.error.RedirectPage === 'UpdateAccountInvoiceAndDataRetrieval') {
      //     let errorData: any = {
      //       messgeType: "error",
      //       title: "Attention",
      //       titleClass: "text-c-blue",
      //       icon: "fas fa-exclamation-circle",
      //       iconClass: "text-c-blue f-70",
      //       okBtnName: "Go To Invoice & Data Retrieval",
      //       message: error.error.DisplayMessage
      //     }
      //     const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
      //     dialogRef.afterClosed().subscribe(result => {
      //       if (!isValuesUndefined(result)) {
      //         data['PayableAccountNumber'] = billDayF.AccountNumber;
      //         data['BillingAccountID'] = data.billingAccountId;
      //         data['selectedTab'] = 1;
      //         data['filedTouched'] = true;
      //         this.openEditBillingTab.emit(data);
      //       }
      //     });
      //   }
      //   if (error.status === 404 && error.error.RedirectPage === 'UpdateAccount') {
      //     let errorData: any = {
      //       messgeType: "error",
      //       title: "Attention",
      //       titleClass: "text-c-blue",
      //       icon: "fas fa-exclamation-circle",
      //       iconClass: "text-c-blue f-70",
      //       closeBtnName: "Cancel",
      //       message: error.error.DisplayMessage
      //     }
      //     const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
      //     dialogRef.afterClosed().subscribe(result => {
      //       if (result !== 'undefined') {
      //         data['PayableAccountNumber'] = billDayF.AccountNumber;
      //         data['BillingAccountID'] = data.billingAccountId;
      //         data['selectedTab'] = 0;
      //         this.openEditBillingTab.emit(data);
      //       }
      //     });
      //   }

      // });
    }
  }

  dateCheck(from: any, to: any, check: any) {

    var fDate, lDate, cDate;
    fDate = Date.parse(from);
    lDate = Date.parse(to);
    cDate = Date.parse(check);

    if ((cDate <= lDate && cDate >= fDate)) {
      return true;
    }
    return false;
  }

  saveInvoiceForcastData(isAddAnotherClick = false) {
    this.submitted = true;

    if (this.addInvoiceRetrivalForm.valid) {

      if (this.tabTypes == 'Search') {
        if (this.patchValue) {

          let isDateRange = this.dateCheck(this.startDate, this.endDate, this.addInvoiceRetrivalForm.value.invoiceBillDate);

          if (this.rowData.VendorAccountId !== this.addInvoiceRetrivalForm.controls['vendorAccountId'].value ||
            !isDateRange ||
            this.addInvoiceRetrivalForm.controls['billingAccountId'].value !== this.payableId
          ) {
            let errorData: any = {
              messgeType: "error",
              title: "Attention",
              titleClass: "text-c-blue",
              icon: "fas fa-exclamation-circle",
              iconClass: "text-c-blue f-70",
              message: 'Please select value as from the sandbox row.'
            }
            const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
            dialogRef.afterClosed().subscribe(result => {
            });
            return
          }
        }
      } else {
        if (this.tabTypes == 'add') {
          if (this.addInvoiceRetrivalForm.controls['billingAccountId'].value !== this.payableId) {
            let errorData: any = {
              messgeType: "error",
              title: "Attention",
              titleClass: "text-c-blue",
              icon: "fas fa-exclamation-circle",
              iconClass: "text-c-blue f-70",
              message: 'Payable Account should match with selected sandbox value.'
            }
            const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
            dialogRef.afterClosed().subscribe(result => {
            });
            return
          }
        }
      }

      let invoiceBillDate;
      if (this.addInvoiceRetrivalForm.value.invoiceBillDate) {
        if (this.patchValue) {
          let date = new Date(this.addInvoiceRetrivalForm.value.invoiceBillDate);
          var offsetMs = date.getTimezoneOffset() * 60000;
          invoiceBillDate = new Date(date.getTime() - offsetMs);

        } else {
          var offsetMs = this.addInvoiceRetrivalForm.value.invoiceBillDate.getTimezoneOffset() * 60000;
          invoiceBillDate = new Date(this.addInvoiceRetrivalForm.value.invoiceBillDate.getTime() - offsetMs);
        }

      }

      // let invoiceBillDate = new Date(this.addInvoiceRetrivalForm.value.invoiceBillDate).toISOString()
      let passingdata :any = {
        billingAccountId: this.addInvoiceRetrivalForm.value.billingAccountId,
        invoiceBillDate: invoiceBillDate
      }
      if(this.patchValue) {
        passingdata['sbInvoiceId'] = this.rowData.SBInvoiceId
      }
      this.saveButtonLoadder = true;
      this.locationService.addInvoiceRetrieval(passingdata).subscribe(res => {
        this.saveButtonLoadder = false;
        if (res.Success) {
          let errorData: any = {
            messgeType: "error",
            title: "Attention",
            titleClass: "text-c-blue",
            icon: "fas fa-exclamation-circle",
            iconClass: "text-c-blue f-70",
            message: 'Successfully saved'
          }
          const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
          dialogRef.afterClosed().subscribe(result => {
            if(isAddAnotherClick) {
              this.submitted = false
              this.addInvoiceRetrivalForm.reset();
              
            } else {
              this.onUserAddEvent.emit(true);
            }
          });
        } else {
          if(this.patchValue) {
            let errorData: any = {
              messgeType: "error",
              title: "Attention",
              titleClass: "text-c-blue",
              icon: "fas fa-exclamation-circle",
              iconClass: "text-c-blue f-70",
              message: res.Message //if messges is multiple use array
            }
            const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
            dialogRef.afterClosed().subscribe(result => {
            });
          }
          this.saveButtonLoadder = false;

          if (this.patchValue) {
            this.fromSandbox.emit(this.pageName);
            return
          }

          const bID = this.addInvoiceRetrivalForm.value.billingAccountId;
          let billDayF: any;
          if (bID) {
            billDayF = this.billingAccount.find((n: any) => {
              return n.BillingAccount.$values[0].Id.toString() === bID.toString();
            })
          }

          this.billDay = (billDayF) ? billDayF['BillingAccount'].$values[0].InvoiceBillDay : '';
          if (this.addInvoiceRetrivalForm.value.billingAccountId) {
            const data: any = {
              billingAccountId: this.addInvoiceRetrivalForm.value.billingAccountId
            };

            if (res.Success === false && res?.Data?.RedirectPage === 'UpdateAccountInvoiceAndDataRetrieval') {
            
              let errorData: any = {
                messgeType: "error",
                title: "Attention",
                titleClass: "text-c-blue",
                icon: "fas fa-exclamation-circle",
                okBtnName: "Go To Invoice & Data Retrieval",
                iconClass: "text-c-blue f-70",
                message: res.Message
              }
              const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
              dialogRef.afterClosed().subscribe(result => {
                if (!isValuesUndefined(result)) {
                  data['PayableAccountNumber'] = billDayF.AccountNumber;
                  data['BillingAccountID'] = data.billingAccountId;
                  data['selectedTab'] = 1;
                  data['filedTouched'] = true;
                  this.openEditBillingTab.emit(data);
                }
              });
            } else if (res.Success === false && res?.Data?.RedirectPage === 'UpdateAccount') {
              let errorData: any = {
                messgeType: "error",
                title: "Attention",
                titleClass: "text-c-blue",
                icon: "fas fa-exclamation-circle",
                iconClass: "text-c-blue f-70",
                closeBtnName: "Cancel",
                message: res.Message
              }
              const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
              dialogRef.afterClosed().subscribe(result => {
                if (!isValuesUndefined(result)) {
                  data['PayableAccountNumber'] = billDayF.AccountNumber;
                  data['BillingAccountID'] = data.billingAccountId;
                  data['selectedTab'] = 0;
                  this.openEditBillingTab.emit(data);
                }
              });
            } else if(res.Success === false && !res?.Data?.RedirectPage) {
              let errorData: any = {
                messgeType: "error",
                title: "Attention",
                titleClass: "text-c-blue",
                icon: "fas fa-exclamation-circle",
                iconClass: "text-c-blue f-70",
                message: res.Message //if messges is multiple use array
              }
              const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
              dialogRef.afterClosed().subscribe(result => {
              });
            }

          } else {
            let errorData: any = {
              messgeType: "error",
              title: "Attention",
              titleClass: "text-c-blue",
              icon: "fas fa-exclamation-circle",
              iconClass: "text-c-blue f-70",
              message: res.Message //if messges is multiple use array
            }
            const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
            dialogRef.afterClosed().subscribe(result => {
            });
          }
        }
      }, error => {

      });
    }
  }

  checkValidBillDate() {
    // if (!this.addInvoiceRetrivalForm.controls['invoiceBillDate'].value) {
    //   this.addInvoiceRetrivalForm.controls['invoiceBillDate'].setValue('');
    // }
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
    this._unsubscribeAllTEMList.next(null);
    this._unsubscribeAllTEMList.complete();
    this._unsubscribeAllBillingAccount.next(null);
    this._unsubscribeAllBillingAccount.complete();
    this._unsubscribeAllCustomer.next(null);
    this._unsubscribeAllCustomer.complete();
    this._unsubscribeAllVendor.next(null);
    this._unsubscribeAllVendor.complete();
    this.onComponentDestroy.emit(this.addInvoiceRetrivalForm.value);
  }

  setTemDDId() {
    if (this.addInvoiceRetrivalForm.controls['customerAccountId'].value) {
      this.addInvoiceRetrivalForm.controls['TEM'].setValue(
        _.cloneDeep(
          this.customerList.find(
            (data: any) => data.Id == this.addInvoiceRetrivalForm.controls['customerAccountId'].value
          ).TemAccountID
        )
      );
    }
  }

  addForecastingRecordPopup() {
    this.addNewInvoice.emit(true);
  }

}
