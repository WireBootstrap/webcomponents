

//
// Adaptors
//

tinybind.adapters['['] = {
    observe: function (obj, keypath, callback) {
        // not implmented
    },
    unobserve: function (obj, keypath, callback) {
        // not implemented
    },
    get: function (obj, keypath) {        
        let key = keypath.split("]")[0].replaceAll('"', "").replaceAll("'", "");
        key =  (wire.isNumeric(key) ? +key : key);
        return obj[key];
    },
    set: function (obj, keypath, value) {
        // not implemented
    }
}

