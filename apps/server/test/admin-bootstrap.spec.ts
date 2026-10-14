import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseBootstrapArguments, readHiddenPassword } from '../src/tools/admin-bootstrap-input.js';
import { PassThrough } from 'node:stream';

void test('bootstrap accepts explicit create/versioned replacement and refuses secret arguments or unsafe versions',()=>{
  assert.deepEqual(parseBootstrapArguments(['create','fixture']),{operation:'create',loginId:'fixture'});
  assert.deepEqual(parseBootstrapArguments(['replace','fixture','--expected-version','3']),{operation:'replace',loginId:'fixture',version:3});
  for(const args of [[],['create','fixture','secret'],['replace','fixture'],['replace','fixture','--expected-version','0'],['replace','fixture','--expected-version','1e2'],['replace','fixture','--expected-version','9007199254740992']]) assert.throws(()=>parseBootstrapArguments(args));
});

void test('hidden password input never echoes data and restores terminal state on success/cancel',async()=>{
  for(const cancel of [false,true]) {
    const input=Object.assign(new PassThrough(),{isTTY:true,isRaw:false,setRawMode(value:boolean){this.isRaw=value;return this;}}),output=Object.assign(new PassThrough(),{isTTY:true});
    let printed=''; output.on('data',(chunk:Buffer)=>{printed+=chunk.toString();});
    const pending=readHiddenPassword(input,output);
    input.write(cancel?'sensitive-fixture\u0003':'sensitive-fixture\r');
    if(cancel) await assert.rejects(pending);else assert.equal(await pending,'sensitive-fixture');
    assert.equal(printed.includes('sensitive-fixture'),false);assert.equal(input.isRaw,false);assert.equal(input.isPaused(),true);assert.equal(input.listenerCount('data'),0);
    input.destroy();output.destroy();
  }
});

void test('hidden input decodes split UTF-8 and rejects nonterminal streams without consuming data',async()=>{
  const input=Object.assign(new PassThrough(),{isTTY:true,isRaw:false,setRawMode(value:boolean){this.isRaw=value;return this;}}),output=Object.assign(new PassThrough(),{isTTY:true});
  const pending=readHiddenPassword(input,output),encoded=Buffer.from('암호');input.write(encoded.subarray(0,2));input.write(encoded.subarray(2));input.write('\r');assert.equal(await pending,'암호');input.destroy();output.destroy();
  const pipe=new PassThrough();await assert.rejects(readHiddenPassword(pipe,pipe),{message:'TTY_REQUIRED'});assert.equal(pipe.listenerCount('data'),0);pipe.destroy();
});
