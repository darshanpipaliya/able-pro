import { Component,  Inject,  OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TerminateYesDialogComponent } from '../terminate-yes-dialog/terminate-yes-dialog.component';
import { LocationService } from 'src/app/services/location.service';

@Component({
  selector: 'app-terminate-ret-dialog',
  templateUrl: './terminate-ret-dialog.component.html',
  styleUrls: ['./terminate-ret-dialog.component.scss']
})
export class TerminateRetDialogComponent implements OnInit {

  retrievalData: any;
  constructor(public dialog: MatDialog,
    public dialogRef: MatDialogRef<TerminateRetDialogComponent>,
    private locationService: LocationService,
    @Inject(MAT_DIALOG_DATA) data: any) {
      this.retrievalData = data.rowData;
      dialogRef.disableClose = true;
  }
  closeDialog() {
    this.dialogRef.close();
  }
  ngOnInit(): void {
  }
  terminateYes() {
    const dialogRef = this.dialog.open(TerminateYesDialogComponent, {
      width: '900px',
      panelClass: 'addVendorProduct',
      data: {
        colseButton: true,
        retrievalData: this.retrievalData
      },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.dialogRef.close(result);
      }
    });
  }
}
