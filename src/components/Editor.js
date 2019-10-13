import React, { useState, useEffect, createRef, Fragment } from 'react';
import { Map as imutableMap } from 'immutable';
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
    ref && ref.current.focus();
  };
  /**
   *  focus() is called once our EditorState has finished updating. This way, users will be able to immediately resume entering (or deleting) text upon clicking a (styling) button or addition of an image.

   */
  //  Styling controls
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
  // HEADERS
  const onH1Click = () => {
    setEditorState(RichUtils.toggleBlockType(editorState, 'header-one'));
  };
  const onH2Click = () => {
    setEditorState(RichUtils.toggleBlockType(editorState, 'header-two'));
  };
  const onH3Click = () => {
    setEditorState(RichUtils.toggleBlockType(editorState, 'header-three'));
  };
  const onH4Click = () => {
    setEditorState(RichUtils.toggleBlockType(editorState, 'header-four'));
  };
  const onH5Click = () => {
    setEditorState(RichUtils.toggleBlockType(editorState, 'header-five'));
  };
  const onH6Click = () => {
    setEditorState(RichUtils.toggleBlockType(editorState, 'header-six'));
  };

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

  const onAlignClick = alignment => {
    // get all blocks
    const allBlocks = document.getElementsByClassName(
      'public-DraftStyleDefault-block'
    );

    /*
      get selected or new block using anchor key and the "data-offset-key" attribute(from draft) 
      the first set of chars in the data offset key is the same as the block's anchor key.
    */
    var myBlock;
    [...allBlocks].map(block => {
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

  // custom inline styles
  const styleMap = {
    STRIKETHROUGH: {
      textDecoration: 'line-through'
    },
    CODE: {
      color: '#00398a',
      background: '#ccc8',
      fontFamily: 'Inconsolata, monospace',
      fontWeight: 'bold'
    },
    HIGHLIGHT: {
      background: '#e9ff32'
    },
    SUPERSCRIPT: {
      verticalAlign: 'super',
      fontSize: 'smaller'
    },
    SUBSCRIPT: {
      verticalAlign: 'sub',
      fontSize: 'smaller'
    },
    blockquote: {
      color: ' #ddd',
      fontStyle: ' italic',
      textAlign: ' center',
      borderLeft: ' 5px solid #888'
    }
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
  console.log(allBlocks);
  const selectedKey = editorState.getSelection().getAnchorKey();
  const selectedBlock = allBlocks.find(block => block.key === selectedKey);
  const currentBlockStyles = selectedBlock.inlineStyleRanges; //array of objects
  const selectionOffset = editorState.getSelection().getAnchorOffset(); // position of cursor or start of selection

  // add to array
  var activeStyles = [];
  currentBlockStyles.filter(inlineStyle => {
    const { offset, length, style } = inlineStyle;
    if (offset < selectionOffset && selectionOffset <= length + offset) {
      // return style;
      !activeStyles.includes(style) && activeStyles.push(style);
    }
    return activeStyles;
  });
  console.log(editorState.getSelection());
  console.log(activeStyles);

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
  const handleImageInputChange = e => {
    setImageState({
      ...imageState,
      [e.target.name]: e.target.value
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

  const handleImageSubmit = e => {
    e.preventDefault();
    clearForm();
    onAddImage(e);
  };

  const { imageCaption, imageDescription, imageUrl } = imageState;
  // The functionality for embedding images
  const onAddImage = e => {
    e.preventDefault();
    const contentState = editorState.getCurrentContent();

    // add entity to contentState
    const contentStateWithEntity = contentState.createEntity(
      'image',
      'IMMUTABLE',
      { src: imageUrl, caption: imageCaption, desc: imageDescription }
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

  // custom blocks for style alignment

  return (
    <div className="editor-wrapper">
      <div className="editor-tools">
        <div className="undo-redo">
          <UndoButton />
          <RedoButton />
        </div>
        <div className="inline-styles">
          <button className="bold-btn style-btn" onClick={onBoldclick}>
            <strong>B</strong>
          </button>

          <button className="style-btn italic-btn" onClick={onItalicClick}>
            <em>I</em>
          </button>

          <button
            className="style-btn underline-btn"
            style={{ textDecoration: 'underline' }}
            onClick={onUnderlineClick}
          >
            U
          </button>

          <button className="style-btn code-btn" onClick={onCodeClick}>
            {'<>'}
          </button>

          <button
            className="style-btn strike-through-btn"
            style={{ textDecoration: 'line-through' }}
            onClick={onStrikeThroughClick}
          >
            ab
          </button>

          <button
            className="style-btn highlight-btn"
            onClick={onHighlightClick}
          >
            <i className=" fas fa-highlighter"></i>
          </button>

          <button
            className="style-btn superscript-btn"
            onClick={onSuperScriptClick}
          >
            X<sup>2</sup>
          </button>

          <button
            className="style-btn subscript-btn"
            onClick={onSubScriptClick}
          >
            X<sub>2</sub>
          </button>
        </div>
        <div className="block-styles">
          <div className="headers">
            <button className="style-btn h1-btn" onClick={onH1Click}>
              H1
            </button>
            <button className="style-btn h1-btn" onClick={onH2Click}>
              H2
            </button>
            <button className="style-btn h1-btn" onClick={onH3Click}>
              H3
            </button>
            <button className="style-btn h1-btn" onClick={onH4Click}>
              H4
            </button>
            <button className="style-btn h1-btn" onClick={onH5Click}>
              H5
            </button>
            <button className="style-btn h1-btn" onClick={onH6Click}>
              H6
            </button>
          </div>
          <button
            className="style-btn blockquote-btn"
            onClick={onBlockquoteClick}
          >
            <i className="fas fa-quote-right"></i>
          </button>
          <button
            className="style-btn codeblock-btn"
            onClick={onCodeBlockClick}
          >
            code
          </button>

          <button className="style-btn ordered-btn" onClick={onOLClick}>
            <i className="fas fa-list-ol"></i>
          </button>
          <button className="style-btn ordered-btn" onClick={onULClick}>
            <i className="fas fa-list"></i>
          </button>
          <div className="align-tools">
            <button
              className="align-left style-btn"
              onClick={() => onAlignClick('align-left')}
            >
              <i className="fas fa-align-left"></i>
            </button>
            <button
              className="align-center style-btn"
              onClick={() => onAlignClick('align-center')}
            >
              <i className="fas fa-align-center"></i>
            </button>
            <button
              className="align-right style-btn"
              onClick={() => onAlignClick('align-right')}
            >
              <i className="fas fa-align-right"></i>
            </button>
            <button
              className="align-justify style-btn"
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
              <form className="image-form" onSubmit={e => handleImageSubmit(e)}>
                <input
                  name="imageUrl"
                  placeholder="Image link"
                  value={imageUrl}
                  type="text"
                  className="form-input image-url-input"
                  onChange={e => handleImageInputChange(e)}
                />
                <input
                  type="text"
                  name="imageCaption"
                  placeholder="Image caption"
                  value={imageCaption}
                  className="form-input image-caption-input"
                  onChange={e => handleImageInputChange(e)}
                />
                <textarea
                  type="text"
                  name="imageDescription"
                  placeholder="Image description"
                  value={imageDescription}
                  className="form-input image-desc-input"
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
