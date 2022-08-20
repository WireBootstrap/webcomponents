

//
// Bootstrap TABLE
// <wire-bs-table wr-data="sampleDataSet" css="table-dark"></wire-bs-table>

//

class WireBsTable extends wire.ui.WireWebComponent {
   
    attr = null;

    connectedCallback() {

        this.attr = this.wrAttributes();

        this.setAttribute('component', 'wire.bsTable');

        super.connectedCallback();
              
    }

    static get template() {
        return '<table class="table" wr-add-class="attr.css"></table>'
    }
     
  }

  customElements.define('wire-bs-table', WireBsTable);
