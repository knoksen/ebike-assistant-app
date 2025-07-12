export type Part = {
  id: number
  name: string
}

export default function PartItem({ part }: { part: Part }) {
  return <li>{part.name}</li>
}
