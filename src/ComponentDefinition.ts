import { componentRegistry, ComponentRegistryEntry } from './ComponentRegistry';
import createCustomElementClass from './createCustomElementClass';

export function defineComponent(component: HTMLElement): void {
    const componentName = getComponentName(component);
    if (!componentName) return;
    if (!isValidComponentName(componentName)) return;

    const { staticAttributes, reactiveAttributes } = extractAttributes(component);
    const template = createTemplate(component);
    if (!template) return;

    const state = initializeState(staticAttributes, reactiveAttributes);
    const registryEntry = createRegistryEntry(template, staticAttributes, reactiveAttributes, state);

    registerComponent(componentName, registryEntry);
}

function getComponentName(component: HTMLElement): string | null {
    const componentName = component.getAttribute('name');
    if (!componentName) {
        console.warn('Component is missing a "name" attribute.');
        return null;
    }
    if (customElements.get(componentName)) {
        console.warn(`Component with name "${componentName}" is already defined.`);
        return null;
    }
    return componentName;
}

function isValidComponentName(componentName: string | null): boolean {
    if (!componentName) {
        console.warn(`Component name is empty or invalid: ${componentName}`);
        return false;
    }
    if (!/^[a-z][a-z0-9\-]*$/.test(componentName)) {
        console.warn(`Invalid component name "${componentName}". Names must contain a hyphen.`);
        return false;
    }
    return true;
}


function extractAttributes(component: HTMLElement): { staticAttributes: string[], reactiveAttributes: string[] } {
    const staticAttributes = component.getAttribute('static-attributes')?.split(' ') || [];
    const reactiveAttributes = component.getAttribute('reactive-attributes')?.split(' ') || [];
    return { staticAttributes, reactiveAttributes };
}

function createTemplate(component: HTMLElement): HTMLTemplateElement | null {
    const template = document.createElement('template');
    try {
        template.innerHTML = component.innerHTML;
    } catch (e) {
        console.error('Failed to create template. Ensure the component content is valid HTML.', e);
        return null;
    }
    return template;
}


function initializeState(staticAttributes: string[], reactiveAttributes: string[]): Record<string, { value: string }> {
    return [...staticAttributes, ...reactiveAttributes].reduce((acc, attr) => {
        acc[attr] = { value: '' };
        return acc;
    }, {} as Record<string, { value: string }>);
}

function createRegistryEntry(
    template: HTMLTemplateElement,
    staticAttributes: string[],
    reactiveAttributes: string[],
    state: Record<string, { value: string }>
): ComponentRegistryEntry {
    return {
        templateContent: template.content,
        staticAttributes,
        reactiveAttributes,
        state,
    };
}

function registerComponent(componentName: string, registryEntry: ComponentRegistryEntry): void {
    componentRegistry[componentName] = registryEntry;
    customElements.define(
        componentName,
        createCustomElementClass(componentName)
    );
}
