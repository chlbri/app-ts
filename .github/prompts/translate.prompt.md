# Translation Prompt

---

language: {{ language }}

---

## Purpose

This prompt is designed to translate any text file content while preserving
the integrity of code elements and special formatting. All provided assets
(files or folders) will be translated to the specified target language.

## Parameter

- **language** (required): The target language for translation (e.g.,
  `French`, `Spanish`, `German`, `Japanese`, etc.)

## Instructions

### General Rules

1. **Translate only human-readable text** - Comments, strings,
   documentation, and prose content should be translated.
2. **Preserve the original file structure** - Do not modify indentation,
   line breaks, or file organization.
3. **Maintain the same file format** - The output should be in the same
   format as the input.

### Programming Language Files

When translating code files (`.ts`, `.js`, `.py`, `.java`, `.go`, etc.):

- **DO NOT translate:**
  - Function names
  - Class names
  - Variable names
  - Method names
  - Import/export statements
  - Package names
  - Type names and interfaces
  - Enum keys
  - Constants identifiers
  - Reserved keywords
  - Library/framework specific terms

- **DO translate:**
  - Comments (single-line and multi-line)
  - String literals containing user-facing text
  - Documentation blocks (JSDoc, docstrings, etc.)
  - Error messages intended for end users
  - Console log messages (when appropriate)

### Markdown Files (`.md`)

When translating Markdown files:

- **DO NOT translate:**
  - Code blocks (inline and fenced)
  - URLs and links targets
  - File paths
  - Custom stylized text with special meaning (badges, shields, etc.)
  - HTML tags and their attributes
  - Anchor links (`#section-name`)
  - Image alt text that serves as identifiers
  - YAML/TOML frontmatter keys
  - Custom admonition types (e.g., `:::warning`, `:::note`)

- **DO translate:**
  - Headings
  - Paragraphs and prose content
  - List items (text content only)
  - Table content (not headers if they are technical terms)
  - Link display text
  - Image captions
  - YAML/TOML frontmatter values (when they are human-readable
    descriptions)

### Configuration Files

For configuration files (`.json`, `.yaml`, `.toml`, etc.):

- **DO NOT translate:**
  - Keys/property names
  - Technical values (paths, URLs, identifiers)
  - Boolean values
  - Numeric values

- **DO translate:**
  - Description fields
  - User-facing message values
  - Comment blocks

### HTML/XML Files

- **DO NOT translate:**
  - Tag names
  - Attribute names
  - CSS class names
  - IDs
  - Script content

- **DO translate:**
  - Text content between tags
  - `alt` attributes for accessibility
  - `title` attributes
  - `placeholder` text
  - `aria-label` values

## Usage

When invoking this prompt:

1. Provide the **language** parameter with the target language
2. Attach the files or folders to be translated as assets

All attached assets will be processed and translated according to the rules
defined above. The translated content will maintain the same file structure
and format as the original.

## Quality Guidelines

1. **Preserve tone and style** - Match the formality level of the original
   text.
2. **Use appropriate technical terminology** - Use established translations
   for technical terms in the target language when they exist.
3. **Maintain consistency** - Use the same translation for repeated terms
   throughout the file.
4. **Context awareness** - Consider the surrounding context when choosing
   translations.
5. **Natural language** - The translation should read naturally in the
   target language.
