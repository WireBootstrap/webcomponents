

//
// Web component
//
class WebComponent extends tinybind.Component {

    wrUpdateBind() {
        if(this.__tinybindView) {
            this.__tinybindView.unbind();
            const nodes = this.constructor.__templateEl.content.cloneNode(true);
            this.__tinybindView.bind(nodes, this, options);
        }
    }

    //
    // Handle attach life-cycle event
    //
    connectedCallback() {
        
        const _templateUrl = (cb) => {
            
            let url = this.constructor.templateUrl;            

            if(!url && this.templateUrl) 
                url = (typeof this.templateUrl == "string") ? this.templateUrl : this.templateUrl();

            if (url) {
                if(typeof url == "function")
                    url = url();
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
            else
                cb();
        }

        const _bindTemplate = ()=> {

            // bubble/forward the observable change to inheriting class
            // after setting dirty flag on the base class
            const options = {wr: { publishCallback: (obj, prop, value)=> { 
                debugger
                new wire.data.DataEvent("object-changed.wr").row(obj).cell(prop, value) .raise();
                this.wrObjectChanged.call(this, obj, prop, value);
            }}};

            if(this.children.length == 0) { 
                // simple append and bind for template
                //super.connectedCallback(); 

                var nodes = this.constructor.__templateEl.content.cloneNode(true);

                this.__tinybindView = tinybind.bind(nodes, this, options);
          
                while (this.firstChild) {
                  this.removeChild(this.firstChild);
                }
          
                this.appendChild(nodes);

            }           
            else {

                // preserve content/children inside the component if exists    

                let tmpl = null;
                
                if(this.templateContainer) {
                    
                    // content to be appended to a node in the template
                    tmpl = this.constructor.__templateEl.content.cloneNode(true); 

                    this.__tinybindView = tinybind.bind(tmpl, this, options);
                        
                    const children = this.children;

                    let parent = tmpl.querySelector(this.templateContainer);
        
                    if(parent) {
            
                        Array.from(this.children).forEach((child)=>{
                            parent.appendChild(child);
                        });
                        
                        this.replaceChildren(tmpl);
            
                    }
                    else console.log(`templateContainer ${this.templateContainer} not found`); 
                   
                }
                else {
                    // ignore template, child content is the template                                   
                    tmpl = this;                    
                    this.__tinybindView = tinybind.bind(tmpl, this, options);
                }                
                
            }

            //
            // App ready
            //            
            if (this.wrIsAppReady)
                this.wrAppReady();
            else
                addEventListener('app-ready.wire', () => {
                    this.wrAppReady();
                });            
        }

        //
        // Template processing
        //
        if(this.constructor.templateUrl || this.templateUrl)
            _templateUrl(() => {          
                _bindTemplate();
            });
        else
            if(this.constructor.templateId) {
                let tmpl = document.getElementById(this.constructor.templateId);                
                this.constructor.__templateEl.innerHTML = tmpl.innerHTML;
                tmpl.remove();
                _bindTemplate();
            }
            else
                _bindTemplate();
          
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
                //this.removeAttribute(name);
                this.wrObjectChanged(this[name], name);
            }
            else
                super.attributeChangedCallback(name, oldValue, newValue);
        }
    }

    async wrAppReady() {
    }

    wrSetAppReady() {        
        dispatchEvent(new Event("app-ready.wire"));
    }

    wrUseAppReady(useAppReady) {
        if (typeof useAppReady != "undefined") {
            wire.ui.customElements.useAppReady = useAppReady;
            wire.ui.customElements.appReady = false;
        }
        return wire.ui.customElements.useAppReady;
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

    get wrAttrib() {

        //
        // Transform all attributes into a config object
        //

        var cfg = {};

        for (let i = 0; i < this.attributes.length; i++) {

            const attr = this.attributes[i];

            if (attr.value.indexOf("wr-") == -1) {

                const num = attr.name.split("-").length;

                const f = wire.isBoolean;

                const json = `{"${attr.name.replaceAll('-', '":{"')}":${f(attr.value)?'':'"'}${attr.value}${f(attr.value)?'':'"'}${'}'.repeat(num)}`;

                wire.merge(cfg, JSON.parse(json));

            }

        }

        cfg = wire.merge(this.constructor.propertyDefaults, cfg);

        return cfg;

    }
    
    //
    // Merged with wrAttrib
    //
    static get propertyDefaults() {
        return {};
    }    

    static get template() {
        return "<div></div>";
    }

    static get templateId() {
        return null;
    }

    static get templateContainer() {
        return null;
    }

}