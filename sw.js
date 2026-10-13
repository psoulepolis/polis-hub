/* Polis Hub — service worker
   A página do app é sempre buscada na internet quando há conexão (assim cada atualização
   publicada no GitHub chega na hora); sem internet, abre a última cópia guardada.
   Os DADOS não passam por aqui: ficam na pasta do servidor escolhida no app. */
const CACHE="polis-hub-R03";
const ARQUIVOS=["./","./index.html","./manifest.webmanifest","./icon-192.png","./icon-512.png","./icon-maskable-512.png"];
self.addEventListener("install",e=>{
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ARQUIVOS.map(u=>new Request(u,{cache:"reload"})))));
});
self.addEventListener("activate",e=>e.waitUntil(
  caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener("message",e=>{ if(e.data==="skip") self.skipWaiting(); });
self.addEventListener("fetch",e=>{
  const req=e.request;
  if(req.method!=="GET"||new URL(req.url).origin!==location.origin) return;
  const pagina=req.mode==="navigate"||/\/(index\.html)?$/.test(new URL(req.url).pathname);
  if(pagina){
    e.respondWith(fetch(new Request(req.url,{cache:"no-cache"})).then(r=>{
      if(r.ok){const cp=r.clone();caches.open(CACHE).then(c=>c.put("./index.html",cp));}
      return r;
    }).catch(()=>caches.match("./index.html")));
    return;
  }
  e.respondWith(caches.match(req,{ignoreSearch:true}).then(r=>r||fetch(req)));
});
