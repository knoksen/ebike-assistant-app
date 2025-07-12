export type SolutionStepsProps = {
  steps: string[] | undefined
  onBack: () => void
}

export function SolutionSteps({ steps, onBack }: SolutionStepsProps) {
  if (!steps) return null

  return (
    <div>
      <h2>Recommended steps</h2>
      <ol>
        {steps.map(step => (
          <li key={step}>{step}</li>
        ))}
      </ol>
      <button onClick={onBack}>Back</button>
    </div>
  )
}
