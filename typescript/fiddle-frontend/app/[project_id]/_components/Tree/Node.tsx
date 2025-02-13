import { diagnosticsAtom } from '@/shared/baml-project-panel/atoms'
import clsx from 'clsx'
import { useAtomValue, useSetAtom } from 'jotai'
import { useAtomCallback } from 'jotai/utils'
import { ChevronDown, ChevronRight, Edit2, File, X } from 'lucide-react'
import { useCallback, useEffect } from 'react'
import type { NodeRendererProps } from 'react-arborist'
import { SiPython, SiTypescript } from 'react-icons/si'
import { activeFileNameAtom, currentEditorFilesAtom, emptyDirsAtom } from '../../_atoms/atoms'

export type Entity = {
  id: string
  name: string
  fullPath: string
  object: any
}

const renderIcon = (path: string) => {
  const icon = path.split('.').pop()
  switch (icon) {
    case 'py':
      return <SiPython size={14} color='#6bc7f6' />
    case 'ts':
      return <SiTypescript size={14} color='#2563eb' />
    default:
      return (
        <span className='file-folder-icon'>
          <File className='text-secondary-foreground/50' size={16} />
        </span>
      )
  }
}

const Node = ({ node, style, dragHandle, tree }: NodeRendererProps<any>) => {
  const CustomIcon = node.data.icon
  const iconColor = node.data.iconColor
  const editorFiles = useAtomValue(currentEditorFilesAtom)
  const setActiveFile = useSetAtom(activeFileNameAtom)

  const hasErrorInChildren = useAtomCallback<boolean, string[]>(
    useCallback(
      (get, set, nodeId: string) => {
        const nodes = [tree.get(nodeId)] // Start with the current node

        const diagnosticErrors = get(diagnosticsAtom)
        const errors = diagnosticErrors.filter((d) => d.type === 'error')
        while (nodes.length > 0) {
          const currentNode = nodes.pop()
          if (currentNode?.children) {
            currentNode.children.forEach((child) => {
              nodes.push(tree.get(child.id))
            })
          }
          if (errors.some((d) => d.file_path === currentNode?.id)) {
            return true
          }
        }
        return false
      },
      [tree],
    ),
  )

  const setEmptyDirs = useSetAtom(emptyDirsAtom)

  useEffect(() => {
    if (node.isSelected) {
      setActiveFile(node.id)
    }
  }, [node.isSelected])

  // Check if the current file or any children have errors
  const fileHasErrors = hasErrorInChildren(node.id)

  return (
    <div
      className={clsx(
        `group relative px-2 py-1 cursor-pointer overflow-x-clip flex-flex-col text-xs ${
          node.state.isSelected ? 'isSelected' : ''
        }`,
        [node.state.isSelected ? 'dark:bg-gray-800 bg-gray-200' : ''],
      )}
      style={style}
      ref={dragHandle}
    >
      <div className='flex flex-row justify-start items-center w-full' onClick={() => node.isInternal && node.toggle()}>
        {node.isLeaf ? (
          <>
            <span className=''></span>
            {renderIcon(node.id)}
          </>
        ) : (
          <>
            <span className='w-fit'>
              {node.isOpen ? <ChevronDown className='w-3 h-fit' /> : <ChevronRight size={12} />}
            </span>
            {/* <span className="file-folder-icon">
              <Folder color="#f6cf60" size={16} />
            </span> */}
          </>
        )}
        <span className='node-text text-muted-foreground hover:text-foreground'>
          {node.isEditing ? (
            <input
              type='text'
              defaultValue={node.data.name}
              onFocus={(e) => e.currentTarget.select()}
              onBlur={() => node.reset()}
              onKeyDown={(e) => {
                if (e.key === 'Escape') node.reset()
                if (e.key === 'Enter') {
                  // Previous name folder name
                  node.submit(e.currentTarget.value)
                  const filePathWithNoFilename = node.id.split('/').slice(0, -1).join('/')
                  const fileName = `${filePathWithNoFilename}/${e.currentTarget.value}`
                  // updateFile({
                  //   reason: 'rename_file',
                  //   root_path: PROJECT_ROOT,
                  //   files: [],
                  //   renames: [{ from: node.id, to: fileName }],
                  // })

                  setEmptyDirs((prev) => {
                    prev = prev
                    return prev.map((d) => {
                      d = d.slice(0, -1)
                      if (d === node.id) {
                        const dirPathWithNoDirname = d.split('/').slice(0, -1).join('/')
                        return `${dirPathWithNoDirname}/${e.currentTarget.value}`
                      }
                      return d
                    })
                  })
                }
              }}
              autoFocus
            />
          ) : (
            <span
              className={clsx(
                fileHasErrors ? 'text-red-500' : node.state.isSelected ? 'dark:text-secondary-foreground ' : '',
                'text-xs pl-1',
              )}
            >
              {node.data.name}
            </span>
          )}
        </span>
      </div>

      {node.id !== 'baml_src' && (
        <div className='hidden absolute top-0 right-0 rounded-md group-hover:flex bg-muted'>
          <div className='flex flex-row items-center'>
            <button
              className='p-1 opacity-70 hover:opacity-100'
              onClick={(e) => {
                e.stopPropagation()
                node.edit()
              }}
              title='Rename...'
            >
              <Edit2 size={11} />
            </button>
            <button
              className='p-1 opacity-60 hover:opacity-100'
              onClick={() => {
                tree.delete(node.id)

                // updateFile({
                //   reason: 'delete_file',
                //   root_path: PROJECT_ROOT,
                //   files: [
                //     {
                //       name: node.id,
                //       content: undefined,
                //     },
                //   ],
                // })
                setEmptyDirs((prev) => {
                  prev = prev
                  return prev.filter((d) => d.slice(0, -1) !== node.id)
                })
              }}
              title='Delete'
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Node
