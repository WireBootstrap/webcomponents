//
// Web component
//
class WebComponent extends tinybind.Component {    

    constructor(props){
      
      super();
      
      this._connectedCallbackHasRun = false;  
        
      //
      // Property merging - backfill if not aready set
      //
      
      let dft = this.constructor.propertyDefaults;
      if(!dft)
           dft = (this.propertyDefaults ? this.propertyDefaults() : null);
      
      if(dft)
          wire.merge(this, dft, {overwrite: false});          

      if(props)
          wire.merge(this, props, {overwrite: false});

    }

    wrUpdateBind() {
        if(this.__tinybindView) {
            this.__tinybindView.unbind();
            this.__tinybindView = tinybind.bind(this, this);
        }        
    }

    //
    // Handle attach life-cycle event
    //
    connectedCallback() {
          
        const _getTemplate = (fn, fn2) => {

            let v = (fn? fn.call(this) : null);

            if(v)
              return v;
            else
              if(fn2) {
                if(typeof fn2 == "function")
                  return fn2.call(this);
                else
                  return fn2;
              }

        }

        const _config = (cb) => {
            
          const url = _getTemplate(this.configUrl, this.constructor.configUrl);
          
          if(url) {         
                      
              fetch(url)
                  .then(response => {
                      if (response.ok)
                          return response.json();
                      else {
                          console.log("Unable to load configuration from {0}".format(url));
                          throw response;
                      }
                  })
                  .then(config => {                
                      if(config){
                          wire.merge(this, config, {overwrite: false});
                      }
                      cb();
                  })
                  .catch(error => {
                      console.log("Unable to load configuration from {0}".format(url));
                      throw error;
                  });
          }
          else cb();

        }

        const _style = (cb) => {
            
            const setStyle = (style) => {

                const tag = document.createElement("style");

                tag.append(style);

                this.prepend(tag);

                cb();

            }

            const url = _getTemplate(this.styleUrl, this.constructor.styleUrl);

            if(url) {                
                fetch(url)
                    .then(response => {
                        if (response.ok)
                            return response.text();
                        else {
                            console.log("Unable to load styles from {0}".format(url));
                            throw response;
                        }
                    })
                    .then(style => {                        
                        setStyle(style);
                    })
                    .catch(error => {
                        console.log("Unable to load styles from {0}".format(url));
                        throw error;
                    });
            }
            else cb();

        }

        const _templateUrl = (cb) => {
            
            const url = _getTemplate(this.templateUrl, this.constructor.templateUrl);

            fetch(url)
                .then(response => {
                    if (response.ok)
                        return response.text();
                    else {
                        console.log("Unable to load template from {0}".format(url));
                        throw response;
                    }
                })
                .then(template => {
                    this.constructor.__templateEl.innerHTML = template;
                    cb();
                })
                .catch(error => {
                    console.log("Unable to load template from {0}".format(url));
                    throw error;
                });
        
        }

        const _bindTemplate = ()=> {
            
          _config(() => {

              // call back when tinybind syncs model either way
              // set sync function 
              const viewOptions = {wr: { syncCallbackReady: false, syncCallback: (obj, prop, value)=> {        
                  
                  //new wire.data.DataEvent("object-changed.wr").row(obj).cell(prop, value) .raise();
                  
                // bubble/forward the observable change to inheriting class             
                this.wrObjectChanged.call(this, obj, prop, value);

              }}};
              
              if(this.children.length == 0) { 
                  // simple append and bind for template
                  //super.connectedCallback(); 

                  var nodes = this.constructor.__templateEl.content.cloneNode(true);

                  this.__tinybindView = tinybind.bind(nodes, this, viewOptions);
          
                  while (this.firstChild) {
                  this.removeChild(this.firstChild);
                  }
          
                  this.appendChild(nodes);

              }           
              else {

                  // preserve content/children inside the component if exists    

                  let tmpl = null;
                  
                  const container = _getTemplate(this.templateContainer, this.constructor.templateContainer);

                  if(container) {
                      
                  // content to be appended to a node in the template
                  tmpl = this.constructor.__templateEl.content.cloneNode(true); 

                  this.__tinybindView = tinybind.bind(tmpl, this, viewOptions);
                      
                  const parent = tmpl.querySelector(container);

                  if(parent) {
  
                      // drag/drop with existing content recursivly embed the same content inside each container
                      let isSelf = false;
                  
                      Array.from(this.children).forEach(child=>{
                          if(!isSelf)
                              isSelf = child.querySelector(container);
                          if(!isSelf)
                              parent.appendChild(child);
                      });
                      
                      if(!isSelf)
                          this.replaceChildren(tmpl);                        
                  }
                  else console.log(`templateContainer ${container} not found`); 
                  
              }
                  else {
                      // ignore template, child content is the template                                   
                      tmpl = this;                    
                      this.__tinybindView = tinybind.bind(tmpl, this, viewOptions);
                  }                
                  
              }
              
              _style(() => {

                  // race condition using the element id, use this event level id
                  new wire.Event("template-ready.webcomponent.wr").data({id: this.id}).raise();

                  //
                  // App ready
                  // turn on sync (noise if left on during initial bindings)
                  //            
                  if (this.wrIsAppReady) {                     
                      this.wrAppReady();
                  }
                  else
                      addEventListener('app-ready.wr', () => {
                          this.wrAppReady();
                      });                                              
              });

          });

        }

        //
        // Template processing
        // this.x is this class, this.contructor.x is the override
        //
        const url = _getTemplate(this.templateUrl, this.constructor.templateUrl);
        if(url)
            _templateUrl(() => {          
                _bindTemplate();
            });
        else {
            const id = _getTemplate(this.templateId, this.constructor.templateId);
            if(id) {
                let tmpl = document.getElementById(id);                
                this.constructor.__templateEl.innerHTML = tmpl.innerHTML;
                tmpl.remove();
                _bindTemplate();
            }
            else {
              if(typeof this.template == "function")
                this.constructor.__templateEl.innerHTML = this.template();              
              _bindTemplate();
            }
         }
          
         this._connectedCallbackHasRun = true;

         dispatchEvent(new Event("connectedCallback.wr"));
          
    }   

