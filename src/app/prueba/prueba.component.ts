import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
@Component({
  standalone: true,
  selector: 'app-prueba',
  imports: [CommonModule, RouterModule],
  templateUrl: './prueba.component.html',
  styleUrl: './prueba.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PruebaComponent {

}
