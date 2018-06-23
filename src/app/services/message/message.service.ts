import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

/**
 * Service to pass messages between components.
 */
@Injectable()
export class MessageService {
  private messageSource = new Subject<string>();
  messageObservable = this.messageSource.asObservable();

  sendMessage(message: string) {
    this.messageSource.next(message);
  }
}
