import { Node, mergeAttributes } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import EditorImageUpload from '~/components/EditorImageUpload.vue'

export const ImageUpload = Node.create({
  name: 'imageUpload',
  group: 'block',
  atom: true,
  draggable: true,

  parseHTML() {
    return [{ tag: 'div[data-type="image-upload"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'image-upload' })]
  },

  addNodeView() {
    return VueNodeViewRenderer(EditorImageUpload)
  },

  addCommands() {
    return {
      setImageUpload: () => ({ commands }) => {
        return commands.insertContent({ type: 'imageUpload' })
      }
    }
  }
})
