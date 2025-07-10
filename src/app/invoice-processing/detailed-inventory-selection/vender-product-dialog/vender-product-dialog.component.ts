import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { SharedModule } from 'src/app/demo/shared/shared.module';

@Component({
  selector: 'app-vender-product-dialog',
  templateUrl: './vender-product-dialog.component.html',
  styleUrls: ['./vender-product-dialog.component.scss'],
  imports: [SharedModule, PrimgModule]
})
export class VenderProductDialogComponent implements OnInit {
  dialog: any;
  chargeCodeData: any;

  constructor(@Inject(MAT_DIALOG_DATA) data: any) {
    this.chargeCodeData = data.rowData;
  }

  ngOnInit(): void {
    
  }

  

}
