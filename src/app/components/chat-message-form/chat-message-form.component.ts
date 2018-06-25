import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MessageService } from '../../services/message/message.service';

@Component({
  selector: 'app-chat-message-form',
  templateUrl: './chat-message-form.component.html',
  styleUrls: ['./chat-message-form.component.scss']
})
export class ChatMessageFormComponent implements OnInit {
  @ViewChild('inputField') private inputField: ElementRef;

  constructor(private messageService: MessageService) {}

  ngOnInit() {}

  getValue() {
    return this.inputField.nativeElement.value;
  }

  submitMessage(message: string): boolean {
    this.messageService.sendMessage(message);

    // prevent page to reload when submitting the form
    return false;
  }
}
