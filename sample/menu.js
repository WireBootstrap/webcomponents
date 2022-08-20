class MenuComponent extends wire.ui.WebComponent {
   
    static get templateUrl() {
        return "../menu.html"
    }

}

customElements.define('app-menu', MenuComponent);