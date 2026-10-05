import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = join(__dirname, "brazil-cities.json");

type IbgeMunicipio = {
  nome: string;
  microrregiao: {
    mesorregiao: {
      UF: {
        sigla: string;
      };
    };
  };
};

const STATES = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO",
] as const;

async function fetchMunicipiosForState(uf: string): Promise<string[]> {
  const url = `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Falha ao buscar municípios de ${uf}: ${response.status}`);
  }

  const data = (await response.json()) as IbgeMunicipio[];
  return data.map((m) => m.nome).sort((a, b) => a.localeCompare(b, "pt-BR"));
}

async function main() {
  const citiesByState: Record<string, string[]> = {};

  for (const uf of STATES) {
    process.stdout.write(`Buscando ${uf}... `);
    citiesByState[uf] = await fetchMunicipiosForState(uf);
    process.stdout.write(`${citiesByState[uf].length} cidades\n`);
  }

  const total = Object.values(citiesByState).reduce(
    (sum, cities) => sum + cities.length,
    0,
  );

  writeFileSync(OUTPUT_PATH, JSON.stringify(citiesByState));

  console.log(`\nGerado ${OUTPUT_PATH} com ${total} municípios.`);

  const spArara = citiesByState.SP.filter((c) =>
    c.toLowerCase().includes("arara"),
  );
  console.log(`SP + "arara": ${spArara.join(", ")}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
