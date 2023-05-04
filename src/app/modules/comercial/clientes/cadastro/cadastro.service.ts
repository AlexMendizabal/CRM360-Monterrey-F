import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ComercialClientesCadastroService {
  private notifyLoaded = new Subject<any>();
  private notifyCancel = new Subject<any>();
  private notifySubmit = new Subject<any>();
  private notifySended = new Subject<any>();

  notifyLoadedObservable$ = this.notifyLoaded.asObservable();
  notifyCancelObservable$ = this.notifyCancel.asObservable();
  notifySubmitObservable$ = this.notifySubmit.asObservable();
  notifySendedObservable$ = this.notifySended.asObservable();

  constructor() {}

  public onNotifyLoaded(data: boolean) {
    this.notifyLoaded.next(data);
  }

  public onNotifyCancel(data: boolean) {
    this.notifyCancel.next(data);
  }

  public onNotifySubmit(data: boolean) {
    this.notifySubmit.next(data);
  }

  public onNotifySended(data: boolean) {
    this.notifySended.next(data);
  }
}
