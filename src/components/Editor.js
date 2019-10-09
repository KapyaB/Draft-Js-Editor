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

  // custom inline styles

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
        </div>
      </div>
      <Editor
        editorState={editorState}
        handleKeyCommand={handleKeyCommand}
        onChange={setEditorState}
      />
    </div>
  );
};

export default EditorComp;
