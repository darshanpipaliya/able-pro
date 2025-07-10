import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { SharedModule } from 'src/app/demo/shared/shared.module';

@Component({
  selector: 'app-charge-code-assignment-dialog',
  templateUrl: './charge-code-assignment-dialog.component.html',
  styleUrls: ['./charge-code-assignment-dialog.component.scss'],
  imports: [SharedModule, PrimgModule]
})
export class ChargeCodeAssignmentDialogComponent implements OnInit {
  dataa: any;
  constructor(public dialogRef: MatDialogRef<ChargeCodeAssignmentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: any
  ) { 

    this.dataa = data;
  }

  ngOnInit(): void {
  }

  saveassignment(){
    this.dialogRef.close(true);
  }
}
