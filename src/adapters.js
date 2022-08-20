

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
        const index = +keypath.split("]")[0];
        return obj[index];
    },
    set: function (obj, keypath, value) {
        // not implemented
    }
}