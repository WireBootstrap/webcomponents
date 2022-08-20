

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