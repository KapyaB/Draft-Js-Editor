# RichText Editor
A rich text editor build with Facebook's Draft js framework

![](./public/editor.png)

## current to-dos:
- [x] highlight current blockstyle buttons
- [ ] link embeds
- [ ] canvas
- [x] color picker
- [x] photo upload
- [ ] audio
- [ ] hashtag
- [ ] mentions
- [ ] resize media
- [ ] editor background (color)
- [ ] make image caption editable

## known issues:
- [ ] active inline style buttons are being highlighted only when user starts typing using new styles unless there is some selected text, then it's immediate.
- [ ] The undo buttons are need to be clicked twice for the other to work
- [x] Font family cant be chosen with nothing in editor ()
- [ ] minor issues with focus when changing font size (details later)
- [x] custom font size incapacitates headers (H1-H6) -moot
- [x] Alignment btn remain highlighted when user moves to different block 
-[x] font color and size are block styles not inline
  * Only works when there is selected text
