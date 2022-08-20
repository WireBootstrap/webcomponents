
import dataset from "../../../data/sample-data.js";

class PageComponent extends wire.ui.WebComponent {
    
    products = null;
    clicked = "Nothing clicked";

    async connectedCallback() {

        super.connectedCallback();

        // Executes the query on the server and put the results onto a public property
        this.products = await dataset.execAsync();

    }

    btnClick = (ev) => {
        // The 'clicked' property is bound in the UI
        this.clicked = ev.detail.currentTarget.innerText;
    }

    static get templateUrl() {
        return "./page1.html"
    }
}

customElements.define('app-page', PageComponent);
