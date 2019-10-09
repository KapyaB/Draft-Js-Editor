import React, { useState } from 'react';
import { Editor, EditorState, RichUtils } from 'draft-js';

import 'draft-js/dist/Draft.css';

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

  /**
   * Styling controls
   */

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
    }
  };

  return (
    <div className="editor-wrapper">
      <div className="editor-tools">
        <div className="inline-styles">
          <button className="bold-btn" onClick={onBoldclick}>
            <strong>B</strong>
          </button>

          <button className="italic-btn" onClick={onItalicClick}>
            <em>I</em>
          </button>

          <button
            className="underline-btn"
            style={{ textDecoration: 'underline' }}
            onClick={onUnderlineClick}
          >
            U
          </button>

          <button className="code-btn" onClick={onCodeClick}>
            {'<>'}
          </button>

          <button
            className="strike-through-btn"
            style={{ textDecoration: 'line-through' }}
            onClick={onStrikeThroughClick}
          >
            ab
          </button>

          <button
            className="highlight-btn"
            style={{
              borderBottom: '4px solid #e9ff32'
            }}
            onClick={onHighlightClick}
          >
            <i className="fas fa-highlighter"></i>
          </button>

          <button className="superscript-btn" onClick={onSuperScriptClick}>
            X<sup>2</sup>
          </button>

          <button className="subscript-btn" onClick={onSubScriptClick}>
            X<sub>2</sub>
          </button>
        </div>
      </div>
      <Editor
        editorState={editorState}
        handleKeyCommand={handleKeyCommand}
        customStyleMap={styleMap}
        onChange={setEditorState}
      />
    </div>
  );
};

export default EditorComp;
