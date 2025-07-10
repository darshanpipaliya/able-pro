import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ICellRendererParams } from 'ag-grid-community';
import { WirelineService } from 'src/app/services/wireline.service';
@Component({
    selector: 'attachment',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
      <ng-container *ngIf="params.data.IsAttachment !== null">
        <i class="fas fa-file" (click)="buttonClicked(this)"></i>
      </ng-container>
  `,
})

export class AttachmentRenderer implements OnInit {
    params: any;
    constructor(private wirelineService: WirelineService) {
    }
    ngOnInit(): void {
    }
    public cellValue!: string;

    agInit(params: ICellRendererParams): void {
        this.params = params;
    }

    refresh(params: ICellRendererParams) {
    }

    buttonClicked(params: any) {
       this.wirelineService.downloadInventoryNote(this.params.data.InventoryNoteId).subscribe({
            next: (dataa: any) => {
            let bolbUrl = URL.createObjectURL(dataa);
            var link = document.createElement("a");
            link.setAttribute("href", bolbUrl);

            link.setAttribute("download", this.params.data.GeneratedFileName);
            link.style.display = "none";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
           
          },
          error: error => {
          }});
    }
}
