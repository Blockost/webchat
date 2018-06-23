import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

// Custom modules
import { RoutingModule } from './modules/routing/routing.module';
import { AngularMaterialModule } from './modules/angular-material/angular-material.module';

// Custom services
import { MessageService } from './services/message/message.service';

// Custom components
import { AppComponent } from './app.component';
import { HomeComponent } from './pages/home/home.component';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';
import { ChatComponent } from './pages/chat/chat.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { InputComponent } from './components/input/input.component';
import { GlobalMembersListComponent } from './components/global-members-list/global-members-list.component';
import { ChannelsManagementPanelComponent } from './components/channels-management-panel/channels-management-panel.component';
import { ChatPanelComponent } from './components/chat-panel/chat-panel.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    PageNotFoundComponent,
    ChatComponent,
    NavbarComponent,
    InputComponent,
    GlobalMembersListComponent,
    ChannelsManagementPanelComponent,
    ChatPanelComponent
  ],
  imports: [BrowserModule, AngularMaterialModule, RoutingModule],
  providers: [MessageService],
  bootstrap: [AppComponent]
})
export class AppModule {}
