import { Body, Catch, Controller, Delete, Get, Headers, HttpCode, HttpException, Inject, Injectable, Patch, Post, Req, Res, UseGuards, type ArgumentsHost, type CanActivate, type ExceptionFilter, type HttpServer, type ExecutionContext } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { randomUUID } from 'node:crypto';
import type { components } from '@holdlog/contracts/http';
import * as validators from '@holdlog/contracts/validators';
import { index } from '@holdlog/contracts/operations';
import { parseParameter } from '@holdlog/contracts/http-input';
import { IdentityService } from './identity.service.js';
import { IdentityError, invalid, unauthenticated } from './errors.js';
type Operation = 'createLoginChallenge' | 'login' | 'completeSignup' | 'refreshSession' | 'logout' | 'getMyProfile' | 'editMyProfile';
interface OperationContract { parameters: (Parameters<typeof parseParameter>[0] & { name: string; validator: keyof typeof validators })[]; body?: Record<string, { validator: keyof typeof validators }> }
type WireRequest = IncomingMessage & { body?: unknown };

/** Extract one opaque Bearer credential, rejecting cookie/proof substitutes before accessing protected data. */
export function bearer(request: IncomingMessage): string {
  const value = request.headers.authorization;
  if (!value || !/^Bearer [A-Za-z0-9_-]+$/i.test(value)) throw unauthenticated();
  return value.slice(7);
}

/** Distinguish the parser's empty-body object from an actual JSON body using HTTP framing. */
function wireBody(request: WireRequest): unknown {
  return !request.headers['transfer-encoding'] && Number(request.headers['content-length'] ?? 0) === 0 ? undefined : request.body;
}

/** Parse and validate generated operation headers and body without coercion or unknown-field removal. */
export function validateInput(operation: Operation, body: unknown, headers: IncomingMessage['headers']): void {
  const contract = index.operations[operation] as OperationContract;
  for (const parameter of contract.parameters) {
    const value = headers[parameter.name.toLowerCase()];
    if (parameter.name === 'If-Match' && value === undefined) throw new IdentityError(428, 'PRECONDITION_REQUIRED');
    try {
      const parsed = parseParameter(parameter, value);
      if (!validators[parameter.validator](parsed)) throw invalid(parameter.name);
    } catch { throw invalid(parameter.name); }
  }
  if (contract.body?.['application/json']) {
    const check = validators[contract.body['application/json'].validator];
    if (!check(body)) {
      const errors = check.errors as { instancePath: string; params: { missingProperty?: string; additionalProperty?: string } }[] | undefined;
      const fields = errors?.map(error => ({ path: error.instancePath + (error.params.missingProperty || error.params.additionalProperty ? '/' + (error.params.missingProperty ?? error.params.additionalProperty)!.replaceAll('~', '~0').replaceAll('/', '~1') : ''), code: 'INVALID_INPUT' })) ?? [];
      throw new IdentityError(400, 'INVALID_INPUT', fields);
    }
  } else if (body !== undefined) { throw invalid('body'); }
}

/** Map every failure to a safe generated Error response, including JSON parsing and database exceptions. */
@Catch()
export class IdentityExceptionFilter implements ExceptionFilter {
  private readonly fallback: BaseExceptionFilter;
  /** Preserve framework handling for unrelated routes, including the exact development health contract. */
  constructor(adapter: HttpServer) { this.fallback = new BaseExceptionFilter(adapter); }
  /** Return a request-correlated failure with no raw exception details or submitted values. */
  catch(error: unknown, host: ArgumentsHost): void {
    const request = host.switchToHttp().getRequest<IncomingMessage>();
    if (!request.url?.startsWith('/api/v2/')) { this.fallback.catch(error, host); return; }
    const response = host.switchToHttp().getResponse<ServerResponse>();
    const malformed = error && typeof error === 'object' && 'status' in error && error.status === 400;
    const failure = error instanceof IdentityError ? error : malformed ? invalid('body') : error instanceof HttpException && error.getStatus() === 404 ? new IdentityError(404, 'NOT_FOUND') : new IdentityError(503, 'TEMPORARY_FAILURE');
    const requestId = randomUUID();
    const body: components['schemas']['Error'] = { code: failure.code, requestId, fieldErrors: failure.fieldErrors, currentVersion: failure.currentVersion, resourceId: null, retryable: failure.status === 503 || failure.code === 'REQUEST_IN_PROGRESS', blockingCrewIds: [], existingVisitId: null };
    response.statusCode = failure.status; response.setHeader('X-Request-Id', requestId); response.setHeader('Cache-Control', 'no-store'); response.setHeader('Content-Type', 'application/json'); response.end(JSON.stringify(body));
  }
}

