(()=>{"use strict";const t={};function e(e){const n=function(t){const e=t.getAttribute("name");return e?customElements.get(e)?(console.warn(`Component with name "${e}" is already defined.`),null):e:(console.warn('Component is missing a "name" attribute.'),null)}(e);if(!n)return;if(!function(t){return t?!!/^[a-z][a-z0-9\-]*$/.test(t)||(console.warn(`Invalid component name "${t}". Names must contain a hyphen.`),!1):(console.warn(`Component name is empty or invalid: ${t}`),!1)}(n))return;const{staticAttributes:r,reactiveAttributes:s}=function(t){return{staticAttributes:t.getAttribute("static-attributes")?.split(" ")||[],reactiveAttributes:t.getAttribute("reactive-attributes")?.split(" ")||[]}}(e),o=function(t){const e=document.createElement("template");try{e.innerHTML=t.innerHTML}catch(t){return console.error("Failed to create template. Ensure the component content is valid HTML.",t),null}return e}(e);if(!o)return;const a=function(t,e){return[...t,...e].reduce(((t,e)=>(t[e]={value:""},t)),{})}(r,s),i=function(t,e,n,r){return{templateContent:t.content,staticAttributes:e,reactiveAttributes:n,state:r}}(o,r,s,a);!function(e,n){t[e]=n,customElements.define(e,function(e){return class extends HTMLElement{shadow=this.attachShadow({mode:"open"});static get observedAttributes(){return t[e]?.reactiveAttributes||[]}connectedCallback(){this.initializeAttributes(),this.render()}attributeChangedCallback(t,e,n){e!==n&&(this.updateState(t,n),this.render())}initializeAttributes(){const n=t[e];n?n.staticAttributes.forEach((t=>{if(!this.hasAttribute(t)&&n.state[t]){const e=n.state[t].value;this.setAttribute(t,e)}})):console.warn(`No registry entry found for component: ${e}`)}render(){const n=t[e];if(!n)return void console.warn(`No registry entry found for rendering component: ${e}`);const r=n.templateContent.cloneNode(!0);this.replacePlaceholders(r),this.shadow.innerHTML="",this.appendScopedStyles(r),this.shadow.appendChild(r)}replacePlaceholders(n){const r=t[e];if(!r)return;const{staticAttributes:s,reactiveAttributes:o}=r;[...s,...o].forEach((t=>{const e=this.getAttribute(t)||r.state[t]?.value||"";n.querySelectorAll("*").forEach((n=>{n.textContent?.includes(`\${${t}}`)&&(n.textContent=n.textContent.replace(new RegExp(`\\$\\{${t}\\}`,"g"),e)),Array.from(n.attributes).forEach((n=>{n.value.includes(`\${${t}}`)&&(n.value=n.value.replace(new RegExp(`\\$\\{${t}\\}`,"g"),e))}))}))}))}appendScopedStyles(t){t.querySelectorAll("style").forEach((t=>{const e=t.cloneNode(!0);t.remove(),this.shadow.appendChild(e)}));const n=document.querySelector(`component[name="${e}"]`);n&&n.querySelectorAll("style").forEach((t=>t.remove()))}updateState(n,r){const s=t[e];s&&s.state[n]&&(s.state[n].value=r||"")}}}(e))}(n,i)}class n extends HTMLElement{constructor(){super(),this.style.display="none"}connectedCallback(){this.hasAttribute("components-defined")||(this.setAttribute("components-defined","true"),this.defineComponents(),this.style.display="none")}defineComponents(){const t=Array.from(this.getElementsByTagName("component")),n=Array.from(this.getElementsByTagName("script"));try{!async function(t){for(const e of t){const t=document.createElement("script");Array.from(e.attributes).forEach((e=>{t.setAttribute(e.name,e.value)})),t.textContent=e.textContent,e.replaceWith(t),t.src&&await new Promise((e=>t.addEventListener("load",e,{once:!0})))}}(n)}catch(t){console.error("Script execution failed:",t)}t.forEach(e)}}class r extends HTMLElement{static importedFiles=new Set;static lazyObserver=null;constructor(){super(),this.style.display="none"}async connectedCallback(){try{await this.processImports(),this.handleSrcAttribute()}catch(t){console.error("Error in connectedCallback:",t)}}disconnectedCallback(){this.cleanupLazyObserver()}async processImports(){const t=Array.from(this.querySelectorAll("htmc-attach"));this.initializeLazyObserver();for(const e of t){const t=e.getAttribute("src");t&&!r.importedFiles.has(t)&&(r.importedFiles.add(t),await this.handleImportAttributes(e,t))}}initializeLazyObserver(){r.lazyObserver||(r.lazyObserver=new IntersectionObserver((t=>{t.forEach((t=>{if(t.isIntersecting){const e=t.target,n=e.getAttribute("src");n&&(this.safeImport(n).catch((t=>console.error(`Failed to lazy load: ${n}`,t))),r.lazyObserver?.unobserve(e))}}))})))}async handleImportAttributes(t,e){t.hasAttribute("defer")?window.addEventListener("load",(()=>this.safeImport(e).catch(console.error))):t.hasAttribute("lazy")?r.lazyObserver?.observe(t):await this.safeImport(e)}handleSrcAttribute(){const t=this.getAttribute("src");t&&(this.hasAttribute("defer")?window.addEventListener("load",(()=>this.safeImport(t))):this.hasAttribute("lazy")?this.setupLazyLoading(t):this.safeImport(t))}setupLazyLoading(t){this.initializeLazyObserver(),r.lazyObserver?.observe(this)}cleanupLazyObserver(){r.lazyObserver&&(r.lazyObserver.unobserve(this),r.lazyObserver.disconnect(),r.lazyObserver=null)}async safeImport(t){if(t)try{await async function(t){try{const e=await fetch(t);if(e.ok){const t=await e.text(),n=document.createElement("template");n.innerHTML=t,document.body.appendChild(n.content.cloneNode(!0))}}catch(e){console.error(`Failed to import components from ${t}:`,e)}}(t)}catch(e){console.error(`Failed to attach component from ${t}:`,e)}else console.warn("You are trying to attach null or undefined src")}}customElements.define("htmc-define",n),customElements.define("htmc-attach",r)})();