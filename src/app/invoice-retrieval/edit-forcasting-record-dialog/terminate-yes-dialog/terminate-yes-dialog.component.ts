import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-terminate-yes-dialog',
  templateUrl: './terminate-yes-dialog.component.html',
  styleUrls: ['./terminate-yes-dialog.component.scss']
})
export class TerminateYesDialogComponent implements OnInit {

  retrievalData: any;
  constructor(public dialogRef: MatDialogRef<TerminateYesDialogComponent>,@Inject(MAT_DIALOG_DATA) data :any) { 
    
    this.retrievalData = data.retrievalData;
    dialogRef.disableClose = true;
  }

  ngOnInit(): void {
  }
  closeDialog() {
    this.dialogRef.close();
  }
  terminateAndInactive(){
    const data = {
      type: 'terminateAndInactive',
      flag: true
    }
    this.dialogRef.close(data);
  }

  terminateOnly(){
    const data = {
      type: 'terminateOnly',
      flag: true
    }
    this.dialogRef.close(data);
  }
}
