(()=>{var e={};e.id=2048,e.ids=[2048],e.modules={72934:e=>{"use strict";e.exports=require("next/dist/client/components/action-async-storage.external.js")},54580:e=>{"use strict";e.exports=require("next/dist/client/components/request-async-storage.external.js")},45869:e=>{"use strict";e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},20399:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},47691:(e,s,t)=>{"use strict";t.r(s),t.d(s,{GlobalError:()=>i.a,__next_app__:()=>p,originalPathname:()=>u,pages:()=>c,routeModule:()=>m,tree:()=>o}),t(61397),t(11506),t(35866);var a=t(23191),r=t(88716),n=t(37922),i=t.n(n),l=t(95231),d={};for(let e in l)0>["default","tree","pages","GlobalError","originalPathname","__next_app__","routeModule"].indexOf(e)&&(d[e]=()=>l[e]);t.d(s,d);let o=["",{children:["auth",{children:["reset-password",{children:["__PAGE__",{},{page:[()=>Promise.resolve().then(t.bind(t,61397)),"/Users/ivanpeychev/Projects/MindburnLabs/justmaily/apps/maily-web/app/auth/reset-password/page.tsx"]}]},{}]},{}]},{layout:[()=>Promise.resolve().then(t.bind(t,11506)),"/Users/ivanpeychev/Projects/MindburnLabs/justmaily/apps/maily-web/app/layout.tsx"],"not-found":[()=>Promise.resolve().then(t.t.bind(t,35866,23)),"next/dist/client/components/not-found-error"]}],c=["/Users/ivanpeychev/Projects/MindburnLabs/justmaily/apps/maily-web/app/auth/reset-password/page.tsx"],u="/auth/reset-password/page",p={require:t,loadChunk:()=>Promise.resolve()},m=new a.AppPageRouteModule({definition:{kind:r.x.APP_PAGE,page:"/auth/reset-password/page",pathname:"/auth/reset-password",bundlePath:"",filename:"",appPaths:[]},userland:{loaderTree:o}})},25290:(e,s,t)=>{Promise.resolve().then(t.bind(t,23745))},23745:(e,s,t)=>{"use strict";t.r(s),t.d(s,{default:()=>c});var a=t(10326),r=t(17577),n=t(35047),i=t(49835),l=t(90772),d=t(54432),o=t(86333);function c(){let e=(0,n.useRouter)(),{resetPassword:s}=(0,i.$4)(),[t,c]=(0,r.useState)(!1),[u,p]=(0,r.useState)(null),[m,x]=(0,r.useState)(!1),[h,g]=(0,r.useState)(""),y=async e=>{e.preventDefault(),c(!0),p(null),x(!1);try{await s(h),x(!0)}catch(e){p("Failed to send reset password email")}finally{c(!1)}};return a.jsx("div",{className:"flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900",children:(0,a.jsxs)("div",{className:"w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-lg dark:bg-gray-800",children:[(0,a.jsxs)("div",{className:"text-center",children:[a.jsx("h2",{className:"text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100",children:"Reset your password"}),a.jsx("p",{className:"mt-2 text-sm text-gray-600 dark:text-gray-400",children:"Enter your email address and we'll send you a link to reset your password."})]}),(0,a.jsxs)("div",{className:"space-y-6",children:[m?a.jsx("div",{className:"rounded-md bg-green-50 p-4 dark:bg-green-900/50",children:a.jsx("p",{className:"text-sm text-green-800 dark:text-green-200",children:"Check your email for a link to reset your password. If it doesn't appear within a few minutes, check your spam folder."})}):(0,a.jsxs)("form",{onSubmit:y,className:"space-y-4",children:[(0,a.jsxs)("div",{children:[a.jsx("label",{htmlFor:"email",className:"block text-sm font-medium text-gray-700 dark:text-gray-300",children:"Email address"}),a.jsx(d.I,{id:"email",type:"email",value:h,onChange:e=>g(e.target.value),required:!0,className:"mt-1",placeholder:"you@example.com",disabled:t})]}),u&&a.jsx("div",{className:"rounded-md bg-red-50 p-4 dark:bg-red-900/50",children:a.jsx("p",{className:"text-sm text-red-800 dark:text-red-200",children:u})}),a.jsx(l.z,{type:"submit",className:"w-full",disabled:t,children:t?"Sending reset link...":"Send reset link"})]}),a.jsx("div",{className:"text-center",children:(0,a.jsxs)(l.z,{variant:"link",onClick:()=>e.push("/auth/signin"),className:"inline-flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100",children:[a.jsx(o.Z,{className:"mr-2 h-4 w-4"}),"Back to sign in"]})})]})]})})}},61397:(e,s,t)=>{"use strict";t.r(s),t.d(s,{default:()=>a});let a=(0,t(68570).createProxy)(String.raw`/Users/ivanpeychev/Projects/MindburnLabs/justmaily/apps/maily-web/app/auth/reset-password/page.tsx#default`)}};var s=require("../../../webpack-runtime.js");s.C(e);var t=e=>s(s.s=e),a=s.X(0,[632,110,781,8057,4991,641,928,688,6865,2385],()=>t(47691));module.exports=a})();