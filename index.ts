/*!
 * HTMC - Hyper Text Markup Components
 * Copyright (c) 2024 Yagil Itzhak
 *
 * This library is licensed under the GNU General Public License v3.0
 * https://www.gnu.org/licenses/gpl-3.0.en.html
 */
class HTMCDefine extends HTMLElement {
    static registry: { [key: string]: { templateContent: DocumentFragment, attributes: string[], state: { [key: string]: any } } } = {};
    static importedFiles: Set<string> = new Set();

    async connectedCallback() {
        await this.processImports();
        this.defineComponents();
        this.style.display = 'none';
    }

    async processImports() {
        const imports = Array.from(this.querySelectorAll('htmc-attach'));
        for (const importElement of imports) {
            const src = importElement.getAttribute('src');
            if (src && !HTMCDefine.importedFiles.has(src)) {
                HTMCDefine.importedFiles.add(src);
                if (importElement.hasAttribute('defer')) {
                    window.addEventListener('load', () => this.importComponents(src));
                } else if (importElement.hasAttribute('lazy')) {
                    const observer = new IntersectionObserver((entries) => {
                        entries.forEach(entry => {
                            if (entry.isIntersecting) {
                                this.importComponents(src);
                                observer.unobserve(entry.target);
                            }
                        });
                    });
                    observer.observe(importElement);
                } else {
                    await this.importComponents(src);
                }
            }
        }
    }

    async executeScripts(scripts: HTMLScriptElement[]) {
        for (const orig of scripts) {
            const copy = document.createElement('script');
            Array.from(orig.attributes).forEach(attr => {
                copy.setAttribute(attr.name, attr.value);
            });
            copy.textContent = orig.textContent;
            orig.replaceWith(copy);
            if (copy.src) {
                await new Promise(resolve => copy.addEventListener('load', resolve, { once: true }));
            }
        }
    }

    defineComponents() {
        const components = Array.from(this.getElementsByTagName('component'));
        const scripts = Array.from(this.getElementsByTagName('script'));

        // Execute found scripts immediately
        this.executeScripts(scripts);

        for (const component of components) {
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
                    shadow: ShadowRoot = this.attachShadow({ mode: 'open' });

                    static get observedAttributes() {
                        return HTMCDefine.registry[componentName].attributes;
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
                        if (!registryEntry) return;

                        const templateContent = registryEntry.templateContent.cloneNode(true) as DocumentFragment;
                        this.replacePlaceholders(templateContent, componentName);
                        this.shadow.innerHTML = '';
                        this.shadow.appendChild(templateContent);
                    }

                    replacePlaceholders(templateContent: DocumentFragment, componentName: string) {
                        const attributes = HTMCDefine.registry[componentName].attributes;
                        for (const attr of attributes) {
                            const state = HTMCDefine.registry[componentName].state[attr];
                            const attrValue = this.getAttribute(attr) || state.value;

                            const nodes = templateContent.querySelectorAll('*');
                            nodes.forEach(node => {
                                if (node.nodeType === Node.ELEMENT_NODE) {
                                    node.innerHTML = node.innerHTML.replace(new RegExp(`\\$\\{${attr}\\}`, 'g'), attrValue);
                                }
                            });
                        }

                        const slots = templateContent.querySelectorAll('slot');
                        slots.forEach(slot => {
                            const slotName = slot.getAttribute('name');
                            if (slotName) {
                                const slotContent = this.querySelector(`[slot="${slotName}"]`);
                                if (slotContent) {
                                    slot.appendChild(slotContent.cloneNode(true));
                                }
                            }
                        });
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
                additionalImports.forEach(importElement => {
                    const newImport = document.createElement('htmc-attach');
                    newImport.setAttribute('src', importElement.getAttribute('src')!);
                    if (importElement.hasAttribute('defer')) newImport.setAttribute('defer', '');
                    if (importElement.hasAttribute('lazy')) newImport.setAttribute('lazy', '');
                    document.body.appendChild(newImport);
                });
            }
        } catch (error) {
            // Handle fetch error
        }
    }
}

customElements.define('htmc-define', HTMCDefine);

class HTMCAttach extends HTMLElement {
    async connectedCallback() {
        const src = this.getAttribute('src');
        if (src) {
            if (this.hasAttribute('defer')) {
                window.addEventListener('load', () => HTMCDefine.prototype.importComponents(src));
            } else if (this.hasAttribute('lazy')) {
                const observer = new IntersectionObserver((entries) => {
                    for (const entry of entries) {
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
