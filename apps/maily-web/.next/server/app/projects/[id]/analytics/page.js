(()=>{var e={};e.id=3446,e.ids=[3446],e.modules={72934:e=>{"use strict";e.exports=require("next/dist/client/components/action-async-storage.external.js")},54580:e=>{"use strict";e.exports=require("next/dist/client/components/request-async-storage.external.js")},45869:e=>{"use strict";e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},20399:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},16307:(e,s,a)=>{"use strict";a.r(s),a.d(s,{GlobalError:()=>r.a,__next_app__:()=>o,originalPathname:()=>m,pages:()=>x,routeModule:()=>p,tree:()=>d}),a(78969),a(11506),a(35866);var l=a(23191),t=a(88716),i=a(37922),r=a.n(i),n=a(95231),c={};for(let e in n)0>["default","tree","pages","GlobalError","originalPathname","__next_app__","routeModule"].indexOf(e)&&(c[e]=()=>n[e]);a.d(s,c);let d=["",{children:["projects",{children:["[id]",{children:["analytics",{children:["__PAGE__",{},{page:[()=>Promise.resolve().then(a.bind(a,78969)),"/Users/ivanpeychev/Projects/MindburnLabs/justmaily/apps/maily-web/app/projects/[id]/analytics/page.tsx"]}]},{}]},{}]},{}]},{layout:[()=>Promise.resolve().then(a.bind(a,11506)),"/Users/ivanpeychev/Projects/MindburnLabs/justmaily/apps/maily-web/app/layout.tsx"],"not-found":[()=>Promise.resolve().then(a.t.bind(a,35866,23)),"next/dist/client/components/not-found-error"]}],x=["/Users/ivanpeychev/Projects/MindburnLabs/justmaily/apps/maily-web/app/projects/[id]/analytics/page.tsx"],m="/projects/[id]/analytics/page",o={require:a,loadChunk:()=>Promise.resolve()},p=new l.AppPageRouteModule({definition:{kind:t.x.APP_PAGE,page:"/projects/[id]/analytics/page",pathname:"/projects/[id]/analytics",bundlePath:"",filename:"",appPaths:[]},userland:{loaderTree:d}})},72599:(e,s,a)=>{Promise.resolve().then(a.bind(a,1489))},1489:(e,s,a)=>{"use strict";a.r(s),a.d(s,{default:()=>u});var l=a(10326),t=a(17577),i=a(35047),r=a(90772),n=a(79210),c=a(33071),d=a(37202),x=a(5932),m=a(76557);let o=(0,m.Z)("TrendingUp",[["polyline",{points:"22 7 13.5 15.5 8.5 10.5 2 17",key:"126l90"}],["polyline",{points:"16 7 22 7 22 13",key:"kwv8wd"}]]);var p=a(24061),h=a(21066);let j=(0,m.Z)("Clock",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["polyline",{points:"12 6 12 12 16 14",key:"68esgv"}]]);function u({params:e}){let s=(0,i.useRouter)(),{supabase:a,user:m}=useSupabase(),[u,y]=(0,t.useState)(!0),[g,b]=(0,t.useState)(null),[v,f]=(0,t.useState)(null),[N,w]=(0,t.useState)("7d"),k=async()=>{y(!0),b(null);try{let{data:l,error:t}=await a.from("projects").select("owner_id, settings").eq("id",e.id).single();if(t)throw t;if(l.owner_id!==m?.id){s.push("/dashboard");return}if(!l.settings.enableAnalytics){b("Analytics are not enabled for this project"),y(!1);return}let i=await P(e.id,N);f(i)}catch(e){b("Failed to load analytics data")}finally{y(!1)}},P=async(e,s)=>({overview:{totalEmails:15e3,deliveryRate:98.5,openRate:45.2,clickRate:12.8,bounceRate:1.5},engagement:{dailyOpens:[{date:"2024-01-01",count:250},{date:"2024-01-02",count:300}],dailyClicks:[{date:"2024-01-01",count:75},{date:"2024-01-02",count:90}],topLinks:[{url:"https://example.com/product",clicks:450},{url:"https://example.com/pricing",clicks:320}]},deliverability:{bounces:[{type:"hard",count:150},{type:"soft",count:75}],complaints:25,blocks:50},timing:{bestSendTimes:[{hour:9,engagementRate:25.5},{hour:14,engagementRate:22.8}],bestDays:[{day:"Tuesday",engagementRate:24.5},{day:"Wednesday",engagementRate:23.2}]}});return u?l.jsx("div",{className:"flex h-full items-center justify-center",children:(0,l.jsxs)("div",{className:"text-center",children:[l.jsx("div",{className:"h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"}),l.jsx("p",{className:"mt-2 text-sm text-gray-600 dark:text-gray-400",children:"Loading analytics..."})]})}):g?l.jsx("div",{className:"flex h-full items-center justify-center",children:(0,l.jsxs)("div",{className:"text-center",children:[l.jsx("div",{className:"mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900",children:l.jsx(d.Z,{className:"h-6 w-6 text-red-600 dark:text-red-400"})}),l.jsx("p",{className:"mt-2 text-lg font-medium text-gray-900 dark:text-gray-100",children:g})]})}):v?l.jsx("div",{className:"container mx-auto py-8",children:(0,l.jsxs)("div",{className:"space-y-8",children:[(0,l.jsxs)("div",{className:"flex items-center justify-between",children:[(0,l.jsxs)("div",{children:[l.jsx("h1",{className:"text-3xl font-bold",children:"Project Analytics"}),l.jsx("p",{className:"mt-2 text-gray-600 dark:text-gray-400",children:"Track your project's performance and engagement metrics"})]}),(0,l.jsxs)("div",{className:"flex items-center space-x-4",children:[(0,l.jsxs)("select",{value:N,onChange:e=>w(e.target.value),className:"rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700",children:[l.jsx("option",{value:"7d",children:"Last 7 days"}),l.jsx("option",{value:"30d",children:"Last 30 days"}),l.jsx("option",{value:"90d",children:"Last 90 days"}),l.jsx("option",{value:"1y",children:"Last year"})]}),l.jsx(r.z,{onClick:k,children:"Refresh"})]})]}),(0,l.jsxs)("div",{className:"grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4",children:[(0,l.jsxs)(c.Zb,{children:[(0,l.jsxs)(c.Ol,{className:"flex flex-row items-center justify-between space-y-0 pb-2",children:[l.jsx(c.ll,{className:"text-sm font-medium",children:"Total Emails"}),l.jsx(x.Z,{className:"h-4 w-4 text-gray-600 dark:text-gray-400"})]}),(0,l.jsxs)(c.aY,{children:[l.jsx("div",{className:"text-2xl font-bold",children:v.overview.totalEmails.toLocaleString()}),l.jsx("p",{className:"text-xs text-gray-600 dark:text-gray-400",children:"Sent during selected period"})]})]}),(0,l.jsxs)(c.Zb,{children:[(0,l.jsxs)(c.Ol,{className:"flex flex-row items-center justify-between space-y-0 pb-2",children:[l.jsx(c.ll,{className:"text-sm font-medium",children:"Delivery Rate"}),l.jsx(o,{className:"h-4 w-4 text-green-600"})]}),(0,l.jsxs)(c.aY,{children:[(0,l.jsxs)("div",{className:"text-2xl font-bold",children:[v.overview.deliveryRate,"%"]}),l.jsx("p",{className:"text-xs text-gray-600 dark:text-gray-400",children:"Successfully delivered"})]})]}),(0,l.jsxs)(c.Zb,{children:[(0,l.jsxs)(c.Ol,{className:"flex flex-row items-center justify-between space-y-0 pb-2",children:[l.jsx(c.ll,{className:"text-sm font-medium",children:"Open Rate"}),l.jsx(p.Z,{className:"h-4 w-4 text-blue-600"})]}),(0,l.jsxs)(c.aY,{children:[(0,l.jsxs)("div",{className:"text-2xl font-bold",children:[v.overview.openRate,"%"]}),l.jsx("p",{className:"text-xs text-gray-600 dark:text-gray-400",children:"Of delivered emails"})]})]}),(0,l.jsxs)(c.Zb,{children:[(0,l.jsxs)(c.Ol,{className:"flex flex-row items-center justify-between space-y-0 pb-2",children:[l.jsx(c.ll,{className:"text-sm font-medium",children:"Click Rate"}),l.jsx(h.Z,{className:"h-4 w-4 text-purple-600"})]}),(0,l.jsxs)(c.aY,{children:[(0,l.jsxs)("div",{className:"text-2xl font-bold",children:[v.overview.clickRate,"%"]}),l.jsx("p",{className:"text-xs text-gray-600 dark:text-gray-400",children:"Of opened emails"})]})]})]}),(0,l.jsxs)(n.mQ,{defaultValue:"engagement",className:"space-y-4",children:[(0,l.jsxs)(n.dr,{children:[(0,l.jsxs)(n.SP,{value:"engagement",className:"flex items-center",children:[l.jsx(p.Z,{className:"mr-2 h-4 w-4"}),"Engagement"]}),(0,l.jsxs)(n.SP,{value:"deliverability",className:"flex items-center",children:[l.jsx(x.Z,{className:"mr-2 h-4 w-4"}),"Deliverability"]}),(0,l.jsxs)(n.SP,{value:"timing",className:"flex items-center",children:[l.jsx(j,{className:"mr-2 h-4 w-4"}),"Timing"]})]}),l.jsx(n.nU,{value:"engagement",className:"space-y-4",children:(0,l.jsxs)("div",{className:"grid gap-6 md:grid-cols-2",children:[(0,l.jsxs)(c.Zb,{children:[l.jsx(c.Ol,{children:l.jsx(c.ll,{children:"Daily Opens"})}),l.jsx(c.aY,{children:l.jsx("div",{className:"h-[200px] w-full bg-gray-100 dark:bg-gray-800"})})]}),(0,l.jsxs)(c.Zb,{children:[l.jsx(c.Ol,{children:l.jsx(c.ll,{children:"Daily Clicks"})}),l.jsx(c.aY,{children:l.jsx("div",{className:"h-[200px] w-full bg-gray-100 dark:bg-gray-800"})})]})]})}),l.jsx(n.nU,{value:"deliverability",className:"space-y-4",children:(0,l.jsxs)("div",{className:"grid gap-6 md:grid-cols-2",children:[(0,l.jsxs)(c.Zb,{children:[l.jsx(c.Ol,{children:l.jsx(c.ll,{children:"Bounce Types"})}),l.jsx(c.aY,{children:l.jsx("div",{className:"space-y-4",children:v.deliverability.bounces.map(e=>(0,l.jsxs)("div",{className:"flex items-center justify-between",children:[(0,l.jsxs)("span",{className:"capitalize",children:[e.type," Bounces"]}),l.jsx("span",{className:"font-medium",children:e.count})]},e.type))})})]}),(0,l.jsxs)(c.Zb,{children:[l.jsx(c.Ol,{children:l.jsx(c.ll,{children:"Delivery Issues"})}),l.jsx(c.aY,{children:(0,l.jsxs)("div",{className:"space-y-4",children:[(0,l.jsxs)("div",{className:"flex items-center justify-between",children:[l.jsx("span",{children:"Complaints"}),l.jsx("span",{className:"font-medium",children:v.deliverability.complaints})]}),(0,l.jsxs)("div",{className:"flex items-center justify-between",children:[l.jsx("span",{children:"Blocks"}),l.jsx("span",{className:"font-medium",children:v.deliverability.blocks})]})]})})]})]})}),l.jsx(n.nU,{value:"timing",className:"space-y-4",children:(0,l.jsxs)("div",{className:"grid gap-6 md:grid-cols-2",children:[(0,l.jsxs)(c.Zb,{children:[l.jsx(c.Ol,{children:l.jsx(c.ll,{children:"Best Send Times"})}),l.jsx(c.aY,{children:l.jsx("div",{className:"space-y-4",children:v.timing.bestSendTimes.map(e=>(0,l.jsxs)("div",{className:"flex items-center justify-between",children:[(0,l.jsxs)("span",{children:[e.hour,":00"]}),(0,l.jsxs)("span",{className:"font-medium",children:[e.engagementRate,"% engagement"]})]},e.hour))})})]}),(0,l.jsxs)(c.Zb,{children:[l.jsx(c.Ol,{children:l.jsx(c.ll,{children:"Best Days"})}),l.jsx(c.aY,{children:l.jsx("div",{className:"space-y-4",children:v.timing.bestDays.map(e=>(0,l.jsxs)("div",{className:"flex items-center justify-between",children:[l.jsx("span",{children:e.day}),(0,l.jsxs)("span",{className:"font-medium",children:[e.engagementRate,"% engagement"]})]},e.day))})})]})]})})]})]})}):null}},78969:(e,s,a)=>{"use strict";a.r(s),a.d(s,{default:()=>l});let l=(0,a(68570).createProxy)(String.raw`/Users/ivanpeychev/Projects/MindburnLabs/justmaily/apps/maily-web/app/projects/[id]/analytics/page.tsx#default`)}};var s=require("../../../../webpack-runtime.js");s.C(e);var a=e=>s(s.s=e),l=s.X(0,[632,110,781,8057,4991,641,928,688,6865,2385],()=>a(16307));module.exports=l})();