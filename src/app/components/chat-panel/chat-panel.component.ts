import { Component, OnInit } from '@angular/core';
import { MessageService } from '../../services/message/message.service';

@Component({
  selector: 'app-chat-panel',
  templateUrl: './chat-panel.component.html',
  styleUrls: ['./chat-panel.component.scss'],
  providers: [MessageService]
})
export class ChatPanelComponent implements OnInit {
  inputMessage: string;

  constructor(private messageService: MessageService) {
    this.messageService.messageObservable.subscribe(message => {
      this.inputMessage = message;
    });
  }

  ngOnInit() {}
}
