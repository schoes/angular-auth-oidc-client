import { JsonPipe } from '@angular/common';
import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { OidcSecurityService } from 'angular-auth-oidc-client';

@Component({
  selector: 'app-home',
  templateUrl: 'home.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [JsonPipe],
})
export class HomeComponent {
  private readonly oidcSecurityService = inject(OidcSecurityService);
  protected readonly userData = this.oidcSecurityService.userData;
  protected readonly authenticated = this.oidcSecurityService.authenticated;
}
