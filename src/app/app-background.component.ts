import { Component } from '@angular/core';


@Component({
  selector: 'app-background',
  standalone: true,
  imports: [],
  template: `
    <div class="waves-container">
      <div class="wave wave-1"></div>
      <div class="wave wave-2"></div>
      <div class="wave wave-3"></div>
    </div>
  `,
  styles: [] 
})
export class AppBackgroundComponent {}