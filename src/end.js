

//
// Web components state management
//

wire.ui.customElements = wire.ui.customElements || {
    appReady: null,
    appState: null,
    useAppReady: false
};


//
// Namespace objects
//
wire.ui.bind = tinybind.bind;
wire.ui.WebComponent = WebComponent;
wire.ui.WireWebComponent = WireWebComponent;