import { componentRegistry } from './ComponentRegistry';
import createCustomElementClass from './createCustomElementClass';
export function defineComponent(component) {
    const componentName = getComponentName(component);
    if (!componentName)
        return;
    if (!isValidComponentName(componentName))
        return;
    const { staticAttributes, reactiveAttributes } = extractAttributes(component);
    const template = createTemplate(component);
    if (!template)
        return;
    const state = initializeState(staticAttributes, reactiveAttributes);
    const registryEntry = createRegistryEntry(template, staticAttributes, reactiveAttributes, state);
    registerComponent(componentName, registryEntry);
}
function getComponentName(component) {
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
function isValidComponentName(componentName) {
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
function extractAttributes(component) {
    const staticAttributes = component.getAttribute('static-attributes')?.split(' ') || [];
    const reactiveAttributes = component.getAttribute('reactive-attributes')?.split(' ') || [];
    return { staticAttributes, reactiveAttributes };
}
function createTemplate(component) {
    const template = document.createElement('template');
    try {
        template.innerHTML = component.innerHTML;
    }
    catch (e) {
        console.error('Failed to create template. Ensure the component content is valid HTML.', e);
        return null;
    }
    return template;
}
function initializeState(staticAttributes, reactiveAttributes) {
    return [...staticAttributes, ...reactiveAttributes].reduce((acc, attr) => {
        acc[attr] = { value: '' };
        return acc;
    }, {});
}
function createRegistryEntry(template, staticAttributes, reactiveAttributes, state) {
    return {
        templateContent: template.content,
        staticAttributes,
        reactiveAttributes,
        state,
    };
}
function registerComponent(componentName, registryEntry) {
    componentRegistry[componentName] = registryEntry;
    customElements.define(componentName, createCustomElementClass(componentName));
}
