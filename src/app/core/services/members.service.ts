import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class MembersService {
  private membershipUrl = 'assets/data/membershipData.json';
  private abonosUrl = 'assets/data/abonosData.json';

  constructor(private http: HttpClient) {}

  getMembers(): Observable<any[]> {
    return forkJoin([
      this.http.get<any[]>(this.membershipUrl),
      this.http.get<any[]>(this.abonosUrl)
    ]).pipe(
      map(([socios, abonos]) => {
        // Optional: Add a flag or verify integrity if needed
        return [...socios, ...abonos];
      })
    );
  }
}
