import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-sandbox-grid-c-tooltip',
  templateUrl: './sandbox-grid-c-tooltip.component.html',
  styleUrls: ['./sandbox-grid-c-tooltip.component.scss']
})
export class SandboxGridCTooltipComponent implements OnInit {

  constructor(public matDialogRef: MatDialogRef<SandboxGridCTooltipComponent>) { }

  ngOnInit(): void {
  }
  
  closeModal() {
    this.matDialogRef.close();
  }
}
