import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-bienvenida',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './bienvenida.component.html',
  styleUrl: './bienvenida.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BienvenidaComponent {

}
