import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { SessionStorageService } from 'src/app/services/session-storage.service';

@Component({
  selector: 'app-signout',
  template: ``,
  standalone: true,
})
export class SignoutComponent implements OnInit {

  constructor(private sessionStorageService: SessionStorageService,
    private localStorageService: LocalStorageService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.sessionStorageService.clearSessionObjects();
    this.localStorageService.clearSessionObjects();
    this.router.navigate(['/auth/signin']);

  }

}
