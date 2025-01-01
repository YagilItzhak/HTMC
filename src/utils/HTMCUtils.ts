export async function executeScripts(scripts: HTMLScriptElement[]): Promise<void> {
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

export async function importComponents(src: string): Promise<void> {
    try {
        const response = await fetch(src);
        if (response.ok) {
            const text = await response.text();
            const template = document.createElement('template');
            template.innerHTML = text;
            document.body.appendChild(template.content.cloneNode(true));
        }
    } catch (error) {
        console.error(`Failed to import components from ${src}:`, error);
    }
}
