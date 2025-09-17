import type { ReactNode } from "react"

export const Table = ({ children }: { children: ReactNode }) => {
  return (
    <div className="overflow-x-auto">
        <table className="w-full text-sm">{children}</table>
    </div>
  )
}

export const TableHeader = ({ children }: { children: ReactNode }) => {
  return (
    <thead className="bg-teal-50 dark:bg-gray-800 text-teal-800 dark:text-teal-600">
        {children}
    </thead>
  )
}

export const TableHead = ({ children, className }: { children: ReactNode,className?: string }) => {
  return (
    <th className={`px-6 py-4 text-left font-bold tracking-wide uppercase text-xs ${className}`}>
        {children}
    </th>
  )
}

export const TableRow = ({ children, className }: { children: ReactNode, className?: string }) => {
  return (
    <tr className={`hover:bg-teal-50 dark:hover:bg-gray-900/80 transition-colors duration-200 ${className}`}>
        {children}
    </tr>
  )
}

export const TableBody = ({ children, className }: { children: ReactNode, className?: string }) => {
  return (
    <tbody className={`divide-y divide-gray-100 dark:divide-gray-700 ${className}`}>
        {children}
    </tbody>
  )
}

export const TableCell = ({ children, className = "", colSpan }: { children: ReactNode, className?: string, colSpan?: number }) => {
  return (
    <td className={`px-6 py-4 font-medium ${className}`} colSpan={colSpan}>
        {children}
    </td>
  )
}