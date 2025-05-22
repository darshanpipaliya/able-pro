import { Component, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { HeaderSectionComponent } from '../common/header-section/header-section.component';
import { GoogleMapsModule } from '@angular/google-maps';
import { SharedModule } from '../demo/shared/shared.module';
import { PrimgModule } from '../demo/shared/primeng.module';
import { Subject, takeUntil } from 'rxjs';
import { Router } from '@angular/router';
import { LocationService } from '../services/location.service';
import { checkIsValueExists, rolePermission } from '../services/helper';
import _ from 'lodash';
import { HttpParams } from '@angular/common/http';
import { MapInfoWindow, MapMarker, GoogleMap } from '@angular/google-maps';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
@Component({
  selector: 'app-map',
  imports: [HeaderSectionComponent, PrimgModule, SharedModule, GoogleMapsModule],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss'
})
export class MapComponent {
  center: any = {
    lat: 31.330179,
    lng: -89.338028,
  };
  zoom = 3;
  showDropdown: boolean = false;
  constructor(private router: Router, private locationService: LocationService) { }
  buttonOptions: any = [
    { label: 'Locations', value: 'location', icon: 'fas fa-map-marker-alt' },
    { label: 'Map', value: 'map', icon: 'fas fa-map-marked-alt' },
  ];
  selectedButton: any = 'map';
  hasSsuperTemUsers: boolean = false;
  tems: any = [];
  accountId: any = '';
  companyId: any = '';
  companies: any = [];
  customers: any = [];
  mapsForUser: any = [];
  selectedTem: string = 'all';
  private readonly getTEMAPIDestroy = new Subject<void>();
  private _unsubscribeCustomer: Subject<any> = new Subject<any>();
  mapCenter = { lat: 40.7128, lng: -74.0060 };
  infoContent = '';
  selectedMap: any = null;
  @ViewChild(MapInfoWindow) infoWindow: MapInfoWindow;
  @ViewChild(GoogleMap) googleMap: GoogleMap;
  @ViewChildren('markerElem') markerElems!: QueryList<MapMarker>;
  onButtonClick(value: string): void {
    this.selectedButton = value;
    setTimeout(() => this.goToPage(value), 0);
  }

  goToPage(to: any) {
    if (to === 'location') {
      this.router.navigate(['/locations']);
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      const markers = this.markerElems
        .map((m) => m.marker)
        .filter((marker): marker is google.maps.Marker => marker !== undefined);
      new MarkerClusterer({ markers, map: this.googleMap.googleMap! });
    }, 0);
  }
  ngOnInit(): void {
    this.hasSsuperTemUsers = rolePermission(['SuperTEMAdmin', 'SuperTEMManager', 'SuperTEMUser']);
    this.showDropdown = rolePermission(['CompanyUser']);
    this.getTemLists();
    this.getCompanies();
    this.getCustomerForUser();
  }

  getCompanies() {
    this.locationService.getCompanies().subscribe((data: any) => {
      if (data) {
        this.companies = _.uniqBy(data, 'Id');
      }
    });
  }

  getTemLists() {
    this.getTEMAPIDestroy.next();
    this.locationService.getTemLists().pipe(takeUntil(this.getTEMAPIDestroy)).subscribe((data) => {
      if (data && data.$values) {
        this.tems = data.$values;

        const newObj = { AccountName: 'All', Id: 'all' };
        if (this.hasSsuperTemUsers) {
          let id = sessionStorage.getItem("LoggedAccountId");
          const found = this.tems.find((element: any) => Number(element.Id) === Number(id));
          this.tems.unshift(found);
          this.tems = this.tems.filter(
            (object: any, index: any, self: any) => object && self.indexOf(object) === index
          );
          this.tems.unshift(newObj);
        }

      }
    }, error => {
      this.tems = [];
    });
  }

  filterGridByTEMId(e: any) {
    console.log('filterGridByTEMId ', e);
  }

  onCustomerSelect() {
    if (this.accountId) {
      this.getCompanyByCustomerId(this.accountId);
    } else {
      this.companies = [];
    }
    this.onCompanySelect();
  }

  getCompanyByCustomerId(id: any) {
    this.locationService.getCompanyByCustomerId(id).subscribe((data) => {
      if (data && data.$values && data.$values.length > 0) {
        this.companies = data.$values;
        this.companies.unshift({ CompanyID: "All", CompanyName: "All" });

      } else {
        this.companies = [];
      }
    });
  }

  onCompanySelect() {
    this.mapsForUser = [];
    if (this.accountId && this.companyId == 'All') {
      const params = new HttpParams().set('customerAccountId', this.accountId);
      this.locationService.getMapForTemUsers(params).subscribe((data: any) => {
        if (data && data.$values && data.$values.length > 0) {
          this.mapsForUser = data.$values;
          this.mapsForUser.map((c: any) => {
            let a: any = {};
            a = c;
            a['addressText'] = this.setAddress(c);
            a['center'] = {};
            a['center']['lat'] = c.Latitude;
            a['center']['lng'] = c.Longitude;
            return a;
          });
        }
      });
    } else if (this.accountId && this.companyId) {
      const params = new HttpParams()
        .set('customerAccountId', this.accountId)
        .set('companyId', this.companyId);
      this.locationService.getMapForTemUsers(params).subscribe((data: any) => {
        if (data && data.$values && data.$values.length > 0) {
          this.mapsForUser = data.$values;
          this.mapsForUser.map((c: any) => {
            console.log(' c ', c);
            let a: any = {};
            a = c;
            a['addressText'] = this.setAddress(c);
            a['center'] = {};
            a['center']['lat'] = c.Latitude;
            a['center']['lng'] = c.Longitude;
            return a;
          });
          console.log('mapsForUser', this.mapsForUser);
        }
      });
    }
  }

  getMapForOtherUsers() {
    this.locationService.getMapForOtherUsers().subscribe((data: any) => {
      if (data && data.$values && data.$values.length > 0) {
        this.mapsForUser = data.$values;
        this.mapsForUser.map((c: any) => {
            let a: any = {};
          a = c;
          a['addressText'] = this.setAddress(c);
          a['center'] = {};
          a['center']['lat'] = c.Latitude;
          a['center']['lng'] = c.Longitude;
          return a;
        });
      }
     console.log('mapsForUser', this.mapsForUser);

    });
  }

  setAddress(c: any) {
    let a = '';

    if (checkIsValueExists(c['LocationName'])) {
      a += c['LocationName'] + ' - ';
    }
    if (checkIsValueExists(c['Address1'])) {
      a += c['Address1'] + ', ';
    }
    if (checkIsValueExists(c['Address2'])) {
      a += c['Address2'] + ', ';
    }
    if (checkIsValueExists(c['city'])) {
      a += c['city'] + ', ';
    }
    if (checkIsValueExists(c['StateName'])) {
      a += c['StateName'] + ', ';
    }
    if (checkIsValueExists(c['CountryName'])) {
      a += c['CountryName'] + ', ';
    }
    if (checkIsValueExists(c['PostalCode'])) {
      a += c['PostalCode'];
    }

    return a;
  }

  getCustomerForUser() {
    this.customers = []
    if (this.selectedTem == 'all') {
      this._unsubscribeCustomer.next(null);
      this.locationService.getCustomerDropDown().pipe(takeUntil(this._unsubscribeCustomer)).subscribe((data) => {
        if (data && data.$values) {
          this.customers = data.$values;
        } else {
          this.customers = [];
        }
      });
    } else {
      this._unsubscribeCustomer.next(null);
      this.locationService.getCustomerDropdownByNewTEM(this.selectedTem).pipe(takeUntil(this._unsubscribeCustomer)).subscribe((data) => {
        if (data && data.Data.$values) {
          this.customers = data.Data.$values;
        } else {
          this.customers = [];
        }
      });
    }
  }

  clickOnCompanyLocation(company: any, id: any) {
    if (company) {
      this.selectedButton = 'location';
      const event = {
        data: company,
      };

      this.onCellDoubleClicked(event);
    }
  }

  onCellDoubleClicked(event: any) {
    console.log('onCellDoubleClicked', event);
  }

  openInfoWindow(e: any) {
    console.log('openInfoWindow', e);
  }
  openInfo(marker: MapMarker, map: any) {
    this.selectedMap = map;
    this.infoWindow.open(marker);
  }

  editLocation(event: MouseEvent, locationId: number) {
    event.preventDefault(); // prevent anchor navigation
    console.log('Editing location ID:', locationId);
    // You can navigate or open modal, etc.
  }

  onMapReady(mapInstance: google.maps.Map) {
    const infoWindow = new google.maps.InfoWindow(); // native info window
  
    const markers = this.mapsForUser.map((map: any) => {
      const marker = new google.maps.Marker({
        position: { lat: map.Latitude, lng: map.Longitude },
        title: map.CompanyName,
        map: mapInstance, // attach to map now
      });
  
      const content = `
        <div>
          <h2>${map.CompanyName}</h2>
          <p>${map.LocationName}</p>
          <p>${map.Address1}${map.Address2 ? ', ' + map.Address2 : ''}</p>
          <p>${map.City}, ${map.StateName}, ${map.PostalCode}, ${map.CountryName}</p>
          <p><strong>Inventory: ${map.ActivePendingActivationAllInventoryCount}</strong></p>
          <a href="#" onclick="window.dispatchEvent(new CustomEvent('edit-location', { detail: ${map.CompanyLocationId} }))">Edit Location</a>
        </div>
      `;
  
      marker.addListener('click', () => {
        infoWindow.setContent(content);
        infoWindow.open(mapInstance, marker);
      });
  
      return marker;
    });
  
    // Cluster the native markers
    new MarkerClusterer({ markers, map: mapInstance });
  
    // Listen for the custom "edit-location" event
    window.addEventListener('edit-location', (e: any) => {
      const id = e.detail;
      console.log('Edit location ID:', id);
      // Optionally: this.router.navigate(['/edit-location', id]);
    });
  }


}
