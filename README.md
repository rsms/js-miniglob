# miniglob

Minimal glob JavaScript implementation ported from
[Go's path/filepath](https://golang.org/pkg/path/filepath)
without any dependencies.

- Exports two functions: [`glob`](#glob) and [`match`](#match)
- Supports everything that path/filepath does
- Additionally, the `glob` function also supports `**` for mathing any directories
- Only requirement is a NodeJS "fs"-like module
  (which can be anything exporting a `readdirSync` and `statSync` function)


## Usage

```
import { glob, match } from 'miniglob'
console.log(glob('src/**.js'))
console.log(match("ab[b-d]", "abc"))
```

See [test/test.js](test/test.js) for more examples


## glob

```ts
glob(pattern :string) : string[]
```

Glob returns the names of all files matching pattern.
The syntax of patterns is the same as in `match`.
The pattern may describe hierarchical names such as `/usr/*/bin/ed`
(assuming the Separator is `/`).

Glob ignores file system errors such as I/O errors reading directories.


## match

```ts
match(pattern :string, name :string) : boolean
```

Match reports whether name matches the shell file name pattern.
The pattern syntax is:

```
pattern:
  { term }
term:
  '*'         matches any sequence of non-Separator characters
  '?'         matches any single non-Separator character
  '[' [ '^' ] { character-range } ']'
              character class (must be non-empty)
  c           matches character c (c != '*', '?', '\\', '[')
  '\\' c      matches character c

character-range:
  c           matches character c (c != '\\', '-', ']')
  '\\' c      matches character c
  lo '-' hi   matches character c for lo <= c <= hi
```

Match requires pattern to match all of name, not just a substring.

On Windows, escaping is disabled. Instead, '\\' is treated as path separator.

