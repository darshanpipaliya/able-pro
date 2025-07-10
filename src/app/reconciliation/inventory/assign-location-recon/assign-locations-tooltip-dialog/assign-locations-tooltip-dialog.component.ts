import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-assign-locations-tooltip-dialog',
  templateUrl: './assign-locations-tooltip-dialog.component.html',
  styleUrls: ['./assign-locations-tooltip-dialog.component.scss']
})
export class AssignLocationsTooltipDialogComponent implements OnInit {

  constructor(public matDialogRef: MatDialogRef<AssignLocationsTooltipDialogComponent>) { }

  ngOnInit(): void {
  }

  closeModal() {
    this.matDialogRef.close();
  }

}
