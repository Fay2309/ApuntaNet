import { ChangeDetectionStrategy, Component, ElementRef, HostListener, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';


@Component({
  selector: 'app-bienvenida',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './bienvenida.component.html',
  styleUrl: './bienvenida.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BienvenidaComponent implements OnInit {
  public nombreUsuario: string = '';
  public menuVisible: boolean = false;

  constructor(private authService: AuthService, private router: Router, private elementRef: ElementRef, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    const usuario = this.authService.obtenerUsuarioActual();
    this.nombreUsuario = usuario ?? 'Usuario';
  }

  toggleMenu(): void {
    this.menuVisible = !this.menuVisible;
  }

  logout(): void {
    localStorage.removeItem('usuario');
    this.router.navigate(['/login']); 
  }

  @HostListener('document:click', ['$event'])
  clickFuera(event: Event): void {
    const target = event.target as HTMLElement;
    const avatarElement = this.elementRef.nativeElement.querySelector('.avatar');
    const menuElement = this.elementRef.nativeElement.querySelector('.menu');
    
    if (this.menuVisible && 
        !avatarElement.contains(target) && 
        !menuElement.contains(target)) {
      this.menuVisible = false;
      this.cdr.detectChanges();
    }
  }

}
