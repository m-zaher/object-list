# Object List Component Documentation

A versatile and customizable web component for managing lists of objects with features like filtering, caching, and responsive design.

## Table of Contents
- [Features](#features)
- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [Component Attributes](#component-attributes)
- [Events](#events)
- [Methods](#methods)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Styling](#styling)
- [Examples](#examples)
- [Browser Support](#browser-support)

## Features

- ✨ Add and manage objects with multiple attributes
- 🔍 Real-time filtering capabilities
- 💾 Local storage caching
- 🗑️ Object deletion with confirmation
- 📱 Responsive design
- ⌨️ Keyboard shortcuts support
- 🌐 Internationalization support
- ⚡ Custom events for integration
- 🎨 Customizable styling
- 📊 Object count tracking

## Installation

Include the component in your HTML file:

```html
<script src="path/to/object-list.js"></script>
```

## Basic Usage

```html
<!-- Basic implementation -->
<object-list max-objects="100"></object-list>

<!-- Full implementation with all attributes -->
<object-list
    max-objects="100"
    delete-label="X"
    counter-label="Objects: {count} / {max}"
    check-full-attributes="true"
    data-filtered-label="Filtered: {count}"
    cache-objects="true"
    delete-confirmation-message="Are you sure you want to delete this item ({obj})?"
    already-exist-message="Object already exists."
    max-height="400"
    limit-reached-message="Maximum limit of {max} objects reached.">
</object-list>
```

## Component Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `max-objects` | Number | 0 | Maximum number of objects allowed (0 = unlimited) |
| `delete-label` | String | "Delete" | Label for delete button |
| `counter-label` | String | "Total Objects: {count}/{max}" | Format for object counter |
| `check-full-attributes` | Boolean | false | Check all attributes for duplicates |
| `data-filtered-label` | String | "Filtered: {count}" | Label for filtered results |
| `cache-objects` | Boolean | true | Enable local storage caching |
| `delete-confirmation-message` | String | "Are you sure..." | Delete confirmation message |
| `already-exist-message` | String | "Object already exists" | Duplicate object message |
| `max-height` | Number | null | Maximum height of list container |
| `limit-reached-message` | String | "Maximum limit reached" | Message when max objects reached |

## Events

```javascript
// Listen for object addition
collection.addEventListener('object-added', (event) => {
    console.log('New object:', event.detail.object);
});

// Listen for object deletion
collection.addEventListener('object-deleted', (event) => {
    console.log('Deleted:', event.detail.deletedObject);
});
```

### Available Events

| Event Name | Detail Object | Description |
|------------|---------------|-------------|
| `object-added` | `{object}` | Fired when new object is added |
| `object-deleted` | `{deletedObject}` | Fired when object is deleted |
| `list-updated` | `{list}` | Fired when list is modified |
| `filter` | `{filterText}` | Fired when filter is applied |
| `clear-filter` | - | Fired when filter is cleared |
| `object-focus` | `{object}` | Fired when object is focused |
| `object-leave` | `{object}` | Fired when object loses focus |

## Methods

```javascript
const collection = document.querySelector('object-list');

// Add new object
collection.addObject({
    attributes: ['ID1', 'Phone1']
});

// Load objects from JSON
collection.loadObjects(jsonString);

// Clear all objects
collection.clearList();

// Get objects as JSON
const json = collection.getObjectsAsJson();
```

### Available Methods

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `addObject` | `object` | void | Adds new object to list |
| `loadObjects` | `jsonString` | void | Loads objects from JSON |
| `clearList` | - | void | Clears all objects |
| `getObjectsAsJson` | - | String | Returns objects as JSON |
| `clearFilter` | - | void | Clears current filter |

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Alt + Shift + A | Load cached objects |
| Delete | Delete focused object |
| Esc | Close confirmation modal |
| Ctrl + Enter | Confirm deletion |

## Styling

The component uses Shadow DOM for encapsulation. Custom styling can be applied through CSS variables:

```css
object-list {
    --primary-color: #007bff;
    --delete-button-color: #dc3545;
    --item-background: #ffffff;
    --item-hover-background: #e9ecef;
}
```

## Examples

### Basic Implementation
```html
<object-list max-objects="100"></object-list>
```

### With Custom Labels and Caching
```html
<object-list
    max-objects="50"
    delete-label="Remove"
    counter-label="Items: {count}/{max}"
    cache-objects="true">
</object-list>
```

### Loading External Data
```javascript
const jsonData = '[{"id": "1", "name": "Item 1"}, {"id": "2", "name": "Item 2"}]';
const collection = document.querySelector('object-list');
collection.loadObjects(jsonData);
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting pull requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

This documentation provides a comprehensive guide for developers to understand and implement the Object List Component. For additional support or feature requests, please open an issue on GitHub.
