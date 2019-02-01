import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { LayoutModule } from '@angular/cdk/layout';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatToolbarModule, MatListModule, MatGridListModule, MatSortModule, MatNativeDateModule } from '@angular/material';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatMenuModule } from '@angular/material/menu';
import { MatRadioModule } from '@angular/material/radio';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ChartModule } from 'primeng/chart';
import { ToastModule } from 'primeng/toast';
import { MessagesModule } from 'primeng/messages';
import { MessageModule } from 'primeng/message';

import { AuthGuard } from './auth/auth.guard';
import { AppRoutingModule } from './app-routing.module';
import { Autorization } from './interceptors/authorization';

import { AppComponent } from './app.component';
import { NavigationComponent } from './components/shared/navigation/navigation.component';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { InvoicePendingComponent } from './components/invoices/invoice-pending/invoice-pending.component';
import { ErrorComponent } from './components/shared/error/error.component';
import { InvoicePdfComponent } from './components/invoices/invoice-pdf/invoice-pdf.component';
import { PendingCufeComponent } from './components/invoices/pending-cufe/pending-cufe.component';
import { LoginComfiarComponent } from './components/login-comfiar/login-comfiar.component';
import { MenuListItemComponent } from './components/shared/menu-list-item/menu-list-item.component';
import { NotePendingComponent } from './components/notes/note-pending/note-pending.component';
import { NoteResendComponent } from './components/notes/note-resend/note-resend.component';
import { NotePdfComponent } from './components/notes/note-pdf/note-pdf.component';

@NgModule({
  declarations: [
    AppComponent,
    NavigationComponent,
    HomeComponent,
    LoginComponent,
    InvoicePendingComponent,
    ErrorComponent,
    InvoicePdfComponent,
    PendingCufeComponent,
    LoginComfiarComponent,
    MenuListItemComponent,
    NotePendingComponent,
    NoteResendComponent,
    NotePdfComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    LayoutModule,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatGridListModule,
    MatCardModule,
    MatMenuModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatNativeDateModule,
    MatDatepickerModule,
    ChartModule,
    ToastModule,
    MessagesModule,
    MessageModule,
    FormsModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatTooltipModule
  ],
  entryComponents: [
    ErrorComponent,
    LoginComfiarComponent
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: Autorization, multi: true },
    AuthGuard
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
