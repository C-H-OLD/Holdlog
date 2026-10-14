import { readFileSync,statSync } from 'node:fs';
import { isAbsolute } from 'node:path';
import { X509Certificate,createPublicKey } from 'node:crypto';
import { createSecureContext } from 'node:tls';

/**
 * Load explicitly opted-in local TLS files in Node only. Require localhost/loopback SAN, current validity,
 * matching key and private key permissions. Reject partial settings with names only, never values/paths/PEM.
 * This validates the certificate, not its installation in a browser/system trust store.
 */
export function readDevelopmentHttps(env:Record<string,string|undefined>):{cert:Buffer;key:Buffer}|undefined {
  const enabled=env.ADMIN_DEV_AUTH_CHECK;
  if(enabled!==undefined&&!['true','false'].includes(enabled))throw new Error('Missing or invalid setting: ADMIN_DEV_AUTH_CHECK');
  if(enabled!=='true') {
    if(env.ADMIN_DEV_TLS_CERT||env.ADMIN_DEV_TLS_KEY)throw new Error('Missing or invalid setting: ADMIN_DEV_AUTH_CHECK');
    return undefined;
  }
  try {
    const certificatePath=env.ADMIN_DEV_TLS_CERT,keyPath=env.ADMIN_DEV_TLS_KEY;
    if(!certificatePath||!keyPath||!isAbsolute(certificatePath)||!isAbsolute(keyPath)||(statSync(keyPath).mode&0o077)!==0)throw new Error('Invalid TLS settings');
    const cert=readFileSync(certificatePath),key=readFileSync(keyPath),parsed=new X509Certificate(cert),now=Date.now();
    if(!parsed.checkHost('localhost')||!parsed.checkIP('127.0.0.1')||Date.parse(parsed.validFrom)>now||Date.parse(parsed.validTo)<=now)throw new Error('Invalid certificate');
    const publicKey=createPublicKey(key).export({type:'spki',format:'der'}),certificateKey=parsed.publicKey.export({type:'spki',format:'der'});
    if(!publicKey.equals(certificateKey))throw new Error('Mismatched TLS key');
    createSecureContext({cert,key});return {cert,key};
  } catch {throw new Error('Missing or invalid settings: ADMIN_DEV_TLS_CERT, ADMIN_DEV_TLS_KEY');}
}
