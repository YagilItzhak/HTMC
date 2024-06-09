class HTMCDefine extends HTMLElement {
    static registry: { [key: string]: { templateContent: DocumentFragment, attributes: string[], state: { [key: string]: any } } } = {};
    static importedFiles: Set<string> = new Set();

    constructor() {
        super();
    }

    async connectedCallback() {
        await this.processImports();
        this.defineComponents();
        this.style.display = 'none';
    }

    async processImports() {
        const imports = Array.from(this.querySelectorAll('htmc-attach'));
        for (let i = 0; i < imports.length; i++) {
            const importElement = imports[i];
            const src = importElement.getAttribute('src');
            if (src && !HTMCDefine.importedFiles.has(src)) {
                HTMCDefine.importedFiles.add(src);
                if (importElement.hasAttribute('defer')) {
                    window.addEventListener('load', () => this.importComponents(src));
                } else if (importElement.hasAttribute('lazy')) {
                    const observer = new IntersectionObserver((entries) => {
                        for (let j = 0; j < entries.length; j++) {
                            const entry = entries[j];
                            if (entry.isIntersecting) {
                                this.importComponents(src);
                                observer.unobserve(entry.target);
                            }
                        }
                    });
                    observer.observe(importElement);
                } else {
                    await this.importComponents(src);
                }
            }
        }
    }

    defineComponents() {
        const components = Array.from(this.querySelectorAll('component'));
        for (let i = 0; i < components.length; i++) {
            const component = components[i];
            const attributes = component.getAttribute('attributes')?.split(' ') || [];
            const componentName = component.getAttribute('name');
            if (componentName && !customElements.get(componentName)) {
                const template = document.createElement('template');
                template.innerHTML = component.innerHTML;

                const state = attributes.reduce((acc, attr) => {
                    acc[attr] = { value: '' };
                    return acc;
                }, {} as { [key: string]: any });

                HTMCDefine.registry[componentName] = {
                    templateContent: template.content.cloneNode(true) as DocumentFragment,
                    attributes,
                    state
                };

                customElements.define(componentName, class extends HTMLElement {
                    shadow: ShadowRoot;

                    static get observedAttributes() {
                        return HTMCDefine.registry[componentName].attributes;
                    }

                    constructor() {
                        super();
                        this.shadow = this.attachShadow({ mode: 'open' });
                    }

                    connectedCallback() {
                        this.render();
                    }

                    attributeChangedCallback(attrName: string, oldVal: string, newVal: string) {
                        this.updateState(attrName, newVal);
                        this.render();
                    }

                    render() {
                        const registryEntry = HTMCDefine.registry[componentName];
                        if (!registryEntry) {
                            return;
                        }

                        const templateContent = registryEntry.templateContent.cloneNode(true) as DocumentFragment;
                        this.replacePlaceholders(templateContent, componentName);
                        this.shadow.innerHTML = '';
                        this.shadow.appendChild(templateContent);
                    }

                    replacePlaceholders(templateContent: DocumentFragment, componentName: string) {
                        const attributes = HTMCDefine.registry[componentName].attributes;
                        for (let i = 0; i < attributes.length; i++) {
                            const attr = attributes[i];
                            const state = HTMCDefine.registry[componentName].state[attr];
                            const attrValue = this.getAttribute(attr) || state.value;

                            const nodes = templateContent.querySelectorAll('*');
                            for (let j = 0; j < nodes.length; j++) {
                                const node = nodes[j];
                                if (node.nodeType === Node.ELEMENT_NODE) {
                                    node.innerHTML = node.innerHTML.replace(new RegExp(`\\$\\{${attr}\\}`, 'g'), attrValue);
                                }
                            }
                        }

                        const innerContent = this.innerHTML;
                        const slots = templateContent.querySelectorAll('slot');
                        for (let i = 0; i < slots.length; i++) {
                            slots[i].innerHTML = innerContent;
                        }
                    }

                    updateState(attrName: string, newVal: string) {
                        const state = HTMCDefine.registry[componentName]?.state[attrName];
                        if (state) {
                            state.value = newVal;
                        }
                    }
                });
            }
        }
    }

    async importComponents(src: string) {
        try {
            const response = await fetch(src);
            if (response.ok) {
                const text = await response.text();
                const template = document.createElement('template');
                template.innerHTML = text;
                document.body.appendChild(template.content.cloneNode(true));

                const additionalImports = template.content.querySelectorAll('htmc-attach');
                for (let i = 0; i < additionalImports.length; i++) {
                    const importElement = additionalImports[i];
                    const newImport = document.createElement('htmc-attach');
                    newImport.setAttribute('src', importElement.getAttribute('src')!);
                    if (importElement.hasAttribute('defer')) newImport.setAttribute('defer', '');
                    if (importElement.hasAttribute('lazy')) newImport.setAttribute('lazy', '');
                    document.body.appendChild(newImport);
                }
            } else {
                console.error(`Failed to load component file: ${src}`);
            }
        } catch (error) {
            console.error(`Error fetching component file: ${error}`);
        }
    }
}

customElements.define('htmc-define', HTMCDefine);

class HTMCAttach extends HTMLElement {
    constructor() {
        super();
    }

    async connectedCallback() {
        const src = this.getAttribute('src');
        if (src) {
            if (this.hasAttribute('defer')) {
                window.addEventListener('load', () => HTMCDefine.prototype.importComponents(src));
            } else if (this.hasAttribute('lazy')) {
                const observer = new IntersectionObserver((entries) => {
                    for (let i = 0; i < entries.length; i++) {
                        const entry = entries[i];
                        if (entry.isIntersecting) {
                            HTMCDefine.prototype.importComponents(src);
                            observer.unobserve(entry.target);
                        }
                    }
                });
                observer.observe(this);
            } else {
                await HTMCDefine.prototype.importComponents(src);
            }
        }
    }
}

customElements.define('htmc-attach', HTMCAttach);