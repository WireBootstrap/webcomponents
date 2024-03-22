/**
 * Extends HTMLElement through tinybind.Component
 */
interface IWireWebComponent extends HTMLElement {
  new(): IWireWebComponent;
  new(config: any): IWireWebComponent;
  /**
   * Native window method for raising Events
   */         
  //dispatchEvent(event: Event); needed?
  /**
   * Resets the bindings for the web component
   */         
  wrUpdateBind(): void;
  /**
   * Web Component's native callback method
   */         
  connectedCallback(): void;
  /**
   * Called when observable component property of 'object' type has been changed
   * This is the object version of attributeChangedCallback used for primitive types
   */      
  wrObjectChanged(obj?: any, name?: string, value?: any): void;
  /**
   * Called by root/app component telling child components initialization has been completed
   */      
  wrSetAppReady(): void;
  /**
   * Callback post application initialization
   */    
  wrAppReady(): Promise<void>;
  /**
   * Shared application state object for components
   */
  wrApp: any;
  /**
   * Static version of wrApp
   */
  wrGetApp(): any;
  /**
   * Object transform for attributes set on the component
   */
   wrAttrib: any;         
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
   wrComponent: IWireComponent;
   /**
   * Renders the component and returns the underlying component
   * @param config The configuration for the component.  Will be merged with any attributes set on the element.
   */   
   wrRender(config?: any): IWireComponent;   
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
  bind(el: any, model: any): any;
}