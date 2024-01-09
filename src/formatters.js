
//
// Formatters
//

//item | exp 'Edit {Name}' | -> two way-> watch item.Name
// <div wr-add-class="wrAttrib | exp '=(`panel-${$obj.color||'inverse'}`)'" class="panel">
tinybind.formatters.exp = function(obj, exp) {
    
    if(obj)
        return exp.eval(obj);
    else
        return "";

}

tinybind.formatters.args = function (fn) {
    let args = Array.prototype.slice.call(arguments, 1);
    return function () {
      // ev, data (from tinybind), arg1, arg2, ...
      // async events loose all but second parameter so adding to data
      const data = arguments[1];
      data.args = args;
      data.el = this;
      return fn.apply(this, Array.prototype.concat.call(arguments[0], data, ...args));
    }
  }          

tinybind.formatters['date'] = function (dte, locale) {    
    if (dte)
        return new Date(dte).toLocaleDateString(locale || "en-US");
    else {
//        console.log("Binding 'date' received a null or undefined object with locale '{0}'".format(locale || '[null]'));
        return "";
    }
}

tinybind.formatters['property'] = function (obj, property) {
    if (obj)
        return obj[property];
    else {
  //      console.log("Binding 'property' received a null or undefined object with property '{0}'".format(property));
        return "";
    }
}
