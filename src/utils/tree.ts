// utils/tree.ts
// utils/tree.ts
export interface TreeNode {
  id: number   // ✅ 改为 number
  name: string
  parentId?: number | string | null
  level?: number  // 添加 level 属性
  iconUrl?: string
  visible?: number
  sort?: number
  children?: TreeNode[]
  [key: string]: any
}

export function buildTree(flatData: TreeNode[], parentId: number | string | null = null): TreeNode[] {
  return flatData
    .filter((item: TreeNode) => item.parentId === parentId)
    .map((item: TreeNode) => ({
      ...item,
      children: buildTree(flatData, item.id)  // 递归调用
    }))
}
