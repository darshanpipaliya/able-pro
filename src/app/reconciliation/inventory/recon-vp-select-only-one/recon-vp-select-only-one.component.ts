import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import _ from 'lodash';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { SharedModule } from 'src/app/demo/shared/shared.module';

@Component({
  selector: 'app-recon-vp-select-only-one',
  templateUrl: './recon-vp-select-only-one.component.html',
  styleUrls: ['./recon-vp-select-only-one.component.scss'],
  imports: [SharedModule, PrimgModule ]
})
export class ReconVpSelectOnlyOneComponent implements OnInit {

  messageData: any;
  close = 'undefined';
  isSuccess: boolean = false;
  selectedRow:any
  selectedVP:any
  constructor(
    public matDialogRef: MatDialogRef<ReconVpSelectOnlyOneComponent>,
    @Inject(MAT_DIALOG_DATA) data: any
  ) {
    
    matDialogRef.disableClose = true;
    this.messageData = data.errorData;
    this.selectedRow = _.uniqBy( data.selectedRow, 'VendorProductId');
    this.isSuccess = this.messageData.message?.includes('Successfully saved');

  }

  ngOnInit(): void {
  }

  redirectTo(redirect: any) {
    this.matDialogRef.close(redirect);
  }
}
