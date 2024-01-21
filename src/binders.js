

//
// Binders
//


tinybind.binders['add-class'] = function (el, value) {
    if(value)
    el.className = (el.className == "" ? value : `${el.className} ${value}`);
}

tinybind.binders['import-*'] = function (el, a, b) {
    let name = "default";
    if (this.formatters && this.formatters.length)
        name = this.formatters[0];

    el.setAttribute(this.arg, "[wr-import]|{0}|{1}|{2}".format(this.arg, name, this.keypath));
}

tinybind.binders['select2'] = {
    publishes: true,
    priority: 2000,
    bind: function (el) {

        const self = this;

        $(el).on("select2:select select2:unselect", function () {
            self.publish();
        });      

    },
    unbind: function (el) {
        $(el).off("select2:select select2:unselect");
        $(el).off("databind.wire");
    },
    routine: function (el, value) {

        $(el).on("databind.wire", (e, d) => {
            debugger
            if (typeof value != "undefined")
                $(el).val(value).trigger("change")
        });

    }
}


//
// Tinybind daterangepicker model binding
//
tinybind.binders['daterangepicker'] = {
    publishes: true,
    priority: 2000,
    bind: function (el) {

        const self = this;

        $(el).on("apply.daterangepicker", function () {
            self.publish();
        });

    },
    unbind: function (el) {             
        $(el).off("apply.daterangepicker");
    },
    routine: function () {
        // not implemented
    }
}


// NOT NEEDED ? Create an anchor and style as button (wr-href="someurl")
// <a wr-navigate="someUrl"></a>
tinybind.binders['navigate'] = {
    function: true,
    priority: 1000,
    unbind: function unbind(el) {
      if (this._navigate) {
        el.removeEventListener("click", this._navigate);
      }
    },
    routine: function routine(el, value) {
  
      if (this._navigate) {
        el.removeEventListener("click", this.handler);
      }
  
      if (value) {
  
        this._navigate = function () {
          window.open(value, "_new");
        }
  
        el.addEventListener("click", this._navigate);
      }
      
    }
}