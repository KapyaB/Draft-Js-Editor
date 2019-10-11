import React, { useState, useEffect, Fragment, createRef } from 'react';
import { EditorState, RichUtils, AtomicBlockUtils } from 'draft-js';
import Editor from 'draft-js-plugins-editor';
import createInlineToolbarPlugin from 'draft-js-inline-toolbar-plugin';
import createLinkPlugin from 'draft-js-anchor-plugin';
import createUndoPlugin from 'draft-js-undo-plugin';
import createCounterPlugin from 'draft-js-counter-plugin';

import { ItalicButton, BoldButton, UnderlineButton } from 'draft-js-buttons';

import 'draft-js/dist/Draft.css';
import 'draft-js-inline-toolbar-plugin/lib/plugin.css';

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

// plugins list
const plugins = [inlineToolbarPlugin, linkPlugin, undoPlugin, counterPlugin];

// editor ref
const editorRef = createRef();

// focus function to programatically activate editor through ref
const focus = () => {
  editorRef && editorRef.current.focus();
};

/* This function is passsed as a callback in the event listener responsible for adding the image

focus() is called once our EditorState has finished updating. This way, users will be able to immediately resume entering (or deleting) text upon the addition of the image.
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

    if (newState) {
      setEditorState(newState);
      return 'handled';
    }

    return 'not-handled';
  };

  //  Styling controls

  // keep track of current style
  const [activeBtns, setActiveBtns] = useState([]);

  // BOLD
  const onBoldclick = () => {
    setEditorState(RichUtils.toggleInlineStyle(editorState, 'BOLD'));
    if (activeBtns.indexOf('bold') !== -1) {
      /* remove style */
      setActiveBtns(activeBtns.filter(btn => btn !== 'bold'));
    } else {
      /* add style */
      setActiveBtns([...activeBtns, 'bold']);
    }
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

  useEffect(() => {
    setTimeout(() => focus(), 0);
  });

  // The functionality for embedding images
  const onAddImage = e => {
    e.preventDefault();
    // image input
    const urlValue = window.prompt('Paste image link');
    const contentState = editorState.getCurrentContent();

    // add entity to contentState
    const contentStateWithEntity = contentState.createEntity(
      'image',
      'IMMUTABLE',
      { src: urlValue }
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

  return (
    <div className="editor-wrapper">
      <div className="editor-tools">
        <div className="undo-redo">
          <UndoButton />
          <RedoButton />
        </div>
        <div className="inline-styles">
          <button
            className={`bold-btn style-btn ${
              activeBtns.includes('bold') ? 'active-btn' : ''
            }`}
            onClick={onBoldclick}
          >
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
          <button className="style-btn add-image-btn" onClick={onAddImage}>
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
          blockStyleFn={myBlockStyleFn}
          onTab={onTab}
          onChange={setEditorState}
          placeholder="Whats on your mind?"
          spellCheck={true}
          ref={editorRef}
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
      </div>
    </div>
  );
};

export default EditorComp;
