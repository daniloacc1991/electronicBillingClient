import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './auth/auth.guard';

import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { NavigationComponent } from './components/shared/navigation/navigation.component';
import { InvoicePendingComponent } from './components/invoice-pending/invoice-pending.component';
import { InvoicePdfComponent } from './components/invoice-pdf/invoice-pdf.component';
import { PendingCufeComponent } from './components/pending-cufe/pending-cufe.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '', component: NavigationComponent,
    children: [
      { path: '', component: HomeComponent, canActivate: [AuthGuard] },
      { path: 'pending', component: InvoicePendingComponent, canActivate: [AuthGuard] },
      { path: 'downloadpdf', component: InvoicePdfComponent, canActivate: [AuthGuard] },
      { path: 'pendingcufe', component: PendingCufeComponent, canActivate: [AuthGuard] }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
