import { importComponents } from '../utils/HTMCUtils';

export default class HTMCAttach extends HTMLElement {
    static importedFiles: Set<string> = new Set();
    static lazyObserver: IntersectionObserver | null = null;

    constructor() {
        super();
        this.style.display = 'none';
    }

    async connectedCallback(): Promise<void> {
        try {
            await this.processImports();
            this.handleSrcAttribute();
        } catch (error) {
            console.error('Error in connectedCallback:', error);
        }
    }

    disconnectedCallback(): void {
        this.cleanupLazyObserver();
    }

    async processImports(): Promise<void> {
        const imports = Array.from(this.querySelectorAll('htmc-attach')) as Array<HTMLElement>;

        this.initializeLazyObserver();

        for (const importElement of imports) {
            const src = importElement.getAttribute('src');
            if (src && !HTMCAttach.importedFiles.has(src)) {
                HTMCAttach.importedFiles.add(src);
                await this.handleImportAttributes(importElement, src);
            }
        }
    }

    initializeLazyObserver(): void {
        if (!HTMCAttach.lazyObserver) {
            HTMCAttach.lazyObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const importElement = entry.target as HTMLElement;
                        const src = importElement.getAttribute('src');
                        if (src) {
                            this.safeImport(src).catch(err => console.error(`Failed to lazy load: ${src}`, err));
                            HTMCAttach.lazyObserver?.unobserve(importElement);
                        }
                    }
                });
            });
        }
    }

    async handleImportAttributes(importElement: HTMLElement, src: string): Promise<void> {
        if (importElement.hasAttribute('defer')) {
            window.addEventListener('load', () => this.safeImport(src).catch(console.error));
        } else if (importElement.hasAttribute('lazy')) {
            HTMCAttach.lazyObserver?.observe(importElement);
        } else {
            await this.safeImport(src);
        }
    }

    handleSrcAttribute(): void {
        const src = this.getAttribute('src');
        if (src) {
            if (this.hasAttribute('defer')) {
                window.addEventListener('load', () => this.safeImport(src));
            } else if (this.hasAttribute('lazy')) {
                this.setupLazyLoading(src);
            } else {
                this.safeImport(src);
            }
        }
    }

    setupLazyLoading(src: string): void {
        this.initializeLazyObserver();
        HTMCAttach.lazyObserver?.observe(this);
    }

    cleanupLazyObserver(): void {
        if (HTMCAttach.lazyObserver) {
            HTMCAttach.lazyObserver.unobserve(this);
            HTMCAttach.lazyObserver.disconnect();
            HTMCAttach.lazyObserver = null;
        }
    }

    async safeImport(src: string): Promise<void> {
        if (!src) {
            console.warn('You are trying to attach null or undefined src');
            return;
        }

        try {
            await importComponents(src);
        } catch (error) {
            console.error(`Failed to attach component from ${src}:`, error);
        }
    }
}
