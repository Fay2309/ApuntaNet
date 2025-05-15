import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class unirseHogarService {
  private apiUrl = 'http://localhost:5000/bienvenida';

  constructor(private http: HttpClient) {}

  unirseHogar(data: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<any>(this.apiUrl, data, { headers });
  }
}
