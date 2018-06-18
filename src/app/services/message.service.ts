import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable()
export class MessageService {
  private messageSource = new Subject<string>();
  messageObservable = this.messageSource.asObservable();

  sendMessage(message: string) {
    console.log('message received by the service');
    this.messageSource.next(message);
  }
}
