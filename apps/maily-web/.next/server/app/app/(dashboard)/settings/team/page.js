(()=>{var e={};e.id=239,e.ids=[239],e.modules={2934:e=>{"use strict";e.exports=require("next/dist/client/components/action-async-storage.external.js")},4580:e=>{"use strict";e.exports=require("next/dist/client/components/request-async-storage.external.js")},5869:e=>{"use strict";e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},399:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},4410:(e,o,n)=>{"use strict";n.r(o),n.d(o,{GlobalError:()=>s.a,__next_app__:()=>u,originalPathname:()=>m,pages:()=>l,routeModule:()=>p,tree:()=>c}),n(2109),n(8804),n(6597),n(4432),n(5819),n(1506),n(5866);var t=n(3191),r=n(8716),a=n(7922),s=n.n(a),i=n(5231),d={};for(let e in i)0>["default","tree","pages","GlobalError","originalPathname","__next_app__","routeModule"].indexOf(e)&&(d[e]=()=>i[e]);n.d(o,d);let c=["",{children:["app",{children:["(dashboard)",{children:["settings",{children:["team",{children:["__PAGE__",{},{page:[()=>Promise.resolve().then(n.bind(n,2109)),"/Users/ivanpeychev/Projects/MindburnLabs/justmaily/apps/maily-web/app/app/(dashboard)/settings/team/page.tsx"]}]},{}]},{layout:[()=>Promise.resolve().then(n.bind(n,8804)),"/Users/ivanpeychev/Projects/MindburnLabs/justmaily/apps/maily-web/app/app/(dashboard)/settings/layout.tsx"]}]},{}]},{layout:[()=>Promise.resolve().then(n.bind(n,6597)),"/Users/ivanpeychev/Projects/MindburnLabs/justmaily/apps/maily-web/app/app/layout.tsx"],error:[()=>Promise.resolve().then(n.bind(n,4432)),"/Users/ivanpeychev/Projects/MindburnLabs/justmaily/apps/maily-web/app/app/error.tsx"],"not-found":[()=>Promise.resolve().then(n.bind(n,5819)),"/Users/ivanpeychev/Projects/MindburnLabs/justmaily/apps/maily-web/app/app/not-found.tsx"]}]},{layout:[()=>Promise.resolve().then(n.t.bind(n,1506,23)),"/Users/ivanpeychev/Projects/MindburnLabs/justmaily/apps/maily-web/app/layout.tsx"],"not-found":[()=>Promise.resolve().then(n.t.bind(n,5866,23)),"next/dist/client/components/not-found-error"]}],l=["/Users/ivanpeychev/Projects/MindburnLabs/justmaily/apps/maily-web/app/app/(dashboard)/settings/team/page.tsx"],m="/app/(dashboard)/settings/team/page",u={require:n,loadChunk:()=>Promise.resolve()},p=new t.AppPageRouteModule({definition:{kind:r.x.APP_PAGE,page:"/app/(dashboard)/settings/team/page",pathname:"/app/settings/team",bundlePath:"",filename:"",appPaths:[]},userland:{loaderTree:c}})},9256:(e,o,n)=>{Promise.resolve().then(n.bind(n,1545))},1545:(e,o,n)=>{"use strict";n.r(o),n.d(o,{default:()=>m});var t=n(326),r=n(7369),a=n(8468),s=n(7256);(function(){var e=Error("Cannot find module '@/components/ui/molecules/form/form'");throw e.code="MODULE_NOT_FOUND",e})(),function(){var e=Error("Cannot find module '@/components/ui/atoms/input'");throw e.code="MODULE_NOT_FOUND",e}(),function(){var e=Error("Cannot find module '@/components/ui/atoms/button'");throw e.code="MODULE_NOT_FOUND",e}(),function(){var e=Error("Cannot find module '@/components/ui/atoms/separator'");throw e.code="MODULE_NOT_FOUND",e}(),function(){var e=Error("Cannot find module '@/components/ui/molecules/data-table/data-table'");throw e.code="MODULE_NOT_FOUND",e}(),function(){var e=Error("Cannot find module '@/components/ui/atoms/avatar'");throw e.code="MODULE_NOT_FOUND",e}(),function(){var e=Error("Cannot find module '@/components/ui/atoms/badge'");throw e.code="MODULE_NOT_FOUND",e}(),function(){var e=Error("Cannot find module '@/lib/api/client'");throw e.code="MODULE_NOT_FOUND",e}(),function(){var e=Error("Cannot find module '@/components/ui/atoms/use-toast'");throw e.code="MODULE_NOT_FOUND",e}(),function(){var e=Error("Cannot find module '@/components/ui/atoms/dropdown-menu'");throw e.code="MODULE_NOT_FOUND",e}();var i=n(9216),d=n(7311);let c=s.z.object({email:s.z.string().email("Invalid email address"),role:s.z.enum(["admin","member"])}),l=[{accessorKey:"fullName",header:"Name",cell:({row:e})=>{let o=e.original;return(0,t.jsxs)("div",{className:"flex items-center gap-x-3",children:[(0,t.jsxs)(Object(function(){var e=Error("Cannot find module '@/components/ui/atoms/avatar'");throw e.code="MODULE_NOT_FOUND",e}()),{children:[t.jsx(Object(function(){var e=Error("Cannot find module '@/components/ui/atoms/avatar'");throw e.code="MODULE_NOT_FOUND",e}()),{src:o.avatarUrl,alt:o.fullName}),t.jsx(Object(function(){var e=Error("Cannot find module '@/components/ui/atoms/avatar'");throw e.code="MODULE_NOT_FOUND",e}()),{children:o.fullName.charAt(0).toUpperCase()})]}),(0,t.jsxs)("div",{children:[t.jsx("div",{className:"font-medium",children:o.fullName}),t.jsx("div",{className:"text-sm text-muted-foreground",children:o.email})]})]})}},{accessorKey:"role",header:"Role",cell:({row:e})=>{let o=e.getValue("role");return t.jsx(Object(function(){var e=Error("Cannot find module '@/components/ui/atoms/badge'");throw e.code="MODULE_NOT_FOUND",e}()),{variant:"owner"===o?"default":"admin"===o?"secondary":"outline",children:o})}},{accessorKey:"joinedAt",header:"Joined",cell:({row:e})=>(0,d.Z)(new Date(e.getValue("joinedAt")),{addSuffix:!0})},{accessorKey:"lastActive",header:"Last Active",cell:({row:e})=>(0,d.Z)(new Date(e.getValue("lastActive")),{addSuffix:!0})},{id:"actions",cell:({row:e})=>{let o=e.original;return(0,t.jsxs)(Object(function(){var e=Error("Cannot find module '@/components/ui/atoms/dropdown-menu'");throw e.code="MODULE_NOT_FOUND",e}()),{children:[t.jsx(Object(function(){var e=Error("Cannot find module '@/components/ui/atoms/dropdown-menu'");throw e.code="MODULE_NOT_FOUND",e}()),{asChild:!0,children:(0,t.jsxs)(Object(function(){var e=Error("Cannot find module '@/components/ui/atoms/button'");throw e.code="MODULE_NOT_FOUND",e}()),{variant:"ghost",className:"h-8 w-8 p-0",children:[t.jsx("span",{className:"sr-only",children:"Open menu"}),t.jsx(i.Z,{className:"h-4 w-4"})]})}),(0,t.jsxs)(Object(function(){var e=Error("Cannot find module '@/components/ui/atoms/dropdown-menu'");throw e.code="MODULE_NOT_FOUND",e}()),{align:"end",children:[t.jsx(Object(function(){var e=Error("Cannot find module '@/components/ui/atoms/dropdown-menu'");throw e.code="MODULE_NOT_FOUND",e}()),{children:"Actions"}),t.jsx(Object(function(){var e=Error("Cannot find module '@/components/ui/atoms/dropdown-menu'");throw e.code="MODULE_NOT_FOUND",e}()),{children:"View profile"}),"owner"!==o.role&&(0,t.jsxs)(t.Fragment,{children:[t.jsx(Object(function(){var e=Error("Cannot find module '@/components/ui/atoms/dropdown-menu'");throw e.code="MODULE_NOT_FOUND",e}()),{}),t.jsx(Object(function(){var e=Error("Cannot find module '@/components/ui/atoms/dropdown-menu'");throw e.code="MODULE_NOT_FOUND",e}()),{children:"Change role"}),t.jsx(Object(function(){var e=Error("Cannot find module '@/components/ui/atoms/dropdown-menu'");throw e.code="MODULE_NOT_FOUND",e}()),{className:"text-destructive",children:"Remove member"})]})]})]})}}];function m(){let{data:e,isLoading:o}=(0,r.useQuery)({queryKey:["team-members"],queryFn:()=>Object(function(){var e=Error("Cannot find module '@/lib/api/client'");throw e.code="MODULE_NOT_FOUND",e}()).team.listMembers()}),{mutate:n,isLoading:s}=(0,a.useMutation)({mutationFn:e=>Object(function(){var e=Error("Cannot find module '@/lib/api/client'");throw e.code="MODULE_NOT_FOUND",e}()).team.invite(e),onSuccess:()=>{Object(function(){var e=Error("Cannot find module '@/components/ui/atoms/use-toast'");throw e.code="MODULE_NOT_FOUND",e}())({title:"Success",description:"Invitation has been sent."})},onError:()=>{Object(function(){var e=Error("Cannot find module '@/components/ui/atoms/use-toast'");throw e.code="MODULE_NOT_FOUND",e}())({title:"Error",description:"Failed to send invitation.",variant:"destructive"})}});return(0,t.jsxs)("div",{className:"space-y-6",children:[(0,t.jsxs)("div",{children:[t.jsx("h3",{className:"text-lg font-medium",children:"Team Settings"}),t.jsx("p",{className:"text-sm text-muted-foreground",children:"Manage your team members and their roles."})]}),t.jsx(Object(function(){var e=Error("Cannot find module '@/components/ui/atoms/separator'");throw e.code="MODULE_NOT_FOUND",e}()),{}),(0,t.jsxs)("div",{className:"space-y-4",children:[(0,t.jsxs)("div",{children:[t.jsx("h4",{className:"text-sm font-medium mb-4",children:"Invite Team Member"}),t.jsx(Object(function(){var e=Error("Cannot find module '@/components/ui/molecules/form/form'");throw e.code="MODULE_NOT_FOUND",e}()),{schema:c,onSubmit:e=>n(e),defaultValues:{role:"member"},children:e=>(0,t.jsxs)("div",{className:"flex gap-4",children:[t.jsx("div",{className:"flex-1",children:t.jsx(Object(function(){var e=Error("Cannot find module '@/components/ui/atoms/input'");throw e.code="MODULE_NOT_FOUND",e}()),{placeholder:"Enter email address",error:e.formState.errors.email?.message,...e.register("email")})}),t.jsx(Object(function(){var e=Error("Cannot find module '@/components/ui/atoms/button'");throw e.code="MODULE_NOT_FOUND",e}()),{type:"submit",disabled:s,loading:s,children:"Send Invite"})]})})]}),(0,t.jsxs)("div",{children:[t.jsx("h4",{className:"text-sm font-medium mb-4",children:"Team Members"}),t.jsx(Object(function(){var e=Error("Cannot find module '@/components/ui/molecules/data-table/data-table'");throw e.code="MODULE_NOT_FOUND",e}()),{columns:l,data:e?.items||[],isLoading:o})]})]})]})}},2109:(e,o,n)=>{"use strict";n.r(o),n.d(o,{default:()=>t});let t=(0,n(8570).createProxy)(String.raw`/Users/ivanpeychev/Projects/MindburnLabs/justmaily/apps/maily-web/app/app/(dashboard)/settings/team/page.tsx#default`)}};var o=require("../../../../../webpack-runtime.js");o.C(e);var n=e=>o(o.s=e),t=o.X(0,[254,781,57,991,641,928,688,865,297],()=>n(4410));module.exports=t})();