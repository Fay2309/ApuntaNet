import { Routes } from '@angular/router';
import { provideRouter } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegistroComponent } from './registro/registro.component'
import { BienvenidaComponent } from './bienvenida/bienvenida.component';
import { LandingpageComponent } from './landingpage/landingpage.component';

export const routes: Routes = [
    { path: '', redirectTo: 'landingpage', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'registro', component: RegistroComponent },
    { path: 'bienvenida', component: BienvenidaComponent },
    { path: 'landingpage', component: LandingpageComponent }
];

export const appRouter = provideRouter(routes);