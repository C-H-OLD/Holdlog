import type pg from 'pg';
import { withTransaction } from '../../database/transaction.js';
import { administratorPasswords, type PasswordCodec } from './admin-credentials.js';
import * as repository from './admin.repository.js';

/** Fixed CLI failure classification; no credential, principal input or SQL details are retained. */
export class BootstrapError extends Error {
  /** Expose only a safe failure code to the local operator. */
  constructor(readonly code:'INVALID_INPUT'|'ALREADY_EXISTS'|'NOT_FOUND'|'VERSION_CONFLICT') {super(code);}
}

/** Apply create-only and explicit versioned replacement; caller owns pool lifetime and secret input. */
export class AdministratorBootstrap {
  /** Inject the database and password adapter so hash failures can be tested before any mutation. */
  constructor(private readonly pool:pg.Pool,private readonly passwords:PasswordCodec=administratorPasswords) {}

  /** Create an active principal with a fresh Argon2id salt; duplicates roll back and preserve the existing row. */
  async create(loginId:string,password:string):Promise<{id:string;version:number}> {
    if (!loginId.length||!password.length) throw new BootstrapError('INVALID_INPUT');
    const digest=await this.passwords.hash(password);
    try {return await withTransaction(this.pool,client=>repository.createAdministrator(client,loginId,digest));}
    catch(error) {if (error&&typeof error==='object'&&'code' in error&&error.code==='23505') throw new BootstrapError('ALREADY_EXISTS'); throw error;}
  }

  /** Replace an existing principal only at the expected version, preserving active/id and atomically revoking sessions. */
  async replace(loginId:string,password:string,expectedVersion:number):Promise<{id:string;version:number}> {
    if (!loginId.length||!password.length||!Number.isSafeInteger(expectedVersion)||expectedVersion<1) throw new BootstrapError('INVALID_INPUT');
    const digest=await this.passwords.hash(password);
    return withTransaction(this.pool,async client=>{
      let principal=await repository.findAdministrator(client,loginId); if(!principal) throw new BootstrapError('NOT_FOUND');
      await repository.lockAdministrator(client,principal.id); principal=await repository.findAdministrator(client,loginId);
      if(!principal) throw new BootstrapError('NOT_FOUND');
      if(principal.version!==expectedVersion) throw new BootstrapError('VERSION_CONFLICT');
      return {id:principal.id,version:await repository.replaceAdministratorPassword(client,principal.id,digest)};
    });
  }
}
