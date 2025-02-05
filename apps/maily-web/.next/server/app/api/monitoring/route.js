"use strict";(()=>{var e={};e.id=5853,e.ids=[5853],e.modules={20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},92647:(e,t,r)=>{let a;r.r(t),r.d(t,{originalPathname:()=>x,patchFetch:()=>R,requestAsyncStorage:()=>v,routeModule:()=>_,serverHooks:()=>E,staticGenerationAsyncStorage:()=>f});var o={};r.r(o),r.d(o,{GET:()=>g});var n=r(49303),i=r(88716),c=r(60670);let s={query:async(e,t)=>(console.log("db query:",e,t),[])},u={get:async e=>null,set:async(e,t)=>{console.log("cache set:",e,t)}},l={find:async e=>(console.log("search find:",e),[])},m={recordLatency:(e,t)=>{console.log(`[MetricsService] ${e}: ${t}ms`)},recordError:(e,t)=>{console.error(`[MetricsService] ${e}`,t)}},g=(a={handler:async e=>{let{searchParams:t}=new URL(e.url);switch(t.get("type")){case"api":return await w();case"db":return await d();case"cache":return await h();case"search":return await p();default:return await y()}}},async(e,t)=>{try{await a(e,t)}catch(e){t.status(500).json({error:"Internal Server Error"})}});async function w(){let e=Date.now();try{let t=await m.getSystemHealth(),r=await m.getErrorRate("5m"),a=await m.getResponseTimeHistory("1h"),o=await m.getRequestRate("5m"),n=await m.getEndpointMetrics(),i=await m.getRateLimitingMetrics("1h"),c=await m.getRequestVolume("1h");return m.recordLatency("monitoring_api_metrics",Date.now()-e),{systemHealth:t,errorRate:r,responseTimeHistory:a,requestRate:o,endpointMetrics:n,rateLimiting:i,requestVolume:c}}catch(e){throw m.recordError("monitoring_api_metrics_error",e.message),e}}async function d(){let e=Date.now();try{let t=await s.getSlowQueries(),r=await s.getConnectionPoolStats("1h"),a=await s.getTransactionMetrics("1h");return m.recordLatency("monitoring_db_metrics",Date.now()-e),{slowQueries:t,connectionPool:r,transactions:a}}catch(e){throw m.recordError("monitoring_db_metrics_error",e.message),e}}async function h(){let e=Date.now();try{let t=await u.getHitRate("1h"),r=await u.getMemoryUsage("1h"),a=await u.getEvictionStats("1h");return m.recordLatency("monitoring_cache_metrics",Date.now()-e),{hitRate:t,memoryUsage:r,evictions:a}}catch(e){throw m.recordError("monitoring_cache_metrics_error",e.message),e}}async function p(){let e=Date.now();try{let t=await l.getLatencyMetrics("1h"),r=await l.getQueryVolume("1h"),a=await l.getIndexStats();return m.recordLatency("monitoring_search_metrics",Date.now()-e),{latency:t,queryVolume:r,indexStats:a}}catch(e){throw m.recordError("monitoring_search_metrics_error",e.message),e}}async function y(){let e=Date.now();try{let[t,r,a,o]=await Promise.all([w(),d(),h(),p()]);return m.recordLatency("monitoring_all_metrics",Date.now()-e),{api:t,db:r,cache:a,search:o}}catch(e){throw m.recordError("monitoring_all_metrics_error",e.message),e}}let _=new n.AppRouteRouteModule({definition:{kind:i.x.APP_ROUTE,page:"/api/monitoring/route",pathname:"/api/monitoring",filename:"route",bundlePath:"app/api/monitoring/route"},resolvedPagePath:"/Users/ivanpeychev/Projects/MindburnLabs/justmaily/apps/maily-web/app/api/monitoring/route.ts",nextConfigOutput:"",userland:o}),{requestAsyncStorage:v,staticGenerationAsyncStorage:f,serverHooks:E}=_,x="/api/monitoring/route";function R(){return(0,c.patchFetch)({serverHooks:E,staticGenerationAsyncStorage:f})}},49303:(e,t,r)=>{e.exports=r(30517)}};var t=require("../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),a=t.X(0,[632,110,781,8057,4991,641,928,688,6865,2385],()=>r(92647));module.exports=a})();