import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-registro',
  standalone: true,
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.scss'],
  imports: [CommonModule, ReactiveFormsModule, RouterModule]
})
export class RegistroComponent {
  registroForm: FormGroup;

  constructor(private fb: FormBuilder, private router: Router) {
    this.registroForm = this.fb.group({
      usuario: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.minLength(5),
        Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{5,}$/)
      ]],
      confirmarPassword: ['', Validators.required],
      telefono: ['', Validators.required]
    }, { validators: this.matchPasswords });
  }

  matchPasswords(group: FormGroup) {
    const pass = group.get('password')?.value;
    const confirm = group.get('confirmarPassword')?.value;
    return pass === confirm ? null : { mismatch: true };
  }

  onSubmit() {
    if (this.registroForm.valid) {
      console.log('Datos del formulario:', this.registroForm.value);
      this.router.navigate(['/login']);
    } else {
      console.log('Formulario inválido');
    }
  }
}
