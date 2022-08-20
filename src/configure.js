
//
// Configuration
//

tinybind.configure({
    
    prefix: 'wr',
    
    fallbackBinder: function(el, value) {

        if (value != null) {
            
            if(typeof value == "object"){
                el[this.type] = value;
                el.setAttribute(this.type, "[wr-object]");
            }
            else
                el.setAttribute(this.type, value);

        } else
            el.removeAttribute(this.type);
        }      
});