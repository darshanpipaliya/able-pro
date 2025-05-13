import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-auth-reset-password-v2',
  templateUrl: './auth-reset-password-v2.component.html',
  styleUrls: ['./auth-reset-password-v2.component.scss']
})
export class AuthResetPasswordV2Component implements OnInit {
  params: any = {};
  constructor(private route: ActivatedRoute
    , private router: Router) { }

  ngOnInit() {
    if (this.route.snapshot.queryParams) {
      this.params = this.route.snapshot.queryParams;
    }
  }

  goToLogin(){
    this.router.navigate(['/auth/signin']);
  }

}
