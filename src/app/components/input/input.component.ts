import { Component, OnInit } from '@angular/core';
import { MessageService } from '../../services/message.service';

@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss']
})
export class InputComponent implements OnInit {
  constructor(private messageService: MessageService) {}

  ngOnInit() {}

  sendMessage(message: string) {
    this.messageService.sendMessage(message);
  }
}
