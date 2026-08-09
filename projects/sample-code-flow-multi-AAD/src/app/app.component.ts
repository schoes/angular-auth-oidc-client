import {
  Component,
  OnInit,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { OidcSecurityService } from 'angular-auth-oidc-client';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class AppComponent implements OnInit {
  private readonly oidcSecurityService = inject(OidcSecurityService);

  ngOnInit(): void {
    this.oidcSecurityService
      .checkAuthMultiple()
      .subscribe(([{ isAuthenticated, userData, accessToken }]) => {
        console.log('Authenticated', isAuthenticated);
        console.log('Received Userdata', userData);
        console.log(`Current access token is '${accessToken}'`);
      });
  }
}
