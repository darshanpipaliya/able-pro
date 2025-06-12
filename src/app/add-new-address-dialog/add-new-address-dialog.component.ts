import { D } from '@angular/cdk/keycodes';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LocationService } from '../services/location.service';
import { ErrorWarningPopupComponent } from '../common/error-warning-popup/error-warning-popup.component';
import { SharedModule } from '../demo/shared/shared.module';
import { PrimgModule } from '../demo/shared/primeng.module';
import { SpaceTrimStartEndInputirective } from '../custom-directives/custom-validation.directive';

@Component({
  selector: 'app-add-new-address-dialog',
  templateUrl: './add-new-address-dialog.component.html',
  styleUrls: ['./add-new-address-dialog.component.scss'],
  imports: [SharedModule, PrimgModule, SpaceTrimStartEndInputirective]
})
export class AddNewAddressDialogComponent implements OnInit {
  CountriesList: any = [];
  stateList: any = [];
  addAddressForm: any;
  submitted: boolean = false;
  private readonly getCountryDestroy = new Subject<void>();
  private readonly getStateDestroy = new Subject<void>();
  saveButtonLoadder = false;
  constructor(public matDialogRef: MatDialogRef<AddNewAddressDialogComponent>,
  public dialog: MatDialog,
  private fb: FormBuilder, private locationService: LocationService) {

    matDialogRef.disableClose = true;

    this.addAddressForm = fb.group({
      line1: new FormControl('', [Validators.required]),
      line2: new FormControl(''),
      city: new FormControl('', [Validators.required]),
      stateId: new FormControl('', [Validators.required]),
      postalCode: new FormControl('', [Validators.required]),
      countryId: new FormControl('', [Validators.required])
    });

    this.getCountryDestroy.next();
    this.locationService.getCountries().pipe(takeUntil(this.getCountryDestroy)).subscribe((data) => {
      if (data && data.$values) {
        this.CountriesList = data.$values;
        this.CountriesList.filter((country: any) => {
          if (country.Abbreviation == 'US') {
            this.addAddressForm.controls['countryId'].setValue(country.Id);
            if (this.addAddressForm.controls['countryId'] && this.addAddressForm.controls['countryId'].value) {
              this.onCountryChange(this.addAddressForm.controls['countryId'].value);
            }
          }
        });
      }
    });
  }

  ngOnDestroy(): any {
    this.getCountryDestroy.next();
    this.getStateDestroy.next();
  }

  ngOnInit(): void {
  }
  onCountryChange(contryID: any) {
    this.getStateDestroy.next();
    this.locationService.getStateDetails(contryID).pipe(takeUntil(this.getStateDestroy)).subscribe((data) => {
      if (data && data.States.$values) {
        this.stateList = data.States.$values;
      }
    });
  }
  get f() {
    return this.addAddressForm.controls;
  }
  addAddress() {
    this.submitted = true;
    if (this.addAddressForm.valid) {
      this.saveButtonLoadder = true;
      this.addAddressForm.value.active = true
      this.locationService.addRemitaddresses(this.addAddressForm.value).subscribe({
        next: data => {
          this.saveButtonLoadder = false;
          let errorData: any = {
            messgeType: "error",
            title: "Attention",
            titleClass: "text-c-blue",
            icon: "fas fa-exclamation-triangle",
            iconClass: "text-c-blue f-70",
            message: 'Successfully saved' //if messges is multiple use array
          }
          const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning', data: errorData });
          dialogRef.afterClosed().subscribe(result => {
          });
          this.submitted = false;
          this.matDialogRef.close(true);
        },
        error: error => {
          this.saveButtonLoadder = false;
          let errorMessage: any = '';
          if (error.status === 400) {
            errorMessage = error.error && error.statusText === 'OK' ? error.error : 'Bad request';
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
}
