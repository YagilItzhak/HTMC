# HTMC - Hyper Text Markup Components

HTMC is a lightweight library for creating reusable web components using a simple HTML-like syntax. It provides an efficient way to define, import, and use custom components with support for static and reactive attributes, lazy loading, and encapsulated styles.

## Features

- 🧩 HTML-based component definitions
- ⚡️ Reactive attribute updates
- 🛡 Shadow DOM style encapsulation
- 🚀 Modern browser optimization
- 📦 External component imports
- 🔄 Lazy loading support


## Installation

Include the HTMC script in your HTML file:

```html
<script src="path/to/htmc.js" defer></script>
```

## Usage

### Define Components

Define custom components using the `<component>` tag within a `<htmc-define>` tag. Specify attributes that the component can accept. Use `${}` syntax for attribute placeholders and `<slot></slot>` for dynamic inner content.

```html
<htmc-define>
    <component name="my-button" static-attributes="onclick">
        <button onclick="${onclick}"><slot></slot></button>
    </component>

    <component name="my-input" static-attributes="placeholder maxlength">
        <input type="text" placeholder="${placeholder}" maxlength="${maxlength}">
    </component>
</htmc-define>
```

### Explanation

- **`${}` Syntax**: Use `${attributeName}` within your component's HTML for attribute placeholders.
- **`<slot></slot>`**: Allows for flexible content insertion, making components more reusable and versatile.

### Use Components

Use the defined components in your HTML. Set attributes and inner content as needed.

```html
<my-button onclick="alert('Button clicked!')">Click Me!</my-button>
<my-input placeholder="Enter text" maxlength="10"></my-input>
```

### Import Component Definitions

Import external component definitions using the `<htmc-attach>` tag.

```html
<htmc-attach src="path/to/components.htmc"></htmc-attach>
```

#### Defer and Lazy Loading

- **Defer**: Load components after the main content has loaded.
- **Lazy**: Load components only when they are in the viewport.

```html
<htmc-attach src="path/to/components.htmc" defer></htmc-attach>
<htmc-attach src="path/to/components.htmc" lazy></htmc-attach>
```

## Advanced Features

### State Update Example

#### my-component.htmc

```html
<htmc-define>
    <component name="my-greeting" reactive-attributes="name">
        <div>
            <h1>Hello, ${name}!</h1>
            <button id="changeNameButton">Change Name</button>
        </div>
    </component>
</htmc-define>
```

#### index.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HTMC Example</title>
    <script src="path/to/htmc.js" defer></script>
</head>
<body>
    <htmc-attach src="my-component.htmc"></htmc-attach>

    <!-- Using the custom component -->
    <my-greeting name="World"></my-greeting>

    <script>
        customElements.whenDefined('my-greeting').then(() => {
            const greetingComponent = document.querySelector('my-greeting');
            const shadowRoot = greetingComponent.shadowRoot;
            const changeNameButton = shadowRoot.getElementById('changeNameButton');

            changeNameButton.addEventListener('click', () => {
                greetingComponent.setAttribute('name', 'HTMC');
            });
        });
    </script>
</body>
</html>
```

## Integration with Other Libraries

### HTMX

HTMX allows you to add AJAX requests and other interactive elements to your HTML. You can use HTMX with HTMC components to create dynamic, server-driven interactions.

```html
<my-button hx-get="/endpoint" hx-target="#result">Load Data</my-button>
<div id="result"></div>
```

### Tailwind CSS

Tailwind CSS is a utility-first CSS framework for styling HTMC components. You can add Tailwind classes directly to the elements within your component definitions.

```html
<htmc-define>
    <component name="my-button" static-attributes="onclick">
        <button class="bg-blue-500 text-white font-bold py-2 px-4 rounded" onclick="${onclick}"><slot></slot></button>
    </component>
</htmc-define>
```

## API

### `<htmc-define>`

Defines a set of custom components.

**Attributes**: None.

### `<component>`

Defines a single custom component within a `<htmc-define>`.

**Attributes**:

- `name`: The name of the custom component.
- `static-attributes`: Space-separated list of static attributes.
- `reactive-attributes`: Space-separated list of reactive attributes.

### `<htmc-attach>`

Imports external component definitions.

**Attributes**:

- `src`: The URL of the external component definitions file.
- `defer`: (Optional) Defer loading until after the main content has loaded.
- `lazy`: (Optional) Lazy load the component when it enters the viewport.

## License

This library is licensed under the GNU General Public License v3.0. See the LICENSE file for more details.
