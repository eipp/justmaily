(()=>{var e={};e.id=48,e.ids=[48],e.modules={2934:e=>{"use strict";e.exports=require("next/dist/client/components/action-async-storage.external.js")},4580:e=>{"use strict";e.exports=require("next/dist/client/components/request-async-storage.external.js")},5869:e=>{"use strict";e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},399:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},7691:(e,t,r)=>{"use strict";r.r(t),r.d(t,{GlobalError:()=>o.a,__next_app__:()=>p,originalPathname:()=>u,pages:()=>c,routeModule:()=>m,tree:()=>l}),r(1397),r(1506),r(5866);var s=r(3191),a=r(8716),n=r(7922),o=r.n(n),i=r(5231),d={};for(let e in i)0>["default","tree","pages","GlobalError","originalPathname","__next_app__","routeModule"].indexOf(e)&&(d[e]=()=>i[e]);r.d(t,d);let l=["",{children:["auth",{children:["reset-password",{children:["__PAGE__",{},{page:[()=>Promise.resolve().then(r.bind(r,1397)),"/Users/ivanpeychev/Projects/MindburnLabs/justmaily/apps/maily-web/app/auth/reset-password/page.tsx"]}]},{}]},{}]},{layout:[()=>Promise.resolve().then(r.t.bind(r,1506,23)),"/Users/ivanpeychev/Projects/MindburnLabs/justmaily/apps/maily-web/app/layout.tsx"],"not-found":[()=>Promise.resolve().then(r.t.bind(r,5866,23)),"next/dist/client/components/not-found-error"]}],c=["/Users/ivanpeychev/Projects/MindburnLabs/justmaily/apps/maily-web/app/auth/reset-password/page.tsx"],u="/auth/reset-password/page",p={require:r,loadChunk:()=>Promise.resolve()},m=new s.AppPageRouteModule({definition:{kind:a.x.APP_PAGE,page:"/auth/reset-password/page",pathname:"/auth/reset-password",bundlePath:"",filename:"",appPaths:[]},userland:{loaderTree:l}})},5290:(e,t,r)=>{Promise.resolve().then(r.bind(r,3745))},3745:(e,t,r)=>{"use strict";r.r(t),r.d(t,{default:()=>i});var s=r(326),a=r(7577),n=r(5047);(function(){var e=Error("Cannot find module '@/lib/providers/supabase'");throw e.code="MODULE_NOT_FOUND",e})(),function(){var e=Error("Cannot find module '@/components/ui/button'");throw e.code="MODULE_NOT_FOUND",e}(),function(){var e=Error("Cannot find module '@/components/ui/input'");throw e.code="MODULE_NOT_FOUND",e}();var o=r(6333);function i(){let e=(0,n.useRouter)(),{resetPassword:t}=Object(function(){var e=Error("Cannot find module '@/lib/providers/supabase'");throw e.code="MODULE_NOT_FOUND",e}())(),[r,i]=(0,a.useState)(!1),[d,l]=(0,a.useState)(null),[c,u]=(0,a.useState)(!1),[p,m]=(0,a.useState)(""),x=async e=>{e.preventDefault(),i(!0),l(null),u(!1);try{await t(p),u(!0)}catch(e){l("Failed to send reset password email")}finally{i(!1)}};return s.jsx("div",{className:"flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900",children:(0,s.jsxs)("div",{className:"w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-lg dark:bg-gray-800",children:[(0,s.jsxs)("div",{className:"text-center",children:[s.jsx("h2",{className:"text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100",children:"Reset your password"}),s.jsx("p",{className:"mt-2 text-sm text-gray-600 dark:text-gray-400",children:"Enter your email address and we'll send you a link to reset your password."})]}),(0,s.jsxs)("div",{className:"space-y-6",children:[c?s.jsx("div",{className:"rounded-md bg-green-50 p-4 dark:bg-green-900/50",children:s.jsx("p",{className:"text-sm text-green-800 dark:text-green-200",children:"Check your email for a link to reset your password. If it doesn't appear within a few minutes, check your spam folder."})}):(0,s.jsxs)("form",{onSubmit:x,className:"space-y-4",children:[(0,s.jsxs)("div",{children:[s.jsx("label",{htmlFor:"email",className:"block text-sm font-medium text-gray-700 dark:text-gray-300",children:"Email address"}),s.jsx(Object(function(){var e=Error("Cannot find module '@/components/ui/input'");throw e.code="MODULE_NOT_FOUND",e}()),{id:"email",type:"email",value:p,onChange:e=>m(e.target.value),required:!0,className:"mt-1",placeholder:"you@example.com",disabled:r})]}),d&&s.jsx("div",{className:"rounded-md bg-red-50 p-4 dark:bg-red-900/50",children:s.jsx("p",{className:"text-sm text-red-800 dark:text-red-200",children:d})}),s.jsx(Object(function(){var e=Error("Cannot find module '@/components/ui/button'");throw e.code="MODULE_NOT_FOUND",e}()),{type:"submit",className:"w-full",disabled:r,children:r?"Sending reset link...":"Send reset link"})]}),s.jsx("div",{className:"text-center",children:(0,s.jsxs)(Object(function(){var e=Error("Cannot find module '@/components/ui/button'");throw e.code="MODULE_NOT_FOUND",e}()),{variant:"link",onClick:()=>e.push("/auth/signin"),className:"inline-flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100",children:[s.jsx(o.Z,{className:"mr-2 h-4 w-4"}),"Back to sign in"]})})]})]})})}},1397:(e,t,r)=>{"use strict";r.r(t),r.d(t,{default:()=>s});let s=(0,r(8570).createProxy)(String.raw`/Users/ivanpeychev/Projects/MindburnLabs/justmaily/apps/maily-web/app/auth/reset-password/page.tsx#default`)}};var t=require("../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),s=t.X(0,[254,781,57,991,641,928,688,865,297],()=>r(7691));module.exports=s})();