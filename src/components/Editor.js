import React, { useState, useEffect, createRef, Fragment } from 'react';
import { Map as imutableMap } from 'immutable';
import { SwatchesPicker } from 'react-color';
import createStyles from 'draft-js-custom-styles';
import {
  EditorState,
  RichUtils,
  AtomicBlockUtils,
  convertToRaw,
  DefaultDraftBlockRenderMap,
  getDefaultKeyBinding
} from 'draft-js';
import Editor from 'draft-js-plugins-editor';
import createInlineToolbarPlugin from 'draft-js-inline-toolbar-plugin';
import createLinkPlugin from 'draft-js-anchor-plugin';
import createUndoPlugin from 'draft-js-undo-plugin';
import createCounterPlugin from 'draft-js-counter-plugin';
import createEmojiPlugin from 'draft-js-emoji-plugin';

import { ItalicButton, BoldButton, UnderlineButton } from 'draft-js-buttons';

// import 'draft-js/dist/Draft.css';
import 'draft-js-inline-toolbar-plugin/lib/plugin.css';
import 'draft-js-emoji-plugin/lib/plugin.css';

import { mediaBlockRenderer } from './entities/mediaBlockRenderer';
import styleMap from '../data/inlineStyles';

// ADDING LINK
const linkPlugin = createLinkPlugin({
  placeholder: 'https://...'
});

// INLINE TOOLBAR
//  At this step, a configuration object can be passed in as an argument.
const inlineToolbarPlugin = createInlineToolbarPlugin({
  structure: [BoldButton, ItalicButton, UnderlineButton, linkPlugin.LinkButton]
});
const { InlineToolbar } = inlineToolbarPlugin;

// CUSTOM PLUGIN THEME
const theme = {
  undo: 'style-btn',
  redo: 'style-btn',
  counter: 'counter',
  counterOverLimit: 'counter-overLimit'
};

// UNDO REDO
const undoPlugin = createUndoPlugin({
  undoContent: 'Undo',
  redoContent: 'Redo',
  theme
});
const { UndoButton, RedoButton } = undoPlugin;

// COUNTERS
const counterPlugin = createCounterPlugin({ theme });
const { CharCounter, WordCounter, LineCounter } = counterPlugin;

// EMOJIS
const emojiPlugin = createEmojiPlugin({
  useNativeArt: false
});
const { EmojiSuggestions, EmojiSelect } = emojiPlugin;

// plugins list
const plugins = [
  inlineToolbarPlugin,
  linkPlugin,
  undoPlugin,
  counterPlugin,
  emojiPlugin
];

// editor ref
const editorRef = createRef();

/* This function is passsed as a callback in the event listener responsible for adding the image
 */

