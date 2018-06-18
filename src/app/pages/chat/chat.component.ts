import { Component, OnInit, OnDestroy } from '@angular/core';
import { MessageService } from '../../services/message.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
  providers: [MessageService]
})
export class ChatComponent implements OnInit {
  inputMessage: string;

  constructor(private messageService: MessageService) {
    this.messageService.messageObservable.subscribe(message => {
      this.inputMessage = message;
    });
  }

  ngOnInit() {}
}
