/* WireBootstrap for Web Components v1.0.17 (2024-03-22) (c) 2020-2024 Enterprise Blocks, Inc. License details: https://www.wirebootstrap.com/license/themes-license.html */
!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?module.exports=e():"function"==typeof define&&define.amd?define(e):(t=t||self).tinybind=e()}(this,function(){"use strict";var t=["prefix","templateDelimiters","rootInterface","preloadData","handler"],e=["binders","formatters","adapters","wr"],n=0,i=1,r=0,s=1,o=/^'.*'$|^".*"$/;function a(t){var e=n,r=t;return o.test(t)?r=t.slice(1,-1):"true"===t?r=!0:"false"===t?r=!1:"null"===t?r=null:"undefined"===t?r=void 0:isNaN(t)?e=i:r=Number(t),{type:e,value:r}}function c(t,e){for(var n,i=t.length,o=0,a=0,c=e[0],h=e[1];a<i;){if((o=t.indexOf(c,a))<0){n&&n.push({type:r,value:t.slice(a)});break}if(n||(n=[]),o>0&&a<o&&n.push({type:r,value:t.slice(a,o)}),a=o+c.length,(o=t.indexOf(h,a))<0){var l=t.slice(a-h.length),u=n[n.length-1];u&&u.type===r?u.value+=l:n.push({type:r,value:l});break}var p=t.slice(a,o).trim();n.push({type:s,value:p}),a=o+h.length}return n}var h,l,u,p={wr:{},binders:{},formatters:{},adapters:{},_prefix:"rv",_fullPrefix:"rv-",get prefix(){return this._prefix},set prefix(t){this._prefix=t,this._fullPrefix=t+"-"},parseTemplate:c,parseType:a,templateDelimiters:["{","}"],rootInterface:".",preloadData:!0,handler:function(t,e,n){this.call(t,e,n.view.models)},fallbackBinder:function(t,e){null!=e?t.setAttribute(this.type,e):t.removeAttribute(this.type)},configure:function(t){var n=this;t&&Object.keys(t).forEach(function(i){var r=t[i];e.indexOf(i)>-1?Object.keys(r).forEach(function(t){n[i][t]=r[t]}):n[i]=r})}};function d(t){return"object"==typeof t&&null!==t}var f=function(){function t(t,e,n){this.keypath=e,this.callback=n,this.objectPath=[],this.parse(),this.obj=this.getRootObject(t),d(this.target=this.realize())&&this.set(!0,this.key,this.target,this.callback)}t.updateOptions=function(t){h=t.adapters,l=Object.keys(h),u=t.rootInterface},t.tokenize=function(t,e){var n,i,r=[],s={i:e,path:""};for(n=0;n<t.length;n++)i=t.charAt(n),~l.indexOf(i)?(r.push(s),s={i:i,path:""}):s.path+=i;return r.push(s),r};var e=t.prototype;return e.parse=function(){var e,n;l.length||function(t){throw new Error("[Observer] "+t)}("Must define at least one adapter interface."),~l.indexOf(this.keypath[0])?(n=this.keypath[0],e=this.keypath.substr(1)):(n=u,e=this.keypath),this.tokens=t.tokenize(e,n),this.key=this.tokens.pop()},e.realize=function(){for(var t,e,n=this.obj,i=-1,r=0;r<this.tokens.length;r++)e=this.tokens[r],d(n)?(void 0!==this.objectPath[r]?n!==(t=this.objectPath[r])&&(this.set(!1,e,t,this),this.set(!0,e,n,this),this.objectPath[r]=n):(this.set(!0,e,n,this),this.objectPath[r]=n),n=this.get(e,n)):(-1===i&&(i=r),(t=this.objectPath[r])&&this.set(!1,e,t,this));return-1!==i&&this.objectPath.splice(i),n},e.sync=function(){var t,e,n;(t=this.realize())!==this.target?(d(this.target)&&this.set(!1,this.key,this.target,this.callback),d(t)&&this.set(!0,this.key,t,this.callback),e=this.value(),this.target=t,((n=this.value())!==e||n instanceof Function)&&this.callback.sync()):t instanceof Array&&this.callback.sync()},e.value=function(){if(d(this.target))return this.get(this.key,this.target)},e.setValue=function(t){d(this.target)&&h[this.key.i].set(this.target,this.key.path,t)},e.get=function(t,e){return h[t.i].get(e,t.path)},e.set=function(t,e,n,i){var r=t?"observe":"unobserve";h[e.i][r](n,e.path,i)},e.unobserve=function(){for(var t,e,n=0;n<this.tokens.length;n++)e=this.tokens[n],(t=this.objectPath[n])&&this.set(!1,e,t,this);d(this.target)&&this.set(!1,this.key,this.target,this.callback)},e.getRootObject=function(t){var e,n;if(!t.$parent)return t;for(e=this.tokens.length?this.tokens[0].path:this.key.path,n=t;n.$parent&&void 0===n[e];)n=n.$parent;return n},t}();var b=/[^\s']+|'([^']|'[^\s])*'|"([^"]|"[^\s])*"/g,v=/\s+/,m=function(){function t(t,e,n,i,r,s,o){this.view=t,this.el=e,this.type=n,this.keypath=i,this.binder=r,this.arg=s,this.formatters=o,this.formatterObservers={},this.model=void 0}var e=t.prototype;return e.observe=function(t,e){return new f(t,e,this)},e.parseTarget=function(){if(this.keypath){var t=a(this.keypath);0===t.type?this.value=t.value:(this.observer=this.observe(this.view.models,this.keypath),this.model=this.observer.target)}else this.value=void 0},e.parseFormatterArguments=function(t,e){var n=this;return t.map(a).map(function(t,i){var r=t.type,s=t.value;if(0===r)return s;n.formatterObservers[e]||(n.formatterObservers[e]={});var o=n.formatterObservers[e][i];return o||(o=n.observe(n.view.models,s),n.formatterObservers[e][i]=o),o.value()})},e.formattedValue=function(t){var e=this;return this.formatters.reduce(function(t,n,i){var r=n.match(b),s=r.shift(),o=e.view.options.formatters[s],a=e.parseFormatterArguments(r,i);return o&&o.read instanceof Function?t=o.read.apply(o,[t].concat(a)):o instanceof Function&&(t=o.apply(void 0,[t].concat(a))),t},t)},e.eventHandler=function(t){var e=this,n=e.view.options.handler;return function(i){n.call(t,this,i,e)}},e.set=function(t){t=t instanceof Function&&!this.binder.function?this.formattedValue(t.call(this.model)):this.formattedValue(t);var e=this.binder.routine||this.binder;e instanceof Function&&e.call(this,this.el,t)},e.sync=function(){this.observer?(this.model=this.observer.target,this.set(this.observer.value()),this.view.options.wr&&this.view.options.wr.syncCallbackReady&&this.view.options.wr.syncCallback&&this.observer.target&&this.view.options.wr.syncCallback.apply(this.observer.obj,[this.observer.target,this.observer.key.path,this.observer.value()])):this.set(this.value)},e.publish=function(){var t=this;if(this.observer){var e=this.formatters.reduceRight(function(e,n,i){var r=n.split(v),s=r.shift(),o=t.view.options.formatters[s],a=t.parseFormatterArguments(r,i);return o&&o.publish&&(e=o.publish.apply(o,[e].concat(a))),e},this.getValue(this.el));this.observer.setValue(e)}},e.bind=function(){this.parseTarget(),this.binder.hasOwnProperty("bind")&&this.binder.bind.call(this,this.el),this.view.options.preloadData&&this.sync()},e.unbind=function(){var t=this;this.binder.unbind&&this.binder.unbind.call(this,this.el),this.observer&&this.observer.unobserve(),Object.keys(this.formatterObservers).forEach(function(e){var n=t.formatterObservers[e];Object.keys(n).forEach(function(t){n[t].unobserve()})}),this.formatterObservers={}},e.update=function(t){void 0===t&&(t={}),this.observer&&(this.model=this.observer.target),this.binder.update&&this.binder.update.call(this,t)},e.getValue=function(t){return this.binder&&this.binder.getValue?this.binder.getValue.call(this,t):function(t){if("checkbox"===t.type)return t.checked;if("select-multiple"===t.type){for(var e,n=[],i=0;i<t.options.length;i++)(e=t.options[i]).selected&&n.push(e.value);return n}return t.value}(t)},t}(),y={routine:function(t,e){t.data=null!=e?e:""}},g=/((?:'[^']*')*(?:(?:[^\|']*(?:'[^']*')+[^\|']*)+|[^\|]+))|^$/g,w=function t(e,n){var i=!1;if(3===n.nodeType){var r=c(n.data,p.templateDelimiters);if(r){for(var s=0;s<r.length;s++){var o=r[s],a=document.createTextNode(o.value);n.parentNode.insertBefore(a,n),1===o.type&&e.buildBinding(a,null,o.value,y,null)}n.parentNode.removeChild(n)}i=!0}else 1===n.nodeType&&(i=e.traverse(n));if(!i)for(var h=0;h<n.childNodes.length;h++)t(e,n.childNodes[h])},k=function(t,e){var n=t.binder&&t.binder.priority||0;return(e.binder&&e.binder.priority||0)-n},_=function(t){return t.trim()},C=function(){function t(t,e,n){t.jquery||t instanceof Array?this.els=t:this.els=[t],this.models=e,this.options=n,this.build()}var e=t.prototype;return e.buildBinding=function(t,e,n,i,r){var s=n.match(g).map(_),o=s.shift();this.bindings.push(new m(this,t,e,o,i,r,s))},e.build=function(){this.bindings=[];var t,e,n=this.els;for(t=0,e=n.length;t<e;t++)w(this,n[t]);this.bindings.sort(k)},e.traverse=function(t){for(var e,n,i,r,s=p._fullPrefix,o="SCRIPT"===t.nodeName||"STYLE"===t.nodeName,a=t.attributes,c=[],h=this.options.starBinders,l=0,u=a.length;l<u;l++){var d=a[l];if(0===d.name.indexOf(s)){if(e=d.name.slice(s.length),r=void 0,!(n=this.options.binders[e]))for(var f=0;f<h.length;f++)if(i=h[f],e.slice(0,i.length-1)===i.slice(0,-1)){n=this.options.binders[i],r=e.slice(i.length-1);break}if(n||(n=p.fallbackBinder),n.block)return this.buildBinding(t,e,d.value,n,r),t.removeAttribute(d.name),!0;c.push({attr:d,binder:n,type:e,arg:r})}}for(var b=0;b<c.length;b++){var v=c[b];this.buildBinding(t,v.type,v.attr.value,v.binder,v.arg),t.removeAttribute(v.attr.name)}return o},e.bind=function(){this.bindings.forEach(function(t){t.bind()})},e.unbind=function(){this.bindings.forEach(function(t){t.unbind()})},e.sync=function(){this.bindings.forEach(function(t){t.sync()})},e.publish=function(){this.bindings.forEach(function(t){t.binder&&t.binder.publishes&&t.publish()})},e.update=function(t){var e=this;void 0===t&&(t={}),Object.keys(t).forEach(function(n){e.models[n]=t[n]}),this.bindings.forEach(function(e){e.update&&e.update(t)})},t}(),E=["push","pop","shift","unshift","sort","reverse","splice"],O={counter:0,weakmap:{},weakReference:function(t){if(!t.hasOwnProperty("__rv")){var e=this.counter++;Object.defineProperty(t,"__rv",{value:e})}return this.weakmap[t.__rv]||(this.weakmap[t.__rv]={callbacks:{}}),this.weakmap[t.__rv]},cleanupWeakReference:function(t,e){Object.keys(t.callbacks).length||t.pointers&&Object.keys(t.pointers).length||delete this.weakmap[e]},stubFunction:function(t,e){var n=t[e],i=this.weakReference(t),r=this.weakmap;t[e]=function(){for(var e=arguments.length,s=new Array(e),o=0;o<e;o++)s[o]=arguments[o];var a=n.apply(t,s);return Object.keys(i.pointers).forEach(function(t){var e=i.pointers[t];r[t]&&r[t].callbacks[e]instanceof Array&&r[t].callbacks[e].forEach(function(t){t.sync()})}),a}},observeArray:function(t,e,n){var i=this;if(t instanceof Array){var r=this.weakReference(t);r.pointers||(r.pointers={},E.forEach(function(e){i.stubFunction(t,e)})),r.pointers[e]||(r.pointers[e]=[]),-1===r.pointers[e].indexOf(n)&&r.pointers[e].push(n)}},unobserveArray:function(t,e,n){if(t instanceof Array&&null!=t.__rv){var i=this.weakmap[t.__rv];if(i){var r=i.pointers[e];if(r){var s=r.indexOf(n);s>-1&&r.splice(s,1),r.length||delete i.pointers[e],this.cleanupWeakReference(i,t.__rv)}}}},observe:function(t,e,n){var i,r=this,s=this.weakReference(t).callbacks;if(!s[e]){s[e]=[];var o=Object.getOwnPropertyDescriptor(t,e);o&&(o.get||o.set||!o.configurable)||(i=t[e],Object.defineProperty(t,e,{enumerable:!0,get:function(){return i},set:function(n){if(n!==i){r.unobserveArray(i,t.__rv,e),i=n;var s=r.weakmap[t.__rv];if(s){var o=s.callbacks[e];o&&o.forEach(function(t){t.sync()}),r.observeArray(n,t.__rv,e)}}}}))}-1===s[e].indexOf(n)&&s[e].push(n),this.observeArray(t[e],t.__rv,e)},unobserve:function(t,e,n){var i=this.weakmap[t.__rv];if(i){var r=i.callbacks[e];if(r){var s=r.indexOf(n);s>-1&&(r.splice(s,1),r.length||(delete i.callbacks[e],this.unobserveArray(t[e],t.__rv,e))),this.cleanupWeakReference(i,t.__rv)}}},get:function(t,e){return t[e]},set:function(t,e,n){t.__wrDirty=!0,t[e]=n}},j=function(t){return null!=t?t.toString():void 0};function A(t,e,n){var i=t.el.cloneNode(!0),r=new C(i,e,t.view.options);return r.bind(),t.marker.parentNode.insertBefore(i,n),r}var R={"on-*":{function:!0,priority:1e3,unbind:function(t){this.handler&&t.removeEventListener(this.arg,this.handler)},routine:function(t,e){this.handler&&t.removeEventListener(this.arg,this.handler),this.handler=this.eventHandler(e),t.addEventListener(this.arg,this.handler)}},"each-*":{block:!0,priority:4e3,bind:function(t){this.marker?this.iterated.forEach(function(t){t.bind()}):(this.marker=document.createComment(" tinybind: "+this.type+" "),this.iterated=[],t.parentNode.insertBefore(this.marker,t),t.parentNode.removeChild(t))},unbind:function(t){this.iterated&&this.iterated.forEach(function(t){t.unbind()})},routine:function(t,e){var n=this,i=this.arg;e=e||[];var r=t.getAttribute("index-property")||"$index";e.forEach(function(t,e){var s={$parent:n.view.models};s[r]=e,s[i]=t;var o=n.iterated[e];if(o)if(o.models[i]!==t){for(var a,c,h=e+1;h<n.iterated.length;h++)if((c=n.iterated[h]).models[i]===t){a=h;break}void 0!==a?(n.iterated.splice(a,1),n.marker.parentNode.insertBefore(c.els[0],o.els[0]),c.models[r]=e):c=A(n,s,o.els[0]),n.iterated.splice(e,0,c)}else o.models[r]=e;else{var l=n.marker;n.iterated.length&&(l=n.iterated[n.iterated.length-1].els[0]),o=A(n,s,l.nextSibling),n.iterated.push(o)}}),this.iterated.length>e.length&&function(t,e){for(var n=0;n<t;n++)e()}(this.iterated.length-e.length,function(){var t=n.iterated.pop();t.unbind(),n.marker.parentNode.removeChild(t.els[0])}),"OPTION"===t.nodeName&&this.view.bindings.forEach(function(t){t.el===n.marker.parentNode&&"value"===t.type&&t.sync()})},update:function(t){var e=this,n={};Object.keys(t).forEach(function(i){i!==e.arg&&(n[i]=t[i])}),this.iterated.forEach(function(t){t.update(n)})}},"class-*":function(t,e){var n=" "+t.className+" ";!e==n.indexOf(" "+this.arg+" ")>-1&&(t.className=e?t.className+" "+this.arg:n.replace(" "+this.arg+" "," ").trim())},text:function(t,e){t.textContent=null!=e?e:""},html:function(t,e){t.innerHTML=null!=e?e:""},show:function(t,e){t.style.display=e?"":"none"},hide:function(t,e){t.style.display=e?"none":""},enabled:function(t,e){t.disabled=!e},disabled:function(t,e){t.disabled=!!e},checked:{publishes:!0,priority:2e3,bind:function(t){var e=this;this.callback||(this.callback=function(){e.publish()}),t.addEventListener("change",this.callback)},unbind:function(t){t.removeEventListener("change",this.callback)},routine:function(t,e){"radio"===t.type?t.checked=j(t.value)===j(e):t.checked=!!e}},value:{publishes:!0,priority:3e3,bind:function(t){if(this.isRadio="INPUT"===t.tagName&&"radio"===t.type,!this.isRadio){this.event=t.getAttribute("event-name")||("SELECT"===t.tagName?"change":"input");var e=this;this.callback||(this.callback=function(){e.publish()}),t.addEventListener(this.event,this.callback)}},unbind:function(t){this.isRadio||t.removeEventListener(this.event,this.callback)},routine:function(t,e){if(this.isRadio)t.setAttribute("value",e);else if("select-multiple"===t.type){if(e instanceof Array)for(var n=0;n<t.length;n++){var i=t[n];i.selected=e.indexOf(i.value)>-1}}else j(e)!==j(t.value)&&(t.value=null!=e?e:"")}},if:{block:!0,priority:4e3,bind:function(t){this.marker?!1===this.bound&&this.nested&&this.nested.bind():(this.marker=document.createComment(" tinybind: "+this.type+" "+this.keypath+" "),this.attached=!1,t.parentNode.insertBefore(this.marker,t),t.parentNode.removeChild(t)),this.bound=!0},unbind:function(){this.nested&&(this.nested.unbind(),this.bound=!1)},routine:function(t,e){!!e!==this.attached&&(e?(this.nested||(this.nested=new C(t,this.view.models,this.view.options),this.nested.bind()),this.marker.parentNode.insertBefore(t,this.marker.nextSibling),this.attached=!0):(t.parentNode.removeChild(t),this.attached=!1))},update:function(t){this.nested&&this.nested.update(t)}}};function x(t,e){for(var n=0;n<e.length;n++){var i=e[n];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(t,i.key,i)}}function N(t){return(N=Object.setPrototypeOf?Object.getPrototypeOf:function(t){return t.__proto__||Object.getPrototypeOf(t)})(t)}function P(t,e){return(P=Object.setPrototypeOf||function(t,e){return t.__proto__=e,t})(t,e)}function $(t,e,n){return($=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Date.prototype.toString.call(Reflect.construct(Date,[],function(){})),!0}catch(t){return!1}}()?Reflect.construct:function(t,e,n){var i=[null];i.push.apply(i,e);var r=new(Function.bind.apply(t,i));return n&&P(r,n.prototype),r}).apply(null,arguments)}function L(t){var e="function"==typeof Map?new Map:void 0;return(L=function(t){if(null===t||(n=t,-1===Function.toString.call(n).indexOf("[native code]")))return t;var n;if("function"!=typeof t)throw new TypeError("Super expression must either be null or a function");if(void 0!==e){if(e.has(t))return e.get(t);e.set(t,i)}function i(){return $(t,arguments,N(this).constructor)}return i.prototype=Object.create(t.prototype,{constructor:{value:i,enumerable:!1,writable:!0,configurable:!0}}),P(i,t)})(t)}var B=function(t){var e,n;function i(){return t.apply(this,arguments)||this}n=t,(e=i).prototype=Object.create(n.prototype),e.prototype.constructor=e,e.__proto__=n;var r,s,o,a=i.prototype;return a.connectedCallback=function(){var t=this.constructor.__templateEl.content.cloneNode(!0);for(this.__tinybindView=p.bind(t,this);this.firstChild;)this.removeChild(this.firstChild);this.appendChild(t)},a.disconnectedCallback=function(){this.__tinybindView.unbind()},a.attributeChangedCallback=function(t,e,n){e!==n&&(this[this.constructor.__propAttributeMap[t]]=n)},r=i,o=[{key:"observedAttributes",get:function(){var t=this.template;if(!t)throw new Error("No template declared for "+this.name);this.__templateEl=document.createElement("template"),this.__templateEl.innerHTML=t;var e=this.__propAttributeMap={},n=[],i=this.properties;return i&&Object.keys(i).forEach(function(t){var r=i[t],s="string"==typeof r?r:t;e[s]=t,n.push(s)}),n}}],(s=null)&&x(r.prototype,s),o&&x(r,o),i}(L(HTMLElement));return p.binders=R,p.formatters={watch:function(t){return t},not:function(t){return!t},negate:function(t){return!t}},p.adapters["."]=O,p.Component=B,p.bind=function(n,i,r){var s={};i=i||{},r=r||{},e.forEach(function(t){s[t]=Object.create(null),r[t]&&Object.keys(r[t]).forEach(function(e){s[t][e]=r[t][e]}),Object.keys(p[t]).forEach(function(e){s[t][e]||(s[t][e]=p[t][e])})}),t.forEach(function(t){var e=r[t];s[t]=null!=e?e:p[t]}),s.starBinders=Object.keys(s.binders).filter(function(t){return t.indexOf("*")>0}),f.updateOptions(s);var o=new C(n,i,s);return o.bind(),o},p}),tinybind.configure({prefix:"wr",fallbackBinder:function(t,e){null!=e?"object"==typeof e?(t[this.type]=e,t.setAttribute(this.type,"[wr-object]")):t.setAttribute(this.type,e):t.removeAttribute(this.type)}}),tinybind.binders["add-class"]=function(t,e){e&&(t.className=""==t.className?e:`${t.className} ${e}`)},tinybind.binders["import-*"]=function(t,e,n){let i="default";this.formatters&&this.formatters.length&&(i=this.formatters[0]),t.setAttribute(this.arg,"[wr-import]|{0}|{1}|{2}".format(this.arg,i,this.keypath))},tinybind.binders.select2={publishes:!0,priority:2e3,bind:function(t){const e=this;$(t).on("select2:select select2:unselect",function(){e.publish()})},unbind:function(t){$(t).off("select2:select select2:unselect"),$(t).off("databind.wire")},routine:function(t,e){$(t).on("databind.wire",(n,i)=>{void 0!==e&&$(t).val(e).trigger("change")})}},tinybind.binders.daterangepicker={publishes:!0,priority:2e3,bind:function(t){const e=this;$(t).on("apply.daterangepicker",function(){e.publish()})},unbind:function(t){$(t).off("apply.daterangepicker")},routine:function(){}},tinybind.binders.navigate={function:!0,priority:1e3,unbind:function(t){this._navigate&&t.removeEventListener("click",this._navigate)},routine:function(t,e){this._navigate&&t.removeEventListener("click",this.handler),e&&(this._navigate=function(){window.open(e,"_new")},t.addEventListener("click",this._navigate))}},tinybind.adapters["["]={observe:function(t,e,n){},unobserve:function(t,e,n){},get:function(t,e){let n=e.split("]")[0].replaceAll('"',"").replaceAll("'","");return t[n=wire.isNumeric(n)?+n:n]},set:function(t,e,n){}},tinybind.formatters.exp=function(t,e){return t?`=(${e})`.eval(t):""},tinybind.formatters.args=function(t){let e=Array.prototype.slice.call(arguments,1);return function(){const n=arguments[1];return n.args=e,n.el=this,t.apply(this,Array.prototype.concat.call(arguments[0],n,...e))}},tinybind.formatters.date=function(t,e){return t?new Date(t).toLocaleDateString(e||"en-US"):""},tinybind.formatters.property=function(t,e){return t?t[e]:""};class WebComponent extends tinybind.Component{constructor(t){super(),this._connectedCallbackHasRun=!1,t&&(this._wrProps=t)}wrUpdateBind(){if(this.__tinybindView){this.__tinybindView.unbind();const t=this.constructor.__templateEl.content.cloneNode(!0);this.__tinybindView.bind(t,this,options)}}connectedCallback(){const t=(t,e)=>{let n=t?t.call(this):null;return n||(e?"function"==typeof e?e.call(this):e:void 0)},e=e=>{const n=t(this.configUrl,this.constructor.configUrl);n?fetch(n).then(t=>{if(t.ok)return t.json();throw console.log("Unable to load configuration from {0}".format(n)),t}).then(t=>{t&&(this._wrProps?(wire.merge(t,this._wrProps),this._wrProps=t):this._wrProps=t),e()}).catch(t=>{throw console.log("Unable to load configuration from {0}".format(n)),t}):e()},n=e=>{const n=t=>{const n=document.createElement("style");n.append(t),this.prepend(n),e()},i=t(this.styleUrl,this.constructor.styleUrl);i?fetch(i).then(t=>{if(t.ok)return t.text();throw console.log("Unable to load styles from {0}".format(i)),t}).then(t=>{n(t)}).catch(t=>{throw console.log("Unable to load styles from {0}".format(i)),t}):e()},i=()=>{e(()=>{const e={wr:{syncCallbackReady:!1,syncCallback:(t,e,n)=>{this.wrObjectChanged.call(this,t,e,n)}}};if(0==this.children.length){var i=this.constructor.__templateEl.content.cloneNode(!0);for(this.__tinybindView=tinybind.bind(i,this,e);this.firstChild;)this.removeChild(this.firstChild);this.appendChild(i)}else{let n=null;const i=t(this.templateContainer,this.constructor.templateContainer);if(i){n=this.constructor.__templateEl.content.cloneNode(!0),this.__tinybindView=tinybind.bind(n,this,e);const t=n.querySelector(i);if(t){let e=!1;Array.from(this.children).forEach(n=>{e||(e=n.querySelector(i)),e||t.appendChild(n)}),e||this.replaceChildren(n)}else console.log(`templateContainer ${i} not found`)}else n=this,this.__tinybindView=tinybind.bind(n,this,e)}n(()=>{new wire.Event("template-ready.webcomponent.wr").data({id:this.id}).raise(),this.wrIsAppReady?this.wrAppReady():addEventListener("app-ready.wr",()=>{this.wrAppReady()})})})};if(t(this.templateUrl,this.constructor.templateUrl))(e=>{const n=t(this.templateUrl,this.constructor.templateUrl);fetch(n).then(t=>{if(t.ok)return t.text();throw console.log("Unable to load template from {0}".format(n)),t}).then(t=>{this.constructor.__templateEl.innerHTML=t,e()}).catch(t=>{throw console.log("Unable to load template from {0}".format(n)),t})})(()=>{i()});else{const e=t(this.templateId,this.constructor.templateId);if(e){let t=document.getElementById(e);this.constructor.__templateEl.innerHTML=t.innerHTML,t.remove(),i()}else"function"==typeof this.template&&(this.constructor.__templateEl.innerHTML=this.template()),i()}this._connectedCallbackHasRun=!0,dispatchEvent(new Event("connectedCallback.wr"))}async ensureConnectedCallback(){return new Promise(t=>{this._connectedCallbackHasRun?t():addEventListener("connectedCallback.wr",t)})}async attributeChangedCallback(t,e,n){if(n.indexOf("[wr-import]")>-1){const t=n.split("|")[1],e=n.split("|")[2],i=n.split("|")[3];const r=(await import(i))[e],s=wire.location.path(i).params();r.eq&&s.length&&s.forEach(t=>{r.eq(t.name,t.value)}),this[t]=r,this.wrObjectChanged(this[t],t)}else"[wr-object]"==n?this.wrObjectChanged(this[t],t):super.attributeChangedCallback(t,e,n)}async wrAppReady(){}wrSetAppReady(){dispatchEvent(new Event("app-ready.wr"))}wrUseAppReady(t){return void 0!==t&&(wire.ui.customElements.useAppReady=t,wire.ui.customElements.appReady=!1),wire.ui.customElements.useAppReady}wrEventReady(){(new wire.ui.Component).eventReady({source:this,element:this})}wrEventDataBind(t){(new wire.ui.Component).eventDataBind({source:this,element:this,data:t})}get wrIsAppReady(){return!wire.ui.customElements.useAppReady||wire.ui.customElements.appReady}get wrApp(){return wire.ui.customElements.appState}set wrApp(t){wire.ui.customElements.appReady=!0,wire.ui.customElements.appState=t}static wrGetApp(){return wire.ui.customElements.appState}wrObjectChanged(t,e){}get wrProps(){return this.wrAttrib}get wrAttrib(){var t={};for(let e=0;e<this.attributes.length;e++){const n=this.attributes[e],i=n.name.split("-").length,r=wire.isBoolean,s=`{"${n.name.replaceAll("-",'":{"')}":${r(n.value)?"":'"'}${n.value}${r(n.value)?"":'"'}${"}".repeat(i)}`;wire.merge(t,JSON.parse(s))}return t=wire.merge(this.constructor.propertyDefaults,t),this._wrProps?wire.merge(this._wrProps,t):t}static get propertyDefaults(){return{}}static get template(){return"<div></div>"}templateUrl(){return null}templateId(){return null}templateContainer(){return null}styleUrl(){return null}}class WireWebComponent extends WebComponent{constructor(){super(),this._objChanged=null,this._component=null,this._firstChild=null}connectedCallback(){super.connectedCallback(),this._objChanged&&super.wrIsAppReady&&this._render(this._objChanged.obj,this._objChanged.name)}async wrAppReady(){this._objChanged&&this._render(this._objChanged.obj,this._objChanged.name)}wrObjectChanged(t,e){super.wrObjectChanged(t,e),this.firstChild&&super.wrIsAppReady?this._render(t,e):this._objChanged={obj:t,name:e}}wrRender(t){return this._render(t,"config"),this.wrComponent}_render(t,e){let n=this.wrAttrib;if(n=n||{},"config"==e?n=wire.merge(t,n):n[e]=t,!n.component)throw`Missing 'component' attribute on ${this.name}`;this._component||(this._component=wire.ui.Component.create(n.component)),this._firstChild||(this._firstChild=this.firstChild),this._component.render(this._firstChild,n),this._objChanged=null}get wrComponent(){return this._component}static get properties(){return{data:!0,config:!0}}}customElements.define("wire-component",WireWebComponent),wire.ui.customElements=wire.ui.customElements||{appReady:null,appState:null,useAppReady:!1},wire.ui.bind=tinybind.bind,wire.ui.WebComponent=WebComponent,wire.ui.WireWebComponent=WireWebComponent;