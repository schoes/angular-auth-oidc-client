import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: true,
})
export class CustomersComponent {}
