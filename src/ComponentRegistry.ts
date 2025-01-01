export type ComponentRegistryEntry = {
    templateContent: DocumentFragment;
    staticAttributes: string[];
    reactiveAttributes: string[];
    state: Record<string, { value: string }>;
};

export const componentRegistry: Record<string, ComponentRegistryEntry> = {};
