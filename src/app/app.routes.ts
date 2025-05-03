import { Routes } from '@angular/router';
import { provideRouter } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegistroComponent } from './registro/registro.component'
import { BienvenidaComponent } from './bienvenida/bienvenida.component';
import { PruebaComponent } from './prueba/prueba.component';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'registro', component: RegistroComponent },
    { path: 'bienvenida', component: BienvenidaComponent },
    { path: 'prueba', component: PruebaComponent }
];

export const appRouter = provideRouter(routes);