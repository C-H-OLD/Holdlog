import { loadConfiguration } from '../config/environment.js';
import { createDatabase } from '../database/pool.js';
import { AdministratorBootstrap, BootstrapError } from '../modules/identity/admin-bootstrap.service.js';
import { parseBootstrapArguments, readHiddenPassword } from './admin-bootstrap-input.js';

/** Validate target configuration before hidden input, then perform exactly one create/explicit replacement and close the DB. */
async function main():Promise<void> {
  const args=parseBootstrapArguments(process.argv.slice(2)),config=loadConfiguration();
  const password=await readHiddenPassword(process.stdin,process.stderr),confirmation=await readHiddenPassword(process.stdin,process.stderr,'Confirm password: ');
  if(!password||password!==confirmation) throw new Error('PASSWORD_CONFIRMATION_FAILED');
  const db=createDatabase(config);
  try {
    const bootstrap=new AdministratorBootstrap(db);
    const result=args.operation==='create'?await bootstrap.create(args.loginId,password):await bootstrap.replace(args.loginId,password,args.version);
    console.info(JSON.stringify({operation:args.operation,result:'completed',version:result.version}));
  } finally {db.close();}
}
await main().catch((error:unknown)=>{
  if(error instanceof BootstrapError) console.error(error.code);
  else if(error instanceof Error&&/^Missing or invalid settings: [A-Z_, ]+$/.test(error.message)) console.error(error.message);
  else if(error instanceof Error&&['INVALID_ARGUMENTS','TTY_REQUIRED','INPUT_CANCELLED','PASSWORD_CONFIRMATION_FAILED'].includes(error.message)) console.error(error.message);
  else console.error('ADMIN_BOOTSTRAP_FAILED');
  process.exitCode=1;
});
