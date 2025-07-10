import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-validate-tooltip-dialog',
  templateUrl: './validate-tooltip-dialog.component.html',
  styleUrls: ['./validate-tooltip-dialog.component.scss']
})
export class ValidateTooltipDialogComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef<ValidateTooltipDialogComponent>) {

   }

  ngOnInit(): void {
  }

}
