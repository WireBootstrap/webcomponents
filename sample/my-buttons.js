class MyComponent extends wire.ui.WebComponent {

    list = [];
    
    static get properties() {
        return {
            label: true,
            list: true
        }
    }

    btnClick = (ev) => {
        this.dispatchEvent(new CustomEvent("btn-click", { detail: ev }));
    }

    static get templateUrl() {
        return "../my-buttons.html"
    }

}

customElements.define('my-buttons', MyComponent);
