import { componentRegistry } from './ComponentRegistry';
export default function createCustomElementClass(componentName) {
    return class extends HTMLElement {
        shadow = this.attachShadow({ mode: 'open' });
        static get observedAttributes() {
            const registryEntry = componentRegistry[componentName];
            if (!registryEntry || !Array.isArray(registryEntry.reactiveAttributes)) {
                console.warn(`No reactive attributes found for component: ${componentName}`);
                return [];
            }
            return registryEntry.reactiveAttributes;
        }
        connectedCallback() {
            try {
                this.initializeAttributes();
                this.render();
            }
            catch (error) {
                console.error(`Error in connectedCallback for component: ${componentName}`, error);
            }
        }
        attributeChangedCallback(attrName, oldVal, newVal) {
            if (String(oldVal) !== String(newVal)) {
                try {
                    this.updateState(attrName, newVal);
                    this.render();
                }
                catch (error) {
                    console.error(`Error in attributeChangedCallback for component: ${componentName}`, error);
                }
            }
        }
        initializeAttributes() {
            const registryEntry = componentRegistry[componentName];
            if (!registryEntry) {
                throw new Error(`No registry entry found for component: ${componentName}`);
            }
            registryEntry.staticAttributes.forEach(attr => {
                if (!this.hasAttribute(attr) && registryEntry.state[attr] !== undefined) {
                    const value = registryEntry.state[attr].value;
                    this.setAttribute(attr, value);
                }
            });
        }
        render() {
            const registryEntry = componentRegistry[componentName];
            if (!registryEntry || !registryEntry.templateContent) {
                throw new Error(`No template content found for component: ${componentName}`);
            }
            const templateContent = registryEntry.templateContent.cloneNode(true);
            this.replacePlaceholders(templateContent);
            this.shadow.innerHTML = '';
            this.appendScopedStyles(templateContent);
            this.shadow.appendChild(templateContent);
        }
        replacePlaceholders(templateContent) {
            const registryEntry = componentRegistry[componentName];
            if (!registryEntry)
                return;
            const { staticAttributes, reactiveAttributes } = registryEntry;
            const allAttributes = [...(staticAttributes || []), ...(reactiveAttributes || [])];
            allAttributes.forEach(attr => {
                const value = this.getAttribute(attr) || registryEntry.state[attr]?.value || '';
                templateContent.querySelectorAll('*').forEach(node => {
                    if (node.textContent?.includes(`\${${attr}}`)) {
                        node.textContent = node.textContent.replace(new RegExp(`\$\{${attr}\}`, 'g'), value);
                    }
                    Array.from(node.attributes).forEach(attribute => {
                        if (attribute.value.includes(`\${${attr}}`)) {
                            attribute.value = attribute.value.replace(new RegExp(`\$\{${attr}\}`, 'g'), value);
                        }
                    });
                });
            });
        }
        appendScopedStyles(templateContent) {
            const styles = templateContent.querySelectorAll('style');
            styles.forEach(style => {
                const styleClone = style.cloneNode(true);
                style.remove();
                this.shadow.appendChild(styleClone);
            });
            const originalComponent = document.querySelector(`component[name="${componentName}"]`);
            if (originalComponent) {
                originalComponent.querySelectorAll('style').forEach(style => style.remove());
            }
        }
        updateState(attrName, newVal) {
            const registryEntry = componentRegistry[componentName];
            if (registryEntry && registryEntry.state[attrName]) {
                registryEntry.state[attrName].value = newVal || '';
            }
        }
        disconnectedCallback() {
            // Add logic here to clean up resources or event listeners if needed.
        }
    };
}
