(()=>{var e={};e.id=2616,e.ids=[2616],e.modules={72934:e=>{"use strict";e.exports=require("next/dist/client/components/action-async-storage.external.js")},54580:e=>{"use strict";e.exports=require("next/dist/client/components/request-async-storage.external.js")},45869:e=>{"use strict";e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},20399:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},1901:(e,a,t)=>{"use strict";t.r(a),t.d(a,{GlobalError:()=>l.a,__next_app__:()=>m,originalPathname:()=>u,pages:()=>o,routeModule:()=>x,tree:()=>c}),t(28570),t(11506),t(35866);var s=t(23191),r=t(88716),i=t(37922),l=t.n(i),n=t(95231),d={};for(let e in n)0>["default","tree","pages","GlobalError","originalPathname","__next_app__","routeModule"].indexOf(e)&&(d[e]=()=>n[e]);t.d(a,d);let c=["",{children:["auth",{children:["verify-email",{children:["__PAGE__",{},{page:[()=>Promise.resolve().then(t.bind(t,28570)),"/Users/ivanpeychev/Projects/MindburnLabs/justmaily/apps/maily-web/app/auth/verify-email/page.tsx"]}]},{}]},{}]},{layout:[()=>Promise.resolve().then(t.bind(t,11506)),"/Users/ivanpeychev/Projects/MindburnLabs/justmaily/apps/maily-web/app/layout.tsx"],"not-found":[()=>Promise.resolve().then(t.t.bind(t,35866,23)),"next/dist/client/components/not-found-error"]}],o=["/Users/ivanpeychev/Projects/MindburnLabs/justmaily/apps/maily-web/app/auth/verify-email/page.tsx"],u="/auth/verify-email/page",m={require:t,loadChunk:()=>Promise.resolve()},x=new s.AppPageRouteModule({definition:{kind:r.x.APP_PAGE,page:"/auth/verify-email/page",pathname:"/auth/verify-email",bundlePath:"",filename:"",appPaths:[]},userland:{loaderTree:c}})},63633:(e,a,t)=>{Promise.resolve().then(t.bind(t,79681))},79681:(e,a,t)=>{"use strict";t.r(a),t.d(a,{default:()=>o});var s=t(10326),r=t(17577),i=t(35047),l=t(49835),n=t(90772),d=t(5932),c=t(86333);function o(){let e=(0,i.useRouter)(),{user:a,signOut:t}=(0,l.$4)(),[o,u]=(0,r.useState)(!1),[m,x]=(0,r.useState)(null),[p,h]=(0,r.useState)(!1),y=async()=>{u(!0),x(null),h(!1);try{h(!0)}catch(e){x("Failed to resend verification email")}finally{u(!1)}},g=async()=>{await t(),e.push("/auth/signin")};return s.jsx("div",{className:"flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900",children:(0,s.jsxs)("div",{className:"w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-lg dark:bg-gray-800",children:[(0,s.jsxs)("div",{className:"text-center",children:[s.jsx("div",{className:"mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900",children:s.jsx(d.Z,{className:"h-6 w-6 text-blue-600 dark:text-blue-400"})}),s.jsx("h2",{className:"mt-4 text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100",children:"Verify your email"}),(0,s.jsxs)("p",{className:"mt-2 text-sm text-gray-600 dark:text-gray-400",children:["We sent a verification link to"," ",s.jsx("span",{className:"font-medium text-gray-900 dark:text-gray-100",children:a?.email}),". Click the link to verify your email address."]})]}),(0,s.jsxs)("div",{className:"space-y-6",children:[m&&s.jsx("div",{className:"rounded-md bg-red-50 p-4 dark:bg-red-900/50",children:s.jsx("p",{className:"text-sm text-red-800 dark:text-red-200",children:m})}),p&&s.jsx("div",{className:"rounded-md bg-green-50 p-4 dark:bg-green-900/50",children:s.jsx("p",{className:"text-sm text-green-800 dark:text-green-200",children:"A new verification email has been sent. Please check your inbox."})}),(0,s.jsxs)("div",{className:"flex flex-col space-y-4",children:[s.jsx(n.z,{onClick:y,disabled:o,className:"w-full",children:o?"Resending...":"Resend verification email"}),(0,s.jsxs)("div",{className:"relative",children:[s.jsx("div",{className:"absolute inset-0 flex items-center",children:s.jsx("div",{className:"w-full border-t border-gray-300 dark:border-gray-600"})}),s.jsx("div",{className:"relative flex justify-center text-sm",children:s.jsx("span",{className:"bg-white px-2 text-gray-500 dark:bg-gray-800 dark:text-gray-400",children:"or"})})]}),(0,s.jsxs)(n.z,{variant:"outline",onClick:g,className:"w-full",children:[s.jsx(c.Z,{className:"mr-2 h-4 w-4"}),"Sign out and try another email"]})]})]})]})})}},28570:(e,a,t)=>{"use strict";t.r(a),t.d(a,{default:()=>s});let s=(0,t(68570).createProxy)(String.raw`/Users/ivanpeychev/Projects/MindburnLabs/justmaily/apps/maily-web/app/auth/verify-email/page.tsx#default`)}};var a=require("../../../webpack-runtime.js");a.C(e);var t=e=>a(a.s=e),s=a.X(0,[632,110,781,8057,4991,641,928,688,6865,2385],()=>t(1901));module.exports=s})();