(()=>{var e={};e.id=410,e.ids=[410],e.modules={2934:e=>{"use strict";e.exports=require("next/dist/client/components/action-async-storage.external.js")},4580:e=>{"use strict";e.exports=require("next/dist/client/components/request-async-storage.external.js")},5869:e=>{"use strict";e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},399:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},4450:(e,t,r)=>{"use strict";r.r(t),r.d(t,{GlobalError:()=>s.a,__next_app__:()=>u,originalPathname:()=>m,pages:()=>l,routeModule:()=>p,tree:()=>d}),r(9971),r(7291),r(6597),r(4432),r(5819),r(1506),r(5866);var n=r(3191),o=r(8716),a=r(7922),s=r.n(a),c=r(5231),i={};for(let e in c)0>["default","tree","pages","GlobalError","originalPathname","__next_app__","routeModule"].indexOf(e)&&(i[e]=()=>c[e]);r.d(t,i);let d=["",{children:["app",{children:["(dashboard)",{children:["analytics",{children:["__PAGE__",{},{page:[()=>Promise.resolve().then(r.bind(r,9971)),"/Users/ivanpeychev/Projects/MindburnLabs/justmaily/apps/maily-web/app/app/(dashboard)/analytics/page.tsx"]}]},{layout:[()=>Promise.resolve().then(r.bind(r,7291)),"/Users/ivanpeychev/Projects/MindburnLabs/justmaily/apps/maily-web/app/app/(dashboard)/analytics/layout.tsx"]}]},{}]},{layout:[()=>Promise.resolve().then(r.bind(r,6597)),"/Users/ivanpeychev/Projects/MindburnLabs/justmaily/apps/maily-web/app/app/layout.tsx"],error:[()=>Promise.resolve().then(r.bind(r,4432)),"/Users/ivanpeychev/Projects/MindburnLabs/justmaily/apps/maily-web/app/app/error.tsx"],"not-found":[()=>Promise.resolve().then(r.bind(r,5819)),"/Users/ivanpeychev/Projects/MindburnLabs/justmaily/apps/maily-web/app/app/not-found.tsx"]}]},{layout:[()=>Promise.resolve().then(r.t.bind(r,1506,23)),"/Users/ivanpeychev/Projects/MindburnLabs/justmaily/apps/maily-web/app/layout.tsx"],"not-found":[()=>Promise.resolve().then(r.t.bind(r,5866,23)),"next/dist/client/components/not-found-error"]}],l=["/Users/ivanpeychev/Projects/MindburnLabs/justmaily/apps/maily-web/app/app/(dashboard)/analytics/page.tsx"],m="/app/(dashboard)/analytics/page",u={require:r,loadChunk:()=>Promise.resolve()},p=new n.AppPageRouteModule({definition:{kind:o.x.APP_PAGE,page:"/app/(dashboard)/analytics/page",pathname:"/app/analytics",bundlePath:"",filename:"",appPaths:[]},userland:{loaderTree:d}})},7787:(e,t,r)=>{Promise.resolve().then(r.bind(r,3287))},3287:(e,t,r)=>{"use strict";r.r(t),r.d(t,{default:()=>u});var n=r(326),o=r(7369);(function(){var e=Error("Cannot find module '@/lib/api/client'");throw e.code="MODULE_NOT_FOUND",e})(),function(){var e=Error("Cannot find module '@/components/ui/atoms/card'");throw e.code="MODULE_NOT_FOUND",e}(),function(){var e=Error("Cannot find module '@/components/ui/atoms/separator'");throw e.code="MODULE_NOT_FOUND",e}();var a=r(4713),s=r(2275),c=r(4061),i=r(5932),d=r(1066);(function(){var e=Error("Cannot find module '@/components/ui/molecules/charts'");throw e.code="MODULE_NOT_FOUND",e})(),function(){var e=Error("Cannot find module '@/components/ui/molecules/data-table/data-table'");throw e.code="MODULE_NOT_FOUND",e}();var l=r(7311);let m=[{accessorKey:"name",header:"Campaign"},{accessorKey:"sentAt",header:"Sent",cell:({row:e})=>(0,l.Z)(new Date(e.getValue("sentAt")),{addSuffix:!0})},{accessorKey:"openRate",header:"Open Rate",cell:({row:e})=>{let t=e.getValue("openRate"),r=`${t.toFixed(1)}%`;return(0,n.jsxs)("div",{className:"flex items-center gap-x-2",children:[r,t>20?n.jsx(a.Z,{className:"h-4 w-4 text-green-500"}):n.jsx(s.Z,{className:"h-4 w-4 text-red-500"})]})}},{accessorKey:"clickRate",header:"Click Rate",cell:({row:e})=>{let t=e.getValue("clickRate"),r=`${t.toFixed(1)}%`;return(0,n.jsxs)("div",{className:"flex items-center gap-x-2",children:[r,t>2.5?n.jsx(a.Z,{className:"h-4 w-4 text-green-500"}):n.jsx(s.Z,{className:"h-4 w-4 text-red-500"})]})}}];function u(){let{data:e,isLoading:t}=(0,o.useQuery)({queryKey:["analytics-overview"],queryFn:()=>Object(function(){var e=Error("Cannot find module '@/lib/api/client'");throw e.code="MODULE_NOT_FOUND",e}()).analytics.getOverview()}),{data:r,isLoading:s}=(0,o.useQuery)({queryKey:["analytics-campaigns"],queryFn:()=>Object(function(){var e=Error("Cannot find module '@/lib/api/client'");throw e.code="MODULE_NOT_FOUND",e}()).analytics.getCampaigns()}),{data:l,isLoading:u}=(0,o.useQuery)({queryKey:["analytics-subscriber-growth"],queryFn:()=>Object(function(){var e=Error("Cannot find module '@/lib/api/client'");throw e.code="MODULE_NOT_FOUND",e}()).analytics.getSubscriberGrowth()}),{data:p,isLoading:h}=(0,o.useQuery)({queryKey:["analytics-engagement"],queryFn:()=>Object(function(){var e=Error("Cannot find module '@/lib/api/client'");throw e.code="MODULE_NOT_FOUND",e}()).analytics.getEngagement()});return(0,n.jsxs)("div",{className:"space-y-6",children:[(0,n.jsxs)("div",{children:[n.jsx("h3",{className:"text-lg font-medium",children:"Overview"}),n.jsx("p",{className:"text-sm text-muted-foreground",children:"View your key metrics and campaign performance."})]}),n.jsx(Object(function(){var e=Error("Cannot find module '@/components/ui/atoms/separator'");throw e.code="MODULE_NOT_FOUND",e}()),{}),(0,n.jsxs)("div",{className:"space-y-8",children:[(0,n.jsxs)("div",{className:"grid gap-4 md:grid-cols-3",children:[(0,n.jsxs)(Object(function(){var e=Error("Cannot find module '@/components/ui/atoms/card'");throw e.code="MODULE_NOT_FOUND",e}()),{children:[(0,n.jsxs)(Object(function(){var e=Error("Cannot find module '@/components/ui/atoms/card'");throw e.code="MODULE_NOT_FOUND",e}()),{className:"flex flex-row items-center justify-between space-y-0 pb-2",children:[n.jsx(Object(function(){var e=Error("Cannot find module '@/components/ui/atoms/card'");throw e.code="MODULE_NOT_FOUND",e}()),{className:"text-sm font-medium",children:"Total Subscribers"}),n.jsx(c.Z,{className:"h-4 w-4 text-muted-foreground"})]}),(0,n.jsxs)(Object(function(){var e=Error("Cannot find module '@/components/ui/atoms/card'");throw e.code="MODULE_NOT_FOUND",e}()),{children:[n.jsx("div",{className:"text-2xl font-bold",children:e?.totalSubscribers.toLocaleString()}),(0,n.jsxs)("div",{className:"flex items-center text-sm text-muted-foreground",children:[n.jsx(a.Z,{className:"mr-1 h-4 w-4 text-green-500"}),e?.subscriberGrowth,"% from last month"]})]})]}),(0,n.jsxs)(Object(function(){var e=Error("Cannot find module '@/components/ui/atoms/card'");throw e.code="MODULE_NOT_FOUND",e}()),{children:[(0,n.jsxs)(Object(function(){var e=Error("Cannot find module '@/components/ui/atoms/card'");throw e.code="MODULE_NOT_FOUND",e}()),{className:"flex flex-row items-center justify-between space-y-0 pb-2",children:[n.jsx(Object(function(){var e=Error("Cannot find module '@/components/ui/atoms/card'");throw e.code="MODULE_NOT_FOUND",e}()),{className:"text-sm font-medium",children:"Average Open Rate"}),n.jsx(i.Z,{className:"h-4 w-4 text-muted-foreground"})]}),(0,n.jsxs)(Object(function(){var e=Error("Cannot find module '@/components/ui/atoms/card'");throw e.code="MODULE_NOT_FOUND",e}()),{children:[(0,n.jsxs)("div",{className:"text-2xl font-bold",children:[e?.averageOpenRate.toFixed(1),"%"]}),(0,n.jsxs)("div",{className:"flex items-center text-sm text-muted-foreground",children:[n.jsx(a.Z,{className:"mr-1 h-4 w-4 text-green-500"}),e?.openRateGrowth,"% from last month"]})]})]}),(0,n.jsxs)(Object(function(){var e=Error("Cannot find module '@/components/ui/atoms/card'");throw e.code="MODULE_NOT_FOUND",e}()),{children:[(0,n.jsxs)(Object(function(){var e=Error("Cannot find module '@/components/ui/atoms/card'");throw e.code="MODULE_NOT_FOUND",e}()),{className:"flex flex-row items-center justify-between space-y-0 pb-2",children:[n.jsx(Object(function(){var e=Error("Cannot find module '@/components/ui/atoms/card'");throw e.code="MODULE_NOT_FOUND",e}()),{className:"text-sm font-medium",children:"Average Click Rate"}),n.jsx(d.Z,{className:"h-4 w-4 text-muted-foreground"})]}),(0,n.jsxs)(Object(function(){var e=Error("Cannot find module '@/components/ui/atoms/card'");throw e.code="MODULE_NOT_FOUND",e}()),{children:[(0,n.jsxs)("div",{className:"text-2xl font-bold",children:[e?.averageClickRate.toFixed(1),"%"]}),(0,n.jsxs)("div",{className:"flex items-center text-sm text-muted-foreground",children:[n.jsx(a.Z,{className:"mr-1 h-4 w-4 text-green-500"}),e?.clickRateGrowth,"% from last month"]})]})]})]}),(0,n.jsxs)(Object(function(){var e=Error("Cannot find module '@/components/ui/atoms/card'");throw e.code="MODULE_NOT_FOUND",e}()),{children:[(0,n.jsxs)(Object(function(){var e=Error("Cannot find module '@/components/ui/atoms/card'");throw e.code="MODULE_NOT_FOUND",e}()),{children:[n.jsx(Object(function(){var e=Error("Cannot find module '@/components/ui/atoms/card'");throw e.code="MODULE_NOT_FOUND",e}()),{children:"Subscriber Growth"}),n.jsx(Object(function(){var e=Error("Cannot find module '@/components/ui/atoms/card'");throw e.code="MODULE_NOT_FOUND",e}()),{children:"Track your subscriber growth over time."})]}),n.jsx(Object(function(){var e=Error("Cannot find module '@/components/ui/atoms/card'");throw e.code="MODULE_NOT_FOUND",e}()),{children:n.jsx(Object(function(){var e=Error("Cannot find module '@/components/ui/molecules/charts'");throw e.code="MODULE_NOT_FOUND",e}()),{data:l?.data||[],categories:["total"],index:"date",colors:["blue"],valueFormatter:e=>`${e.toLocaleString()} subscribers`,yAxisWidth:80,height:350})})]}),(0,n.jsxs)(Object(function(){var e=Error("Cannot find module '@/components/ui/atoms/card'");throw e.code="MODULE_NOT_FOUND",e}()),{children:[(0,n.jsxs)(Object(function(){var e=Error("Cannot find module '@/components/ui/atoms/card'");throw e.code="MODULE_NOT_FOUND",e}()),{children:[n.jsx(Object(function(){var e=Error("Cannot find module '@/components/ui/atoms/card'");throw e.code="MODULE_NOT_FOUND",e}()),{children:"Engagement Metrics"}),n.jsx(Object(function(){var e=Error("Cannot find module '@/components/ui/atoms/card'");throw e.code="MODULE_NOT_FOUND",e}()),{children:"Compare open rates and click rates across campaigns."})]}),n.jsx(Object(function(){var e=Error("Cannot find module '@/components/ui/atoms/card'");throw e.code="MODULE_NOT_FOUND",e}()),{children:n.jsx(Object(function(){var e=Error("Cannot find module '@/components/ui/molecules/charts'");throw e.code="MODULE_NOT_FOUND",e}()),{data:p?.data||[],categories:["openRate","clickRate"],index:"name",colors:["blue","green"],valueFormatter:e=>`${e.toFixed(1)}%`,yAxisWidth:60,height:350})})]}),(0,n.jsxs)("div",{children:[n.jsx("h4",{className:"text-sm font-medium mb-4",children:"Recent Campaigns"}),n.jsx(Object(function(){var e=Error("Cannot find module '@/components/ui/molecules/data-table/data-table'");throw e.code="MODULE_NOT_FOUND",e}()),{columns:m,data:r?.items||[],isLoading:s})]})]})]})}},9971:(e,t,r)=>{"use strict";r.r(t),r.d(t,{default:()=>n});let n=(0,r(8570).createProxy)(String.raw`/Users/ivanpeychev/Projects/MindburnLabs/justmaily/apps/maily-web/app/app/(dashboard)/analytics/page.tsx#default`)}};var t=require("../../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),n=t.X(0,[254,781,57,991,641,928,688,865,297],()=>r(4450));module.exports=n})();