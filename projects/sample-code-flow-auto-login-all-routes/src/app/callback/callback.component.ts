import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-callback',
  templateUrl: './callback.component.html',
  styleUrls: ['./callback.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class CallbackComponent {
  ngOnInit(): void {
    // Maybe some business logic
  }
}
