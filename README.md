## BlockNote Mendix Pluggable Widget
[BlockNote](https://github.com/TypeCellOS/BlockNote) 📒 is an "open source Block-Based React rich text editor. Easily add a modern text editing experience to your app.". **All credits for the library go to [BlockNote](https://github.com/TypeCellOS/BlockNote)'s contributors.**

The Block Note is used by [Docs](https://docs.numerique.gouv.fr/login/), a joint effort from the French 🇫🇷 and German 🇩🇪 governments, described as a way to "Collaborate and write in real time, without layout constraints". It is an alternative to Notion, Confluence, Google Docs, among others.

Now, [BlockNote](https://github.com/TypeCellOS/BlockNote) is available as a Mendix Widget 🚀, allowing you to bring the minimalistic, yet powerful editor to your Mendix Web applications.

<img alt="Mendix Pluggable Widget Block Note Logo" src="https://github.com/joaodelopes/block-note-mendix/blob/main/images/logo.jpeg" width="65px"/>

## Features
Mendix pluggable widget where you can simply add an editor to your web application.
From [BlockNote (Github README), ](https://github.com/TypeCellOS/BlockNote)we can see all of the features and components provided by the editor. Some of them are:

*   Animations;

*   Helpful Placeholders;

*   Drag and Drop Blocks;

*   Nesting / indentation with tab and shift+tab;

*   Slash (/) menu;

*   Format menu;

*   Ctrl+Z, Ctrl+Y to undo and redo, respectively;

*   Editable and View-only modes;

*   Resizable/responsive;

*   Option to preload and save content (JSON);

*   Customize css. The editor is wrapped by the css classes below:

    *   .blocknote-mendix-wrapper
    *   .blocknote-mx-dark (for dark mode only)


### Light
![Light Mode](https://github.com/joaodelopes/block-note-mendix/blob/main/images/lightmodedemo.png)
![Light Mode (full-page)](https://github.com/joaodelopes/block-note-mendix/blob/main/images/fullscreendemo.png)

### Dark
![Dark Mode](https://github.com/joaodelopes/block-note-mendix/blob/main/images/darkmodedemo.png)

### View-only
![View-only Mode](https://github.com/joaodelopes/block-note-mendix/blob/main/images/viewmodedemo.png)

## Usage
1. Create a database entity to store the JSON configuration of the Block Note.
2. Add a dataview to a page and fetch the aforementioned configuration.
2. Inside the dataview, add the block-note widget.
3. Set it as editable (Yes) or Read-only (No), set the theme (light or dark), and add a Save action. There's also an attribute configuration, to load an initial configuration and save it afterwards.

![Usage in Mendix Studio Pro](https://github.com/joaodelopes/block-note-mendix/blob/main/images/studioproconfig.png)


## Demo project
- [Mendix app running on the cloud](https://block-note-demo-sandbox.mxapps.io/index.html?profile=Responsive)
- [Mendix demo module (.mpk)](https://github.com/joaodelopes/block-note-mendix/blob/main/demo/BlockNoteDemo.mpk)
- [Mendix demo scss (.scss)](https://github.com/joaodelopes/block-note-mendix/blob/main/demo/demo.scss)

## Issues, suggestions and feature requests
No known issues at the moment.
We are working in improving it and adding features to make this widget more flexible for different purposes. Feel free to suggest us new features and report issues.

## License

BlockNote (the library upon this widget is based on) is licensed under the [MPL 2.0 license](https://fossa.com/blog/open-source-software-licenses-101-mozilla-public-license-2-0/), which allows you to use BlockNote in commercial (and closed-source) applications. If you make changes to the [BlockNote source files](https://github.com/TypeCellOS/BlockNote), you are expected to publish these changes, so that the rest of the community can benefit as well.

⚠️ If you download this widget from the Mendix Marketplace and **change the Block Note's source code, not the widget's code itself**, you are expected to publish them [here](https://github.com/TypeCellOS/BlockNote), as per the license mentioned above.

The widget itself is under MIT.