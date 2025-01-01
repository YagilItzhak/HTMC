import { executeScripts } from '../utils/HTMCUtils';
import { defineComponent } from '../ComponentDefinition';
export default class HTMCDefine extends HTMLElement {
    constructor() {
        super();
        this.style.display = 'none';
    }
    connectedCallback() {
        if (this.hasAttribute('components-defined'))
            return;
        this.setAttribute('components-defined', 'true');
        this.defineComponents();
        this.style.display = 'none';
    }
    defineComponents() {
        const components = Array.from(this.getElementsByTagName('component'));
        const scripts = Array.from(this.getElementsByTagName('script'));
        try {
            executeScripts(scripts);
        }
        catch (error) {
            console.error('Script execution failed:', error);
        }
        components.forEach(defineComponent);
    }
}
