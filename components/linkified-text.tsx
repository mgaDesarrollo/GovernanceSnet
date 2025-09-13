import { linkifyText } from "@/lib/linkify"

interface LinkifiedTextProps {
  children: string
  className?: string
}

export function LinkifiedText({ children, className = "" }: LinkifiedTextProps) {
  const linkifiedContent = linkifyText(children)

  return <div className={`whitespace-pre-line ${className}`}>{linkifiedContent}</div>
}
