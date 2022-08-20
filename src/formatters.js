

//
// Formatters
//

tinybind.formatters['property'] = function (obj, property) {
    if (obj)
        return obj[property];
    else {
        console.log("Binding 'property' received a null or undefined object with property '{0}'".format(property));
        return "";
    }
}
