import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { OidcSecurityService } from 'angular-auth-oidc-client';

@Component({
  selector: 'app-forbidden',
  templateUrl: 'forbidden.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class ForbiddenComponent {
  public isAuthenticated$ = inject(OidcSecurityService).isAuthenticated$;
}
