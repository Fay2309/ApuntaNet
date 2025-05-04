import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppBackgroundComponent } from 'src/app/app-background.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AppBackgroundComponent],
  template: `
  <app-background></app-background>
  
  <div class="main-content">
    <router-outlet></router-outlet>
  </div>
`,
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'curso';
}
