---
name: translate
description:
  Translate any text file content to a target language while preserving the
  integrity of code elements and special formatting.
---

# Translate

Translate any text file content to a target language while preserving the
integrity of code elements and special formatting.

## Usage

1. Provide the **language** parameter with the target language name (e.g.,
   `French`, `Spanish`, `German`, `Japanese`).
2. Attach the files or folders to be translated as assets.

## Rules

### General

1. **Translate only human-readable text** — comments, strings,
   documentation, and prose content.
2. **Preserve the original file structure** — do not modify indentation,
   line breaks, or file organization.
3. **Maintain the same file format** — output must be in the same format as
   the input.

### Programming Language Files (`.ts`, `.js`, `.py`, `.java`, `.go`, …)

| Action               | Targets                                                                                                                                                                                                            |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **DO NOT translate** | Function names, class names, variable names, method names, import/export statements, package names, type names, interfaces, enum keys, constant identifiers, reserved keywords, library/framework-specific terms   |
| **DO translate**     | Comments (single-line and multi-line), string literals containing user-facing text, documentation blocks (JSDoc, docstrings, etc.), error messages intended for end users, console log messages (when appropriate) |

### Markdown Files (`.md`)

| Action               | Targets                                                                                                                                                                                                             |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **DO NOT translate** | Code blocks (inline and fenced), URLs and link targets, file paths, badges/shields, HTML tags and attributes, anchor links, image alt text used as identifiers, YAML/TOML frontmatter keys, custom admonition types |
| **DO translate**     | Headings, paragraphs and prose, list items (text content only), table content, link display text, image captions, YAML/TOML frontmatter values (human-readable descriptions)                                        |

### Configuration Files (`.json`, `.yaml`, `.toml`, …)

| Action               | Targets                                                                                          |
| -------------------- | ------------------------------------------------------------------------------------------------ |
| **DO NOT translate** | Keys/property names, technical values (paths, URLs, identifiers), boolean values, numeric values |
| **DO translate**     | Description fields, user-facing message values, comment blocks                                   |

### HTML/XML Files

| Action               | Targets                                                                                                  |
| -------------------- | -------------------------------------------------------------------------------------------------------- |
| **DO NOT translate** | Tag names, attribute names, CSS class names, IDs, script content                                         |
| **DO translate**     | Text content between tags, `alt` attributes, `title` attributes, `placeholder` text, `aria-label` values |

## Quality Guidelines

1. **Preserve tone and style** — match the formality level of the original.
2. **Use appropriate technical terminology** — use established translations
   for technical terms in the target language when they exist.
3. **Maintain consistency** — use the same translation for repeated terms
   throughout the file.
4. **Context awareness** — consider the surrounding context when choosing
   translations.
5. **Natural language** — the translation should read naturally in the
   target language.

## When to use

- When localizing documentation, changelogs, or README files for a new
  audience
- When translating user-facing string literals in source files
- When preparing a multilingual release of a project
