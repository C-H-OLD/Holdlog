import { Body, Controller, Delete, Get, Headers, HttpCode, Inject, Injectable, Post, Req, Res, UseGuards, type CanActivate, type ExecutionContext } from '@nestjs/common';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { randomUUID } from 'node:crypto';
import type { components } from '@holdlog/contracts/http';
import { AdminSessionService } from './admin-session.js';
import { validateInput, wireBody } from './identity.controller.js';
import { unauthenticated } from './errors.js';
const cookieName='holdlog_admin_session';
const cookieAttributes='Path=/api/v2/admin; HttpOnly; Secure; SameSite=Lax';
type AdminRequest=IncomingMessage&{body?:unknown;administrator?:{principalId:string;sessionId:string}};

/** Read exactly one canonical opaque administrator cookie; Bearer tokens and duplicate cookies never substitute. */
export function administratorCookie(request:IncomingMessage):string {
  const matches=(request.headers.cookie??'').split(';').map(value=>value.trim()).filter(value=>value.startsWith(cookieName+'='));
  if(matches.length!==1) throw unauthenticated();
  const value=matches[0]!.slice(cookieName.length+1);if(!/^[a-f0-9]{64}$/.test(value)) throw unauthenticated();return value;
}

/** Shared guard for006/019: current admin authority on every request and exact Origin/CSRF for writes. */
@Injectable()
export class AdminSessionGuard implements CanActivate {
  /** Inject only the administrator service, independent of mobile principals and provider settings. */
  constructor(@Inject(AdminSessionService) private readonly service:AdminSessionService) {}
  /** Attach server-derived principal context after session checks; downstream writes recheck inside their transaction. */
  async canActivate(context:ExecutionContext):Promise<boolean> {
    const request=context.switchToHttp().getRequest<AdminRequest>(),write=!['GET','HEAD','OPTIONS'].includes(request.method??'');
    request.administrator=await this.service.authenticate(administratorCookie(request),write,request.headers.origin,request.headers['x-csrf-token'] as string|undefined);return true;
  }
}

@Controller('api/v2/admin/auth/sessions')
export class AdminIdentityController {
  /** Keep cookie/header/contract handling in HTTP while services own authority and transactions. */
  constructor(@Inject(AdminSessionService) private readonly service:AdminSessionService) {}
  /** Correlate no-store auth responses without logging credentials, cookies or body values. */
  private metadata(response:ServerResponse):void {response.setHeader('X-Request-Id',randomUUID());response.setHeader('Cache-Control','no-store');}

  /** Require an allowed login Origin and generated input, then set a host-only Secure cookie after commit. */
  @Post() @HttpCode(200)
  async login(@Body() body:components['schemas']['AdminLoginInput'],@Req() request:AdminRequest,@Res({passthrough:true}) response:ServerResponse) {
    this.service.requireOrigin(request.headers.origin);validateInput('adminLogin',body,request.headers);
    const result=await this.service.login(body,request.headers.origin);this.metadata(response);
    // Storage returns UTC ISO text; cookie Max-Age/Expires need a Date.
    const absoluteExpiresAt=new Date(result.absoluteExpiresAt),maxAge=Math.max(0,Math.floor((absoluteExpiresAt.getTime()-Date.now())/1000));
    response.setHeader('Set-Cookie',`${cookieName}=${result.cookie}; ${cookieAttributes}; Max-Age=${maxAge}; Expires=${absoluteExpiresAt.toUTCString()}`);return result.session;
  }

  /** Return stable session-bound CSRF and current idle expiry without exposing the cookie secret. */
  @Get('current') @UseGuards(AdminSessionGuard)
  async current(@Req() request:AdminRequest,@Res({passthrough:true}) response:ServerResponse) {this.metadata(response);return this.service.session(administratorCookie(request));}

  /** Revoke only the authenticated session and clear the same cookie attributes after successful commit. */
  @Delete('current') @UseGuards(AdminSessionGuard)
  async logout(@Req() request:AdminRequest,@Headers('x-csrf-token') csrf:string|undefined,@Res({passthrough:true}) response:ServerResponse) {
    validateInput('adminLogout',wireBody(request),request.headers);
    const result=await this.service.logout(administratorCookie(request),request.headers.origin,csrf);this.metadata(response);
    response.setHeader('Set-Cookie',`${cookieName}=; ${cookieAttributes}; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`);return result;
  }
}