/** Reusable current-session boundary for downstream mobile controllers; business writes recheck under their locks. */
@Injectable()
export class MobileSessionGuard implements CanActivate {
  /** Use the mobile identity service, keeping administrator cookies outside this boundary. */
  constructor(@Inject(IdentityService) private readonly service: IdentityService) {}
  /** Reject invalid/expired/revoked sessions before controller invocation. */
  async canActivate(context: ExecutionContext): Promise<boolean> { await this.service.authenticate(bearer(context.switchToHttp().getRequest<IncomingMessage>())); return true; }
}

@Controller('api/v2')
export class IdentityController {
  /** Inject the identity business service; controller owns only wire validation and response metadata. */
  constructor(@Inject(IdentityService) private readonly service: IdentityService) {}

  /** Prepare correlated no-store responses and expose a quoted current profile version when present. */
  private metadata(response: ServerResponse, version?: number): void {
    response.setHeader('X-Request-Id', randomUUID()); response.setHeader('Cache-Control', 'no-store');
    if (version !== undefined) response.setHeader('ETag', '"' + version + '"');
  }

  /** Validate challenge headers and issue its one-time provider nonce. */
  @Post('auth/challenges') @HttpCode(200)
  async challenge(@Req() request: WireRequest, @Res({ passthrough: true }) response: ServerResponse) {
    validateInput('createLoginChallenge', wireBody(request), request.headers); this.metadata(response); return this.service.challenge();
  }

  /** Validate the generated login shape and return exactly one existing-session/new-proof branch. */
  @Post('auth/sessions') @HttpCode(200)
  async login(@Body() body: components['schemas']['LoginInput'], @Req() request: WireRequest, @Res({ passthrough: true }) response: ServerResponse) {
    validateInput('login', body, request.headers); this.metadata(response); return this.service.login(body);
  }

  /** Validate named signup and its request key; return fresh session secrets only on this201 response. */
  @Post('auth/signups') @HttpCode(201)
  async signup(@Body() body: components['schemas']['CompleteSignupInput'], @Req() request: WireRequest, @Headers('idempotency-key') key: string, @Res({ passthrough: true }) response: ServerResponse) {
    validateInput('completeSignup', body, request.headers); this.metadata(response); return this.service.signup(body, key.toLowerCase());
  }

  /** Validate installation-bound refresh and rotate once; reused credentials revoke their family. */
  @Post('auth/sessions/refresh') @HttpCode(200)
  async refresh(@Body() body: components['schemas']['RefreshInput'], @Req() request: WireRequest, @Res({ passthrough: true }) response: ServerResponse) {
    validateInput('refreshSession', body, request.headers); this.metadata(response); return this.service.refresh(body);
  }

  /** Revoke this authenticated mobile session and its current installation connection. */
  @Delete('auth/sessions/current') @UseGuards(MobileSessionGuard)
  async logout(@Req() request: WireRequest, @Res({ passthrough: true }) response: ServerResponse) {
    validateInput('logout', wireBody(request), request.headers); this.metadata(response); return this.service.logout(bearer(request));
  }

  /** Return the authorized self projection with its optimistic version ETag. */
  @Get('me') @UseGuards(MobileSessionGuard)
  async me(@Req() request: WireRequest, @Res({ passthrough: true }) response: ServerResponse) {
    const result = await this.service.getProfile(bearer(request)); this.metadata(response, result.version); return result;
  }

  /** Apply the generated name patch with version and request-key validation; image changes await011. */
  @Patch('me') @UseGuards(MobileSessionGuard)
  async edit(@Body() body: components['schemas']['ProfileInput'], @Req() request: WireRequest, @Headers('idempotency-key') key: string, @Headers('if-match') match: string, @Res({ passthrough: true }) response: ServerResponse) {
    validateInput('editMyProfile', body, request.headers);
    const version = Number(match.slice(1, -1)); if (!Number.isSafeInteger(version)) throw invalid('If-Match');
    const result = await this.service.editProfile(bearer(request), body, version, key.toLowerCase()); this.metadata(response, result.version); return result;
  }
}
