import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http:HttpClient) { }

  async getData (type:string):Promise<any> {
    return (await this.http.get<any>(`http://localhost:3000/api/data/${type}`).toPromise())
  }
}
