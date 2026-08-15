import {
  Component,
  OnInit,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { OidcSecurityService } from 'angular-auth-oidc-client';

@Component({
  selector: 'app-auto-component',
  templateUrl: './auto-login.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class AutoLoginComponent implements OnInit {
  private readonly oidcSecurityService = inject(OidcSecurityService);

  ngOnInit(): void {
    this.oidcSecurityService
      .checkAuth()
      .subscribe(() => this.oidcSecurityService.authorize());
  }
}
