(()=>{var e={};e.id=5271,e.ids=[5271],e.modules={72934:e=>{"use strict";e.exports=require("next/dist/client/components/action-async-storage.external.js")},54580:e=>{"use strict";e.exports=require("next/dist/client/components/request-async-storage.external.js")},45869:e=>{"use strict";e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},20399:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},77618:(e,a,t)=>{"use strict";t.r(a),t.d(a,{GlobalError:()=>i.a,__next_app__:()=>m,originalPathname:()=>u,pages:()=>o,routeModule:()=>x,tree:()=>c}),t(80197),t(11506),t(35866);var s=t(23191),r=t(88716),l=t(37922),i=t.n(l),n=t(95231),d={};for(let e in n)0>["default","tree","pages","GlobalError","originalPathname","__next_app__","routeModule"].indexOf(e)&&(d[e]=()=>n[e]);t.d(a,d);let c=["",{children:["auth",{children:["signup",{children:["__PAGE__",{},{page:[()=>Promise.resolve().then(t.bind(t,80197)),"/Users/ivanpeychev/Projects/MindburnLabs/justmaily/apps/maily-web/app/auth/signup/page.tsx"]}]},{}]},{}]},{layout:[()=>Promise.resolve().then(t.bind(t,11506)),"/Users/ivanpeychev/Projects/MindburnLabs/justmaily/apps/maily-web/app/layout.tsx"],"not-found":[()=>Promise.resolve().then(t.t.bind(t,35866,23)),"next/dist/client/components/not-found-error"]}],o=["/Users/ivanpeychev/Projects/MindburnLabs/justmaily/apps/maily-web/app/auth/signup/page.tsx"],u="/auth/signup/page",m={require:t,loadChunk:()=>Promise.resolve()},x=new s.AppPageRouteModule({definition:{kind:r.x.APP_PAGE,page:"/auth/signup/page",pathname:"/auth/signup",bundlePath:"",filename:"",appPaths:[]},userland:{loaderTree:c}})},37295:(e,a,t)=>{Promise.resolve().then(t.bind(t,82173))},82173:(e,a,t)=>{"use strict";t.r(a),t.d(a,{default:()=>m});var s={};t.r(s);var r=t(10326),l=t(17577),i=t(35047),n=t(49835),d=t(90772),c=t(54432),o=t(12893),u=t(77863);function m(){let e=(0,i.useRouter)(),{signUp:a}=(0,n.$4)(),[t,m]=(0,l.useState)(!1),[x,p]=(0,l.useState)(null),[h,g]=(0,l.useState)(""),[y,b]=(0,l.useState)(""),[v,j]=(0,l.useState)(""),f=async t=>{t.preventDefault(),m(!0),p(null);try{await a(h,y,{full_name:v}),e.push("/auth/verify-email")}catch(e){p("Failed to create account")}finally{m(!1)}},N=async t=>{m(!0),p(null);try{await a(t),e.push("/dashboard")}catch(e){p(`Failed to sign up with ${t}`)}finally{m(!1)}};return r.jsx("div",{className:"flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900",children:(0,r.jsxs)("div",{className:"w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-lg dark:bg-gray-800",children:[(0,r.jsxs)("div",{className:"text-center",children:[r.jsx("h2",{className:"text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100",children:"Create your account"}),(0,r.jsxs)("p",{className:"mt-2 text-sm text-gray-600 dark:text-gray-400",children:["Already have an account?"," ",r.jsx("a",{href:"/auth/signin",className:"font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300",children:"Sign in"})]})]}),(0,r.jsxs)("div",{className:"space-y-6",children:[(0,r.jsxs)("form",{onSubmit:f,className:"space-y-4",children:[(0,r.jsxs)("div",{children:[r.jsx("label",{htmlFor:"fullName",className:"block text-sm font-medium text-gray-700 dark:text-gray-300",children:"Full name"}),r.jsx(c.I,{id:"fullName",type:"text",value:v,onChange:e=>j(e.target.value),required:!0,className:"mt-1",placeholder:"John Doe",disabled:t})]}),(0,r.jsxs)("div",{children:[r.jsx("label",{htmlFor:"email",className:"block text-sm font-medium text-gray-700 dark:text-gray-300",children:"Email address"}),r.jsx(c.I,{id:"email",type:"email",value:h,onChange:e=>g(e.target.value),required:!0,className:"mt-1",placeholder:"you@example.com",disabled:t})]}),(0,r.jsxs)("div",{children:[r.jsx("label",{htmlFor:"password",className:"block text-sm font-medium text-gray-700 dark:text-gray-300",children:"Password"}),r.jsx(c.I,{id:"password",type:"password",value:y,onChange:e=>b(e.target.value),required:!0,className:"mt-1",disabled:t}),r.jsx("p",{className:"mt-1 text-xs text-gray-500 dark:text-gray-400",children:"Must be at least 8 characters long"})]}),x&&r.jsx("div",{className:"rounded-md bg-red-50 p-4 dark:bg-red-900/50",children:r.jsx("p",{className:"text-sm text-red-800 dark:text-red-200",children:x})}),r.jsx(d.z,{type:"submit",className:"w-full",disabled:t,children:t?"Creating account...":"Create account"})]}),(0,r.jsxs)("div",{className:"relative",children:[r.jsx("div",{className:"absolute inset-0 flex items-center",children:r.jsx("div",{className:"w-full border-t border-gray-300 dark:border-gray-600"})}),r.jsx("div",{className:"relative flex justify-center text-sm",children:r.jsx("span",{className:"bg-white px-2 text-gray-500 dark:bg-gray-800 dark:text-gray-400",children:"Or continue with"})})]}),(0,r.jsxs)("div",{className:"grid grid-cols-2 gap-3",children:[(0,r.jsxs)(d.z,{type:"button",variant:"outline",onClick:()=>N("github"),disabled:t,className:(0,u.cn)("w-full",t&&"cursor-not-allowed opacity-50"),children:[r.jsx(o.Z,{className:"mr-2 h-4 w-4"}),"GitHub"]}),(0,r.jsxs)(d.z,{type:"button",variant:"outline",onClick:()=>N("google"),disabled:t,className:(0,u.cn)("w-full",t&&"cursor-not-allowed opacity-50"),children:[r.jsx(s.GoogleIcon,{className:"mr-2 h-4 w-4"}),"Google"]})]})]})]})})}},80197:(e,a,t)=>{"use strict";t.r(a),t.d(a,{default:()=>s});let s=(0,t(68570).createProxy)(String.raw`/Users/ivanpeychev/Projects/MindburnLabs/justmaily/apps/maily-web/app/auth/signup/page.tsx#default`)}};var a=require("../../../webpack-runtime.js");a.C(e);var t=e=>a(a.s=e),s=a.X(0,[632,110,781,8057,4991,641,928,688,6865,2385],()=>t(77618));module.exports=s})();