import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

// Custom modules
import { RoutingModule } from './modules/routing/routing.module';
import { AngularMaterialModule } from './modules/angular-material/angular-material.module';

// Custom components
import { AppComponent } from './app.component';
import { HomeComponent } from './pages/home/home.component';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';

@NgModule({
  declarations: [AppComponent, HomeComponent, PageNotFoundComponent],
  imports: [BrowserModule, RoutingModule, AngularMaterialModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
