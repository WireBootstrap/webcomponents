class AppComponent extends wire.ui.WebComponent {

    static get templateUrl() {
        return "../app.html"
    }

}

customElements.define('my-app', AppComponent);
