

//
// Binders
//

tinybind.binders['add-class'] = function (el, value) {
    if(value)
        el.className = `${el.className} ${value}`
}

tinybind.binders['import-*'] = function (el, a, b) {
    let name = "default";
    if (this.formatters && this.formatters.length)
        name = this.formatters[0];

    el.setAttribute(this.arg, "[wr-import]|{0}|{1}|{2}".format(this.arg, name, this.keypath));
}