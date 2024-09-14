import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UserManagementComponent } from './user-management/user-management.component';
import { GroupManagementComponent } from './group-management/group-management.component';
import { AuthGuard } from './auth.guard';  // Import the AuthGuard
import { LogoutComponent } from './logout/logout.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'logout', component: LogoutComponent },  // Add logout route
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },  // Protect the dashboard route
  { path: 'user-management', component: UserManagementComponent, canActivate: [AuthGuard] },  // Protect user-management
  { path: 'group-management', component: GroupManagementComponent, canActivate: [AuthGuard] },  // Protect group-management
  { path: '', redirectTo: '/login', pathMatch: 'full' }
];
