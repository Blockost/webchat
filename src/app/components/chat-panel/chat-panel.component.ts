import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef
} from '@angular/core';
import { MessageService } from '../../services/message/message.service';
import { Message } from '../../models/message';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat-panel',
  templateUrl: './chat-panel.component.html',
  styleUrls: ['./chat-panel.component.scss'],
  providers: [MessageService]
})
export class ChatPanelComponent implements OnInit, OnDestroy {
  @ViewChild('messageContainer') private messageContainer: ElementRef;
  private messages: Message[];
  private messageSubscription: Subscription;

  constructor(private messageService: MessageService) {}

  ngOnInit() {
    this.messages = [];
    this.messageSubscription = this.messageService.messageObservable.subscribe(
      message => this.pushMessage(new Message('sytem', 'all', message))
    );
    Date.now();
  }

  ngOnDestroy() {
    this.messageSubscription.unsubscribe();
  }

  pushMessage(message: Message) {
    this.messages.push(message);
    // scroll message container to the end
    this.messageContainer.nativeElement.scrollTop = this.messageContainer.nativeElement.scrollHeight;
  }
}
