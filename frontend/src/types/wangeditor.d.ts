declare module '@wangeditor/editor-for-vue' {
  import { DefineComponent } from 'vue'

  interface WangEditor {
    getHtml(): string
    getMenuConfig(menuKey: string): {
      customUpload?: (file: File, insertFn: (...args: unknown[]) => void) => void
    }
  }

  export const Editor: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>
  export const Toolbar: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>
}

declare module 'wangeditor' {
  export interface WangEditor {
    getHtml(): string
    getMenuConfig(menuKey: string): {
      customUpload?: (file: File, insertFn: (...args: unknown[]) => void) => void
    }
  }
}
