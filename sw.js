const V="vias-v3";
const SHELL=["./","index.html","config.js","manifest.webmanifest","icon-192.png","icon-512.png"];
const LIBS=["https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.js"];
self.addEventListener("install",e=>{e.waitUntil((async()=>{
  const c=await caches.open(V);await c.addAll(SHELL);
  for(const u of LIBS){try{await c.put(u,await fetch(u,{mode:"no-cors"}))}catch(_){}}
  self.skipWaiting()})())});
self.addEventListener("activate",e=>{e.waitUntil((async()=>{
  for(const k of await caches.keys())if(k!==V)await caches.delete(k);
  await self.clients.claim()})())});
const put=(k,r)=>caches.open(V).then(c=>c.put(k,r));
self.addEventListener("fetch",e=>{
  const r=e.request;if(r.method!=="GET")return;
  const u=new URL(r.url);
  if(u.origin===location.origin){
    // Mismo sitio: primero red (para recibir actualizaciones); si no hay conexión o tarda, lo guardado.
    e.respondWith(Promise.race([fetch(r),new Promise((_,j)=>setTimeout(j,4000))])
      .then(x=>{if(x.ok)put(r,x.clone());return x})
      .catch(()=>caches.match(r).then(x=>x||caches.match("index.html"))));
    return}
  if(u.pathname.includes("/storage/v1/object/public/")){
    // Fotos: primero lo guardado.
    e.respondWith(caches.match(r.url).then(x=>x||fetch(r.url).then(y=>{if(y.ok)put(r.url,y.clone());return y})));
    return}
  if(["cdn.jsdelivr.net","fonts.googleapis.com","fonts.gstatic.com"].includes(u.hostname)){
    e.respondWith(caches.match(r).then(x=>x||fetch(r).then(y=>{if(y.ok||y.type==="opaque")put(r,y.clone());return y})));
  }
});
