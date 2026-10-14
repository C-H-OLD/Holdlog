import { argon2id, hash, verify } from 'argon2';

export interface PasswordCodec { hash(password:string):Promise<string>; verify(digest:string,password:string):Promise<boolean> }

/** Generate independent salts with the pinned Argon2id cost; never log input or the encoded hash. */
export async function hashAdministratorPassword(password:string):Promise<string> {
  return hash(password,{type:argon2id,memoryCost:65536,timeCost:3,parallelism:4});
}

/** Verify a PHC hash using the Argon2 library; malformed storage/worker errors propagate to safe adapters. */
export async function verifyAdministratorPassword(digest:string,password:string):Promise<boolean> { return verify(digest,password); }

export const administratorPasswords:PasswordCodec={hash:hashAdministratorPassword,verify:verifyAdministratorPassword};
