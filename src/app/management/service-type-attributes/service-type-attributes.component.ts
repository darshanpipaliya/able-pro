import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AddEditAttributeComponent } from './add-edit-attribute/add-edit-attribute.component';
import { LocationService } from 'src/app/services/location.service';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { PrimgModule } from 'src/app/demo/shared/primeng.module';
import { CustomDualListComponent } from 'src/app/common/custom-dual-list/custom-dual-list.component';

@Component({
  selector: 'app-service-type-attributes',
  templateUrl: './service-type-attributes.component.html',
  styleUrls: ['./service-type-attributes.component.scss'],
  standalone: true,
  imports: [SharedModule, PrimgModule, CustomDualListComponent]
})
export class ServiceTypeAttributesComponent implements OnInit {

  selectedButton: any = 'users';
  buttonOptions: any = [
    { 'label': 'Products', value: 'products', icon: 'fa-box-open' },
    { 'label': 'Products Structure', value: 'productstructure', icon: 'fa-sitemap fas' },
    { 'label': 'Service Type Attributes', value: 'serviceTypeAttributes', icon: 'fa-tag fas' },
  ];

  format: any = { add: 'Add', remove: 'Remove', all: 'Select All', none: 'Remove All',
  };
  keepSorted = true;
  key: string;
  display: any;
  filter = true;
  sort = true;
  source: any = [];
  localSourceData: any = [];
  longDistanceDataSource: any = [];
  confirmedLocalData: any = [];
  confirmedLongDistanceData: any = [];
  stopSpinner = true;
  disabled = false;
  chargeCodes: any;
  localData: any;
  longDistanceData: any;
  serviceTypeAttriData: any;
  isSuperTEMAdmin: boolean = false;
  isSuperTEMManager: boolean = false;
  hidHeader = false;
  constructor(
    private router: Router,
    private locationService: LocationService,
    public dialog: MatDialog
  ) { }

  ngOnInit() {
    this.isSuperTEMAdmin = this.locationService.isUserHasSuperTEMAdminRole();
    this.isSuperTEMManager = this.locationService.isUserHasSuperTEMManagerRole();
    if (!this.isSuperTEMAdmin) {
      this.disabled = true;
    }
    this.getAttributesData();
  }

  getDualListLable(item: any) {
    return item.Attributes.Name;
  }

  getAttributesData() {
    this.stopSpinner = false;
    this.locationService.getServiceTypeattributes().subscribe(result => {
      this.key = 'Id';
      this.display = 'Name';
      this.serviceTypeAttriData = result.$values;
      this.serviceTypeAttriData.forEach((element: any) => {
        element.UnmappedAttributes.$values = element.UnmappedAttributes.$values.concat(element.MappedAttributes.$values)
      });
      this.stopSpinner = true;
    }, error=>{
      this.stopSpinner = true;
    } );
  }

  goToPage(to: any) {
    if (to === 'charge') {
      this.router.navigate(['/management/products/charge-types']);
    } else if (to === 'users') {
      this.router.navigate(['/management/vendors/users']);
    } else if (to === 'vendors') {
      this.router.navigate(['/management/vendors/vendors']);
    } else if (to === 'productstructure') {
      this.router.navigate(['/management/products/structure']);
    } else if (to === 'products') {
      this.router.navigate(['/management/products/products'])
    }
  }

  serviceTypeAttriPopup() {
    const dialogRef = this.dialog.open(AddEditAttributeComponent, {
      panelClass: 'width-665',
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getAttributesData();
        // this.hidHeader = true;
      }
    });
  }

  destinationChange(index: any) {
    this.saveData(index);
  }

  saveData(index: any = '') {
    let requestData: any = [];

    let attributesIdsList: any = [];
    this.serviceTypeAttriData[index].MappedAttributes.$values.forEach((mapedAttr: any) => {
      attributesIdsList.push(mapedAttr.Id);
    })

    requestData = {
      serviceTypeId: this.serviceTypeAttriData[index].ServiceTypeId,
      attributesIds: attributesIdsList
    };

    // this.serviceTypeAttriData.forEach(item => {

    //   let attributesIdsList: any = [];
    //   item.MappedAttributes.$values.forEach(mapedAttr => {
    //     attributesIdsList.push(mapedAttr.Id);
    //   })

    //   requestData.push({
    //     serviceTypeId: item.ServiceTypeId,
    //     attributesIds: attributesIdsList
    //   })
    // })

    this.locationService.addServiceTypeattributes(requestData).subscribe(result => {
    });

  }
}
