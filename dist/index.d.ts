/**
 * Extends HTMLElement through tinybind.Component
 */
interface IWireWebComponent extends HTMLElement {
    new(): IWireWebComponent;
    /**
     * Native window method for raising Events
     */         
    //dispatchEvent(event: Event); needed?
    /**
     * Web Component's native callback method
     */         
    connectedCallback(): void;
    /**
     * Called when observable component property of 'object' type has been changed
     * This is the object version of attributeChangedCallback used for primitive types
     */      
    wrObjectChanged(obj?: any, name?: string): void;
    /**
     * Called by root/app component telling child components initialization has been completed
     */      
    wrSetAppReady(): void;
    /**
     * Callback post application initialization
     */    
    wrAppReady(ev?: Event): void;
    /**
     * Transforms the attributes set on the component into an object
     * @param defaults Optional object containing default values for the attributes
     */
     wrAttributes(defaults?: any): any;
    /**
     * Transforms the attributes set on the component into an object
     * @param useAppReady Use this parameter to tell downstream components to expect an wrSetAppReady callback
     * @returns Boolean with the value of the property
     */
     wrUseAppReady(useAppReady?: boolean): boolean;
     /**
      * Returns app ready boolean state when using app initialization or always *true* if not
      */
     wrIsAppReady: boolean;
     /**
      * Returns the underlying component rendered inside the web component
      */
     wrComponent: IWireComponent     
}

interface IWireUi {  
    /**
     * Extends HTMLElement through tinybind.Component
     */
    WebComponent: IWireWebComponent;
    /**
     * Extends wire.ui.WebComponent to auto render native WireBootstrap components
     */    
    WireWebComponent: IWireWebComponent;
    /**
     * Tinybind bind method
     */
    bind(el: any, model: any);
  }