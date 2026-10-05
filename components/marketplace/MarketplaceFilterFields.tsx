"use client";

import { AnimatedSelect } from "@/components/ui/AnimatedSelect";
import { Field } from "@/components/ui/Field";
import { MultiSelect } from "@/components/ui/MultiSelect";
import { StateCityFilterSelect } from "@/components/ui/StateCityFilterSelect";
import {
  parseMultiValue,
  serializeMultiValue,
  type MarketplaceSearchFilters,
} from "@/lib/marketplace-filters";
import { getModalityLabel, SESSION_MODALITIES } from "@/lib/labels";

type MarketplaceFilterFieldsProps = {
  idPrefix?: string;
  filters: MarketplaceSearchFilters;
  vehicleTypes: string[];
  carBrands: string[];
  tags: { slug: string; name: string }[];
  photographers: { handle: string; name: string }[];
  tipo?: "albuns" | "fotos";
  onFilterChange: (key: string, value: string) => void;
};

export function MarketplaceFilterFields({
  idPrefix = "",
  filters,
  vehicleTypes,
  carBrands,
  tags,
  photographers,
  tipo = "albuns",
  onFilterChange,
}: MarketplaceFilterFieldsProps) {
  const modalityOptions = SESSION_MODALITIES.map((modality) => ({
    value: modality,
    label: getModalityLabel(modality),
  }));

  const vehicleTypeOptions = vehicleTypes.map((vehicleType) => ({
    value: vehicleType,
    label: vehicleType,
  }));

  const carBrandOptions = carBrands.map((brand) => ({
    value: brand,
    label: brand,
  }));

  const tagOptions = tags.map((tag) => ({
    value: tag.slug,
    label: tag.name,
  }));

  return (
    <div className="flex flex-col gap-5">
      <MultiSelect
        id={`${idPrefix}modality`}
        label="Modalidade"
        placeholder="Todas as modalidades"
        options={modalityOptions}
        value={parseMultiValue(filters.modality)}
        onChange={(values) =>
          onFilterChange("modality", serializeMultiValue(values))
        }
      />

      <MultiSelect
        id={`${idPrefix}vehicleType`}
        label="Categoria de veículo"
        placeholder="Todas as categorias"
        options={vehicleTypeOptions}
        value={parseMultiValue(filters.vehicleType)}
        onChange={(values) =>
          onFilterChange("vehicleType", serializeMultiValue(values))
        }
      />

      <MultiSelect
        id={`${idPrefix}carBrand`}
        label="Marca"
        placeholder="Todas as marcas"
        options={carBrandOptions}
        value={parseMultiValue(filters.carBrand)}
        onChange={(values) =>
          onFilterChange("carBrand", serializeMultiValue(values))
        }
      />

      <MultiSelect
        id={`${idPrefix}tag`}
        label="Tags"
        placeholder="Todas as tags"
        options={tagOptions}
        value={parseMultiValue(filters.tag)}
        onChange={(values) => onFilterChange("tag", serializeMultiValue(values))}
      />

      <Field label="Fotógrafo" htmlFor={`${idPrefix}photographer`}>
        <AnimatedSelect
          id={`${idPrefix}photographer`}
          searchable
          value={filters.photographer ?? ""}
          onChange={(event) =>
            onFilterChange("photographer", event.target.value)
          }
        >
          <option value="">Todos os fotógrafos</option>
          {photographers.map((photographer) => (
            <option key={photographer.handle} value={photographer.handle}>
              {photographer.name}
            </option>
          ))}
        </AnimatedSelect>
      </Field>

      <StateCityFilterSelect
        idPrefix={idPrefix}
        state={filters.state ?? ""}
        city={filters.city ?? ""}
        onStateChange={(value) => onFilterChange("state", value)}
        onCityChange={(value) => onFilterChange("city", value)}
      />

      <Field label="Ordenar" htmlFor={`${idPrefix}sort`}>
        <AnimatedSelect
          id={`${idPrefix}sort`}
          value={filters.sort ?? "recent"}
          onChange={(event) => onFilterChange("sort", event.target.value)}
        >
          <option value="recent">Mais recentes</option>
          {tipo === "albuns" && (
            <option value="date_desc">Data da cobertura</option>
          )}
          {tipo === "fotos" && (
            <option value="date_desc">Data da foto</option>
          )}
          <option value="price_asc">Menor preço</option>
          <option value="price_desc">Maior preço</option>
        </AnimatedSelect>
      </Field>
    </div>
  );
}
