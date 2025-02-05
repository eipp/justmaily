"use strict";exports.id=865,exports.ids=[865],exports.modules={167:(t,e)=>{e._=e._interop_require_default=function(t){return t&&t.__esModule?t:{default:t}}},8285:(t,e,r)=>{function s(t,e){if(!Object.prototype.hasOwnProperty.call(t,e))throw TypeError("attempted to use private field on non-instance");return t}r.r(e),r.d(e,{_:()=>s,_class_private_field_loose_base:()=>s})},8817:(t,e,r)=>{r.r(e),r.d(e,{_:()=>i,_class_private_field_loose_key:()=>i});var s=0;function i(t){return"__private_"+s+++"_"+t}},1174:(t,e,r)=>{function s(t){return t&&t.__esModule?t:{default:t}}r.r(e),r.d(e,{_:()=>s,_interop_require_default:()=>s})},8374:(t,e,r)=>{function s(t){if("function"!=typeof WeakMap)return null;var e=new WeakMap,r=new WeakMap;return(s=function(t){return t?r:e})(t)}function i(t,e){if(!e&&t&&t.__esModule)return t;if(null===t||"object"!=typeof t&&"function"!=typeof t)return{default:t};var r=s(e);if(r&&r.has(t))return r.get(t);var i={__proto__:null},n=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var u in t)if("default"!==u&&Object.prototype.hasOwnProperty.call(t,u)){var o=n?Object.getOwnPropertyDescriptor(t,u):null;o&&(o.get||o.set)?Object.defineProperty(i,u,o):i[u]=t[u]}return i.default=t,r&&r.set(t,i),i}r.r(e),r.d(e,{_:()=>i,_interop_require_wildcard:()=>i})},7739:(t,e,r)=>{r.d(e,{j:()=>n});var s=r(4351),i=r(3341),n=new class extends s.l{#t;#e;#r;constructor(){super(),this.#r=t=>{if(!i.sk&&window.addEventListener){let e=()=>t();return window.addEventListener("visibilitychange",e,!1),()=>{window.removeEventListener("visibilitychange",e)}}}}onSubscribe(){this.#e||this.setEventListener(this.#r)}onUnsubscribe(){this.hasListeners()||(this.#e?.(),this.#e=void 0)}setEventListener(t){this.#r=t,this.#e?.(),this.#e=t(t=>{"boolean"==typeof t?this.setFocused(t):this.onFocus()})}setFocused(t){this.#t!==t&&(this.#t=t,this.onFocus())}onFocus(){let t=this.isFocused();this.listeners.forEach(e=>{e(t)})}isFocused(){return"boolean"==typeof this.#t?this.#t:globalThis.document?.visibilityState!=="hidden"}}},2113:(t,e,r)=>{r.d(e,{V:()=>s});var s=function(){let t=[],e=0,r=t=>{t()},s=t=>{t()},i=t=>setTimeout(t,0),n=s=>{e?t.push(s):i(()=>{r(s)})},u=()=>{let e=t;t=[],e.length&&i(()=>{s(()=>{e.forEach(t=>{r(t)})})})};return{batch:t=>{let r;e++;try{r=t()}finally{--e||u()}return r},batchCalls:t=>(...e)=>{n(()=>{t(...e)})},schedule:n,setNotifyFunction:t=>{r=t},setBatchNotifyFunction:t=>{s=t},setScheduler:t=>{i=t}}}()},3791:(t,e,r)=>{r.d(e,{z:()=>c});var s=r(7739),i=r(2113),n=r(3341),u=r(1638);r(5621).F;var o=r(4351),a=r(2244),c=class extends o.l{constructor(t,e){super(),this.options=e,this.#s=t,this.#i=null,this.#n=(0,a.O)(),this.options.experimental_prefetchInRender||this.#n.reject(Error("experimental_prefetchInRender feature flag is not enabled")),this.bindMethods(),this.setOptions(e)}#s;#u=void 0;#o=void 0;#a=void 0;#c;#l;#n;#i;#h;#d;#p;#f;#y;#v;#b=new Set;bindMethods(){this.refetch=this.refetch.bind(this)}onSubscribe(){1===this.listeners.size&&(this.#u.addObserver(this),l(this.#u,this.options)?this.#m():this.updateResult(),this.#R())}onUnsubscribe(){this.hasListeners()||this.destroy()}shouldFetchOnReconnect(){return h(this.#u,this.options,this.options.refetchOnReconnect)}shouldFetchOnWindowFocus(){return h(this.#u,this.options,this.options.refetchOnWindowFocus)}destroy(){this.listeners=new Set,this.#g(),this.#O(),this.#u.removeObserver(this)}setOptions(t,e){let r=this.options,s=this.#u;if(this.options=this.#s.defaultQueryOptions(t),void 0!==this.options.enabled&&"boolean"!=typeof this.options.enabled&&"function"!=typeof this.options.enabled&&"boolean"!=typeof(0,n.Nc)(this.options.enabled,this.#u))throw Error("Expected enabled to be a boolean or a callback that returns a boolean");this.#w(),this.#u.setOptions(this.options),r._defaulted&&!(0,n.VS)(this.options,r)&&this.#s.getQueryCache().notify({type:"observerOptionsUpdated",query:this.#u,observer:this});let i=this.hasListeners();i&&d(this.#u,s,this.options,r)&&this.#m(),this.updateResult(e),i&&(this.#u!==s||(0,n.Nc)(this.options.enabled,this.#u)!==(0,n.Nc)(r.enabled,this.#u)||(0,n.KC)(this.options.staleTime,this.#u)!==(0,n.KC)(r.staleTime,this.#u))&&this.#Q();let u=this.#_();i&&(this.#u!==s||(0,n.Nc)(this.options.enabled,this.#u)!==(0,n.Nc)(r.enabled,this.#u)||u!==this.#v)&&this.#C(u)}getOptimisticResult(t){let e=this.#s.getQueryCache().build(this.#s,t),r=this.createResult(e,t);return(0,n.VS)(this.getCurrentResult(),r)||(this.#a=r,this.#l=this.options,this.#c=this.#u.state),r}getCurrentResult(){return this.#a}trackResult(t,e){let r={};return Object.keys(t).forEach(s=>{Object.defineProperty(r,s,{configurable:!1,enumerable:!0,get:()=>(this.trackProp(s),e?.(s),t[s])})}),r}trackProp(t){this.#b.add(t)}getCurrentQuery(){return this.#u}refetch({...t}={}){return this.fetch({...t})}fetchOptimistic(t){let e=this.#s.defaultQueryOptions(t),r=this.#s.getQueryCache().build(this.#s,e);return r.fetch().then(()=>this.createResult(r,e))}fetch(t){return this.#m({...t,cancelRefetch:t.cancelRefetch??!0}).then(()=>(this.updateResult(),this.#a))}#m(t){this.#w();let e=this.#u.fetch(this.options,t);return t?.throwOnError||(e=e.catch(n.ZT)),e}#Q(){this.#g();let t=(0,n.KC)(this.options.staleTime,this.#u);if(n.sk||this.#a.isStale||!(0,n.PN)(t))return;let e=(0,n.Kp)(this.#a.dataUpdatedAt,t);this.#f=setTimeout(()=>{this.#a.isStale||this.updateResult()},e+1)}#_(){return("function"==typeof this.options.refetchInterval?this.options.refetchInterval(this.#u):this.options.refetchInterval)??!1}#C(t){this.#O(),this.#v=t,!n.sk&&!1!==(0,n.Nc)(this.options.enabled,this.#u)&&(0,n.PN)(this.#v)&&0!==this.#v&&(this.#y=setInterval(()=>{(this.options.refetchIntervalInBackground||s.j.isFocused())&&this.#m()},this.#v))}#R(){this.#Q(),this.#C(this.#_())}#g(){this.#f&&(clearTimeout(this.#f),this.#f=void 0)}#O(){this.#y&&(clearInterval(this.#y),this.#y=void 0)}createResult(t,e){let r;let s=this.#u,i=this.options,o=this.#a,c=this.#c,h=this.#l,f=t!==s?t.state:this.#o,{state:y}=t,v={...y},b=!1;if(e._optimisticResults){var m,R;let r=this.hasListeners(),n=!r&&l(t,e),o=r&&d(t,s,e,i);(n||o)&&(v={...v,...(m=y.data,R=t.options,{fetchFailureCount:0,fetchFailureReason:null,fetchStatus:(0,u.Kw)(R.networkMode)?"fetching":"paused",...void 0===m&&{error:null,status:"pending"}})}),"isRestoring"===e._optimisticResults&&(v.fetchStatus="idle")}let{error:g,errorUpdatedAt:O,status:w}=v;if(e.select&&void 0!==v.data){if(o&&v.data===c?.data&&e.select===this.#h)r=this.#d;else try{this.#h=e.select,r=e.select(v.data),r=(0,n.oE)(o?.data,r,e),this.#d=r,this.#i=null}catch(t){this.#i=t}}else r=v.data;if(void 0!==e.placeholderData&&void 0===r&&"pending"===w){let t;if(o?.isPlaceholderData&&e.placeholderData===h?.placeholderData)t=o.data;else if(t="function"==typeof e.placeholderData?e.placeholderData(this.#p?.state.data,this.#p):e.placeholderData,e.select&&void 0!==t)try{t=e.select(t),this.#i=null}catch(t){this.#i=t}void 0!==t&&(w="success",r=(0,n.oE)(o?.data,t,e),b=!0)}this.#i&&(g=this.#i,r=this.#d,O=Date.now(),w="error");let Q="fetching"===v.fetchStatus,_="pending"===w,C="error"===w,S=_&&Q,E=void 0!==r,T={status:w,fetchStatus:v.fetchStatus,isPending:_,isSuccess:"success"===w,isError:C,isInitialLoading:S,isLoading:S,data:r,dataUpdatedAt:v.dataUpdatedAt,error:g,errorUpdatedAt:O,failureCount:v.fetchFailureCount,failureReason:v.fetchFailureReason,errorUpdateCount:v.errorUpdateCount,isFetched:v.dataUpdateCount>0||v.errorUpdateCount>0,isFetchedAfterMount:v.dataUpdateCount>f.dataUpdateCount||v.errorUpdateCount>f.errorUpdateCount,isFetching:Q,isRefetching:Q&&!_,isLoadingError:C&&!E,isPaused:"paused"===v.fetchStatus,isPlaceholderData:b,isRefetchError:C&&E,isStale:p(t,e),refetch:this.refetch,promise:this.#n};if(this.options.experimental_prefetchInRender){let e=t=>{"error"===T.status?t.reject(T.error):void 0!==T.data&&t.resolve(T.data)},r=()=>{e(this.#n=T.promise=(0,a.O)())},i=this.#n;switch(i.status){case"pending":t.queryHash===s.queryHash&&e(i);break;case"fulfilled":("error"===T.status||T.data!==i.value)&&r();break;case"rejected":("error"!==T.status||T.error!==i.reason)&&r()}}return T}updateResult(t){let e=this.#a,r=this.createResult(this.#u,this.options);if(this.#c=this.#u.state,this.#l=this.options,void 0!==this.#c.data&&(this.#p=this.#u),(0,n.VS)(r,e))return;this.#a=r;let s={};t?.listeners!==!1&&(()=>{if(!e)return!0;let{notifyOnChangeProps:t}=this.options,r="function"==typeof t?t():t;if("all"===r||!r&&!this.#b.size)return!0;let s=new Set(r??this.#b);return this.options.throwOnError&&s.add("error"),Object.keys(this.#a).some(t=>this.#a[t]!==e[t]&&s.has(t))})()&&(s.listeners=!0),this.#S({...s,...t})}#w(){let t=this.#s.getQueryCache().build(this.#s,this.options);if(t===this.#u)return;let e=this.#u;this.#u=t,this.#o=t.state,this.hasListeners()&&(e?.removeObserver(this),t.addObserver(this))}onQueryUpdate(){this.updateResult(),this.hasListeners()&&this.#R()}#S(t){i.V.batch(()=>{t.listeners&&this.listeners.forEach(t=>{t(this.#a)}),this.#s.getQueryCache().notify({query:this.#u,type:"observerResultsUpdated"})})}};function l(t,e){return!1!==(0,n.Nc)(e.enabled,t)&&void 0===t.state.data&&!("error"===t.state.status&&!1===e.retryOnMount)||void 0!==t.state.data&&h(t,e,e.refetchOnMount)}function h(t,e,r){if(!1!==(0,n.Nc)(e.enabled,t)){let s="function"==typeof r?r(t):r;return"always"===s||!1!==s&&p(t,e)}return!1}function d(t,e,r,s){return(t!==e||!1===(0,n.Nc)(s.enabled,t))&&(!r.suspense||"error"!==t.state.status)&&p(t,r)}function p(t,e){return!1!==(0,n.Nc)(e.enabled,t)&&t.isStaleByTime((0,n.KC)(e.staleTime,t))}},5621:(t,e,r)=>{r.d(e,{F:()=>i});var s=r(3341),i=class{#E;destroy(){this.clearGcTimeout()}scheduleGc(){this.clearGcTimeout(),(0,s.PN)(this.gcTime)&&(this.#E=setTimeout(()=>{this.optionalRemove()},this.gcTime))}updateGcTime(t){this.gcTime=Math.max(this.gcTime||0,t??(s.sk?1/0:3e5))}clearGcTimeout(){this.#E&&(clearTimeout(this.#E),this.#E=void 0)}}},1638:(t,e,r)=>{r.d(e,{Kw:()=>c,Mz:()=>d,DV:()=>h});var s=r(7739),i=r(4351),n=r(3341),u=new class extends i.l{#T=!0;#e;#r;constructor(){super(),this.#r=t=>{if(!n.sk&&window.addEventListener){let e=()=>t(!0),r=()=>t(!1);return window.addEventListener("online",e,!1),window.addEventListener("offline",r,!1),()=>{window.removeEventListener("online",e),window.removeEventListener("offline",r)}}}}onSubscribe(){this.#e||this.setEventListener(this.#r)}onUnsubscribe(){this.hasListeners()||(this.#e?.(),this.#e=void 0)}setEventListener(t){this.#r=t,this.#e?.(),this.#e=t(this.setOnline.bind(this))}setOnline(t){this.#T!==t&&(this.#T=t,this.listeners.forEach(e=>{e(t)}))}isOnline(){return this.#T}},o=r(2244);function a(t){return Math.min(1e3*2**t,3e4)}function c(t){return(t??"online")!=="online"||u.isOnline()}var l=class extends Error{constructor(t){super("CancelledError"),this.revert=t?.revert,this.silent=t?.silent}};function h(t){return t instanceof l}function d(t){let e,r=!1,i=0,h=!1,d=(0,o.O)(),p=()=>s.j.isFocused()&&("always"===t.networkMode||u.isOnline())&&t.canRun(),f=()=>c(t.networkMode)&&t.canRun(),y=r=>{h||(h=!0,t.onSuccess?.(r),e?.(),d.resolve(r))},v=r=>{h||(h=!0,t.onError?.(r),e?.(),d.reject(r))},b=()=>new Promise(r=>{e=t=>{(h||p())&&r(t)},t.onPause?.()}).then(()=>{e=void 0,h||t.onContinue?.()}),m=()=>{let e;if(h)return;let s=0===i?t.initialPromise:void 0;try{e=s??t.fn()}catch(t){e=Promise.reject(t)}Promise.resolve(e).then(y).catch(e=>{if(h)return;let s=t.retry??(n.sk?0:3),u=t.retryDelay??a,o="function"==typeof u?u(i,e):u,c=!0===s||"number"==typeof s&&i<s||"function"==typeof s&&s(i,e);if(r||!c){v(e);return}i++,t.onFail?.(i,e),(0,n._v)(o).then(()=>p()?void 0:b()).then(()=>{r?v(e):m()})})};return{promise:d,cancel:e=>{h||(v(new l(e)),t.abort?.())},continue:()=>(e?.(),d),cancelRetry:()=>{r=!0},continueRetry:()=>{r=!1},canStart:f,start:()=>(f()?m():b().then(m),d)}}},4351:(t,e,r)=>{r.d(e,{l:()=>s});var s=class{constructor(){this.listeners=new Set,this.subscribe=this.subscribe.bind(this)}subscribe(t){return this.listeners.add(t),this.onSubscribe(),()=>{this.listeners.delete(t),this.onUnsubscribe()}}hasListeners(){return this.listeners.size>0}onSubscribe(){}onUnsubscribe(){}}},2244:(t,e,r)=>{r.d(e,{O:()=>s});function s(){let t,e;let r=new Promise((r,s)=>{t=r,e=s});function s(t){Object.assign(r,t),delete r.resolve,delete r.reject}return r.status="pending",r.catch(()=>{}),r.resolve=e=>{s({status:"fulfilled",value:e}),t(e)},r.reject=t=>{s({status:"rejected",reason:t}),e(t)},r}},3341:(t,e,r)=>{r.d(e,{CN:()=>R,Ht:()=>m,KC:()=>o,Kp:()=>u,Nc:()=>a,PN:()=>n,Q$:()=>l,VS:()=>h,VX:()=>b,Ym:()=>c,ZT:()=>i,_v:()=>y,cG:()=>g,oE:()=>v,sk:()=>s});var s="undefined"==typeof window||"Deno"in globalThis;function i(){}function n(t){return"number"==typeof t&&t>=0&&t!==1/0}function u(t,e){return Math.max(t+(e||0)-Date.now(),0)}function o(t,e){return"function"==typeof t?t(e):t}function a(t,e){return"function"==typeof t?t(e):t}function c(t){return JSON.stringify(t,(t,e)=>p(e)?Object.keys(e).sort().reduce((t,r)=>(t[r]=e[r],t),{}):e)}function l(t,e){if(t===e)return t;let r=d(t)&&d(e);if(r||p(t)&&p(e)){let s=r?t:Object.keys(t),i=s.length,n=r?e:Object.keys(e),u=n.length,o=r?[]:{},a=0;for(let i=0;i<u;i++){let u=r?i:n[i];(!r&&s.includes(u)||r)&&void 0===t[u]&&void 0===e[u]?(o[u]=void 0,a++):(o[u]=l(t[u],e[u]),o[u]===t[u]&&void 0!==t[u]&&a++)}return i===u&&a===i?t:o}return e}function h(t,e){if(!e||Object.keys(t).length!==Object.keys(e).length)return!1;for(let r in t)if(t[r]!==e[r])return!1;return!0}function d(t){return Array.isArray(t)&&t.length===Object.keys(t).length}function p(t){if(!f(t))return!1;let e=t.constructor;if(void 0===e)return!0;let r=e.prototype;return!!(f(r)&&r.hasOwnProperty("isPrototypeOf"))&&Object.getPrototypeOf(t)===Object.prototype}function f(t){return"[object Object]"===Object.prototype.toString.call(t)}function y(t){return new Promise(e=>{setTimeout(e,t)})}function v(t,e,r){return"function"==typeof r.structuralSharing?r.structuralSharing(t,e):!1!==r.structuralSharing?l(t,e):e}function b(t,e,r=0){let s=[...t,e];return r&&s.length>r?s.slice(1):s}function m(t,e,r=0){let s=[e,...t];return r&&s.length>r?s.slice(0,-1):s}var R=Symbol();function g(t,e){return!t.queryFn&&e?.initialPromise?()=>e.initialPromise:t.queryFn&&t.queryFn!==R?t.queryFn:()=>Promise.reject(Error(`Missing queryFn: '${t.queryHash}'`))}},4976:(t,e,r)=>{r.r(e),r.d(e,{QueryClientContext:()=>n,QueryClientProvider:()=>o,useQueryClient:()=>u});var s=r(7577),i=r(326),n=s.createContext(void 0),u=t=>{let e=s.useContext(n);if(t)return t;if(!e)throw Error("No QueryClient set, use QueryClientProvider to set one");return e},o=({client:t,children:e})=>(s.useEffect(()=>(t.mount(),()=>{t.unmount()}),[t]),(0,i.jsx)(n.Provider,{value:t,children:e}))},3550:(t,e,r)=>{r.d(e,{QueryErrorResetBoundary:()=>a,useQueryErrorResetBoundary:()=>o});var s=r(7577),i=r(326);function n(){let t=!1;return{clearReset:()=>{t=!1},reset:()=>{t=!0},isReset:()=>t}}var u=s.createContext(n()),o=()=>s.useContext(u),a=({children:t})=>{let[e]=s.useState(()=>n());return(0,i.jsx)(u.Provider,{value:e,children:"function"==typeof t?t(e):t})}},3875:(t,e,r)=>{r.d(e,{JN:()=>u,KJ:()=>o,pf:()=>n});var s=r(7577),i=r(8613),n=(t,e)=>{(t.suspense||t.throwOnError||t.experimental_prefetchInRender)&&!e.isReset()&&(t.retryOnMount=!1)},u=t=>{s.useEffect(()=>{t.clearReset()},[t])},o=({result:t,errorResetBoundary:e,throwOnError:r,query:s,suspense:n})=>t.isError&&!e.isReset()&&!t.isFetching&&s&&(n&&void 0===t.data||(0,i.L)(r,[t.error,s]))},2151:(t,e,r)=>{r.d(e,{IsRestoringProvider:()=>u,useIsRestoring:()=>n});var s=r(7577),i=s.createContext(!1),n=()=>s.useContext(i),u=i.Provider},4138:(t,e,r)=>{r.d(e,{A8:()=>i,Ct:()=>s,SB:()=>u,Z$:()=>n,j8:()=>o});var s=(t,e)=>void 0===e.state.data,i=t=>{let e=t.staleTime;t.suspense&&(t.staleTime="function"==typeof e?(...t)=>Math.max(e(...t),1e3):Math.max(e??1e3,1e3),"number"==typeof t.gcTime&&(t.gcTime=Math.max(t.gcTime,1e3)))},n=(t,e)=>t.isLoading&&t.isFetching&&!e,u=(t,e)=>t?.suspense&&e.isPending,o=(t,e,r)=>e.fetchOptimistic(t).catch(()=>{r.clearReset()})},9279:(t,e,r)=>{r.d(e,{r:()=>d});var s=r(7577),i=r(2113),n=r(3341),u=r(4976),o=r(3550),a=r(3875),c=r(2151),l=r(4138),h=r(8613);function d(t,e,r){let d=(0,u.useQueryClient)(r),p=(0,c.useIsRestoring)(),f=(0,o.useQueryErrorResetBoundary)(),y=d.defaultQueryOptions(t);d.getDefaultOptions().queries?._experimental_beforeQuery?.(y),y._optimisticResults=p?"isRestoring":"optimistic",(0,l.A8)(y),(0,a.pf)(y,f),(0,a.JN)(f);let v=!d.getQueryCache().get(y.queryHash),[b]=s.useState(()=>new e(d,y)),m=b.getOptimisticResult(y),R=!p&&!1!==t.subscribed;if(s.useSyncExternalStore(s.useCallback(t=>{let e=R?b.subscribe(i.V.batchCalls(t)):h.Z;return b.updateResult(),e},[b,R]),()=>b.getCurrentResult(),()=>b.getCurrentResult()),s.useEffect(()=>{b.setOptions(y,{listeners:!1})},[y,b]),(0,l.SB)(y,m))throw(0,l.j8)(y,b,f);if((0,a.KJ)({result:m,errorResetBoundary:f,throwOnError:y.throwOnError,query:d.getQueryCache().get(y.queryHash),suspense:y.suspense}))throw m.error;if(d.getDefaultOptions().queries?._experimental_afterQuery?.(y,m),y.experimental_prefetchInRender&&!n.sk&&(0,l.Z$)(m,p)){let t=v?(0,l.j8)(y,b,f):d.getQueryCache().get(y.queryHash)?.promise;t?.catch(h.Z).finally(()=>{b.updateResult()})}return y.notifyOnChangeProps?m:b.trackResult(m)}},8468:(t,e,r)=>{r.d(e,{useMutation:()=>h});var s=r(7577),i=r(2113),n=r(5621);r(1638),n.F;var u=r(4351),o=r(3341),a=class extends u.l{#s;#a=void 0;#j;#P;constructor(t,e){super(),this.#s=t,this.setOptions(e),this.bindMethods(),this.#M()}bindMethods(){this.mutate=this.mutate.bind(this),this.reset=this.reset.bind(this)}setOptions(t){let e=this.options;this.options=this.#s.defaultMutationOptions(t),(0,o.VS)(this.options,e)||this.#s.getMutationCache().notify({type:"observerOptionsUpdated",mutation:this.#j,observer:this}),e?.mutationKey&&this.options.mutationKey&&(0,o.Ym)(e.mutationKey)!==(0,o.Ym)(this.options.mutationKey)?this.reset():this.#j?.state.status==="pending"&&this.#j.setOptions(this.options)}onUnsubscribe(){this.hasListeners()||this.#j?.removeObserver(this)}onMutationUpdate(t){this.#M(),this.#S(t)}getCurrentResult(){return this.#a}reset(){this.#j?.removeObserver(this),this.#j=void 0,this.#M(),this.#S()}mutate(t,e){return this.#P=e,this.#j?.removeObserver(this),this.#j=this.#s.getMutationCache().build(this.#s,this.options),this.#j.addObserver(this),this.#j.execute(t)}#M(){let t=this.#j?.state??{context:void 0,data:void 0,error:null,failureCount:0,failureReason:null,isPaused:!1,status:"idle",variables:void 0,submittedAt:0};this.#a={...t,isPending:"pending"===t.status,isSuccess:"success"===t.status,isError:"error"===t.status,isIdle:"idle"===t.status,mutate:this.mutate,reset:this.reset}}#S(t){i.V.batch(()=>{if(this.#P&&this.hasListeners()){let e=this.#a.variables,r=this.#a.context;t?.type==="success"?(this.#P.onSuccess?.(t.data,e,r),this.#P.onSettled?.(t.data,null,e,r)):t?.type==="error"&&(this.#P.onError?.(t.error,e,r),this.#P.onSettled?.(void 0,t.error,e,r))}this.listeners.forEach(t=>{t(this.#a)})})}},c=r(4976),l=r(8613);function h(t,e){let r=(0,c.useQueryClient)(e),[n]=s.useState(()=>new a(r,t));s.useEffect(()=>{n.setOptions(t)},[n,t]);let u=s.useSyncExternalStore(s.useCallback(t=>n.subscribe(i.V.batchCalls(t)),[n]),()=>n.getCurrentResult(),()=>n.getCurrentResult()),o=s.useCallback((t,e)=>{n.mutate(t,e).catch(l.Z)},[n]);if(u.error&&(0,l.L)(n.options.throwOnError,[u.error]))throw u.error;return{...u,mutate:o,mutateAsync:u.mutate}}},7369:(t,e,r)=>{r.d(e,{useQuery:()=>n});var s=r(3791),i=r(9279);function n(t,e){return(0,i.r)(t,s.z,e)}},8613:(t,e,r)=>{function s(t,e){return"function"==typeof t?t(...e):!!t}function i(){}r.d(e,{L:()=>s,Z:()=>i})},9690:(t,e,r)=>{r.d(e,{Analytics:()=>s}),r(7577);function s(t){return null}},3370:(t,e,r)=>{function s(t){return t&&t.__esModule?t:{default:t}}r.r(e),r.d(e,{_:()=>s,_interop_require_default:()=>s})},6674:(t,e,r)=>{r.d(e,{c:()=>i});var s=r(8570);let i=(0,s.createProxy)(String.raw`/Users/ivanpeychev/Projects/MindburnLabs/justmaily/apps/maily-web/node_modules/@vercel/analytics/dist/react/index.mjs#Analytics`);(0,s.createProxy)(String.raw`/Users/ivanpeychev/Projects/MindburnLabs/justmaily/apps/maily-web/node_modules/@vercel/analytics/dist/react/index.mjs#track`)}};