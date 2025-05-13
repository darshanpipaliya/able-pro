import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { rolePermission } from 'src/app/services/helper';
import { EditMapDialogComponent } from '../edit-map-dialog/edit-map-dialog.component';
 

@Component({
  selector: 'app-map-section',
  templateUrl: './map-section.component.html',
  styleUrls: ['./map-section.component.scss']
})
export class MapSectionComponent implements OnInit {

  @Input() update : any;
  @Input() rowData :any;
  @Input() dataAvailble: any;
  viewNEdit = false;
  constructor(public dialog: MatDialog) { }

  ngOnInit(): void {
    this.viewNEdit = rolePermission(['SuperTEMAdmin', 'SuperTEMManager', 'SuperTEMUser', 'SuperTEM', 'TEMAdmin', 'TEMUser', 'TEMManager']);

  }

  onEditMap(locationData: any) {
    const dialogRef = this.dialog.open(EditMapDialogComponent, {
      panelClass: 'width-665',
      data: locationData,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result !== 'undefined') {
        if (result.latitude && result.longitude) {

          if (this.rowData?.Location) {
            this.rowData.Location.Latitude = result.latitude;
            this.rowData.Location.Longitude = result.longitude;
          } else {
            this.rowData.Latitude = result.latitude;
            this.rowData.Longitude = result.longitude;
          }
        }
      }
    });
  }

}
