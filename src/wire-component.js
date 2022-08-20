

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
