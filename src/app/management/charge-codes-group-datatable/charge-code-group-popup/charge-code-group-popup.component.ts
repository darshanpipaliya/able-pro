import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-charge-code-group-popup',
  templateUrl: './charge-code-group-popup.component.html',
  styleUrls: ['./charge-code-group-popup.component.scss']
})
export class ChargeCodeGroupPopupComponent implements OnInit {

    data: any;
    constructor(public dialog: MatDialog, @Inject(MAT_DIALOG_DATA) data: any,
      public dialogRef: MatDialogRef<ChargeCodeGroupPopupComponent>,
      private _route: ActivatedRoute,
      private _router: Router) {
      this.data = data.IdsList;
      dialogRef.disableClose = true;
      
      if(document?.location?.origin) {
        sessionStorage.setItem('hostname', document?.location?.origin)
      }
    }
    ngOnInit(): void {
    }
  
    close() {
      this.dialog.closeAll();
    }
  
    closeDialog() {
      this.dialogRef.close();
    }
  
    closeAndReview() {
      this.dialogRef.close();
    }
  
    saveCorrection(){
      this.dialogRef.close(true);
    }
    update(obj: any) {
      let hostname = sessionStorage.getItem('hostname');
      if(hostname) {
        const link = hostname + '/management/vendors/charge-codes-group?GroupId=' + obj.GroupId + '&GroupXVendorProductTypeId=' + obj.GroupXVendorProductTypeId + '&VendorProductTypeId=' + obj.VendorProductTypeId; 
        window.open(link, '_blank');
        this.dialogRef.close(false);
      }
    }



}
