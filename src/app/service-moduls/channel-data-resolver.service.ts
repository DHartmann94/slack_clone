import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChannelDataResolverService implements Resolve<Observable<string>>  {
  private dataSubject = new BehaviorSubject<string>('Initial data');

  sendData(data: string) {
    this.dataSubject.next(data);
  }

  resolve(): Observable<string> {
    return this.dataSubject.asObservable();
  }
}
