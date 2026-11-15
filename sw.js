const C='lines-v18',SH='shared-imgs',B=()=>self.registration.scope;
const HOSTS=['www.gstatic.com','cdnjs.cloudflare.com','cdn.jsdelivr.net','tessdata.projectnaptha.com'];
self.addEventListener('install',e=>{self.skipWaiting()});
self.addEventListener('activate',e=>e.waitUntil((async()=>{
  for(const k of await caches.keys())if(k!==C&&k!==SH&&k.indexOf('lines-v')===0)await caches.delete(k);
  await self.clients.claim();
})()));
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method==='POST'&&u.origin===location.origin&&u.pathname.endsWith('/share-target')){
    e.respondWith((async()=>{
      try{
        const fd=await e.request.formData(),c=await caches.open(SH);
        for(const k of await c.keys())await c.delete(k);
        const fl=fd.getAll('images').filter(f=>f&&f.size);
        for(let i=0;i<fl.length;i++)await c.put(new Request(B()+'shared/'+Date.now()+'-'+i),new Response(fl[i],{headers:{'content-type':fl[i].type||'image/jpeg'}}));
      }catch(x){}
      return Response.redirect(B()+'?shared=1',303);
    })());
    return;
  }
  if(e.request.method!=='GET')return;
  if(!(u.origin===location.origin||HOSTS.indexOf(u.hostname)>=0))return;
  e.respondWith(caches.open(C).then(async c=>{
    const hit=await c.match(e.request);
    const net=fetch(e.request).then(r=>{if(r&&(r.ok||r.type==='opaque'))c.put(e.request,r.clone());return r}).catch(()=>hit);
    return hit||net;
  }));
});
self.addEventListener('notificationclick',e=>{e.notification.close();e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(l=>l.length?l[0].focus():clients.openWindow('./')))});
