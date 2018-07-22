const { glob, match, PatternError } = require('../miniglob')
const assert = require('assert')


function repr(v) {
  return JSON.stringify(v)
}


const MATCH   = 'MATCH'
const NOMATCH = 'NOMATCH'
const ERROR   = 'ERROR'


console.log('test match')
const matchPairs = [
  ['*.*x', 'a.jsx', MATCH],
  ['*.*x', 'a.jsx', MATCH],
  ['*.*x*', 'a.jsx', MATCH],
  ['*.*x*', 'a.txt', MATCH],
  ['*.*x*', 'a.xml', MATCH],
  ['*.*x*', 'a.js', NOMATCH],

  ["abc", "abc", MATCH],
  ["*", "abc", MATCH],
  ["*c", "abc", MATCH],
  ["a*", "a", MATCH],
  ["a*", "abc", MATCH],
  ["a*", "ab/c", NOMATCH],
  ["a*/b", "abc/b", MATCH],
  ["a*/b", "a/c/b", NOMATCH],
  ["a*b*c*d*e*/f", "axbxcxdxe/f", MATCH],
  ["a*b*c*d*e*/f", "axbxcxdxexxx/f", MATCH],
  ["a*b*c*d*e*/f", "axbxcxdxe/xxx/f", NOMATCH],
  ["a*b*c*d*e*/f", "axbxcxdxexxx/fff", NOMATCH],
  ["a*b?c*x", "abxbbxdbxebxczzx", MATCH],
  ["a*b?c*x", "abxbbxdbxebxczzy", NOMATCH],
  ["ab[c]", "abc", MATCH],
  ["ab[b-d]", "abc", MATCH],
  ["ab[e-g]", "abc", NOMATCH],
  ["ab[^c]", "abc", NOMATCH],
  ["ab[^b-d]", "abc", NOMATCH],
  ["ab[^e-g]", "abc", MATCH],
  ["a\\*b", "a*b", MATCH],
  ["a\\*b", "ab", NOMATCH],
  ["a?b", "a☺b", MATCH],
  ["a[^a]b", "a☺b", MATCH],
  ["a???b", "a☺b", NOMATCH],
  ["a[^a][^a][^a]b", "a☺b", NOMATCH],
  ["[a-ζ]*", "α", MATCH],
  ["*[a-ζ]", "A", NOMATCH],
  ["a?b", "a/b", NOMATCH],
  ["a*b", "a/b", NOMATCH],
  ["[\\]a]", "]", MATCH],
  ["[\\-]", "-", MATCH],
  ["[x\\-]", "x", MATCH],
  ["[x\\-]", "-", MATCH],
  ["[x\\-]", "z", NOMATCH],
  ["[\\-x]", "x", MATCH],
  ["[\\-x]", "-", MATCH],
  ["[\\-x]", "a", NOMATCH],
  ["[]a]", "]", ERROR],
  ["[-]", "-", ERROR],
  ["[x-]", "x", ERROR],
  ["[x-]", "-", ERROR],
  ["[x-]", "z", ERROR],
  ["[-x]", "x", ERROR],
  ["[-x]", "-", ERROR],
  ["[-x]", "a", ERROR],
  ["\\", "a", ERROR],
  ["[a-b-c]", "a", ERROR],
  ["[", "a", ERROR],
  ["[^", "a", ERROR],
  ["[^bc", "a", ERROR],
  ["a[", "a", NOMATCH],
  ["a[", "ab", ERROR],
  ["*x", "xxx", MATCH],
]
for (let [pattern, input, expectedResult] of matchPairs) {
  let result = ERROR
  try {
    result = match(pattern, input) ? MATCH : NOMATCH
  } catch (err) {
    if (expectedResult === ERROR) {
      if (err.message != 'bad pattern') {
        assert(false, 'expected error "bad pattern" but got: ' + (err.stack || String(err)))
      }
    } else {
      console.error(err.stack || String(err))
    }
  }
  assert(
    result === expectedResult,
    `match(${repr(pattern)}, ${repr(input)}) => ${result}; expected ${expectedResult}`
  )
}


