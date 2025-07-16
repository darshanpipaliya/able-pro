import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';    
import * as _ from 'lodash';
import { MatDialog } from '@angular/material/dialog';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { SandBoxService } from 'src/app/services/sandbox.service';
import { isValuesUndefined, rolePermission } from 'src/app/services/helper';
import { ErrorWarningPopupComponent } from 'src/app/common/error-warning-popup/error-warning-popup.component';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';

@Component({
  selector: 'app-final-review',
  templateUrl: './final-review.component.html',
  styleUrls: ['./final-review.component.scss'],
  imports: [SharedModule, PrimgModule],
  providers: [SandBoxService]
})
export class FinalReviewComponent implements OnInit {
  statusList: any;
  isAllowSuperTem = false;
  Math = Math;
  
  @Input() sandBoxGridRowData: any;
  @Input() recordPublishedOrCompleted: any;
  @Input() overviewData: any;

  finalReviewData: any;
  constructor(public sandboxService: SandBoxService , public dialog: MatDialog) { }
  @Output() onClickHyperlink: EventEmitter<any> = new EventEmitter<any>();
  @Output() clickOnSaved: EventEmitter<any> = new EventEmitter<any>();
  @Output() moveToGridPage: EventEmitter<any> = new EventEmitter<any>();
  private _unsubscribeUnpublish: Subject<any> = new Subject<any>();
  isShowspinner = false;
  isPreviousInvoice = true;

  ngOnInit(): void {
    this.isAllowSuperTem = rolePermission(['SuperTEMAdmin']);

    this.finalReview();
    this.getStatus();
  }

  finalReview() {
    this.sandboxService.finalReview(this.sandBoxGridRowData.SBInvoiceId).subscribe((data: any) => {
      this.finalReviewData = data.Data;
      this.finalReviewData.NoOfDaysSecondsInSandboxBeforePending = this.finalReviewData.NoOfDaysSecondsInSandboxBeforePending !== 0 ? this.covertDate(this.finalReviewData.NoOfDaysSecondsInSandboxBeforePending) : '0d 0h 0m';
      this.finalReviewData.NoOfDaysSecondsInSandbox = this.covertDate(this.finalReviewData.NoOfDaysSecondsInSandbox);
      this.finalReviewData.DataIssueSecondsInSandbox = this.covertDate(this.finalReviewData.DataIssueSecondsInSandbox);
      this.finalReviewData['AmountToPay'] = data.Data.AmountToPay ? parseFloat(data.Data.AmountToPay).toFixed(2) : '0.00';
      this.finalReviewData.ChargeCorrectionsTotal = data.Data.ChargeCorrectionsTotal ? parseFloat(data.Data.ChargeCorrectionsTotal).toFixed(2) : '0.00';
      this.finalReviewData['DistributedCharges'] = this.finalReviewData['DistributedCharges'] ? parseFloat(this.finalReviewData['DistributedCharges']).toFixed(2) : '0.00';

      this.finalReviewData['AmountToPay'] = data.Data?.AmountToPay.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      this.finalReviewData['ChargeCorrectionsTotal'] = data.Data?.ChargeCorrectionsTotal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      this.finalReviewData['DistributedCharges'] = this.finalReviewData?.DistributedCharges.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

      this.isPreviousInvoice = data.Other?.IsPreviousSbInvoiceFound;
    }, error => {

    });
  }
 
  redirectTo(toWhich: any) {
    this.onClickHyperlink.emit(toWhich);
  }

  getStatus() {
    this.sandboxService.statusList().subscribe((res: any) => {
      this.statusList = res.Data.$values;
    })
  }


  publish() {
    // let passid = _.find(this.statusList, (x: any) => x.DisplayText == 'Published').Id

    // this.sandboxService.sandboxStatus(this.sandBoxGridRowData.SBInvoiceId, passid).subscribe((res: any) => {
      this.sandboxService.sandboxPublish(this.sandBoxGridRowData.SBInvoiceId).subscribe((res: any) => {
        if (res.Success) {
          let errorData: any = {
            messgeType: "error",
            title: "Attention",
            titleClass: "text-c-blue",
            icon: "fas fa-exclamation-circle",
            iconClass: "text-c-blue f-70",
            message: 'The invoice is in the que to publish.  The invoice status will change to Published when publishing is complete.',
            okBtnName: 'Close'
          }
          const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
          dialogRef.afterClosed().subscribe(result => {
            // this.clickOnSaved.emit(0);
            this.moveToGridPage.emit(true);
        });
      }
    })

  }
  unPublish() {
    
    let errorData: any = {
      messgeType: "error",
      title: "Attention",
      titleClass: "text-c-blue",
      icon: "fas fa-bomb",
      iconClass: "text-c-blue f-70",
      message: 'You have selected the nuclear option and this is a big deal dude!  Are you really sure you want to do this?   ',
      okBtnName: 'Let me think about it!',
      closeBtnName: 'DO IT! Remove this invoice from the customer data!',
    }
    const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
    dialogRef.afterClosed().subscribe(result => {
      if (!isValuesUndefined(result)) {
        if (!result) {
          this.isShowspinner = true;
          this.sandboxService.sandboxUnPublish(this.sandBoxGridRowData.SBInvoiceId).subscribe((res: any) => {
            this.isShowspinner = false;
            if (res.Success) {
              this._unsubscribeUnpublish.next(true);
              this.sandboxService.unpublishCleanUp(this.sandBoxGridRowData.SBInvoiceId).pipe(takeUntil(this._unsubscribeUnpublish)).subscribe((res: any) => {
              })

              let errorData: any = {
                messgeType: "error",
                title: "Attention",
                titleClass: "text-c-blue",
                icon: "fas fa-exclamation-circle",
                iconClass: "text-c-blue f-70",
                message: res.Message,
                okBtnName: 'Close'
              }
              const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
              dialogRef.afterClosed().subscribe(result => {
                if(result) {
                   this.moveToGridPage.emit(true);
                }
              });
            }
          })
 
        } else {
        }
      }
    });
  }
  covertDate(second: any) {
 
    if (second) {
      var seconds = parseInt(second, 10);
 
      var days = Math.floor(seconds / (3600 * 24));
      seconds -= days * 3600 * 24;
      var hrs = Math.floor(seconds / 3600);
      seconds -= hrs * 3600;
      var mnts = Math.floor(seconds / 60);
      seconds -= mnts * 60;
      return days + "d " + hrs + "h " + mnts + "m"
    } else {
      return '';
    }
   
  }

  ngOnDestroy() {
    this._unsubscribeUnpublish.next(true);
    this._unsubscribeUnpublish.complete();
  }
}
