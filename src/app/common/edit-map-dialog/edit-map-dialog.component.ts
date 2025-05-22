import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LocationService } from 'src/app/services/location.service';
import { ErrorWarningPopupComponent } from '../error-warning-popup/error-warning-popup.component';
import { SpaceTrimStartEndInputirective } from 'src/app/custom-directives/custom-validation.directive';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { GoogleMapsModule } from '@angular/google-maps';
@Component({
  selector: 'app-edit-map-dialog',
  templateUrl: './edit-map-dialog.component.html',
  styleUrls: ['./edit-map-dialog.component.scss'],
  standalone:true,
  imports: [
    SpaceTrimStartEndInputirective, 
    SharedModule,
    GoogleMapsModule
  ]
})
export class EditMapDialogComponent implements OnInit {
  dialogData: any;
  latitude: number;
  longitude: number;
  zoom: number;
  address: string;
  mapApproxAddress: any = [];
  saveButtonLoader = false;
  isCompanyUser:boolean = false;
  isTEMUser: boolean = false;
  isDisabled: boolean = false;
  center: any = {
    lat: 0,
    lng: 0,
  };
  constructor(private dialogRef: MatDialogRef<EditMapDialogComponent>,
    public dialog: MatDialog,
    private locationService: LocationService,
    @Inject(MAT_DIALOG_DATA) data: any) {
    this.dialogData = data;
  }

  ngOnInit() {
    if(this.dialogData?.Location){
      this.latitude = this.dialogData.Location.Latitude;
      this.longitude = this.dialogData.Location.Longitude;
      this.center = {
        lat: this.dialogData.Location.Latitude,
        lng: this.dialogData.Location.Longitude,
      };
    } else {
      this.latitude = this.dialogData.Latitude;
      this.longitude = this.dialogData.Longitude;
      this.center = {
        lat: this.dialogData.Latitude,
        lng: this.dialogData.Longitude,
      };
    }
    this.zoom = 8;

    this.isCompanyUser = this.locationService.isUserCompanyUser();
    this.isTEMUser = this.locationService.isUserHasTEMUserRole();

    if(this.isCompanyUser || this.isTEMUser) {
      this.isDisabled = true
    }
  }
  markerDragEnd(event: google.maps.MapMouseEvent) {
  console.log('markerDragEnd ', event.latLng?.toJSON());
    let x: any = event.latLng?.toJSON();
    this.latitude = x.lat;
    this.longitude = x.lng;
  }

  saveLlocation() {
    let data: any = {
      latitude: this.latitude,
      longitude: this.longitude,
    }
    this.saveButtonLoader = true;
    this.locationService.updateGPSLocation(this.dialogData.LocationId, data).subscribe((result: any) => {
      this.saveButtonLoader = false;
      let errorData: any = {
        messgeType: "error",
        title: "Attention",
        titleClass: "text-c-blue",
        icon: "fas fa-exclamation-triangle",
        iconClass: "text-c-blue f-70",
        message: 'Successfully saved' //if messges is multiple use array
      }
      const dialogRef1 = this.dialog.open(ErrorWarningPopupComponent, { panelClass: 'error-warning',data: errorData });
      dialogRef1.afterClosed().subscribe(result => {
        this.dialogRef.close(data);
      });

    });

  }
}