    async ensureConnectedCallback() {

        return new Promise((cb) => {
            if (this._connectedCallbackHasRun)
              cb();
            else
              addEventListener('connectedCallback.wr', cb);  
        });

    }

    async attributeChangedCallback(name, oldValue, newValue) {

        if (newValue.indexOf("[wr-import]") > -1) {

            const prop = newValue.split("|")[1];
            const name = newValue.split("|")[2];
            const path = newValue.split("|")[3];

            let d = await import(path);

            const obj = d[name];

            // import file.js?id=10
            const params = wire.location.path(path).params();

            if(obj.eq && params.length) {

                // add filters
                params.forEach(param => {
                    obj.eq(param.name, param.value);
                });

            }

            this[prop] = obj;
            
            this.wrObjectChanged(this[prop], prop);
        }
        else {
          
            if (newValue == "[wr-object]") {
                this._wrProps = this._wrProps || {};
                this._wrProps[name] = this[name];
                this.wrObjectChanged(this[name], name);                
                this.removeAttribute(name);
            }
            else
                super.attributeChangedCallback(name, oldValue, newValue);
        }
    }

    async wrAppReady() {
    }

    wrSetAppReady() {
        dispatchEvent(new Event("app-ready.wr"));
    }

    wrUseAppReady(useAppReady) {
        if (typeof useAppReady != "undefined") {
            wire.ui.customElements.useAppReady = useAppReady;
            wire.ui.customElements.appReady = false;
        }
        return wire.ui.customElements.useAppReady;
    }

    wrEventReady() {
      new wire.ui.Component().eventReady({source: this, element: this});
    }

    wrEventDataBind(data) {
      new wire.ui.Component().eventDataBind({source: this, element: this, data: data});
    }

    get wrIsAppReady() {
        return (wire.ui.customElements.useAppReady ? wire.ui.customElements.appReady : true);
    }    

    get wrApp(){
        return wire.ui.customElements.appState;
    }
  
    set wrApp(app){
      wire.ui.customElements.appReady = true;
      wire.ui.customElements.appState = app;
    }

    static wrGetApp(){
      return wire.ui.customElements.appState;
    }
  
    wrObjectChanged(obj, name) {
    }

    get wrProps(){
      return this.wrAttrib;
    }

    get wrAttrib() {

        //
        // Transform all attributes into a config object
        //

        var cfg = {};

        for (let i = 0; i < this.attributes.length; i++) {

            const attr = this.attributes[i];

            //if (attr.value.indexOf("wr-") == -1) {

                const num = attr.name.split("-").length;

                const f = wire.isBoolean;

                const json = `{"${attr.name.replaceAll('-', '":{"')}":${f(attr.value)?'':'"'}${attr.value}${f(attr.value)?'':'"'}${'}'.repeat(num)}`;
                
                wire.merge(cfg, JSON.parse(json));

            //}

        }

        //cfg = wire.merge(this.constructor.propertyDefaults, cfg);

        //if(this._wrProps)
           // return wire.merge(this._wrProps, cfg);
       // else
            return cfg;

    }
    
    //
    // Merged with wrAttrib
    //
    propertyDefaults() {
        return null;
    }    

    static get template() {
        return "<div></div>";
    }

    templateUrl() {
      return null;
    }

    templateId() {
      return null;
    }

    templateContainer() {
      return null;
    }

    styleUrl() {
      return null;
    }    

}