console.log('test glob')
process.chdir(__dirname + '/fixtures')
const testPatterns = [

  // files in the current directory which extension begins with ".js"
  ['*.js*', `
    a.js
    a.jsx
  `],

  // all files with a filename extension in the "cat" directory
  ['cat/*.*', `
    cat/a.js
    cat/a.txt
  `],

  // all files in the "cat" directory
  ['cat/*', `
    cat/a
    cat/a.js
    cat/a.txt
  `],

  // .js files in directories which name starts with "f"
  ['f*/*.js', `
    foo/a.js
    foo/b.js
  `],

  // direct matches without actual patterns
  ['foo/a.js', 'foo/a.js'],
  ['foo/bar', 'foo/bar'],

  // no files matching these patterns
  ['foo/nomatch*.*', ''],
  ['foo/nomatch*.js', ''],
  ['**nomatch**', ''],
  ['**nomatch**', ''],
  ['non/existing', ''],

  // all files except those which names starts with "."
  ['**/[^.]*', `
    a
    a.js
    a.jsx
    a.txt
    bar/a
    bar/a.js
    bar/a.jsx
    bar/a.txt
    cat/a
    cat/a.js
    cat/a.txt
    foo/a
    foo/a.js
    foo/a.jsx
    foo/a.txt
    foo/b.js
    foo/bar/a
    foo/bar/a.js
    foo/bar/a.jsx
    foo/bar/a.txt
    foo/bar/baz/a
    foo/bar/baz/a.js
    foo/bar/baz/a.jsx
    foo/bar/baz/a.txt
    foo/bir/a
    foo/bir/a.js
    foo/bir/a.jsx
    foo/bir/a.txt
    foo/bir/baz/a
    foo/bir/baz/a.js
    foo/bir/baz/a.jsx
    foo/bir/baz/a.txt
    foo/bor/a
    foo/bor/a.js
    foo/bor/a.jsx
    foo/bor/a.txt
    foo/bor/baz/a
    foo/bor/baz/a.js
    foo/bor/baz/a.jsx
    foo/bor/baz/a.txt
  `],

  // all .js files at any level
  ['**.js',`
    a.js
    bar/a.js
    cat/a.js
    foo/a.js
    foo/b.js
    foo/bar/a.js
    foo/bar/baz/a.js
    foo/bir/a.js
    foo/bir/baz/a.js
    foo/bor/a.js
    foo/bor/baz/a.js
  `],

  // all .js files at least one level deep
  ['*/**.js',`
    bar/a.js
    cat/a.js
    foo/a.js
    foo/b.js
    foo/bar/a.js
    foo/bar/baz/a.js
    foo/bir/a.js
    foo/bir/baz/a.js
    foo/bor/a.js
    foo/bor/baz/a.js
  `],

  // all .js files at least two levels deep
  ['*/*/**.js',`
    foo/bar/a.js
    foo/bar/baz/a.js
    foo/bir/a.js
    foo/bir/baz/a.js
    foo/bor/a.js
    foo/bor/baz/a.js
  `],

  // all .js files at least three levels deep
  ['*/*/*/**.js',`
    foo/bar/baz/a.js
    foo/bir/baz/a.js
    foo/bor/baz/a.js
  `],

  // certain files in certain directories
  ['[fc]*/**a**.txt',`
    cat/a.txt
    foo/a.txt
    foo/bar/a.txt
    foo/bar/baz/a.txt
    foo/bir/a.txt
    foo/bir/baz/a.txt
    foo/bor/a.txt
    foo/bor/baz/a.txt
  `],
]
for (let [pattern, expected] of testPatterns) {
  if (expected === ERROR) {
    assert.throws(() => { glob(pattern) }, PatternError)
  } else {
    expected = expected.trim().split(/[\r\n\t\s]+/g).filter(s => s.length)
    let result = glob(pattern)
    try {
      assert.deepStrictEqual(result, expected)
    } catch (err) {
      console.error(
        `glob(%o) failed\n%s\nValue returned from glob:\n%o`,
        pattern,
        (err.stack || String(err)),
        result
      )
      process.exit(1)
    }
  }
}


console.log('ok')
process.exit(0)
