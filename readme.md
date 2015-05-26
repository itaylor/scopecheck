### scopecheck

A flexible tool for finding global scope leaks (and more) via static analysis.
Built with [escope](https://www.npmjs.com/package/escope) and [esprima](https://www.npmjs.com/package/esprima)

### CLI Usage
    npm install -g scopecheck
    scopecheck "path/to/some/js/files/**.js"

scopecheck will scan the files for undefined references, (both usages and definitions) and give you a report about them

### myfile.js
    (function (){
        var foo = foo.bar();
        $('.someClass');
        x = 5;
        otherThing.that.is.not.defined();
    })();

### Command 
    #Runs scope check adding $ as an ok reference
    scopecheck -a "$" ./myfile.js

### Example output
    $ scopecheck -a "$" "tmp/myfile.js"
    Starting run with 1 files.
    tmp/myfile.js 🚫
      x 4:4
      otherThing.that.is.not.defined 5:4
    Files with errors: 1
    #exit with error code 1

### Options Reference:
    Usage: scopecheck [options] <fileglob>

      Options:

        -h, --help                       output usage information
        -V, --version                    output the version number
        -a, --add-predef-var [value]     adds a variable that should be considered as defined
        -r, --remove-predef-var [value]  remove this from the list of variables considered as defined
        -p, --print-predef-vars          Prints all the built-in variables that are considered as defined
        -e, --exclude [value]            A missing reference to exclude from the list of errors.
        -s, --suppress-non-errors        Suppress messages about each file processed.
        -n, --node-js-vars-only          Only add predefVars that are needed for nodes.js

      Examples:

        Find all missing refs in js files.  Allow that $ and jQuery are defined.
        $ scopecheck -a "$" -a jQuery "**/*.js"

        Find all missing refs in a single file, include debugger statements as errors
        $ scopecheck -r debugger foo/bar.js

        Report console statements as missing refs, except for console.error
        $ scopecheck -r console -e "console.error" "**/*.js"

### API Usage



    
### License

Copyright (c) 2015 Ian Taylor

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.