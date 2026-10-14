import { createElement,useState } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from '../providers/AuthProvider.tsx';
import { useAdminAuth } from '../hooks/useAdminAuth.ts';
import { createAdminAuthApi,AdminAuthError } from '../api/auth.ts';
import { AdminAuthStore } from '../providers/adminAuthStore.ts';

/** Development-only controls exercise the real Provider; outputs contain categories, never session/CSRF/password data. */
function AdminAuthCheck() {
  const {store,snapshot}=useAdminAuth(),[result,setResult]=useState('ready');
  /** Render a safe result category and contain asynchronous failures without logging arbitrary payloads. */
  async function run(work:()=>Promise<void>):Promise<void> {setResult('pending');try {await work();setResult('completed');}catch(error){setResult(error instanceof AdminAuthError?error.kind:'failed');}}
  /** Read the password only for this request and clear its input before awaiting network work. */
  function login(event:React.SubmitEvent<HTMLFormElement>):void {
    event.preventDefault();const form=event.currentTarget,loginId=(form.elements.namedItem('loginId') as HTMLInputElement).value,passwordInput=form.elements.namedItem('password') as HTMLInputElement,password=passwordInput.value;passwordInput.value='';
    void run(()=>store.login({loginId,password},crypto.randomUUID()));
  }
  return createElement('main',{},
    createElement('h1',{},'개발 관리자 인증 검사'),
    createElement('p',{},'개발 전용 HTTPS 검사 도구. 제품 로그인 화면이 아닙니다.'),
    createElement('form',{onSubmit:login,autoComplete:'off'},
      createElement('label',{},'loginId ',createElement('input',{name:'loginId',required:true,autoComplete:'off'})),
      createElement('label',{},' password ',createElement('input',{name:'password',type:'password',required:true,autoComplete:'off'})),
      createElement('button',{type:'submit'},'로그인 검사')),
    createElement('button',{type:'button',onClick:()=>{void run(()=>store.check());}},'세션 재조회'),
    createElement('button',{type:'button',onClick:()=>{void run(()=>store.logout(crypto.randomUUID()));}},'로그아웃 검사'),
    createElement('p',{},'상태: ',createElement('output',{'aria-label':'세션 상태'},snapshot.status)),
    createElement('p',{},'결과: ',createElement('output',{'aria-label':'검사 결과','aria-live':'polite'},snapshot.failure?[snapshot.failure.kind,snapshot.failure.status,snapshot.failure.code].filter(value=>value!==null).join(':'):result)));
}

if(import.meta.env.DEV&&location.protocol==='https:'&&['localhost','127.0.0.1'].includes(location.hostname)) {
  const container=document.getElementById('admin-auth-check');if(!container)throw new Error('Missing development check root');
  const store=new AdminAuthStore(createAdminAuthApi()),root=createRoot(container);
  root.render(createElement(AuthProvider,{store,children:createElement(AdminAuthCheck)}));
  import.meta.hot?.dispose(()=>{root.unmount();});
}
