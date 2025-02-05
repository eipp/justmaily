"use strict";exports.id=501,exports.ids=[501],exports.modules={6478:(e,t,r)=>{r.d(t,{Z:()=>n});var s=r(1159),i={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};let a=e=>e.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase().trim(),n=(e,t)=>{let r=(0,s.forwardRef)(({color:r="currentColor",size:n=24,strokeWidth:u=2,absoluteStrokeWidth:o,className:l="",children:c,...h},d)=>(0,s.createElement)("svg",{ref:d,...i,width:n,height:n,stroke:r,strokeWidth:o?24*Number(u)/Number(n):u,className:["lucide",`lucide-${a(e)}`,l].join(" "),...h},[...t.map(([e,t])=>(0,s.createElement)(e,t)),...Array.isArray(c)?c:[c]]));return r.displayName=`${e}`,r}},1112:(e,t,r)=>{r.d(t,{Z:()=>s});let s=(0,r(6478).Z)("Activity",[["path",{d:"M22 12h-4l-3 9L9 3l-3 9H2",key:"d5dnw9"}]])},767:(e,t,r)=>{r.d(t,{Z:()=>s});let s=(0,r(6478).Z)("AlertCircle",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["line",{x1:"12",x2:"12",y1:"8",y2:"12",key:"1pkeuh"}],["line",{x1:"12",x2:"12.01",y1:"16",y2:"16",key:"4dfq90"}]])},4553:(e,t,r)=>{r.d(t,{Z:()=>s});let s=(0,r(6478).Z)("BarChart2",[["line",{x1:"18",x2:"18",y1:"20",y2:"10",key:"1xfpm4"}],["line",{x1:"12",x2:"12",y1:"20",y2:"4",key:"be30l9"}],["line",{x1:"6",x2:"6",y1:"20",y2:"14",key:"1r4le6"}]])},4120:(e,t,r)=>{r.d(t,{Z:()=>s});let s=(0,r(6478).Z)("Clock",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["polyline",{points:"12 6 12 12 16 14",key:"68esgv"}]])},2604:(e,t,r)=>{r.d(t,{c:()=>o});var s=r(3791),i=r(3341);function a(e){return{onFetch:(t,r)=>{let s=t.options,a=t.fetchOptions?.meta?.fetchMore?.direction,o=t.state.data?.pages||[],l=t.state.data?.pageParams||[],c={pages:[],pageParams:[]},h=0,d=async()=>{let r=!1,d=e=>{Object.defineProperty(e,"signal",{enumerable:!0,get:()=>(t.signal.aborted?r=!0:t.signal.addEventListener("abort",()=>{r=!0}),t.signal)})},f=(0,i.cG)(t.options,t.fetchOptions),p=async(e,s,a)=>{if(r)return Promise.reject();if(null==s&&e.pages.length)return Promise.resolve(e);let n={client:t.client,queryKey:t.queryKey,pageParam:s,direction:a?"backward":"forward",meta:t.options.meta};d(n);let u=await f(n),{maxPages:o}=t.options,l=a?i.Ht:i.VX;return{pages:l(e.pages,u,o),pageParams:l(e.pageParams,s,o)}};if(a&&o.length){let e="backward"===a,t={pages:o,pageParams:l},r=(e?u:n)(s,t);c=await p(t,r,e)}else{let t=e??o.length;do{let e=0===h?l[0]??s.initialPageParam:n(s,c);if(h>0&&null==e)break;c=await p(c,e),h++}while(h<t)}return c};t.options.persister?t.fetchFn=()=>t.options.persister?.(d,{client:t.client,queryKey:t.queryKey,meta:t.options.meta,signal:t.signal},r):t.fetchFn=d}}}function n(e,{pages:t,pageParams:r}){let s=t.length-1;return t.length>0?e.getNextPageParam(t[s],t,r[s],r):void 0}function u(e,{pages:t,pageParams:r}){return t.length>0?e.getPreviousPageParam?.(t[0],t,r[0],r):void 0}var o=class extends s.z{constructor(e,t){super(e,t)}bindMethods(){super.bindMethods(),this.fetchNextPage=this.fetchNextPage.bind(this),this.fetchPreviousPage=this.fetchPreviousPage.bind(this)}setOptions(e,t){super.setOptions({...e,behavior:a()},t)}getOptimisticResult(e){return e.behavior=a(),super.getOptimisticResult(e)}fetchNextPage(e){return this.fetch({...e,meta:{fetchMore:{direction:"forward"}}})}fetchPreviousPage(e){return this.fetch({...e,meta:{fetchMore:{direction:"backward"}}})}createResult(e,t){var r,s;let{state:i}=e,a=super.createResult(e,t),{isFetching:o,isRefetching:l,isError:c,isRefetchError:h}=a,d=i.fetchMeta?.fetchMore?.direction,f=c&&"forward"===d,p=o&&"forward"===d,g=c&&"backward"===d,y=o&&"backward"===d;return{...a,fetchNextPage:this.fetchNextPage,fetchPreviousPage:this.fetchPreviousPage,hasNextPage:!!(r=i.data)&&null!=n(t,r),hasPreviousPage:!!(s=i.data)&&!!t.getPreviousPageParam&&null!=u(t,s),isFetchNextPageError:f,isFetchingNextPage:p,isFetchPreviousPageError:g,isFetchingPreviousPage:y,isRefetchError:h&&!f&&!g,isRefetching:l&&!p&&!y}}}},476:(e,t,r)=>{r.d(t,{HydrationBoundary:()=>u});var s=r(7577);function i(e){return e}function a(e,t,r){if("object"!=typeof t||null===t)return;let s=e.getMutationCache(),a=e.getQueryCache(),n=r?.defaultOptions?.deserializeData??e.getDefaultOptions().hydrate?.deserializeData??i,u=t.mutations||[],o=t.queries||[];u.forEach(({state:t,...i})=>{s.build(e,{...e.getDefaultOptions().hydrate?.mutations,...r?.defaultOptions?.mutations,...i},t)}),o.forEach(({queryKey:t,state:s,queryHash:i,meta:u,promise:o})=>{let l=a.get(i),c=void 0===s.data?s.data:n(s.data);if(l){if(l.state.dataUpdatedAt<s.dataUpdatedAt){let{fetchStatus:e,...t}=s;l.setState({...t,data:c})}}else l=a.build(e,{...e.getDefaultOptions().hydrate?.queries,...r?.defaultOptions?.queries,queryKey:t,queryHash:i,meta:u},{...s,data:c,fetchStatus:"idle"});if(o){let e=Promise.resolve(o).then(n);l.fetch(void 0,{initialPromise:e})}})}var n=r(4976),u=({children:e,options:t={},state:r,queryClient:i})=>{let u=(0,n.useQueryClient)(i),[o,l]=s.useState(),c=s.useRef(t);return c.current=t,s.useMemo(()=>{if(r){if("object"!=typeof r)return;let e=u.getQueryCache(),t=r.queries||[],s=[],i=[];for(let r of t){let t=e.get(r.queryHash);if(t){let e=r.state.dataUpdatedAt>t.state.dataUpdatedAt,s=o?.find(e=>e.queryHash===r.queryHash);e&&(!s||r.state.dataUpdatedAt>s.state.dataUpdatedAt)&&i.push(r)}else s.push(r)}s.length>0&&a(u,{queries:s},c.current),i.length>0&&l(e=>e?[...e,...i]:i)}},[u,o,r]),s.useEffect(()=>{o&&(a(u,{queries:o},c.current),l(void 0))},[u,o]),e}},6284:(e,t,r)=>{r.d(t,{useInfiniteQuery:()=>a});var s=r(2604),i=r(9279);function a(e,t){return(0,i.r)(e,s.c,t)}},2268:(e,t,r)=>{r.d(t,{useIsFetching:()=>n});var s=r(7577),i=r(2113),a=r(4976);function n(e,t){let r=(0,a.useQueryClient)(t),n=r.getQueryCache();return s.useSyncExternalStore(s.useCallback(e=>n.subscribe(i.V.batchCalls(e)),[n]),()=>r.isFetching(e),()=>r.isFetching(e))}},7710:(e,t,r)=>{r.d(t,{useIsMutating:()=>u,useMutationState:()=>l});var s=r(7577),i=r(3341),a=r(2113),n=r(4976);function u(e,t){let r=(0,n.useQueryClient)(t);return l({filters:{...e,status:"pending"}},r).length}function o(e,t){return e.findAll(t.filters).map(e=>t.select?t.select(e):e.state)}function l(e={},t){let r=(0,n.useQueryClient)(t).getMutationCache(),u=s.useRef(e),l=s.useRef(null);return l.current||(l.current=o(r,e)),s.useEffect(()=>{u.current=e}),s.useSyncExternalStore(s.useCallback(e=>r.subscribe(()=>{let t=(0,i.Q$)(l.current,o(r,u.current));l.current!==t&&(l.current=t,a.V.schedule(e))}),[r]),()=>l.current,()=>l.current)}},6324:(e,t,r)=>{r.d(t,{useQueries:()=>y});var s=r(7577),i=r(2113),a=r(3791),n=r(4351),u=r(3341);function o(e,t){return e.filter(e=>!t.includes(e))}var l=class extends n.l{#e;#t;#r;#s;#i;#a;#n;#u;constructor(e,t,r){super(),this.#e=e,this.#s=r,this.#r=[],this.#i=[],this.#t=[],this.setQueries(t)}onSubscribe(){1===this.listeners.size&&this.#i.forEach(e=>{e.subscribe(t=>{this.#o(e,t)})})}onUnsubscribe(){this.listeners.size||this.destroy()}destroy(){this.listeners=new Set,this.#i.forEach(e=>{e.destroy()})}setQueries(e,t,r){this.#r=e,this.#s=t,i.V.batch(()=>{let e=this.#i,t=this.#l(this.#r);t.forEach(e=>e.observer.setOptions(e.defaultedQueryOptions,r));let s=t.map(e=>e.observer),i=s.map(e=>e.getCurrentResult()),a=s.some((t,r)=>t!==e[r]);(e.length!==s.length||a)&&(this.#i=s,this.#t=i,this.hasListeners()&&(o(e,s).forEach(e=>{e.destroy()}),o(s,e).forEach(e=>{e.subscribe(t=>{this.#o(e,t)})}),this.#c()))})}getCurrentResult(){return this.#t}getQueries(){return this.#i.map(e=>e.getCurrentQuery())}getObservers(){return this.#i}getOptimisticResult(e,t){let r=this.#l(e).map(e=>e.observer.getOptimisticResult(e.defaultedQueryOptions));return[r,e=>this.#h(e??r,t),()=>this.#d(r,e)]}#d(e,t){let r=this.#l(t);return r.map((t,s)=>{let i=e[s];return t.defaultedQueryOptions.notifyOnChangeProps?i:t.observer.trackResult(i,e=>{r.forEach(t=>{t.observer.trackProp(e)})})})}#h(e,t){return t?(this.#a&&this.#t===this.#u&&t===this.#n||(this.#n=t,this.#u=this.#t,this.#a=(0,u.Q$)(this.#a,t(e))),this.#a):e}#l(e){let t=new Map(this.#i.map(e=>[e.options.queryHash,e])),r=[];return e.forEach(e=>{let s=this.#e.defaultQueryOptions(e),i=t.get(s.queryHash);i?r.push({defaultedQueryOptions:s,observer:i}):r.push({defaultedQueryOptions:s,observer:new a.z(this.#e,s)})}),r}#o(e,t){let r=this.#i.indexOf(e);-1!==r&&(this.#t=function(e,t,r){let s=e.slice(0);return s[t]=r,s}(this.#t,r,t),this.#c())}#c(){this.hasListeners()&&this.#a!==this.#h(this.#d(this.#t,this.#r),this.#s?.combine)&&i.V.batch(()=>{this.listeners.forEach(e=>{e(this.#t)})})}},c=r(4976),h=r(2151),d=r(3550),f=r(3875),p=r(4138),g=r(8613);function y({queries:e,...t},r){let n=(0,c.useQueryClient)(r),u=(0,h.useIsRestoring)(),o=(0,d.useQueryErrorResetBoundary)(),y=s.useMemo(()=>e.map(e=>{let t=n.defaultQueryOptions(e);return t._optimisticResults=u?"isRestoring":"optimistic",t}),[e,n,u]);y.forEach(e=>{(0,p.A8)(e),(0,f.pf)(e,o)}),(0,f.JN)(o);let[b]=s.useState(()=>new l(n,y,t)),[m,v,P]=b.getOptimisticResult(y,t.combine),w=!u&&!1!==t.subscribed;s.useSyncExternalStore(s.useCallback(e=>w?b.subscribe(i.V.batchCalls(e)):g.Z,[b,w]),()=>b.getCurrentResult(),()=>b.getCurrentResult()),s.useEffect(()=>{b.setQueries(y,t,{listeners:!1})},[y,t,b]);let O=m.some((e,t)=>(0,p.SB)(y[t],e))?m.flatMap((e,t)=>{let r=y[t];if(r){let t=new a.z(n,r);if((0,p.SB)(r,e))return(0,p.j8)(r,t,o);(0,p.Z$)(e,u)&&(0,p.j8)(r,t,o)}return[]}):[];if(O.length>0)throw Promise.all(O);let C=m.find((e,t)=>{let r=y[t];return r&&(0,f.KJ)({result:e,errorResetBoundary:o,throwOnError:r.throwOnError,query:n.getQueryCache().get(r.queryHash),suspense:y[t]?.suspense})});if(C?.error)throw C.error;return v(P())}},115:(e,t,r)=>{r.d(t,{useSuspenseInfiniteQuery:()=>n});var s=r(2604),i=r(9279),a=r(4138);function n(e,t){return(0,i.r)({...e,enabled:!0,suspense:!0,throwOnError:a.Ct},s.c,t)}},5486:(e,t,r)=>{r.d(t,{useSuspenseQueries:()=>a});var s=r(6324),i=r(4138);function a(e,t){return(0,s.useQueries)({...e,queries:e.queries.map(e=>({...e,suspense:!0,throwOnError:i.Ct,enabled:!0,placeholderData:void 0}))},t)}},5532:(e,t,r)=>{r.d(t,{useSuspenseQuery:()=>n});var s=r(3791),i=r(9279),a=r(4138);function n(e,t){return(0,i.r)({...e,enabled:!0,suspense:!0,throwOnError:a.Ct,placeholderData:void 0},s.z,t)}},4034:(e,t,r)=>{r.d(t,{a:()=>s});let s=(0,r(8570).createProxy)(String.raw`/Users/ivanpeychev/Projects/MindburnLabs/justmaily/apps/maily-web/node_modules/@tanstack/react-query/build/modern/useQuery.js#useQuery`)}};