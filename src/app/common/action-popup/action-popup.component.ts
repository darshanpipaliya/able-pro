import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-action-popup',
  templateUrl: './action-popup.component.html',
  styleUrls: ['./action-popup.component.scss'],
  imports: [
    CommonModule,
  ]
})
export class ActionPopupComponent implements OnInit {

  text: any;
  data: any;
  constructor(@Inject(MAT_DIALOG_DATA) data: any, public dialog: MatDialog,
    public dialogRef: MatDialogRef<ActionPopupComponent>,) {

    this.text = data.text;
    this.data = data;
  }

  ngOnInit(): void {

  }

}
