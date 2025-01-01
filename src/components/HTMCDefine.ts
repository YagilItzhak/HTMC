import { executeScripts } from '../utils/HTMCUtils';
import { defineComponent } from '../ComponentDefinition';

export default class HTMCDefine extends HTMLElement {

    constructor() {
        super();
        this.style.display = 'none';
    }

    connectedCallback(): void {
        if (this.hasAttribute('components-defined')) return;
        this.setAttribute('components-defined', 'true');
        this.defineComponents();
        this.style.display = 'none';
    }

    defineComponents(): void {
        const components = Array.from(this.getElementsByTagName('component')) as HTMLElement[];
        const scripts = Array.from(this.getElementsByTagName('script')) as HTMLScriptElement[];

        try {
            executeScripts(scripts);
        } catch (error) {
            console.error('Script execution failed:', error);
        }

        components.forEach(defineComponent);
    }
}

