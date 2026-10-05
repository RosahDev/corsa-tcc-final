import { formatCurrency } from "@/lib/format";

type Point = { month: string; total: number };

const CHART_WIDTH = 640;
const CHART_HEIGHT = 220;
const PADDING = { top: 36, right: 16, bottom: 32, left: 16 };

function buildLastSixMonths(data: Point[]): Point[] {
  const totals = new Map(data.map((item) => [item.month, item.total]));
  const series: Point[] = [];
  const now = new Date();

  for (let offset = 5; offset >= 0; offset -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    series.push({ month, total: totals.get(month) ?? 0 });
  }

  return series;
}

function formatMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split("-").map(Number);
  return new Intl.DateTimeFormat("pt-BR", { month: "short" })
    .format(new Date(year, month - 1, 1))
    .replace(/\.$/, "");
}

function getChartMax(total: number): number {
  if (total <= 0) return 1;

  const magnitude = 10 ** Math.floor(Math.log10(total));
  const normalized = total / magnitude;

  if (normalized <= 1) return magnitude;
  if (normalized <= 2) return 2 * magnitude;
  if (normalized <= 5) return 5 * magnitude;
  return 10 * magnitude;
}

export function SalesChart({ data }: { data: Point[] }) {
  const series = buildLastSixMonths(data);
  const maxTotal = Math.max(...series.map((item) => item.total), 0);
  const chartMax = getChartMax(maxTotal);
  const hasSales = maxTotal > 0;

  const plotWidth = CHART_WIDTH - PADDING.left - PADDING.right;
  const plotHeight = CHART_HEIGHT - PADDING.top - PADDING.bottom;
  const barGap = 14;
  const barWidth = (plotWidth - barGap * (series.length - 1)) / series.length;
  const gridLines = 4;

  if (!hasSales) {
    return (
      <div className="mt-6 flex min-h-[200px] flex-col items-center justify-center rounded-2xl border border-dashed border-corsa-border bg-corsa-cream/60 px-6 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-corsa-rose">
          <svg
            viewBox="0 0 24 24"
            className="size-6 text-corsa-wine"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            aria-hidden
          >
            <path d="M4 19V5" strokeLinecap="round" />
            <path d="M4 19H20" strokeLinecap="round" />
            <path d="M8 15V11" strokeLinecap="round" />
            <path d="M12 19V7" strokeLinecap="round" />
            <path d="M16 19V13" strokeLinecap="round" />
          </svg>
        </div>
        <p className="mt-4 text-sm font-medium text-corsa-ink">
          Nenhuma venda nos últimos 6 meses
        </p>
        <p className="mt-1 max-w-sm text-sm text-corsa-muted">
          Quando você receber pedidos pagos, o desempenho mensal aparecerá aqui.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <svg
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
        className="h-[220px] w-full"
        role="img"
        aria-label="Gráfico de vendas dos últimos seis meses"
      >
        <defs>
          <linearGradient id="salesBarGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7A2834" />
            <stop offset="100%" stopColor="#5D1923" />
          </linearGradient>
        </defs>

        {Array.from({ length: gridLines + 1 }, (_, index) => {
          const y = PADDING.top + (plotHeight / gridLines) * index;

          return (
            <line
              key={index}
              x1={PADDING.left}
              y1={y}
              x2={CHART_WIDTH - PADDING.right}
              y2={y}
              stroke="#E5DFD6"
              strokeDasharray="4 6"
            />
          );
        })}

        {series.map((item, index) => {
          const barHeight =
            item.total > 0
              ? Math.max(12, (item.total / chartMax) * plotHeight)
              : 6;
          const x = PADDING.left + index * (barWidth + barGap);
          const y = PADDING.top + plotHeight - barHeight;
          const label = formatMonthLabel(item.month);

          return (
            <g key={item.month}>
              {item.total > 0 && (
                <text
                  x={x + barWidth / 2}
                  y={Math.max(PADDING.top + 14, y - 10)}
                  textAnchor="middle"
                  fill="#5D1923"
                  fontSize="11"
                  fontWeight="600"
                >
                  {formatCurrency(item.total)}
                </text>
              )}
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx={10}
                fill={item.total > 0 ? "url(#salesBarGradient)" : "#E5DFD6"}
                opacity={item.total > 0 ? 1 : 0.55}
              />
              <text
                x={x + barWidth / 2}
                y={CHART_HEIGHT - 10}
                textAnchor="middle"
                fill="#6B6560"
                fontSize="11"
                style={{ textTransform: "capitalize" }}
              >
                {label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
