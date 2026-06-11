import { predictions } from "../data/mundial"

function ProbBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">{value}%</span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full" style={{ width: `${value}%`, backgroundColor: color }} />
      </div>
    </div>
  )
}

export default function Predictions() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold">Predicciones de partidos</h1>
        <p className="text-sm text-muted-foreground">
          Probabilidades estimadas a partir del análisis de datos históricos.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {predictions.map((p) => (
          <div key={p.id} className="rounded-xl border bg-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-semibold">{p.home}</span>
              <span className="text-sm text-muted-foreground">vs</span>
              <span className="font-semibold">{p.away}</span>
            </div>

            <div className="flex flex-col gap-3">
              <ProbBar label={`Gana ${p.home}`} value={p.homeProb} color="#0b6e4f" />
              <ProbBar label="Empate" value={p.drawProb} color="#5b6472" />
              <ProbBar label={`Gana ${p.away}`} value={p.awayProb} color="#e4b343" />
            </div>

            <div className="mt-4 rounded-lg bg-muted p-3 text-sm">
              Resultado más probable:{" "}
              <span className="font-semibold text-primary">{p.predictedWinner}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
