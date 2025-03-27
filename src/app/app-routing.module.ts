// import { NgModule } from '@angular/core';
// import { RouterModule, Routes } from '@angular/router';
// import { DefaultComponent } from './default.component';
// import { MenuComponent } from './menu.component';
// import { ConfirmOTPComponent } from './shared';

// const routes: Routes = [
//   { path: '', redirectTo: 'login', pathMatch: 'full' },
//   { path: 'confirmOTP', component : ConfirmOTPComponent},
//   {
//     path: 'login',
//     loadChildren: () =>
//       import('./login/login.module').then((m) => m.LoginModule),
//   },
//   {
//     path: '',
//     component: DefaultComponent,
//     children: [
//       { path: '', redirectTo:'ADMIN', pathMatch: 'full' },
      
//       {
//         path: 'ADMIN',
//         children:[
//           {path: '', component: MenuComponent},
//           {path: 'sub-menu/:id', component: MenuComponent}
//         ]
//       },
//       {
//         path: 'ADMIN-PAGE',
//         //canActivate: [AuthGuard],
//         loadChildren: () =>
//           import('./admin/admin.module').then((m) => m.AdminModule),
//       }, 
//       // {
//       //   path: 'ADMIN-PAGE',
//       //   //canActivate: [AuthGuard],
//       //   loadChildren: () =>
//       //     import('./template/template.module').then((m) => m.TemplateModule),
//       // },       

//       // {
//       //   path: 'TEMPLATE-PAGE',
//       //   //canActivate: [AuthGuard],
//       //   loadChildren: () =>
//       //     import('./template/template.module').then((m) => m.TemplateModule),
//       // },
//       {
//         path: 'ORG',
//         children:[
//           {path: '', component: MenuComponent},
//           {path: 'sub-menu/:id', component: MenuComponent}
//         ]
//       },
//       {
//         path: 'ORG-PAGE',
//         //canActivate: [AuthGuard],
//         loadChildren: () =>
//           import('./organization/ogranization.module').then((m) => m.OrganizationModule),
//       }
//       ,
//       {
//         path: 'ACC',
//         //canActivate: [AuthGuard],
//         children:[
//           {path: '', component: MenuComponent},
//           {path: 'sub-menu/:id', component: MenuComponent}
//         ]
//       },
//       {
//         path: 'ACC-PAGE',
//         //canActivate: [AuthGuard],
//         loadChildren: () =>
//           import('./accounting/accounting.module').then((m) => m.AccountingModule),
//       }
//     ]
//   },
// ];

// @NgModule({
//   imports: [RouterModule.forRoot(routes)],
//   exports: [RouterModule],
// })
// export class AppRoutingModule { }
