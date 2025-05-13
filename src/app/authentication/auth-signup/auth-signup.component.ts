import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SpaceTrimStartEndInputirective } from 'src/app/custom-directives/custom-validation.directive';

@Component({
  selector: 'app-auth-signup',
  templateUrl: './auth-signup.component.html',
  styleUrls: ['./auth-signup.component.scss'],
  standalone: true,
  imports: [
    RouterModule,
    SpaceTrimStartEndInputirective
  ]
})
export class AuthSignupComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
