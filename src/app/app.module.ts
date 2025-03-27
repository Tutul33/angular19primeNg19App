// import {
//   loadFieldTitle,
//   loadValidation,
//   loadErrorMessage,
//   setServerDate,
//   setSignalRConnection,
// } from './core/models/app.initializer';
// import { MessageService } from 'primeng/api';
// import { ErrorHandler, NgModule } from '@angular/core';
// import { BrowserModule } from '@angular/platform-browser';
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// import { AppRoutingModule } from './app-routing.module';
// import { AppComponent } from './app.component';

// import { LoginModule } from './login/login.module';
// import { SharedModule } from './shared/shared.module';

// // Third party module
// import { ToastrModule } from 'ngx-toastr';
// /* NgRx */

// import { HTTP_INTERCEPTORS } from '@angular/common/http';
// import { HeadersInterceptor } from './core/services/http-interceptor.service';
// import { EncodeHttpParamsInterceptor } from './core/services/encodeHttpParams.interceptor';
// import { HttpErrorInterceptor } from './core/services/http-error.Interceptor';
// import { DefaultComponent } from './default.component';

// import { MenuComponent } from './menu.component';
// import { AppSharedModule } from './app-shared/app-shared.module';
// import { HttpClientModule } from '@angular/common/http';
// import { ErrorLogService } from './shared/services/error-log.service';
// import { FormsModule } from '@angular/forms';
// import { TabMenuModule } from 'primeng/tabmenu';



// @NgModule({
//   imports: [
//     BrowserModule,
//     BrowserAnimationsModule,
//     ToastrModule.forRoot(),
//     HttpClientModule,
//     LoginModule,    
//     SharedModule,
//     AppSharedModule,
//     AppRoutingModule,
//     FormsModule,
//     TabMenuModule  
    
//   ],
//   exports: [
//     HttpClientModule
//   ],
  
//   providers: [
//     loadFieldTitle,
//     loadValidation,
//     loadErrorMessage,
//     MessageService,
//     setServerDate,
//     setSignalRConnection,
//     {
//       provide: HTTP_INTERCEPTORS,
//       useClass: HeadersInterceptor,
//       multi: true,
//     },
//     {
//       provide: HTTP_INTERCEPTORS,
//       useClass: HttpErrorInterceptor,
//       multi: true,
//     },
//     {
//       provide: HTTP_INTERCEPTORS,
//       useClass: EncodeHttpParamsInterceptor,
//       multi: true
//     },
//     {
//       provide: ErrorHandler, 
//       useClass: ErrorLogService
//     }
//   ],
//   declarations: [AppComponent, DefaultComponent, MenuComponent],
//   bootstrap: [AppComponent],
// })
// export class AppModule {}
