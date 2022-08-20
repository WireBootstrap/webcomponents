class HeaderComponent extends wire.ui.WebComponent {
   
    static get templateUrl() {
        return "../header.html"
    }

}

customElements.define('app-header', HeaderComponent);