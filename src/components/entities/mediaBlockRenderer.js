/**
 * Here er are using custome block componets. Key concepts:
 * 1. contentBlock - an immutable record that represents the full state of a SINGLE block of editor content.
 * 2. All contentBlocks in an editor are structured in an OrderedMap, which makes up the editors contentState.
 */
import React from 'react';
// import { EditorState, RichUtils, AtomicBlockUtils } from 'draft-js';

/**
 * To render a custome block, we rely on the blockRendererFn prop of the Editor object
 */
export const mediaBlockRenderer = block => {
  if (block.getType() === 'atomic') {
    // if the block type is atomic

    return {
      component: Media, // the component to render
      // props: (optional) - oprops passed to the custom component via the props.blockProps sub property objects
      editable: false // customary for non-text blocks
    };
  }
  return null;
};

// The Image Entity.
/**
 * Entities are used for annotating ranges of text with metadata. Providing levels of richness beyond styled text
 */
const Image = props => {
  if (!!props.src) {
    return <img src={props.src} className="embedded-img" alt="" />;
  }
  return null;
};

// The Media custom component. Has access to the contenBlock objects and contentState record made available within the custom component alomg with the props

const Media = props => {
  // get the Image entity metadata
  const entity = props.contentState.getEntity(props.block.getEntityAt(0));

  // image src and type
  const { src } = entity.getData();
  const type = entity.getType();

  let media;
  if (type === 'image') {
    // render image compononent
    media = <Image src={src} />;
  }

  return media;
};
