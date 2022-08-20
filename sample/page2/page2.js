import dataset from "../../data/sample-data.js";

class PageComponent extends wire.ui.WebComponent {

    // Pass the dataset to the component to be executed there
    dataset = dataset;

    static get templateUrl() {
        return "./page2.html"
    }
}

customElements.define('app-page', PageComponent);
