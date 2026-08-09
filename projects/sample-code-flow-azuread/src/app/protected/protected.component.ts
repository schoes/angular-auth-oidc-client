import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-protected',
  templateUrl: './protected.component.html',
  styleUrls: ['./protected.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: true,
})
export class ProtectedComponent {}
