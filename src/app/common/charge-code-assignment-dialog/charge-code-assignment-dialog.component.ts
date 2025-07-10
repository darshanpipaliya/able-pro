import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SharedModule } from 'src/app/demo/shared/shared.module';

@Component({
  selector: 'app-charge-code-assignment-dialog',
  templateUrl: './charge-code-assignment-dialog.component.html',
  styleUrls: ['./charge-code-assignment-dialog.component.scss'],
  standalone: true,
  imports: [SharedModule]
})
export class ChargeCodeAssignmentDialogComponent implements OnInit {
  dataa
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
