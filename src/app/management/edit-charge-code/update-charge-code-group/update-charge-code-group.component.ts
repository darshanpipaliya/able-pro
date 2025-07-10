import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import {DOCUMENT} from '@angular/common';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';

@Component({
  selector: 'app-update-charge-code-group',
  templateUrl: './update-charge-code-group.component.html',
  styleUrls: ['./update-charge-code-group.component.scss'],
  standalone: true,
  imports: [SharedModule, PrimgModule]
})
export class UpdateChargeCodeGroupComponent implements OnInit {

  data: any;
  constructor(public dialog: MatDialog, @Inject(MAT_DIALOG_DATA) data: any,
    public dialogRef: MatDialogRef<UpdateChargeCodeGroupComponent>,
    private _route: ActivatedRoute,
    @Inject(DOCUMENT) private document: Document,
    private _router: Router) {
    this.data = data.vendorTypeName;
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
      this.dialogRef.close(true);
    }
  }

}
