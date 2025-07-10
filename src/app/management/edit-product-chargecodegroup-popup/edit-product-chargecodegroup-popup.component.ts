import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AngularDualListBoxModule, DualListComponent } from 'angular-dual-listbox';
import { ErrorWarningPopupComponent } from 'src/app/common/error-warning-popup/error-warning-popup.component';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { LocationService } from 'src/app/services/location.service';

@Component({
  selector: 'app-edit-product-chargecodegroup-popup',
  templateUrl: './edit-product-chargecodegroup-popup.component.html',
  styleUrls: ['./edit-product-chargecodegroup-popup.component.scss'],
  standalone: true,
  imports: [SharedModule, PrimgModule, AngularDualListBoxModule]
})
export class EditProductChargecodegroupPopupComponent implements OnInit {

  format: any = DualListComponent.DEFAULT_FORMAT;
  keepSorted = true;
  key: string;
  display: any;
  filter = true;
  source: any = [];
  confirmed: any = [];
  disabled = false;
  chargeCodes: any;

  constructor(private locationService: LocationService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialog: MatDialog,
    private dialogRef: MatDialogRef<EditProductChargecodegroupPopupComponent>
  ) {

  }

  ngOnInit(): void {

    let conformCCList = this.data.data.ChargeCodeGroupChargeCodes.$values;
    conformCCList.forEach((element: any) => {
      element.chargeCodeFormate = element.ChargeCode + ' / ' + element.ChargeCodeType + ' / ' + element.Description;
      element.Id = element.ChargeCodeID;
    });

    this.confirmed = conformCCList;

    this.locationService.getChargecodes().subscribe((data: any) => {
      if (data.$values) {
        this.chargeCodes = data.$values;
        this.chargeCodes.forEach((element: any) => {
          element.chargeCodeFormate = element.ChargeCodeName + ' / ' + element.ChargeCodeType.Name + ' / ' + element.Description;
        });
        this.source = JSON.parse(JSON.stringify(this.chargeCodes));
        this.key = 'Id';
        this.display = 'chargeCodeFormate';
      }
    });
  }

  updateChargeCodeGroup() {
    let chageCodeIds: any[] = [];
    this.confirmed.forEach((element: any) => {
      chageCodeIds.push(element.Id);
    });
    let data: any = {
      chargeCodeIds: chageCodeIds
    }
    this.locationService.updateChargeCodeGroups(data, this.data.data.ChargeCodeGroupId).subscribe({
      next: data => {
        let errorData: any = {
          messgeType: "error",
          title: "Attention",
          titleClass: "text-c-blue",
          icon: "fas fa-exclamation-triangle",
          iconClass: "text-c-blue f-70",
          message: 'Successfully saved' //if messges is multiple use array
        }
        const dialogRef1 = this.dialog.open(ErrorWarningPopupComponent, {panelClass: 'error-warning', data: errorData });
        dialogRef1.afterClosed().subscribe(result => {
          this.dialogRef.close();
        });
      },
      error: error => {
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
        }
      }

    });
  }
}