const EditorComp = () => {
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  /*
  The EditorState object is a complete snapshot of the state of the editor, including contents, cursor, and undo/redo history. Any changes to the content and selection within the editor will create new editorState object
  */
  const handleKeyCommand = (command, editorState) => {
    /**
     * For inline and block style behavior, the RichUtils module provides useful functions to help manipulate state. It has information about the core key commands available to web editors, such as Cmd+B (bold), Cmd+I (italic), etc.
     * command- string command to be executed
     */

    const newState = RichUtils.handleKeyCommand(editorState, command);

    if (typeof command === 'object') {
      const { cmd, e } = command;
      if (cmd === 'tab') {
        onTab(e);
      }

      return 'handled';
    }

    if (newState) {
      setEditorState(newState);
      return 'handled';
    }

    return 'not-handled';
  };

  // ref state
  const [ref, setRef] = useState(editorRef);
  // focus function to programatically activate editor through ref
  const focus = () => {
    ref && ref.current && ref.current.focus();
  };
  /**
   *  focus() is called once our EditorState has finished updating. This way, users will be able to immediately resume entering (or deleting) text upon clicking a (styling) button or addition of an image.

   */
  //  Styling controls
  // custom style function
  const [customStyle, setCustomStyle] = useState({
    name: '',
    value: '12'
  });
  const { name, value } = customStyle;
  // const customStyleFn = DraftInlineStyle => {
  //   const { name, value } = customStyle;
  //   const output = {};
  //   if (name === 'fontSize') {
  //     output.fontSize = `${value}px`;
  //   } else if (name === 'fontColor') {
  //     output.color = `${value}`;
  //   }

  //   return output;
  // };

  const customStylesToManage = ['font-size', 'color'];
  const { styles, customStyleFn } = createStyles(
    customStylesToManage,
    'CUSTOM_'
  );
  // 'CUSTOM_' will be the prefix of my styles

  // font size
  const handleFontSizeChange = e => {
    setCustomStyle({ ...customStyle, value: e.target.value });
  };

  const handleFontSizeSubmit = e => {
    e.preventDefault();
    const newEditorState = styles.fontSize.toggle(editorState, `${value}px`);
    setEditorState(newEditorState);
    setRef(editorRef);
  };

  // font color
  const handleColorChangeComplete = color => {
    const newEditorState = styles.color.toggle(editorState, color);
    setEditorState(newEditorState);
    // setCustomStyle({ name: 'fontColor', value: color });
    setShowColors(false);
    setRef(editorRef);
  };

  // FONT
  const [currFont, setCurrFont] = useState('Arial');
  const [showFonts, setShowFonts] = useState(false);
  const [showColors, setShowColors] = useState(false);

  const fonts = [
    'Sans_Serif',
    'Roboto',
    'Open_Sans',
    'Times_New_Roman',
    'Georgia',
    'Arial',
    'Verdana',
    'Courier_New',
    'Lucida_Console',
    'Barlow',
    'Dancing_Script',
    'Inconsolata',
    'Lato',
    'Libre_Baskerville',
    'Montserrat',
    'Pacifico',
    'Lobster',
    'Raleway',
    'Roboto_Mono',
    'SourceSans_Pro'
  ];
  const onFontSelect = font => {
    setCurrFont(font);
    setShowFonts(false);
    setEditorState(RichUtils.toggleInlineStyle(editorState, font));
  };

  // BOLD
  const onBoldclick = () => {
    setEditorState(RichUtils.toggleInlineStyle(editorState, 'BOLD'));
  };

  // ITALICS
  const onItalicClick = () => {
    setEditorState(RichUtils.toggleInlineStyle(editorState, 'ITALIC'));
  };

  // UNDERLINE
  const onUnderlineClick = () => {
    setEditorState(RichUtils.toggleInlineStyle(editorState, 'UNDERLINE'));
  };

  // CODE
  const onCodeClick = () => {
    setEditorState(RichUtils.toggleInlineStyle(editorState, 'CODE'));
  };

  // STRIKE THROUGH
  const onStrikeThroughClick = () => {
    setEditorState(RichUtils.toggleInlineStyle(editorState, 'STRIKETHROUGH'));
  };

  // HIGHLIGHT
  const onHighlightClick = () => {
    setEditorState(RichUtils.toggleInlineStyle(editorState, 'HIGHLIGHT'));
  };

  // SUPERSCRIPT
  const onSuperScriptClick = () => {
    setEditorState(RichUtils.toggleInlineStyle(editorState, 'SUPERSCRIPT'));
  };

  // SUBSCRIPT
  const onSubScriptClick = () => {
    setEditorState(RichUtils.toggleInlineStyle(editorState, 'SUBSCRIPT'));
  };

  // BLOCKSTYLES
  function myBlockStyleFn(contentBlock) {
    const type = contentBlock.getType();
    switch (type) {
      default:
        return;

      case 'blockquote':
        return 'my-blockquote';

      case 'code-block':
        return 'my-codeblock';

      case 'align-left':
        return 'align-block-left';
    }
  }
  // // HEADERS (e.g.)
  // const onH1Click = () => {
  //   setEditorState(RichUtils.toggleBlockType(editorState, 'header-one'));
  // };

  // BLOCKQUOTE
  const onBlockquoteClick = () => {
    setEditorState(RichUtils.toggleBlockType(editorState, 'blockquote'));
  };

  // CODE BLOCK
  const onCodeBlockClick = () => {
    setEditorState(RichUtils.toggleBlockType(editorState, 'code-block'));
  };

  // LISTS
  const onOLClick = () => {
    setEditorState(RichUtils.toggleBlockType(editorState, 'ordered-list-item'));
  };
  const onULClick = () => {
    setEditorState(
      RichUtils.toggleBlockType(editorState, 'unordered-list-item')
    );
  };

  // TEXT ALIGNMENT
  const allBlockNodes = document.getElementsByClassName(
    'public-DraftStyleDefault-block'
  );

  /*
      get selected or new block using anchor key and the "data-offset-key" attribute(from draft) 
      the first set of chars in the data offset key is the same as the block's anchor key.
    */

  const onAlignClick = alignment => {
    // get all blocks
    var myBlock;
    [...allBlockNodes].map(block => {
      const anchorKey = block.getAttribute('data-offset-key').split('-')[0];
      const selectedBlockKey = editorState.getSelection().getAnchorKey();
      // check if the two keya re equal
      if (anchorKey === selectedBlockKey) {
        myBlock = block;
      }
      return myBlock;
    });
    const classes = myBlock.classList;
    // remove previously added (default has only two classes, so remove 3rd)
    if (classes.length > 2) {
      classes.remove(classes[2]);
    }
    classes.add(alignment);
  };

  // key binding
  const keyBindingFn = e => {
    if (e.keyCode === 9) {
      return { cmd: 'tab', e };
    }
    return getDefaultKeyBinding(e);
  };
  // LIST LEVEL
  const onTab = e => {
    const maxDepth = 5;
    setEditorState(RichUtils.onTab(e, editorState, maxDepth));
  };

  // CUSTTOM BLOCKS
  const blockRenderMap = imutableMap({
    'align-left': {
      element: 'div'
      // can have a wrapper property - a react component that wraps this component
    }
  });

  const extendedBlockRenderMap = DefaultDraftBlockRenderMap.merge(
    blockRenderMap
  );

  // Keep track of active styles
  const allBlocks = convertToRaw(editorState.getCurrentContent()).blocks;
  const selectedKey = editorState.getSelection().getAnchorKey();
  const selectedBlock = allBlocks.find(block => block.key === selectedKey);
  const selectedBlockNode = [...allBlockNodes].find(
    node => node.getAttribute('data-offset-key').split('-')[0] === selectedKey
  );
  const currentInlineStyles = selectedBlock.inlineStyleRanges; //array of objects
  const currentBlockStyle = selectedBlock.type;
  const selectionOffset = editorState.getSelection().getAnchorOffset(); // position of cursor or start of selection

  // add to array
  var activeStyles = [];

  // remove alignment highlight
  if (selectedBlockNode) {
    if (selectedBlockNode.classList.length > 2) {
      const alignStyle = selectedBlockNode.classList[2];
      !activeStyles.includes(alignStyle) && activeStyles.push(alignStyle);
    } else {
    }
  }

  activeStyles.push(currentBlockStyle);
  currentInlineStyles.filter(inlineStyle => {
    const { offset, length, style } = inlineStyle;
    if (offset < selectionOffset && selectionOffset <= length + offset) {
      // return style;
      !activeStyles.includes(style) && activeStyles.push(style);
    }
    return activeStyles;
  });

  useEffect(() => {
    setTimeout(() => focus(), 0);
  });

  // toggle image input
  const [imagePrompt, setImagePrompt] = useState(false);

  // image form
  const [imageState, setImageState] = useState({
    imageUrl: '',
    imageCaption: '',
    imageDescription: ''
  });
  const { imageUrl, imageCaption, imageDescription } = imageState;

  // convert to base64
  const getBase64 = file => {
    var reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function() {
      setFileState({
        ...fileState,
        file: reader.result
      });
    };

    reader.onerror = function(error) {
      window.alert('Something went wrong with the image');
    };
  };

  // file input
  const [fileState, setFileState] = useState({
    file: 'null',
    fileName: 'Choose file'
  });
  const { file, fileName } = fileState;

  // onChange handlers for image form

  const handleImageInputChange = e => {
    setImageState({
      ...imageState,
      [e.target.name]: e.target.value
    });
  };

  const onImageFileChange = e => {
    const newFile = e.target.files[0];
    newFile && getBase64(newFile);
    setFileState({
      ...fileState,
      fileName: newFile ? newFile.name : 'Choose file'
    });
  };

  const clearForm = () => {
    setImagePrompt(false);
    setRef(editorRef);
    setImageState({
      imageCaption: '',
      imageDescription: '',
      imageUrl: ''
    });
  };

  // submit image data
  const handleImageSubmit = e => {
    e.preventDefault();
    // compose form data
    const imageData = {
      imageSrc: file || imageUrl,
      imageCaption,
      imageDescription
    };
    if (!imageData.imageSrc) {
      return window.alert('Please select an image');
    }
    clearForm();
    onAddImage(e, imageData);
  };

  // The functionality for embedding images
  const onAddImage = (e, imageData) => {
    e.preventDefault();
    const contentState = editorState.getCurrentContent();

    const { imageSrc, imageCaption, imageDescription } = imageData;
    console.log(imageData);
    // add entity to contentState
    const contentStateWithEntity = contentState.createEntity(
      'image',
      'IMMUTABLE',
      {
        src: imageSrc,
        caption: imageCaption,
        desc: imageDescription
      }
    ); // these are the metadata made available to the Media component in the custome block renderer

    const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
    const newEditorState = EditorState.set(
      editorState,
      { currentContent: contentStateWithEntity },
      'create-entity'
    );
    setEditorState(
      AtomicBlockUtils.insertAtomicBlock(newEditorState, entityKey, ' ')
    );
  };

  // console.log('Start offset: ', editorState.getSelection().getStartOffset());

  // console.log('End offset: ', editorState.getSelection().getEndOffset());

  // current font color
  const currentFontColorName = activeStyles.find(
    style => style.charAt(13) === '#'
  );
  var currentFontColor;
  if (currentFontColorName) {
    currentFontColor = currentFontColorName.split('_')[2];
  }

  return (
    <div className="editor-wrapper">
      <div className="editor-tools">
        <div className="undo-redo">
          <UndoButton />
          <RedoButton />
        </div>
        <div className="font-styles">
          <div className="font-selector">
            <button
              className="current-font"
              onClick={() => setShowFonts(!showFonts)}
            >
              {currFont.replace(/_/g, ' ')} <i className="fas fa-sort-down"></i>
            </button>
            {showFonts && (
              <div className="font-list">
                {fonts.sort().map(font => (
                  <button
                    onClick={() => onFontSelect(font)}
                    key={font}
                    value={font}
                    className="font-option"
                  >
                    {font.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
            )}
          </div>
          <form
            className="font-size-form"
            onSubmit={e => handleFontSizeSubmit(e)}
          >
            <input
              type="number"
              min="1"
              step="1"
              placeholder="font size"
              className="font-size-input"
              onChange={e => handleFontSizeChange(e)}
              name="fontSize"
              value={value}
              onFocus={() => setRef(null)}
              onMouseOver={() => setRef(null)}
            />
            <button type="submit" className="set-font-size">
              <i className="far fa-check-circle"></i>
            </button>
          </form>
        </div>
        <div className="inline-styles">
          <button
            className={`bold-btn style-btn ${
              activeStyles.includes('BOLD') ? 'active-btn' : null
            }`}
            onClick={() => onBoldclick()}
          >
            <strong>B</strong>
          </button>

          <button
            className={`italic-btn style-btn ${
              activeStyles.includes('ITALIC') ? 'active-btn' : null
            }`}
            onClick={onItalicClick}
          >
            <em>I</em>
          </button>

          <button
            className={`underline-btn style-btn ${
              activeStyles.includes('UNDERLINE') ? 'active-btn' : null
            }`}
            style={{ textDecoration: 'underline' }}
            onClick={onUnderlineClick}
          >
            U
          </button>
          <button
            className={`highlight-btn style-btn ${
              activeStyles.includes('HIGHLIGHT') ? 'active-btn' : null
            }`}
            onClick={onHighlightClick}
          >
            <i className=" fas fa-highlighter"></i>
          </button>
          <div className="color-picker">
            <button
              className="current-font-color style-btn"
              onClick={() => {
                setShowColors(!showColors);
                setRef(null);
              }}
            >
              <p className="font-btn">A</p>
              <span
                className="color-bar"
                style={{ background: `${currentFontColor || '#333'}` }}
              ></span>
            </button>
            {showColors && (
              <div
                className="swatches-wrapper"
                onMouseOut={() => setRef(editorRef)}
                onMouseOver={() => setRef(null)}
              >
                <SwatchesPicker
                  onChangeComplete={color =>
                    handleColorChangeComplete(color.hex)
                  }
                />
              </div>
            )}
          </div>

          <button
            className={`code-btn style-btn ${
              activeStyles.includes('CODE') ? 'active-btn' : null
            }`}
            onClick={onCodeClick}
          >
            {'<>'}
          </button>

          <button
            className={`strike-through-btn style-btn ${
              activeStyles.includes('STRIKETHROUGH') ? 'active-btn' : null
            }`}
            style={{ textDecoration: 'line-through' }}
            onClick={onStrikeThroughClick}
          >
            ab
          </button>

          <button
            className={`superscript-btn style-btn ${
              activeStyles.includes('SUPERSCRIPT') ? 'active-btn' : null
            }`}
            onClick={onSuperScriptClick}
          >
            X<sup>2</sup>
          </button>

          <button
            className={`subscript-btn style-btn ${
              activeStyles.includes('SUBSCRIPT') ? 'active-btn' : null
            }`}
            onClick={onSubScriptClick}
          >
            X<sub>2</sub>
          </button>
        </div>
        <div className="block-styles">
          {/* <div className="headers">
            <button
              className={`h1-btn style-btn ${
                activeStyles.includes('header-one') ? 'active-btn' : null
              }`}
              onClick={onH1Click}
            >
              H1
            </button>
          </div> */}
          <button
            className={`blockquote-btn style-btn ${
              activeStyles.includes('blockquote') ? 'active-btn' : null
            }`}
            onClick={onBlockquoteClick}
          >
            <i className="fas fa-quote-right"></i>
          </button>
          <button
            className={`codeblock-btn style-btn ${
              activeStyles.includes('code-block') ? 'active-btn' : null
            }`}
            onClick={onCodeBlockClick}
          >
            code
          </button>

          <button
            className={`ordered-btn style-btn ${
              activeStyles.includes('ordered-list-item') ? 'active-btn' : null
            }`}
            onClick={onOLClick}
          >
            <i className="fas fa-list-ol"></i>
          </button>
          <button
            className={`unordered-btn style-btn ${
              activeStyles.includes('unordered-list-item') ? 'active-btn' : null
            }`}
            onClick={onULClick}
          >
            <i className="fas fa-list"></i>
          </button>
          <div className="align-tools">
            <button
              className={`align-left style-btn ${
                activeStyles.includes('align-left') ? 'active-btn' : null
              }`}
              onClick={() => onAlignClick('align-left')}
            >
              <i className="fas fa-align-left"></i>
            </button>
            <button
              className={`align-center style-btn ${
                activeStyles.includes('align-center') ? 'active-btn' : null
              }`}
              onClick={() => onAlignClick('align-center')}
            >
              <i className="fas fa-align-center"></i>
            </button>
            <button
              className={`align-right style-btn ${
                activeStyles.includes('align-right') ? 'active-btn' : null
              }`}
              onClick={() => onAlignClick('align-right')}
            >
              <i className="fas fa-align-right"></i>
            </button>
            <button
              className={`align-justify style-btn ${
                activeStyles.includes('align-justify') ? 'active-btn' : null
              }`}
              onClick={() => onAlignClick('align-justify')}
            >
              <i className="fas fa-align-justify"></i>
            </button>
          </div>
          <button
            className="style-btn add-image-btn"
            onClick={() => {
              setImagePrompt(!imagePrompt);
              setRef(null);
            }}
          >
            <i className="far fa-image"></i>
          </button>
        </div>
      </div>
      <div className="editor-container">
        {/* The blockRendererFn props renders the default DraftEditorBlock text block if no custome rendere is defined */}
        <Editor
          editorState={editorState}
          handleKeyCommand={handleKeyCommand}
          customStyleMap={styleMap}
          customStyleFn={customStyleFn}
          plugins={plugins}
          blockRendererFn={mediaBlockRenderer}
          blockRenderMap={extendedBlockRenderMap}
          blockStyleFn={myBlockStyleFn}
          keyBindingFn={keyBindingFn}
          onChange={setEditorState}
          placeholder="Whats on your mind?"
          spellCheck={true}
          ref={ref}
        />
        <InlineToolbar>
          {// may be use React.Fragment instead of div to improve perfomance after React 16
          externalProps => (
            <Fragment>
              <BoldButton {...externalProps} />
              <ItalicButton {...externalProps} />
              <UnderlineButton {...externalProps} />
              <linkPlugin.LinkButton {...externalProps} />
            </Fragment>
          )}
        </InlineToolbar>
        <EmojiSuggestions />
        <div className="counters-wrapper">
          <div className="counter-container">
            <CharCounter limit={200} /> characters
          </div>
          <div className="counter-container">
            <WordCounter limit={30} /> words
          </div>
          <div className="counter-container">
            <LineCounter limit={10} /> lines
          </div>
        </div>
        <div className="emoji-selection">
          <EmojiSelect />
          {imagePrompt && (
            <div className="image-form-container">
              <h2 className="form-head">Add image</h2>
              <form
                className="image-form"
                onSubmit={e => handleImageSubmit(e)}
                encType="multipart/form-data"
              >
                <div className="input-options-wrapper">
                  <p className="input-hint">Pase a link or upload image</p>
                  <div className="input-options"></div>
                  <input
                    name="imageUrl"
                    placeholder="Image link"
                    value={imageUrl}
                    type="text"
                    className="form-input image-url-input"
                    onChange={e => handleImageInputChange(e)}
                  />
                  <label className="image-embed-btn" htmlFor="embed-image">
                    Choose Image
                    <input
                      type="file"
                      accept="image/*"
                      name="image"
                      id="embed-image"
                      className="btn"
                      onChange={e => {
                        onImageFileChange(e);
                      }}
                      style={{ width: '100%' }}
                    />
                  </label>
                </div>

                <input
                  type="text"
                  name="imageCaption"
                  placeholder="Image caption"
                  value={imageCaption}
                  className="form-input image-caption-input"
                  onChange={e => handleImageInputChange(e)}
                />
                <div className="form-btns">
                  <button type="submit" className="green-btn">
                    Add image
                  </button>
                  <button onClick={() => clearForm()} className="red-btn">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditorComp;
