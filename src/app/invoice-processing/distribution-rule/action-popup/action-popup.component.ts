import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { SharedModule } from 'src/app/demo/shared/shared.module';

@Component({
  selector: 'app-action-popup',
  templateUrl: './action-popup.component.html',
  styleUrls: ['./action-popup.component.scss'],
  imports: [SharedModule, PrimgModule]
})
export class ActionPopupComponent implements OnInit {
  text: any;
  data: any;

  constructor(
    @Inject(MAT_DIALOG_DATA) public datas: any,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<ActionPopupComponent>
  ) {
    this.text = datas.text;
    this.data = datas;
  }

  ngOnInit(): void {}

  updateMessage(newMessage: string) {
    this.text  = newMessage;
  }
}
