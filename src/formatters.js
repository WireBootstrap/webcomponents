//
// Formatters
//

tinybind.formatters.args = function (fn) {
    let args = Array.prototype.slice.call(arguments, 1);
    return function () {
        return fn.apply(this, Array.prototype.concat.call(arguments[0], args));
    }
}            

tinybind.formatters['property'] = function (obj, property) {
    if (obj)
        return obj[property];
    else {
        console.log("Binding 'property' received a null or undefined object with property '{0}'".format(property));
        return "";
    }
}
