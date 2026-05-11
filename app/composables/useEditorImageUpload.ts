export function useEditorImageUpload() {
  async function uploadImage(file: File): Promise<string | null> {
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await $fetch('/api/upload', { method: 'POST', body: formData })
      return (res as any).url ?? null
    } catch {
      return null
    }
  }

  function createImageHandler() {
    return {
      canExecute: (editor: any) => editor.can().setImage({ src: '' }),
      execute: (editor: any) => {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = 'image/*'
        input.onchange = async () => {
          const file = input.files?.[0]
          if (!file) return
          const url = await uploadImage(file)
          if (url) {
            editor.chain().focus().setImage({ src: url }).run()
          }
        }
        input.click()
        return editor.chain().focus()
      },
      isActive: (editor: any) => editor.isActive('image'),
      isDisabled: (editor: any) => !editor.can().setImage({ src: '' })
    }
  }

  return { createImageHandler }
}
