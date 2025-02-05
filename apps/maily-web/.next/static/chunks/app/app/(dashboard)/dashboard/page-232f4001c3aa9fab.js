(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[9930],{27090:function(e,s,a){Promise.resolve().then(a.bind(a,49524))},49524:function(e,s,a){"use strict";a.r(s),a.d(s,{default:function(){return v}});var l=a(57437),t=a(71632),c=a(86158),i=a(14459),n=a(63405),r=a(92553),d=a(44022),x=a(99376);a(2265);let o=e=>{let{width:s="100%",height:a="1rem"}=e;return(0,l.jsx)("div",{style:{width:s,height:a,backgroundColor:"#e0e0e0",borderRadius:"4px"}})};var m=a(54506),h=a(95805),u=a(89345),j=a(28921),f=a(17580),p=a(39763);let N=(0,p.Z)("Activity",[["path",{d:"M22 12h-4l-3 9L9 3l-3 9H2",key:"d5dnw9"}]]),g=(0,p.Z)("ArrowRight",[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"m12 5 7 7-7 7",key:"xquz4c"}]]),y=[{accessorKey:"name",header:"Name"},{accessorKey:"status",header:"Status"},{accessorKey:"sentAt",header:"Sent",cell:e=>{let{row:s}=e;return(0,m.Z)(new Date(s.original.sentAt),{addSuffix:!0})}},{accessorKey:"openRate",header:"Open Rate",cell:e=>{let{row:s}=e;return"".concat(s.original.openRate,"%")}},{accessorKey:"clickRate",header:"Click Rate",cell:e=>{let{row:s}=e;return"".concat(s.original.clickRate,"%")}}];function v(){let e=(0,x.useRouter)(),{data:s,isLoading:a}=(0,t.useQuery)({queryKey:["dashboard-stats"],queryFn:()=>n.h.analytics.getDashboardStats()}),{data:p,isLoading:v}=(0,t.useQuery)({queryKey:["recent-campaigns"],queryFn:()=>n.h.campaigns.list({limit:5})}),{data:b,isLoading:w}=(0,t.useQuery)({queryKey:["recent-activities"],queryFn:()=>n.h.analytics.getRecentActivities()});return(0,l.jsx)(i.Z,{children:(0,l.jsxs)("div",{className:"flex-1 space-y-4 p-8 pt-6",children:[(0,l.jsxs)("div",{className:"flex items-center justify-between space-y-2",children:[(0,l.jsx)("h2",{className:"text-3xl font-bold tracking-tight",children:"Dashboard"}),(0,l.jsx)("div",{className:"flex items-center space-x-2",children:(0,l.jsx)(d.z,{onClick:()=>e.push("/campaigns/new"),children:"Create Campaign"})})]}),(0,l.jsxs)("div",{className:"grid gap-4 md:grid-cols-2 lg:grid-cols-4",children:[(0,l.jsxs)(c.Zb,{children:[(0,l.jsxs)(c.Ol,{className:"flex flex-row items-center justify-between space-y-0 pb-2",children:[(0,l.jsx)(c.ll,{className:"text-sm font-medium",children:"Total Subscribers"}),(0,l.jsx)(h.Z,{className:"h-4 w-4 text-muted-foreground"})]}),(0,l.jsx)(c.aY,{children:a?(0,l.jsx)(o,{className:"h-7 w-20"}):(0,l.jsx)("div",{className:"text-2xl font-bold",children:null==s?void 0:s.totalSubscribers.toLocaleString()})})]}),(0,l.jsxs)(c.Zb,{children:[(0,l.jsxs)(c.Ol,{className:"flex flex-row items-center justify-between space-y-0 pb-2",children:[(0,l.jsx)(c.ll,{className:"text-sm font-medium",children:"Total Campaigns"}),(0,l.jsx)(u.Z,{className:"h-4 w-4 text-muted-foreground"})]}),(0,l.jsx)(c.aY,{children:a?(0,l.jsx)(o,{className:"h-7 w-20"}):(0,l.jsx)("div",{className:"text-2xl font-bold",children:null==s?void 0:s.totalCampaigns.toLocaleString()})})]}),(0,l.jsxs)(c.Zb,{children:[(0,l.jsxs)(c.Ol,{className:"flex flex-row items-center justify-between space-y-0 pb-2",children:[(0,l.jsx)(c.ll,{className:"text-sm font-medium",children:"Average Open Rate"}),(0,l.jsx)(j.Z,{className:"h-4 w-4 text-muted-foreground"})]}),(0,l.jsx)(c.aY,{children:a?(0,l.jsx)(o,{className:"h-7 w-20"}):(0,l.jsxs)("div",{className:"text-2xl font-bold",children:[null==s?void 0:s.averageOpenRate.toFixed(1),"%"]})})]}),(0,l.jsxs)(c.Zb,{children:[(0,l.jsxs)(c.Ol,{className:"flex flex-row items-center justify-between space-y-0 pb-2",children:[(0,l.jsx)(c.ll,{className:"text-sm font-medium",children:"Average Click Rate"}),(0,l.jsx)(f.Z,{className:"h-4 w-4 text-muted-foreground"})]}),(0,l.jsx)(c.aY,{children:a?(0,l.jsx)(o,{className:"h-7 w-20"}):(0,l.jsxs)("div",{className:"text-2xl font-bold",children:[null==s?void 0:s.averageClickRate.toFixed(1),"%"]})})]})]}),(0,l.jsxs)("div",{className:"grid gap-4 md:grid-cols-2 lg:grid-cols-7",children:[(0,l.jsxs)(c.Zb,{className:"col-span-4",children:[(0,l.jsx)(c.Ol,{children:(0,l.jsx)(c.ll,{children:"Recent Campaigns"})}),(0,l.jsx)(c.aY,{children:v?(0,l.jsxs)("div",{className:"space-y-2",children:[(0,l.jsx)(o,{className:"h-10 w-full"}),(0,l.jsx)(o,{className:"h-10 w-full"}),(0,l.jsx)(o,{className:"h-10 w-full"})]}):(0,l.jsx)(r.w,{columns:y,data:(null==p?void 0:p.items)||[]})})]}),(0,l.jsxs)(c.Zb,{className:"col-span-3",children:[(0,l.jsxs)(c.Ol,{children:[(0,l.jsx)(c.ll,{children:"Recent Activity"}),(0,l.jsxs)(c.SZ,{children:["You had ",(null==b?void 0:b.length)||0," activities this month"]})]}),(0,l.jsx)(c.aY,{children:w?(0,l.jsxs)("div",{className:"space-y-4",children:[(0,l.jsx)(o,{className:"h-14 w-full"}),(0,l.jsx)(o,{className:"h-14 w-full"}),(0,l.jsx)(o,{className:"h-14 w-full"})]}):(0,l.jsx)("div",{className:"space-y-8",children:null==b?void 0:b.map(e=>(0,l.jsxs)("div",{className:"flex items-center gap-4",children:[(0,l.jsx)("div",{className:"rounded-full p-2 bg-secondary",children:(0,l.jsx)(N,{className:"h-4 w-4"})}),(0,l.jsxs)("div",{className:"flex-1 space-y-1",children:[(0,l.jsx)("p",{className:"text-sm font-medium leading-none",children:e.description}),(0,l.jsx)("p",{className:"text-sm text-muted-foreground",children:(0,m.Z)(new Date(e.timestamp),{addSuffix:!0})})]}),(0,l.jsx)(d.z,{variant:"ghost",size:"icon",children:(0,l.jsx)(g,{className:"h-4 w-4"})})]},e.id))})})]})]})]})})}}},function(e){e.O(0,[632,7842,2385,4714,2943,5148,8487,1523,1744],function(){return e(e.s=27090)}),_N_E=e.O()}]);