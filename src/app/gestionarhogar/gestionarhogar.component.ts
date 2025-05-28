import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';


@Component({
  selector: 'app-gestionarhogar',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './gestionarhogar.component.html',
  styleUrl: './gestionarhogar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GestionarhogarComponent {

}
