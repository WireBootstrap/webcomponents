
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
        el.className = `${el.className} ${value}`
}

tinybind.binders['import-*'] = function (el, a, b) {
    let name = "default";
    if (this.formatters && this.formatters.length)
        name = this.formatters[0];

    el.setAttribute(this.arg, "[wr-import]|{0}|{1}|{2}".format(this.arg, name, this.keypath));
}

//
// Formatters
//

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

    _objChanged = null;

    connectedCallback() {

        super.connectedCallback();

        // wrObjectChanged called before this component was added to the DOM
        // so render now
        if(this._objChanged)
            this._render(this._objChanged.obj, this._objChanged.name);
    }

    wrObjectChanged(obj, name) {       
        
        super.wrObjectChanged(obj, name);
       
        if(this.firstChild)
            this._render(obj, name);
        else
            this._objChanged = {obj: obj, name: name};
    }
        
    _render(obj, name) {
        
        let config = this.wrAttributes()

        if(name == "config")
            config = wire.merge(config, obj);

        if(name == "data")
            config.data = obj;
        
        if(!config.component) 
            throw `Missing 'component' attribute on ${this.name}`;
        else {

            let cmp = wire.ui.Component.create(config.component);        

            cmp.render(this.firstChild, config);

        }

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
    appReady: null
};


//
// Namespace objects
//
wire.ui.bind = tinybind.bind;
wire.ui.WebComponent = WebComponent;
wire.ui.WireWebComponent = WireWebComponent;