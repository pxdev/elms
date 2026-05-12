import { ImageUpload } from '~/extensions/image-upload'

export function useEditorImageUpload() {
  const imageUploadHandler = {
    canExecute: (editor: any) => editor.can().insertContent({ type: 'imageUpload' }),
    execute: (editor: any) => editor.chain().focus().insertContent({ type: 'imageUpload' }),
    isActive: (editor: any) => editor.isActive('imageUpload'),
    isDisabled: (editor: any) => !editor.can().insertContent({ type: 'imageUpload' })
  }

  return {
    ImageUpload,
    imageUploadHandler
  }
}
