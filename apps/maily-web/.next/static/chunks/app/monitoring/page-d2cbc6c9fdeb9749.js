(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[5738],{7999:function(e,t,i){Promise.resolve().then(i.bind(i,67200))},67200:function(e,t,i){"use strict";i.r(t),i.d(t,{default:function(){return w}});var s=i(57437),a=i(71632),l=i(12339),n=i(63405),r=i(66070),d=i(94508);function o(e){let{title:t,value:i,description:a,trend:l,className:n,loading:o=!1}=e;return(0,s.jsxs)(r.Zb,{className:(0,d.cn)("overflow-hidden",n),children:[(0,s.jsxs)(r.Ol,{className:"flex flex-row items-center justify-between space-y-0 pb-2",children:[(0,s.jsx)(r.ll,{className:"text-sm font-medium",children:t}),void 0!==l&&(0,s.jsxs)("span",{className:(0,d.cn)("text-xs font-medium",l>0?"text-green-600":l<0?"text-red-600":"text-gray-600"),children:[l>0?"+":"",l,"%"]})]}),(0,s.jsx)(r.aY,{children:o?(0,s.jsx)("div",{className:"h-9 w-full animate-pulse rounded bg-gray-200"}):(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)("div",{className:"text-2xl font-bold",children:i}),a&&(0,s.jsx)("p",{className:"text-xs text-muted-foreground",children:a})]})})]})}var c=i(47625),u=i(5481),x=i(97059),m=i(62994),h=i(34788),y=i(23263),v=i(77031),j=i(6987);function f(e){let{title:t,data:i,type:a="area",dataKey:l,xAxisKey:n="timestamp",className:o,loading:f=!1,height:g=350,color:p="#0ea5e9"}=e;return(0,s.jsxs)(r.Zb,{className:(0,d.cn)("overflow-hidden",o),children:[(0,s.jsx)(r.Ol,{children:(0,s.jsx)(r.ll,{className:"text-sm font-medium",children:t})}),(0,s.jsx)(r.aY,{children:f?(0,s.jsx)("div",{className:"w-full animate-pulse rounded bg-gray-200",style:{height:"".concat(g,"px")}}):(0,s.jsx)(c.h,{width:"100%",height:g,children:"area"===a?(0,s.jsxs)(u.T,{data:i,children:[(0,s.jsx)("defs",{children:(0,s.jsxs)("linearGradient",{id:"gradient-".concat(t),x1:"0",y1:"0",x2:"0",y2:"1",children:[(0,s.jsx)("stop",{offset:"5%",stopColor:p,stopOpacity:.8}),(0,s.jsx)("stop",{offset:"95%",stopColor:p,stopOpacity:0})]})}),(0,s.jsx)(x.K,{dataKey:n,stroke:"#888888",fontSize:12,tickLine:!1,axisLine:!1}),(0,s.jsx)(m.B,{stroke:"#888888",fontSize:12,tickLine:!1,axisLine:!1,tickFormatter:e=>"".concat(e)}),(0,s.jsx)(h.u,{}),(0,s.jsx)(y.u,{type:"monotone",dataKey:l,stroke:p,fillOpacity:1,fill:"url(#gradient-".concat(t,")")})]}):(0,s.jsxs)(v.v,{data:i,children:[(0,s.jsx)(x.K,{dataKey:n,stroke:"#888888",fontSize:12,tickLine:!1,axisLine:!1}),(0,s.jsx)(m.B,{stroke:"#888888",fontSize:12,tickLine:!1,axisLine:!1,tickFormatter:e=>"".concat(e)}),(0,s.jsx)(h.u,{}),(0,s.jsx)(j.$,{dataKey:l,fill:p,radius:[4,4,0,0]})]})})})]})}i(2265);let g=e=>{let{children:t}=e;return(0,s.jsx)("table",{style:{width:"100%",borderCollapse:"collapse"},children:t})},p=e=>{let{children:t}=e;return(0,s.jsx)("thead",{children:t})},k=e=>{let{children:t}=e;return(0,s.jsx)("tr",{children:t})},N=e=>{let{children:t}=e;return(0,s.jsx)("th",{children:t})},b=e=>{let{children:t}=e;return(0,s.jsx)("tbody",{children:t})},L=e=>{let{children:t}=e;return(0,s.jsx)("td",{children:t})};function S(e){let{title:t,columns:i,data:a,className:l,loading:n=!1}=e;return(0,s.jsxs)(r.Zb,{className:(0,d.cn)("overflow-hidden",l),children:[(0,s.jsx)(r.Ol,{children:(0,s.jsx)(r.ll,{className:"text-sm font-medium",children:t})}),(0,s.jsx)(r.aY,{children:n?(0,s.jsx)("div",{className:"space-y-2",children:Array.from({length:5}).map((e,t)=>(0,s.jsx)("div",{className:"h-8 w-full animate-pulse rounded bg-gray-200"},t))}):(0,s.jsx)("div",{className:"relative w-full overflow-auto",children:(0,s.jsxs)(g,{children:[(0,s.jsx)(p,{children:(0,s.jsx)(k,{children:i.map(e=>(0,s.jsx)(N,{children:e.title},e.key))})}),(0,s.jsx)(b,{children:a.map((e,t)=>(0,s.jsx)(k,{children:i.map(t=>(0,s.jsx)(L,{children:t.format?t.format(e[t.key]):e[t.key]},t.key))},t))})]})})})]})}function w(){let{data:e,isLoading:t}=(0,a.useQuery)({queryKey:["metrics","api"],queryFn:()=>n.h.monitoring.getApiMetrics(),refetchInterval:3e4}),{data:i,isLoading:r}=(0,a.useQuery)({queryKey:["metrics","db"],queryFn:()=>n.h.monitoring.getDbMetrics(),refetchInterval:3e4}),{data:c,isLoading:u}=(0,a.useQuery)({queryKey:["metrics","cache"],queryFn:()=>n.h.monitoring.getCacheMetrics(),refetchInterval:3e4}),{data:x,isLoading:m}=(0,a.useQuery)({queryKey:["metrics","search"],queryFn:()=>n.h.monitoring.getSearchMetrics(),refetchInterval:3e4});return(0,s.jsx)("div",{className:"container mx-auto py-10",children:(0,s.jsxs)(l.mQ,{defaultValue:"overview",className:"space-y-6",children:[(0,s.jsxs)(l.dr,{children:[(0,s.jsx)(l.SP,{value:"overview",children:"Overview"}),(0,s.jsx)(l.SP,{value:"api",children:"API"}),(0,s.jsx)(l.SP,{value:"database",children:"Database"}),(0,s.jsx)(l.SP,{value:"cache",children:"Cache"}),(0,s.jsx)(l.SP,{value:"search",children:"Search"})]}),(0,s.jsxs)(l.nU,{value:"overview",className:"space-y-6",children:[(0,s.jsxs)("div",{className:"grid gap-4 md:grid-cols-2 lg:grid-cols-4",children:[(0,s.jsx)(o,{title:"System Status",value:(null==e?void 0:e.system.healthy)?"Healthy":"Unhealthy",description:"Uptime: ".concat((0,d.LU)(null==e?void 0:e.system.uptime)),loading:t}),(0,s.jsx)(o,{title:"Error Rate",value:"".concat((0,d.uf)(null==e?void 0:e.errors.rate),"%"),trend:-2.5,loading:t}),(0,s.jsx)(o,{title:"Avg Response Time",value:(0,d.LU)(null==e?void 0:e.responseTime.average),trend:1.8,loading:t}),(0,s.jsx)(o,{title:"Request Rate",value:"".concat((0,d.uf)(null==e?void 0:e.requests.rate),"/s"),trend:5.2,loading:t})]}),(0,s.jsxs)("div",{className:"grid gap-4 md:grid-cols-2",children:[(0,s.jsx)(f,{title:"Response Time Distribution",data:(null==e?void 0:e.responseTime.distribution)||[],type:"bar",dataKey:"count",xAxisKey:"bucket",loading:t}),(0,s.jsx)(f,{title:"Error Rate Trend",data:(null==e?void 0:e.errors.trend)||[],dataKey:"count",loading:t,color:"#ef4444"})]})]}),(0,s.jsx)(l.nU,{value:"api",className:"space-y-6",children:(0,s.jsx)(S,{title:"Endpoint Performance",columns:[{key:"endpoint",title:"Endpoint"},{key:"count",title:"Requests",format:d.uf},{key:"avgResponseTime",title:"Avg Response Time",format:d.LU},{key:"errorRate",title:"Error Rate",format:e=>"".concat((0,d.uf)(e),"%")}],data:(null==e?void 0:e.requests.byEndpoint)||[],loading:t})}),(0,s.jsxs)(l.nU,{value:"database",className:"space-y-6",children:[(0,s.jsxs)("div",{className:"grid gap-4 md:grid-cols-3",children:[(0,s.jsx)(o,{title:"Active Connections",value:(0,d.uf)(null==i?void 0:i.activeConnections),description:"Pool Size: ".concat((0,d.uf)(null==i?void 0:i.poolSize)),loading:r}),(0,s.jsx)(o,{title:"Waiting Connections",value:(0,d.uf)(null==i?void 0:i.waitingConnections),loading:r})]}),(0,s.jsx)(S,{title:"Slow Queries",columns:[{key:"query",title:"Query"},{key:"duration",title:"Duration",format:d.LU},{key:"timestamp",title:"Timestamp",format:d.p6}],data:(null==i?void 0:i.slowQueries)||[],loading:r})]}),(0,s.jsxs)(l.nU,{value:"cache",className:"space-y-6",children:[(0,s.jsxs)("div",{className:"grid gap-4 md:grid-cols-3",children:[(0,s.jsx)(o,{title:"Hit Rate",value:"".concat((0,d.uf)(null==c?void 0:c.hitRate),"%"),loading:u}),(0,s.jsx)(o,{title:"Cache Size",value:(0,d.td)(null==c?void 0:c.size),loading:u}),(0,s.jsx)(o,{title:"Evictions",value:(0,d.uf)(null==c?void 0:c.evictions),loading:u})]}),(0,s.jsx)(S,{title:"Cache Keys",columns:[{key:"key",title:"Key"},{key:"hits",title:"Hits",format:d.uf},{key:"misses",title:"Misses",format:d.uf},{key:"size",title:"Size",format:d.td}],data:(null==c?void 0:c.byKey)||[],loading:u})]}),(0,s.jsxs)(l.nU,{value:"search",className:"space-y-6",children:[(0,s.jsxs)("div",{className:"grid gap-4 md:grid-cols-3",children:[(0,s.jsx)(o,{title:"Average Latency",value:(0,d.LU)(null==x?void 0:x.averageLatency),loading:m}),(0,s.jsx)(o,{title:"Query Volume",value:"".concat((0,d.uf)(null==x?void 0:x.queryVolume),"/s"),loading:m}),(0,s.jsx)(o,{title:"Index Size",value:(0,d.td)(null==x?void 0:x.indexSize),loading:m})]}),(0,s.jsx)(S,{title:"Query Stats",columns:[{key:"type",title:"Query Type"},{key:"count",title:"Count",format:d.uf},{key:"avgLatency",title:"Avg Latency",format:d.LU}],data:(null==x?void 0:x.queryStats)||[],loading:m})]})]})})}}},function(e){e.O(0,[9774,632,7842,2385,7901,4712,5397,1688,8728,4714,2943,5148,8487,1523,1744],function(){return e(e.s=7999)}),_N_E=e.O()}]);