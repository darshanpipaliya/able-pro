import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { rolePermission } from 'src/app/services/helper';
import { EditMapDialogComponent } from '../edit-map-dialog/edit-map-dialog.component';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { GoogleMapsModule } from '@angular/google-maps';

@Component({
  selector: 'app-map-section',
  templateUrl: './map-section.component.html',
  styleUrls: ['./map-section.component.scss'],
  imports: [
    PrimgModule,
    SharedModule,
    GoogleMapsModule
  ]
})
export class MapSectionComponent implements OnInit {

  @Input() update : any;
  @Input() rowData :any;
  @Input() dataAvailble: any;
  viewNEdit = false;
  center: any = {
    lat: 0,
    lng: 0,
  };
  zoom = 8;
  constructor(public dialog: MatDialog) {
    
   }

  ngOnInit(): void {
    this.viewNEdit = rolePermission(['SuperTEMAdmin', 'SuperTEMManager', 'SuperTEMUser', 'SuperTEM', 'TEMAdmin', 'TEMUser', 'TEMManager']);
    this.center = {
      lat: this.rowData.Latitude ?? 0,
      lng: this.rowData.Longitude ?? 0,
    };
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
