
//
// Configuration
//

tinybind.configure({
    
    prefix: 'wr',
    
    fallbackBinder: function(el, value) {

        if (value != null) {
            
            if(typeof value == "object"){
                el[this.type] = value;
                el.setAttribute(this.type, "[wr-object]");
            }
            else
                el.setAttribute(this.type, value);

        } else
            el.removeAttribute(this.type);
        }      
});

//
// Binders
//

tinybind.binders['add-class'] = function (el, value) {
    if(value)
    el.className = (el.className == "" ? value : `${el.className} ${value}`);
}

tinybind.binders['import-*'] = function (el, a, b) {
    let name = "default";
    if (this.formatters && this.formatters.length)
        name = this.formatters[0];

    el.setAttribute(this.arg, "[wr-import]|{0}|{1}|{2}".format(this.arg, name, this.keypath));
}

tinybind.binders['select2'] = {
    publishes: true,
    priority: 2000,
    bind: function (el) {

        const self = this;

        $(el).on("select2:select select2:unselect", function () {
            self.publish();
        });

    },
    unbind: function (el) {
        $(el).off("select2:select select2:unselect");
    },
    routine: function () {
        // not implemented
    }
}


//
// Tinybind daterangepicker model binding
//
tinybind.binders['daterangepicker'] = {
    publishes: true,
    priority: 2000,
    bind: function (el) {

        const self = this;

        $(el).on("apply.daterangepicker", function () {
            self.publish();
        });

    },
    unbind: function (el) {             
        $(el).off("apply.daterangepicker");
    },
    routine: function () {
        // not implemented
    }
}



//
// Adaptors
//

tinybind.adapters['['] = {
    observe: function (obj, keypath, callback) {
        // not implmented
    },
    unobserve: function (obj, keypath, callback) {
        // not implemented
    },
    get: function (obj, keypath) {
        const index = +keypath.split("]")[0];
        return obj[index];
    },
    set: function (obj, keypath, value) {
        // not implemented
    }
}

//
// Formatters
//

tinybind.formatters.args = function (fn) {
    let args = Array.prototype.slice.call(arguments, 1);
    return function () {
        return fn.apply(this, Array.prototype.concat.call(arguments[0], args));
    }
}            

tinybind.formatters['property'] = function (obj, property) {
    if (obj)
        return obj[property];
    else {
        console.log("Binding 'property' received a null or undefined object with property '{0}'".format(property));
        return "";
    }
}


//
// Web component
//
class WebComponent extends tinybind.Component {

    //
    // Handle attach life-cycle event
    //
    connectedCallback() {

        const _connectedCallback = () => {

            super.connectedCallback();

            //
            // App ready
            //

            if (wire.ui.customElements.appReady)
                this.wrAppReady();
            else
                addEventListener('app-ready.wire', () => {
                    this.wrAppReady();
                });

        }


        //
        // Template processing
        //

        const _template = () => {
            const url = this.constructor.templateUrl;

            if (url) {
                fetch(url + `?v=${wire.guid()}`)
                    .then(response => {
                        if (response.ok)
                            return response.text();
                        else {
                            console.log("Unable to load template from {0}".format(url));
                            throw reponse;
                        }
                    })
                    .then(template => {
                        this.constructor.__templateEl.innerHTML = template;
                        _connectedCallback();
                    })
                    .catch(error => {
                        console.log("Unable to load template from {0}".format(url));
                        throw error;
                    });
            }
            else
                _connectedCallback();

        }

        _template();

    }   

    async wrAppReady() {
    }

    wrSetAppReady() {
        wire.ui.customElements.appReady = true;
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

    wrObjectChanged(obj, name) {
    }

    async attributeChangedCallback(name, oldValue, newValue) {

        if (newValue.indexOf("[wr-import]") > -1) {

            const prop = newValue.split("|")[1];
            const name = newValue.split("|")[2];
            const path = newValue.split("|")[3];

            let d = await import(path);

            this[prop] = d[name];

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

    wrAttributes(defaults) {

        //
        // Transform all attributes into a config object
        //

        var cfg = {};

        for (let i = 0; i < this.attributes.length; i++) {

            const attr = this.attributes[i];

            if (attr.value.indexOf("wr-") == -1) {

                const num = attr.name.split("-").length;

                const json = `{"${attr.name.replaceAll('-', '":{"')}":"${attr.value}"${'}'.repeat(num)}`;

                wire.merge(cfg, JSON.parse(json));

            }

        }

        if (defaults)
            cfg = wire.merge(defaults, cfg);

        return cfg;

    }

    
    //
    // Stub for templateUrl
    //
    static get template() {
        return "<div></div>";
    }

}

//
// Wire Component - wraps any WireBootstrap component
//

class WireWebComponent extends WebComponent {

    constructor() {
        // queue if wrObjectChanged called before this component was added to the DOM
        // or when waiting for app init to complete
        this._objChanged = null;
        this._component = null;
    }

    connectedCallback() {

        super.connectedCallback();

        if (this._objChanged && super.wrIsAppReady)
            this._render(this._objChanged);
    }

    async wrAppReady() {

        if (this._objChanged)
            this._render(this._objChanged);

    }

    wrObjectChanged(obj, name) {       
        
        super.wrObjectChanged(obj, name);
       
        if (this.firstChild && super.wrIsAppReady)
            this._render(obj, name);
        else
            this._objChanged = {obj: obj, name: name};
    }
        
    _render(obj, name) {
        
        let config = this.wrAttributes()

        if(obj.name == "config")
            config = wire.merge(config, obj.obj);

        if(obj.name == "data")
            config.data = obj.obj;
        
        if(!config.component) 
            throw `Missing 'component' attribute on ${this.name}`;
        else {

            this._component = wire.ui.Component.create(config.component);        

            this._component.render(this.firstChild, config);

        }

        this._objChanged = null;

    }

    get wrComponent() {
        return this._component;
    }    
    
    static get properties() {
        return {
            data: true,
            config: true            
        }
    }

  }

  customElements.define('wire-component', WireWebComponent);


//
// Web components state management
//

wire.ui.customElements = wire.ui.customElements || {
    appReady: null,
    useAppReady: false
};


//
// Namespace objects
//
wire.ui.bind = tinybind.bind;
wire.ui.WebComponent = WebComponent;
wire.ui.WireWebComponent = WireWebComponent;