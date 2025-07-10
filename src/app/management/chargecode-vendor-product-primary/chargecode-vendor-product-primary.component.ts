import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ErrorWarningPopupComponent } from 'src/app/common/error-warning-popup/error-warning-popup.component';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { LocationService } from 'src/app/services/location.service';

@Component({
  selector: 'app-chargecode-vendor-product-primary',
  templateUrl: './chargecode-vendor-product-primary.component.html',
  styleUrls: ['./chargecode-vendor-product-primary.component.scss'],
  standalone: true,
  imports: [SharedModule, PrimgModule]
})
export class ChargecodeVendorProductPrimaryComponent implements OnInit {

  source: any = [];
  key: any = [];
  display: any = [];
  confirmed = [];

  selectedCCV: any = [];
  radioCCV: any;

  saveButtonLoader = false;
  constructor(private locationService: LocationService,
    @Inject(MAT_DIALOG_DATA) public confirmData: any,
    public dialog: MatDialog,
    private dialogRef: MatDialogRef<ChargecodeVendorProductPrimaryComponent>
  ) {

  }

  ngOnInit(): void {
    this.confirmData.data.forEach((element: any) => {
      element.chargeCodeFormate = element.ChargeCodeName + ' / ' + element.ChargeCodeType.Name + ' / ' + element.Description;
      if (element.PrimaryChargeCode) {
        this.radioCCV = element.Id.toString();
      }
      if (element.RequiredChargeCode) {
        this.selectedCCV.push(element);
      }
    });
    this.source = JSON.parse(JSON.stringify(this.confirmData.data));
    this.key = 'Id';
    this.display = 'chargeCodeFormate';
  }

  updateData() {
    let chageCodeIds: any[] = [];
    this.source.forEach((element: any) => {
      chageCodeIds.push(
        {
          chargeCodeId: element.Id,
          required: this.selectedCCV.filter((c: any) => c.Id == element.Id).length ? true : false,
          primaryChargeCode: element.Id == this.radioCCV ? true : false
        }
      );
    });

    if (chageCodeIds.filter((c: any) => c.primaryChargeCode).length != 1) {
      let errorData: any = {
        messgeType: "error",
        title: "Attention",
        titleClass: "text-c-blue",
        icon: "fas fa-exclamation-triangle",
        iconClass: "text-c-blue f-70",
        message: 'Please Select any one charge code as primary charge code' //if messges is multiple use array
      }
      const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning',data: errorData });
      dialogRef.afterClosed().subscribe(result => {
      });
      return;
    }

    if (chageCodeIds.filter((c: any) => c.required).length === 0) {
      let errorData: any = {
        messgeType: "error",
        title: "Attention",
        titleClass: "text-c-blue",
        icon: "fas fa-exclamation-triangle",
        iconClass: "text-c-blue f-70",
        message: 'Please Select at least one charge code as required charge code' //if messges is multiple use array
      }
      const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning',data: errorData });
      dialogRef.afterClosed().subscribe(result => {
      });
      return;
    }
    let data: any = {
      groupId: null,
      groupName: null,
      groupDescription: null,
      groupManagerId: null,
      parentGroupId: null,

      chargeCodes: chageCodeIds,
      vendorProductTypeId: this.confirmData.vendoProductId
    }

    this.saveButtonLoader = true;
    this.locationService.addChargeCodeGroups(data).subscribe({
      next: data => {
        this.saveButtonLoader = false;
        let errorData: any = {
          messgeType: "error",
          title: "Attention",
          titleClass: "text-c-blue",
          icon: "fas fa-exclamation-triangle",
          iconClass: "text-c-blue f-70",
          message: 'Successfully saved' //if messges is multiple use array
        }
        const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning',data: errorData });
        dialogRef.afterClosed().subscribe(result => {
          this.dialogRef.close(true);
        });
      },
      error: error => {
        this.saveButtonLoader = false;
        let errorMessage: any = '';
        if (error.status === 400) {
          errorMessage = error.error ? error.error : 'Bad request';
          let errorData: any = {
            messgeType: "error",
            title: "Attention",
            titleClass: "text-c-blue",
            icon: "fas fa-exclamation-triangle",
            iconClass: "text-c-blue f-70",
            message: errorMessage //if messges is multiple use array
          }
          const dialogRef = this.dialog.open(ErrorWarningPopupComponent, {panelClass: 'error-warning', data: errorData });
          dialogRef.afterClosed().subscribe(result => {
            this.dialogRef.close(false);
          });
        }
      }
    });

  }

}
