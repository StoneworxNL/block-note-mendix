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
3. Set it as editable (Yes) or Read-only (No) and add a Save action. There's two different inputs for configurations, in case you want to load an initial configuration different than the attribute where you want to save it to.

![Usage in Mendix Studio Pro](https://github.com/joaodelopes/block-note-mendix/blob/main/images/studioproconfig.png)


## Demo project
- [Mendix app running on the cloud](https://block-note-demo-sandbox.mxapps.io/index.html?profile=Responsive)
- [Mendix demo module (.mpk)](https://github.com/joaodelopes/block-note-mendix/blob/main/demo/BlockNoteDemo.mpk)
- [Mendix demo scss (.scss)](https://github.com/joaodelopes/block-note-mendix/blob/main/demo/demo.scss)

## Issues, suggestions and feature requests
No known issues at the moment.
We are working in improving it and adding features to make this widget more flexible for different purposes. Feel free to suggest us new features and report issues.

# Block Note

[BlockNote](https://github.com/TypeCellOS/BlockNote) 📒 is an "open source Block-Based React rich text editor. Easily add a modern text editing experience to your app.". **All credits for the library go to [BlockNote](https://github.com/TypeCellOS/BlockNote)'s contributors.**

The Block Note is used by [Docs](https://docs.numerique.gouv.fr/login/), a joint effort from the French 🇫🇷 and German 🇩🇪 governments, described as a way to "Collaborate and write in real time, without layout constraints". It is an alternative to Notion, Confluence, Google Docs, among others.

## 🚀 Mendix Pluggable Widget

Now, [BlockNote](https://github.com/TypeCellOS/BlockNote) is available as a Mendix Widget 🚀, allowing you to bring the minimalistic, yet powerful editor to your Mendix applications.

### Features 😎

From [BlockNote (Github README), ](https://github.com/TypeCellOS/BlockNote)we can see all of the features and components provided by the editor. Some of them are:

*   Animations;

*   Helpful Placeholders;

*   Drag and Drop Blocks;

*   Nesting / indentation with tab and shift+tab;

*   Slash (/) menu;

*   Format menu;

*   Ctrl+Z, Ctrl+Y to save and undo, respectively;

*   Editable and View-only modes;

*   Resizable/responsive;

*   Option to preload and save content (JSON);

*   Customize css. The editor is wrapped by the css classes below:

    *   .blocknote-mendix-wrapper
    *   .blocknote-mx-dark (for dark mode only)

## Examples

### Budget

|           |             |                       |
| --------- | ----------- | --------------------- |
| **Type**  | **January** | **February**          |
| Income    | 1000 €      | 1000 €                |
| Outcome   | 400 €       | 300 € *(in progress)* |
| Remaining | 600 €       | *~ (in progress)*     |

### Mendix Steps

1.  Download Block Note widget from Mendix Marketplace 🖥️

    1.  Test It
    2.  Provide Feedback

***💬 Feedback is highly appreciated!***

1.  Integrate it in your application 🙌

### Images (Sure thing, even gifs)

![giphy.gif](https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExdmE5OGtiMHRxM2Z3c240bm9jbDJzN3psYmd6czd2N2FjNm85anVoMyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/ztkgsOOma7wWp6cBlr/giphy.gif)

### More About Block Note

*   Check Github Block Note's documentation: <https://github.com/TypeCellOS/BlockNote>

*   Check Block Note's Mendix Pluggable Widget

    *   Mendix Marketplace

        *   🤖

    *   Check Available Mendix Demo

### To Review Later (rollup.config.js file)

*   [Useful Info](https://www.mendix.com/blog/build-widgets-in-mendix-with-react-part-4-arcgis-maps/)

```javascript
import json from '@rollup/plugin-json';

export default args => {
    const result = args.configDefaultConfig;
    console.warn ('Custom Rollup')

    return result.map((config) => {
                config.output.inlineDynamicImports = true
                console.warn ("Set dynamic imports")
                const plugins = config.plugins || []
                config.plugins = [
                    ...plugins,
                    json(),
                ]  
                return config;
    });
};
```

### Groceries' Checklist:

*   [x] eggs;
*   [ ] cheese;
*   [x] milk;
*   [ ] cottage cheese;
*   [ ] vegetables;
*   [ ] fruits

### Stressed out? Here's a nature Video 🌳

[](https://www.pexels.com/download/video/3571264/)

### Search Emojis

👾 Did you know you can add a /+emoji and then start writing something related to your emoji to search for it? Try it!

### That file you don't want to forget 🚧

[pres.numbers](https://docs.sheetjs.com/pres.numbers)

## About Stoneworx

### We Create Inovation

We started our company as friends and will always remain a club of people that likes doing business in a friendly matter.\
A group of entrepreneurial, smart and highly experienced Mendix professionals.  

On a daily basis, we create software applications that simplify our clients’ business processes by using the Mendix low code platform. It is our mission is to turn complex ideas into simple solutions for medium to corporate-sized businesses, in any industry.

![From https://www.stoneworx.nl/](https://cdn.prod.website-files.com/66991b9fc069c88aec093fd1/66b242753e65840128c97ab9_imagehero-p-800.png)

From https://www.stoneworx.nl/

### License

BlockNote (the library upon this widget is based on) is licensed under the [MPL 2.0 license](https://fossa.com/blog/open-source-software-licenses-101-mozilla-public-license-2-0/), which allows you to use BlockNote in commercial (and closed-source) applications. If you make changes to the [BlockNote source files](https://github.com/TypeCellOS/BlockNote), you are expected to publish these changes, so that the rest of the community can benefit as well.

⚠️ If you download this widget from the Mendix Marketplace and **change the Block Note's source code, not the widget's code itself**, you are expected to publish them [here](https://github.com/TypeCellOS/BlockNote), as per the license mentioned above.

The widget itself is under MIT.
