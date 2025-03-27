## BlockNote
Block-Based React rich text editor. Easily add a modern text editing experience to your app. Based on https://www.npmjs.com/package/@blocknote/react.

<img alt="Mendix Pluggable Widget Block Note Logo" src="https://github.com/joaodelopes/block-note-mendix/blob/main/images/logo.jpeg" width="65px"/>

## Features
Mendix pluggable widget where you can simply add an editor to your web application.
Full list of features can be checked on the [Block Note's documentation](https://github.com/joaodelopes/block-note-mendix/blob/main/images/logo.jpeg).

### Light
![Light Mode](https://github.com/joaodelopes/block-note-mendix/blob/main/images/lightmodedemo.png)

### Dark
![Dark Mode](https://github.com/joaodelopes/block-note-mendix/blob/main/images/darkmodedemo.png)

### View-only
![Edit Mode](https://github.com/joaodelopes/block-note-mendix/blob/main/images/viewmodedemo.png)


## Usage
1. Create a database entity to store the JSON configuration of the Block Note.
2. Add a dataview to a page and fetch the aforementioned configuration.
2. Inside the dataview, add the block-note widget.
3. Set it as editable (Yes) or Read-only (No) and add a Save action. There's two different inputs for configurations, in case you want to load an initial configuration different than the attribute where you want to save it to.

![Usage in Mendix Studio Pro](https://github.com/joaodelopes/block-note-mendix/blob/main/images/studioproconfig.png)


## Demo project
- [Mendix app running on the cloud](https://block-note-demo-sandbox.mxapps.io/index.html?profile=Responsive)
- [Mendix .mpk demo module](https://github.com/joaodelopes/block-note-mendix/blob/main/demo_mpk/BlockNoteDemo.mpk)

## Issues, suggestions and feature requests
Known Issue: Sometimes, when you add text, it automatically scrolls up to the beginning of the block note.
We are working in improving it and adding features to make this widget more flexible for different purposes. Feel free to suggest us new features and report issues.
