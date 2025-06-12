import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatDialogRef } from '@angular/material/dialog';
import { LastMonthDataYesComponent } from '../last-month-data-yes/last-month-data-yes.component';
@Component({
  selector: 'app-last-month-data-dialog',
  templateUrl: './last-month-data-dialog.component.html',
  styleUrls: ['./last-month-data-dialog.component.scss']
})
export class LastMonthDataDialogComponent implements OnInit {
  varclose = false;

  data: any;
  constructor(public dialog: MatDialog, @Inject(MAT_DIALOG_DATA) data: any,public dialogRef: MatDialogRef<LastMonthDataDialogComponent>) {
    this.data = data;
    dialogRef.disableClose = true;
   }

  ngOnInit(): void {
  }
  

  close(){
    this.dialog.closeAll();
  }

  closeDialog() {
    this.dialogRef.close();
  }
  LastMonthYes() {
    const dialogRef = this.dialog.open(LastMonthDataYesComponent, {
      width: '900px',
      panelClass: 'addVendorProduct',
      data: {
        closeButton: true,
        data : this.data.expectedInvoiceID,
        PreviousInvoiceId : this.data.PreviousInvoiceId,
        isExistInvoice: this.data.isExistInvoice,
        parentDialogRef: this.dialogRef
      },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result) => {
      this.close();
    });
  }

}
