#!/usr/bin/env python3
"""
Prisma Schema -> Mermaid ER Diagram Generator

Parses schema.prisma and produces a valid Mermaid erDiagram file.
- Skips enums (not supported in Mermaid ER).
- Converts Prisma types to Mermaid-compatible types.
- Extracts relationships from @relation fields.
- Removes emoji markers.
- Deduplicates fields and entities.
"""

import re
import sys
from pathlib import Path
from collections import OrderedDict

SCHEMA_PATH = Path(__file__).parent / "prisma" / "schema.prisma"
OUTPUT_PATH = Path(__file__).parent / "prisma" / "ERD.md"

# Prisma -> Mermaid type mapping
TYPE_MAP = {
    "String": "string",
    "Int": "int",
    "Float": "float",
    "Boolean": "boolean",
    "DateTime": "datetime",
    "Json": "string",
    "Decimal": "float",
    "BigInt": "int",
    "Bytes": "string",
}


def parse_schema(schema_text: str):
    """Parse a Prisma schema and return models and their fields/relations."""
    models: OrderedDict[str, dict] = OrderedDict()
    enums: set[str] = set()

    # First pass: collect enum names so we can identify enum-typed fields
    for match in re.finditer(r"^enum\s+(\w+)\s*\{", schema_text, re.MULTILINE):
        enums.add(match.group(1))

    # Second pass: parse models
    for match in re.finditer(
        r"^model\s+(\w+)\s*\{(.*?)^\}", schema_text, re.MULTILINE | re.DOTALL
    ):
        model_name = match.group(1)
        body = match.group(2)

        if model_name in models:
            continue  # skip duplicate model definitions

        fields = OrderedDict()  # field_name -> {type, is_pk, is_optional}
        relations = []  # list of {field, target_model, is_list, is_optional, relation_name}

        # Find the @@map directive to get the DB table name
        map_match = re.search(r'@@map\("(\w+)"\)', body)
        table_name = map_match.group(1) if map_match else model_name

        for line in body.split("\n"):
            line = line.strip()

            # Skip empty lines, comments, @@directives
            if not line or line.startswith("//") or line.startswith("@@"):
                continue

            # Parse field line:  fieldName  Type?  @attributes...
            field_match = re.match(
                r"^(\w+)\s+([\w\[\]?]+)\s*(.*)?$", line
            )
            if not field_match:
                continue

            field_name = field_match.group(1)
            field_type_raw = field_match.group(2)
            attrs = field_match.group(3) or ""

            # Determine if it is a list relation (Type[])
            is_list = field_type_raw.endswith("[]")
            is_optional = "?" in field_type_raw

            # Clean type
            clean_type = field_type_raw.replace("[]", "").replace("?", "")

            # Check if this is a relation field (type is another model name)
            if clean_type in enums:
                # Enum field -> treat as string
                if field_name not in fields:
                    fields[field_name] = {
                        "type": "string",
                        "is_pk": "@id" in attrs,
                        "is_optional": is_optional,
                    }
                continue

            # Check if this field references another model (relation field)
            # A relation field's type starts with uppercase and is not in TYPE_MAP
            if clean_type[0].isupper() and clean_type not in TYPE_MAP:
                # This is a relation field
                # Extract relation details from @relation if present
                rel_match = re.search(
                    r'@relation\([^)]*fields:\s*\[([^\]]+)\].*?references:\s*\[([^\]]+)\]',
                    attrs,
                )
                if rel_match and not is_list:
                    # This is a forward relation (has FK field)
                    fk_field = rel_match.group(1).strip()
                    relations.append({
                        "field": field_name,
                        "fk_field": fk_field,
                        "target_model": clean_type,
                        "is_list": is_list,
                        "is_optional": is_optional,
                    })
                elif not is_list and not rel_match:
                    # Forward relation without explicit @relation (implicit)
                    relations.append({
                        "field": field_name,
                        "fk_field": None,
                        "target_model": clean_type,
                        "is_list": is_list,
                        "is_optional": is_optional,
                    })
                # Skip list relations (back-references) — they don't define relationships
                continue

            # Scalar field
            mapped_type = TYPE_MAP.get(clean_type, "string")

            if field_name not in fields:
                fields[field_name] = {
                    "type": mapped_type,
                    "is_pk": "@id" in attrs,
                    "is_optional": is_optional,
                }

        models[model_name] = {
            "table_name": table_name,
            "fields": fields,
            "relations": relations,
        }

    return models


def generate_mermaid(models: dict) -> str:
    """Generate Mermaid erDiagram code from parsed models."""
    lines = ["erDiagram"]

    # Build a lookup from model name -> table name for resolving relations
    model_to_table = {name: info["table_name"] for name, info in models.items()}

    # 1. Entity definitions with fields
    for model_name, info in models.items():
        table = info["table_name"]
        lines.append(f"    {table} {{")

        for field_name, field_info in info["fields"].items():
            ftype = field_info["type"]
            pk_marker = " PK" if field_info["is_pk"] else ""
            lines.append(f"        {ftype} {field_name}{pk_marker}")

        lines.append("    }")
        lines.append("")

    # 2. Relationships
    # Collect relationships to deduplicate
    seen_rels = set()

    for model_name, info in models.items():
        source_table = info["table_name"]

        for rel in info["relations"]:
            target_model = rel["target_model"]
            target_table = model_to_table.get(target_model)

            if not target_table:
                continue

            # Determine cardinality
            # Forward relation (has FK): source }o--|| target (many-to-one or one-to-one)
            # If the FK field is optional -> }o--|o (zero-or-one to one)
            # If the FK field is required -> }o--|| (many to one, required)

            is_optional = rel["is_optional"]

            # Check if the source side is "one" (has @unique on the FK field)
            # For simplicity, use many-to-one as default for forward relations
            if is_optional:
                left_card = "|o"   # zero or one
                right_card = "|o"  # zero or one on target side
            else:
                left_card = "}o"   # many (source side)
                right_card = "||"  # exactly one (target side)

            # Self-referencing relation
            if source_table == target_table:
                left_card = "|o"
                right_card = "|o"

            rel_label = rel["field"]

            # Create a canonical key to deduplicate
            rel_key = (source_table, target_table, rel_label)
            if rel_key in seen_rels:
                continue
            seen_rels.add(rel_key)

            lines.append(
                f"    {source_table} {left_card}--{right_card} {target_table} : {rel_label}"
            )

    return "\n".join(lines)


def main():
    schema_path = SCHEMA_PATH
    output_path = OUTPUT_PATH

    if not schema_path.exists():
        print(f"Error: {schema_path} not found", file=sys.stderr)
        sys.exit(1)

    schema_text = schema_path.read_text(encoding="utf-8")
    models = parse_schema(schema_text)

    print(f"Parsed {len(models)} models")

    mermaid_code = generate_mermaid(models)

    # Write as markdown with mermaid code block
    output = f"```mermaid\n{mermaid_code}\n```\n"
    output_path.write_text(output, encoding="utf-8")

    print(f"ERD written to {output_path}")
    print(f"Total lines: {len(output.splitlines())}")


if __name__ == "__main__":
    main()
