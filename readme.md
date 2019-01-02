**Please note:** This project is deprecated at Zynga and is no longer maintained.

---

API Browser
============================

The API Browser uses data generated by Jasy to render documentation for JavaScript projects.


## Usage

The API Browser requires to use the [Jasy](http://github.com/zynga/jasy) tooling framework as the data it parses is based on the output of that tool. As soon as you have configured Jasy for your project apply the follwing two changes:

Add a requires section into your `jasyproject.json` (or YAML):

```json
{
  "requires": 
  [
    {
      "source" : "https://github.com/zynga/apibrowser.git",
      "version" : 0.8
    }
  ]
}
```

Add another task to your `jasyscript.py`:

```python
@task
def api():

    # Writes API data to api/data
    ApiWriter(session).write("$prefix/data")

    # Generates API browser into api folder
    Task.runTask("apibrowser", "build")

```


## Jasy Compatibility

This project is kept compatible with newest development of the [Jasy](http://github.com/zynga/jasy) tooling framework. This means that the newest GitHub versions typically require a recent Jasy version  as well. Take a look at this list to understand what version to choose from:

* **0.6**: Jasy >= 0.8
* **0.5.3**: Jasy = 0.7.x
* **0.5.2**: Jasy = 0.6.x


## Authors

The API Browser is an official Zynga OpenSource project.


## License

Copyright (c) 2012 Zynga Inc. http://zynga.com/

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
