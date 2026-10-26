<template>
  <el-cascader
    v-model="id"
    :options="areaOptions"
    :props="cascaderProps"
    clearable
    placeholder="请选择社区"

  />
</template>

<script setup lang="ts">
// @ts-nocheck
import { ref, reactive } from 'vue'
import { getAreaData } from '@/api/hengzhiyuan'
import { useDialogStore } from '@/views/client/Portfolio/HengzhiyuanMap/stores/dialogStore'
const dialogStore = useDialogStore()
const id = defineModel('id')
const areaOptions = ref([])
const cascaderProps = reactive({
  value: "code",
  label: "name",
  children: "children",
  // 指定选项的叶子节点的标志位为选项对象的某个属性值
  leaf: 'isLeaf',
  checkStrictly: true, // 任意层级可选
  emitPath: false,     // 只返回单个值（code），不是数组
  lazy: true,
  async lazyLoad(node, resolve) {
    const { level } = node
    if (level === 0) {
      // 加载一级
      resolve(dialogStore.areaData)
    }
    else if (node.level === 1) {
      // 加载二级，并设置为叶子节点（不再展开）
      const { code, level } = node.data
      // level=5&parent=510106025000
      const listRes = await getAreaData({ level: level + 1, parent: code })
      const { data: { list } } = listRes
      const children = list.map(child => ({
        ...child,
        isLeaf: true
      }))
      resolve(children)
    }
  }
})
</script>

<style lang="scss" scoped>

</style>
