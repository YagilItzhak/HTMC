# HTMC - Hyper Text Markup Components

HTMC is a 4 KB library for creating reusable web components using a simple HTML-like syntax. It provides a straightforward way to define, import, and use custom components with support for deferred and lazy loading.

## Features

- **Reusable Components**: Define custom components with attributes and inner content.
- **Dynamic Imports**: Import component definitions from external files.
- **Deferred and Lazy Loading**: Improve performance by loading components as needed.
- **Encapsulation**: Use Shadow DOM to encapsulate styles and behavior.

## Installation

Include the HTMC script in your HTML file:

```html
<script src="https://yagilitzhak.github.io/HTMC/index.js"></script>
```

## Usage

### Define Components

Define custom components using the `<component>` tag within a `<htmc-define>` tag. Specify attributes that the component can accept. Use `${}` syntax to denote placeholders for attribute values and `<slot></slot>` to insert inner content dynamically.

```html
<htmc-define>
    <component name="my-button" attributes="onclick">
        <button onclick="${onclick}"><slot></slot></button>
    </component>

    <component name="my-input" attributes="placeholder maxlength">
        <input type="text" placeholder="${placeholder}" maxlength="${maxlength}">
    </component>
</htmc-define>
```

#### Explanation

- **`${}` Syntax**: Use `${attributeName}` within your component's HTML to denote a placeholder for the attribute value. When the component is used, these placeholders will be replaced with the actual attribute values.
- **`<slot></slot>`**: Slots are used to insert inner content provided by the user of the component. This allows for flexible content insertion, making the components more reusable and versatile.

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

You can defer or lazy load the components to improve performance:

- **Defer**: Load components after the main content has loaded.
- **Lazy**: Load components only when they are in the viewport.

```html
<htmc-attach src="path/to/components.htmc" defer></htmc-attach>
<htmc-attach src="path/to/components.htmc" lazy></htmc-attach>
```

## Example

### `components.htmc`

```html
<htmc-define>
    <component name="my-button" attributes="onclick">
        <button onclick="${onclick}"><slot></slot></button>
    </component>

    <component name="my-input" attributes="placeholder maxlength">
        <input type="text" placeholder="${placeholder}" maxlength="${maxlength}">
    </component>
</htmc-define>
```

### `index.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reusable Web Components with HTMC</title>
    <script src="https://yagilitzhak.github.io/HTMC/index.js" defer></script>
</head>
<body>
    <htmc-attach src="components.htmc"></htmc-attach>

    <my-button onclick="alert('Button clicked!')">Click Me!</my-button>
    <my-input placeholder="Enter text" maxlength="10"></my-input>
</body>
</html>
```

## State Update Example

### `my-component.htmc`

```html
<htmc-define>
    <component name="my-greeting" attributes="name">
        <div>
            <h1>Hello, ${name}!</h1>
            <button id="changeNameButton">Change Name</button>
        </div>
    </component>
</htmc-define>
```

### `index.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HTMC Example</title>
    <script type="module" src="https://yagilitzhak.github.io/HTMC/index.js"></script>
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

## Named Slots

Named slots allow you to define multiple insertion points within your component. Use the `name` attribute to define and use named slots.

### `named-slots.htmc`

```html
<htmc-define>
    <component name="my-card" attributes="title">
        <div class="card">
            <h2>${title}</h2>
            <div class="content">
                <slot name="content"></slot>
            </div>
            <div class="footer">
                <slot name="footer"></slot>
            </div>
        </div>
    </component>
</htmc-define>
```

### `index.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HTMC Named Slots Example</title>
    <script src="https://yagilitzhak.github.io/HTMC/index.js" defer></script>
</head>
<body>
    <htmc-attach src="named-slots.htmc"></htmc-attach>

    <my-card title="My Card">
        <div slot="footer">This is the footer content.</div>
        <div slot="content">This is the card content.</div>
    </my-card>
</body>
</html>
```

## Embedded Scripting

You can also add scripts directly within the `<htmc-define>` tag for more dynamic behavior.

```html
<htmc-define>
    <component name="my-greeting" attributes="name">
        <div>
            <h1>Hello, ${name}!</h1>
            <button id="changeNameButton">Change Name</button>
        </div>
    </component>
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
</htmc-define>
```

## Integration with Other Libraries

### HTMX

HTMX allows you to add AJAX requests and other interactive elements to your HTML. You can use HTMX with HTMC components to create dynamic, server-driven interactions.

```html
<my-button hx-get="/endpoint" hx-target="#result">Load Data</my-button>
<div id="result"></div>
```

### Tailwind CSS

Tailwind CSS is a utility-first CSS framework that can be used to style your HTMC components. Add Tailwind classes directly to the elements within your component definitions.

```html
<htmc-define>
    <component name="my-button" attributes="onclick">
        <button class="bg-blue-500 text-white font-bold py-2 px-4 rounded" onclick="${onclick}"><slot></slot></button>
    </component>
</htmc-define>
```

## API

### `<htmc-define>`

Defines a set of custom components.

#### Attributes
None.

### `<component>`

Defines a single custom component within a `<htmc-define>`.

#### Attributes
- `name`: The name of the custom component.
- `attributes`: A space-separated list of attributes that the component accepts.

### `<htmc-attach>`

Imports external component definitions.

#### Attributes
- `src`: The URL of the external component definitions file.
- `defer`: (Optional) Defer loading until after the main content has loaded.
- `lazy`: (Optional) Lazy load the component when it enters the viewport.

## License

This library is licensed under the GNU General Public License v3.0. See the [LICENSE](LICENSE) file for more details.
