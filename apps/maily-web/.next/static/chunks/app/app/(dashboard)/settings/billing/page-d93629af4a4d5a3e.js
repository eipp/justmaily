(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[3750],{65062:function(e,s,i){Promise.resolve().then(i.bind(i,33139))},33139:function(e,s,i){"use strict";i.r(s),i.d(s,{default:function(){return x}});var n={};i.r(n);var l=i(57437),r=i(71632),d=i(44022),a=i(24032),c=i(63405),t=i(86158),m=i(94608);i(2265);var u=i(54506);function x(){let{data:e,isLoading:s}=(0,r.useQuery)({queryKey:["subscription"],queryFn:()=>c.h.billing.getSubscription()}),{data:i,isLoading:x}=(0,r.useQuery)({queryKey:["usage"],queryFn:()=>c.h.billing.getUsage()}),{data:h,isLoading:j}=(0,r.useQuery)({queryKey:["plans"],queryFn:()=>c.h.billing.listPlans()});return(0,l.jsxs)("div",{className:"space-y-6",children:[(0,l.jsxs)("div",{children:[(0,l.jsx)("h3",{className:"text-lg font-medium",children:"Billing Settings"}),(0,l.jsx)("p",{className:"text-sm text-muted-foreground",children:"Manage your subscription and billing information."})]}),(0,l.jsx)(a.Z,{}),(0,l.jsxs)("div",{className:"space-y-8",children:[(0,l.jsxs)("div",{children:[(0,l.jsx)("h4",{className:"text-sm font-medium mb-4",children:"Current Plan"}),e&&(0,l.jsxs)(t.Zb,{children:[(0,l.jsx)(t.Ol,{children:(0,l.jsxs)("div",{className:"flex items-center justify-between",children:[(0,l.jsxs)("div",{children:[(0,l.jsx)(t.ll,{children:e.plan.name}),(0,l.jsxs)(t.SZ,{children:["$",e.plan.price,"/month"]})]}),(0,l.jsx)(m.C,{variant:"active"===e.status?"default":"destructive",children:e.status})]})}),(0,l.jsx)(t.aY,{children:(0,l.jsxs)("div",{className:"text-sm text-muted-foreground",children:[e.cancelAtPeriodEnd?"Your subscription will end on ":"Your next billing date is ",(0,u.Z)(new Date(e.currentPeriodEnd),{addSuffix:!0})]})}),(0,l.jsx)(t.eW,{children:(0,l.jsx)(d.z,{variant:"outline",children:e.cancelAtPeriodEnd?"Resume Subscription":"Cancel Subscription"})})]})]}),i&&(0,l.jsxs)("div",{children:[(0,l.jsx)("h4",{className:"text-sm font-medium mb-4",children:"Usage"}),(0,l.jsxs)("div",{className:"grid gap-4 md:grid-cols-3",children:[(0,l.jsxs)(t.Zb,{children:[(0,l.jsx)(t.Ol,{children:(0,l.jsx)(t.ll,{className:"text-sm font-medium",children:"Subscribers"})}),(0,l.jsx)(t.aY,{children:(0,l.jsxs)("div",{className:"space-y-2",children:[(0,l.jsxs)("div",{className:"flex items-center justify-between text-sm",children:[(0,l.jsx)("div",{children:i.subscribers.count}),(0,l.jsxs)("div",{className:"text-muted-foreground",children:["of ",i.subscribers.limit]})]}),(0,l.jsx)(n.Progress,{value:i.subscribers.count/i.subscribers.limit*100})]})})]}),(0,l.jsxs)(t.Zb,{children:[(0,l.jsx)(t.Ol,{children:(0,l.jsx)(t.ll,{className:"text-sm font-medium",children:"Campaigns"})}),(0,l.jsx)(t.aY,{children:(0,l.jsxs)("div",{className:"space-y-2",children:[(0,l.jsxs)("div",{className:"flex items-center justify-between text-sm",children:[(0,l.jsx)("div",{children:i.campaigns.count}),(0,l.jsxs)("div",{className:"text-muted-foreground",children:["of ",i.campaigns.limit]})]}),(0,l.jsx)(n.Progress,{value:i.campaigns.count/i.campaigns.limit*100})]})})]}),(0,l.jsxs)(t.Zb,{children:[(0,l.jsx)(t.Ol,{children:(0,l.jsx)(t.ll,{className:"text-sm font-medium",children:"Team Members"})}),(0,l.jsx)(t.aY,{children:(0,l.jsxs)("div",{className:"space-y-2",children:[(0,l.jsxs)("div",{className:"flex items-center justify-between text-sm",children:[(0,l.jsx)("div",{children:i.teamMembers.count}),(0,l.jsxs)("div",{className:"text-muted-foreground",children:["of ",i.teamMembers.limit]})]}),(0,l.jsx)(n.Progress,{value:i.teamMembers.count/i.teamMembers.limit*100})]})})]})]})]}),(0,l.jsxs)("div",{children:[(0,l.jsx)("h4",{className:"text-sm font-medium mb-4",children:"Available Plans"}),(0,l.jsx)("div",{className:"grid gap-4 md:grid-cols-3",children:null==h?void 0:h.map(s=>(0,l.jsxs)(t.Zb,{children:[(0,l.jsxs)(t.Ol,{children:[(0,l.jsx)(t.ll,{children:s.name}),(0,l.jsxs)(t.SZ,{children:["$",s.price,"/month"]})]}),(0,l.jsx)(t.aY,{children:(0,l.jsx)("ul",{className:"list-disc list-inside space-y-2 text-sm",children:s.features.map((e,s)=>(0,l.jsx)("li",{children:e},s))})}),(0,l.jsx)(t.eW,{children:(0,l.jsx)(d.z,{variant:(null==e?void 0:e.plan.id)===s.id?"secondary":"default",className:"w-full",disabled:(null==e?void 0:e.plan.id)===s.id,children:(null==e?void 0:e.plan.id)===s.id?"Current Plan":"Upgrade"})})]},s.id))})]})]})]})}}},function(e){e.O(0,[632,7842,2385,4714,2943,5148,8487,1523,1744],function(){return e(e.s=65062)}),_N_E=e.O()}]);