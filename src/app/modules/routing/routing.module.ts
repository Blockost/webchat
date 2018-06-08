import { NgModule } from '@angular/core';
import { RouterModule, Route } from '@angular/router';

// Import components
import { HomeComponent } from '../../pages/home/home.component';
import { PageNotFoundComponent } from '../../pages/page-not-found/page-not-found.component';
import { ChatComponent } from '../../pages/chat/chat.component';

// Add routes to components here (order matters) !
const ROUTES = [
  {
    path: 'home',
    component: HomeComponent
  },
  {
    path: 'chat',
    component: ChatComponent
  },
  {
    path: '404',
    component: PageNotFoundComponent
  },
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: '**', // fallback route (no match)
    redirectTo: '/404'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(ROUTES)],
  exports: [RouterModule],
  declarations: []
})
export class RoutingModule {}
