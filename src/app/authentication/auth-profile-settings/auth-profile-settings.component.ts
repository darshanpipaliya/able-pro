import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SpaceTrimStartEndInputirective } from 'src/app/custom-directives/custom-validation.directive';
import { SharedModule } from 'src/app/demo/shared/shared.module';

@Component({
  selector: 'app-auth-profile-settings',
  templateUrl: './auth-profile-settings.component.html',
  styleUrls: ['./auth-profile-settings.component.scss'],
  standalone: true,
  imports: [
    SharedModule,
    CommonModule,
    SpaceTrimStartEndInputirective,
    RouterModule
  ]
})
export class AuthProfileSettingsComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
