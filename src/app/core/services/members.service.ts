import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MembersService {
  // Using test file for now - change to membershipData.json for full data
  // Pointing to the full dataset
  private dataUrl = 'assets/data/membershipData.json';

  constructor(private http: HttpClient) {}

  getMembers(): Observable<any[]> {
    return this.http.get<any[]>(this.dataUrl);
  }
}
