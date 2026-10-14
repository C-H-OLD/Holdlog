import { StringDecoder } from 'node:string_decoder';
export type BootstrapArguments={operation:'create';loginId:string}|{operation:'replace';loginId:string;version:number};
interface SecretInput extends NodeJS.ReadableStream {isTTY?:boolean;isRaw?:boolean;readableFlowing?:boolean|null;setRawMode?(value:boolean):unknown}
interface SecretOutput extends NodeJS.WritableStream {isTTY?:boolean}

/** Parse only operation/identifier/version arguments; no password argument, environment variable or pipe fallback exists. */
export function parseBootstrapArguments(args:string[]):BootstrapArguments {
  const [operation,loginId,flag,version]=args;
  if(!loginId?.length) throw new Error('INVALID_ARGUMENTS');
  if(operation==='create'&&args.length===2) return {operation,loginId};
  if(operation==='replace'&&args.length===4&&flag==='--expected-version'&&/^[1-9][0-9]*$/.test(version??'')&&Number.isSafeInteger(Number(version))) return {operation,loginId,version:Number(version)};
  throw new Error('INVALID_ARGUMENTS');
}

/**
 * Read a password from a real raw terminal without echo; restore raw/pause state and listeners on every outcome.
 * Reject non-TTY pipes, EOF, Ctrl-C/Ctrl-D and process termination with fixed errors; never output the input.
 */
export async function readHiddenPassword(input:SecretInput,output:SecretOutput,prompt='Password: '):Promise<string> {
  if(!input.isTTY||!output.isTTY||!input.setRawMode) throw new Error('TTY_REQUIRED');
  const raw=input.isRaw??false,paused=input.isPaused()||input.readableFlowing!==true,setRawMode=input.setRawMode.bind(input);let value='';const decoder=new StringDecoder('utf8');
  let onData:(chunk:Buffer|string)=>void=()=>undefined;
  let cancel:()=>void=()=>undefined;
  try {
    setRawMode(true);output.write(prompt);
    return await new Promise<string>((resolve,reject)=>{
      /** Abort with a safe category instead of leaking terminal data or an underlying stream error. */
      cancel=()=>{reject(new Error('INPUT_CANCELLED'));};
      /** Consume raw input without echo; handle backspace and completion locally rather than through readline output. */
      onData=(chunk)=>{
        for(const character of typeof chunk==='string'?chunk:decoder.write(chunk)) {
          if(character==='\u0003'||character==='\u0004'){cancel();return;}
          if(character==='\r'||character==='\n'){resolve(value);return;}
          if(character==='\u007f'||character==='\b') value=Array.from(value).slice(0,-1).join('');
          else if(character>=' '&&character!=='\u001b') value+=character;
        }
      };
      input.on('data',onData);input.once('end',cancel);input.once('error',cancel);
      process.once('SIGTERM',cancel);process.once('SIGHUP',cancel);input.resume();
    });
  } finally {
    input.removeListener('data',onData);input.removeListener('end',cancel);input.removeListener('error',cancel);
    process.removeListener('SIGTERM',cancel);process.removeListener('SIGHUP',cancel);
    setRawMode(raw);if(paused) input.pause();output.write('\n');value='';
  }
}
