

//
// Wire Component - wraps any WireBootstrap component
//

class WireWebComponent extends WebComponent {

    constructor() {
        super();
        // queue if wrObjectChanged called before this component was added to the DOM
        // or when waiting for app init to complete
        this._objChanged = null;
        this._component = null;
        this._firstChild = null;
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
        
    wrRender(config) {

        this._render(config, "config");
        return this.wrComponent;

    }

    _render(obj, name) {
       
        let config = this.wrAttrib;

        config = config || {};

        if(name == "config")
            config = wire.merge(obj, config);
        else
            config[name] = obj;

        if(!config.component) 
            throw `Missing 'component' attribute on ${this.name}`;
        else {

            if(!this._component)
                this._component = wire.ui.Component.create(config.component);        

            if(!this._firstChild)
                this._firstChild = this.firstChild;

            this._component.render(this._firstChild, config);

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
