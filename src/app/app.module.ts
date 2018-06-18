import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

// Custom modules
import { RoutingModule } from './modules/routing/routing.module';
import { AngularMaterialModule } from './modules/angular-material/angular-material.module';

// Custom services
import { MessageService } from './services/message.service';

// Custom components
import { AppComponent } from './app.component';
import { HomeComponent } from './pages/home/home.component';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';
import { ChatComponent } from './pages/chat/chat.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { InputComponent } from './components/input/input.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    PageNotFoundComponent,
    ChatComponent,
    NavbarComponent,
    InputComponent
  ],
  imports: [BrowserModule, AngularMaterialModule, RoutingModule],
  providers: [MessageService],
  bootstrap: [AppComponent]
})
export class AppModule {}
