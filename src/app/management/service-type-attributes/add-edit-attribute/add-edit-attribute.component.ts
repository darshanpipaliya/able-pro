  import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ErrorWarningPopupComponent } from 'src/app/common/error-warning-popup/error-warning-popup.component';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { LocationService } from 'src/app/services/location.service';

@Component({
  selector: 'app-add-edit-attribute',
  templateUrl: './add-edit-attribute.component.html',
  styleUrls: ['./add-edit-attribute.component.scss'],
  standalone: true,
  imports: [SharedModule, PrimgModule]
})
export class AddEditAttributeComponent implements OnInit {
  attributeForm: FormGroup;
  isSubmit: boolean = false;
  saveButtonLoadder = false;
  constructor(
    private locationService: LocationService,
    private dialogRef: MatDialogRef<AddEditAttributeComponent>,
    public dialog: MatDialog,
    private fb: FormBuilder) {
    dialogRef.disableClose = true;
    this.attributeForm = fb.group({
      name: new FormControl('', [Validators.required]),
      keepForProduction:new FormControl(false)
    });
  }

  ngOnInit(): void {

  }

  saveAttribute() {
    this.isSubmit = true;

    if (this.attributeForm.valid) {
      this.saveButtonLoadder = true;
      this.locationService.addAttributes(this.attributeForm.value).subscribe({
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
          const dialogRef1 = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning',data: errorData });
          dialogRef1.afterClosed().subscribe(result => {
            this.dialogRef.close(true);
          });
        },
        error: error => {
          this.saveButtonLoadder = false;
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
            const dialogRef = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning',data: errorData });
          }
        }
      });
    }
  }
}
