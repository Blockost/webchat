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
import { toUnicode } from 'punycode';

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
  }

  ngOnDestroy() {
    this.messageSubscription.unsubscribe();
  }

  pushMessage(message: Message) {
    this.messages.push(message);
    // TODO: 2018-06-25 Find a way to scroll after the message is pushed to the view
    // scroll message container to the end
    this.messageContainer.nativeElement.scrollTop = this.messageContainer.nativeElement.scrollHeight;
  }
}
