// Injects a simple navigation bar compatible with static hosting
(function () {
  function onReady(fn){
    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', fn, {once:true}); }
    else { fn(); }
  }
  onReady(function(){
  try { console.log('[nav] init start'); } catch(e) {}
  var existing = document.getElementById('custom-nav');

  // Inject CSS link next to this script
  var link = document.createElement('link');
  link.rel = 'stylesheet';
  try {
    var curr = document.currentScript && document.currentScript.src ? document.currentScript.src : 'assets/nav.js';
    var base = curr.slice(0, curr.lastIndexOf('/') + 1);
    link.href = base + 'nav.css';
  } catch (e) {
    link.href = '/assets/nav.css';
  }
  document.head.appendChild(link);

  // Either use existing markup or build it
  var nav = existing || document.createElement('nav');
  nav.id = 'custom-nav';
  var container = existing ? nav.querySelector('.container') : document.createElement('div');
  if (!container) { container = document.createElement('div'); }
  container.className = 'container';

  // Hamburger toggle (for mobile)
  var toggle = container.querySelector('.menu-toggle') || document.createElement('button');
  toggle.className = 'menu-toggle';
  toggle.setAttribute('aria-expanded', toggle.getAttribute('aria-expanded') || 'false');
  toggle.setAttribute('aria-controls', 'custom-nav-list');
  if (!toggle.innerHTML || !/Menu/.test(toggle.innerHTML)) {
    toggle.innerHTML = '<svg width="20" height="16" viewBox="0 0 20 16" aria-hidden="true" focusable="false" style="display:block"><rect y="0" width="20" height="2" fill="#423560"/><rect y="7" width="20" height="2" fill="#423560"/><rect y="14" width="20" height="2" fill="#423560"/></svg><span>Menu</span>';
  }

  var ul = container.querySelector('#custom-nav-list') || document.createElement('ul');
  ul.id = 'custom-nav-list';

  function liLink(text, href, cls) {
    var li = document.createElement('li');
    if (cls) li.className = cls;
    var a = document.createElement('a');
    a.textContent = text;
    a.href = href;
    li.appendChild(a);
    return li;
  }

  // Items (create only if empty)
  if (!ul.children.length) {
    ul.appendChild(liLink('Accueil', '/', 'brand'));
    ul.appendChild(liLink('Prestations', '/prestations/'));
    var liPlus = document.createElement('li');
    liPlus.className = 'dropdown';
    var aPlus = document.createElement('a');
    aPlus.href = '#';
    aPlus.textContent = 'Plus';
    liPlus.appendChild(aPlus);
    var menu = document.createElement('div');
    menu.className = 'dropdown-menu';
    var aRemb = document.createElement('a');
    aRemb.textContent = 'Aides financieres';
    aRemb.href = '/rembousement/';
    var aBlog = document.createElement('a');
    aBlog.textContent = 'Blog';
    aBlog.href = '/blog/';
    menu.appendChild(aRemb);
    menu.appendChild(aBlog);
    liPlus.appendChild(menu);
    ul.appendChild(liPlus);
  } else {
    var aPlus = ul.querySelector('.dropdown > a') || document.createElement('a');
  }

  // Ensure a contact strip exists (desktop-only via CSS)
  var contact = container.querySelector('.contact-strip');
  if (!contact) {
    contact = document.createElement('div');
    contact.className = 'contact-strip';
    contact.innerHTML = '<a href="mailto:maudpozza.psy@gmail.com">maudpozza.psy@gmail.com</a>\n<a href="tel:+33764491267">07.64.49.12.67</a>';
  }

  if (!existing) {
    container.appendChild(toggle);
    container.appendChild(contact);
    container.appendChild(ul);
    nav.appendChild(container);
  } else {
    // If existing markup is present, make sure pieces are attached
    if (!toggle.parentNode) container.prepend(toggle);
    if (!contact.parentNode) container.appendChild(contact);
    if (!ul.parentNode) container.appendChild(ul);
  }

  // Insert nav at the very top if we created it
  if (!existing) {
    try{ document.body.insertBefore(nav, document.body.firstChild); }
    catch(e){ document.addEventListener('DOMContentLoaded', function(){ document.body.insertBefore(nav, document.body.firstChild); }, {once:true}); }
  }

  // Prevent default navigation on the "Plus" toggle (for desktop hover menu)
  if (aPlus) aPlus.addEventListener('click', function (e) { e.preventDefault(); });

  // Mark active link by path
  try {
    var path = (location.pathname || '/').toLowerCase();
    var links = nav.querySelectorAll('a[href]');
    links.forEach(function (a) {
      var href = a.getAttribute('href');
      if (!href) return;
      function norm(u){
        try { return new URL(u, location.origin).pathname.replace(/\/+$/, '/'); } catch (e) { return u; }
      }
      if (norm(path) === norm(href)) {
        var li = a.closest('li');
        if (li) li.classList.add('active');
      }
    });
  } catch (e) { /* no-op */ }

  // Toggle logic (exposed + listeners)
  window.__pmpaToggleNav = function(){
    try { console.log('[nav] toggle clicked'); } catch(e) {}
    var el = document.getElementById('custom-nav');
    if (!el) return;
    var open = el.classList.toggle('open');
    try { console.log('[nav] open state:', open); } catch(e) {}
    var t = el.querySelector('.menu-toggle');
    if (t) t.setAttribute('aria-expanded', open ? 'true' : 'false');
  };
  toggle.addEventListener('click', window.__pmpaToggleNav, true);
  toggle.addEventListener('pointerdown', function(e){ if(e.pointerType==='touch') { e.preventDefault(); window.__pmpaToggleNav(); } }, true);
  toggle.setAttribute('onclick','try{window.__pmpaToggleNav&&window.__pmpaToggleNav()}catch(e){};return false;');
  try { console.log('[nav] init done'); } catch(e) {}

  // Remove duplicate contact info rendered in legacy markup
  try {
    (function hideDupContacts(){
      var phoneRx = /0?7[\.\s]*64[\.\s]*49[\.\s]*12[\.\s]*67/i;
      var mailRx = /maudpozza\.psy@gmail\.com/i;
      // Hide any mailto/tel anchors outside our custom nav
      document.querySelectorAll('a[href^="mailto:"], a[href^="tel:"]').forEach(function(a){
        if (!a.closest('#custom-nav')) { a.style.display = 'none'; }
      });
      // Hide plain-text duplicates if present
      var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
      var toHide = new Set();
      var n;
      while ((n = walker.nextNode())) {
        var t = (n.nodeValue || '').trim();
        if (!t) continue;
        if (phoneRx.test(t) || mailRx.test(t)) {
          var el = n.parentElement;
          if (el && !el.closest('#custom-nav')) toHide.add(el);
        }
      }
      toHide.forEach(function(el){ el.style.display = 'none'; });
    })();
  } catch(e) { try{ console.warn('[nav] dup-contact cleanup error', e); }catch(_){} }

  // Remove the top page background colorUnderlay that creates a large empty band
  try {
    var topUnderlay = document.querySelector('#bgLayers_pageBackground_m30mg [data-testid="colorUnderlay"].LWbAav.Kv1aVt');
    if (topUnderlay && topUnderlay.parentNode) {
      topUnderlay.parentNode.removeChild(topUnderlay);
      try { console.log('[ui] removed top colorUnderlay'); } catch(e) {}
    }
  } catch(e) { try{ console.warn('[ui] colorUnderlay remove error', e); }catch(_){} }
  
  // Fix a few common mis-decoded French characters seen in static export
  try {
    (function fixFrenchEncoding(){
      var pairs = [
        ['sÅ“', 'sœur'],
        ['cÅ“', 'cœur'],
        ['â€œ', '“'],
        ['â€', '”'],
        ['â€™', '’']
      ];
      function walk(node){
        if(node.nodeType===3){
          var t=node.nodeValue;
          for(var i=0;i<pairs.length;i++){
            var a=pairs[i][0], b=pairs[i][1];
            if(t.indexOf(a)!==-1){ t = t.split(a).join(b); }
          }
          node.nodeValue=t;
        } else if(node.nodeType===1 && node.tagName!=='SCRIPT' && node.tagName!=='STYLE'){
          for(var j=0;j<node.childNodes.length;j++) walk(node.childNodes[j]);
        }
      }
      walk(document.body);
    })();
  } catch(e) { try{ console.warn('[nav] encoding-fix error', e); }catch(_){} }
  });
})();

