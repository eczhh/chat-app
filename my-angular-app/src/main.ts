import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { HttpClientModule, provideHttpClient } from '@angular/common/http';
import { SocketIoConfig, SocketIoModule } from 'ngx-socket-io';
import { importProvidersFrom } from '@angular/core';

// Socket.io configuration
const socketConfig: SocketIoConfig = { url: 'http://localhost:3000', options: {} };

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(), // Provide HttpClient globally
    importProvidersFrom(SocketIoModule.forRoot(socketConfig)) // Provide Socket.io globally
  ]
}).catch(err => console.error(err));
