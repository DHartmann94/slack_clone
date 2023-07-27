import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ChatSharedService implements CanActivate   {

  constructor(
    private router: Router,
  ){}
  
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean | UrlTree {
    const boardRoute = this.router.config.find(route => route.path === 'board');
    if (boardRoute && boardRoute.children) {
      const hasChannelsComponent = boardRoute.children.some(route => route.path === 'channels');
      const hasChatExtendComponent = boardRoute.children.some(route => route.path === 'chat-extended');
      if (hasChannelsComponent && hasChatExtendComponent) {
        return true;
      }
    }
    return this.router.createUrlTree(['/']);
  }
}
