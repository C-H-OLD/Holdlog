import type Database from 'better-sqlite3';
import { isUniqueViolation } from '../../database/errors.js';
import { withTransaction } from '../../database/transaction.js';
import { administratorPasswords, type PasswordCodec } from './admin-credentials.js';
import * as repository from './admin.repository.js';

/** Fixed CLI failure classification; no credential, principal input or SQL details are retained. */
export class BootstrapError extends Error {
  /** Expose only a safe failure code to the local operator. */
  constructor(readonly code:'INVALID_INPUT'|'ALREADY_EXISTS'|'NOT_FOUND'|'VERSION_CONFLICT') {super(code);}
}

/** Apply create-only and explicit versioned replacement; caller owns the connection lifetime and secret input. */
export class AdministratorBootstrap {
  /** Inject the database and password adapter so hash failures can be tested before any mutation. */
  constructor(private readonly db:Database.Database,private readonly passwords:PasswordCodec=administratorPasswords) {}

  /** Create an active principal with a fresh Argon2id salt; duplicates roll back and preserve the existing row. */
  async create(loginId:string,password:string):Promise<{id:string;version:number}> {
    if (!loginId.length||!password.length) throw new BootstrapError('INVALID_INPUT');
    const digest=await this.passwords.hash(password);
    try {return withTransaction(this.db,()=>repository.createAdministrator(this.db,loginId,digest));}
    catch(error) {if (isUniqueViolation(error)) throw new BootstrapError('ALREADY_EXISTS'); throw error;}
  }

  /** Replace an existing principal only at the expected version, preserving active/id and atomically revoking sessions. */
  async replace(loginId:string,password:string,expectedVersion:number):Promise<{id:string;version:number}> {
    if (!loginId.length||!password.length||!Number.isSafeInteger(expectedVersion)||expectedVersion<1) throw new BootstrapError('INVALID_INPUT');
    const digest=await this.passwords.hash(password);
    return withTransaction(this.db,()=>{
      let principal=repository.findAdministrator(this.db,loginId); if(!principal) throw new BootstrapError('NOT_FOUND');
      // The IMMEDIATE transaction replaced the principal row lock; the re-read keeps the former recheck order.
      principal=repository.findAdministrator(this.db,loginId);
      if(!principal) throw new BootstrapError('NOT_FOUND');
      if(principal.version!==expectedVersion) throw new BootstrapError('VERSION_CONFLICT');
      return {id:principal.id,version:repository.replaceAdministratorPassword(this.db,principal.id,digest)};
    });
  }
}
