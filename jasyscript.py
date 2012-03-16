#!/usr/bin/env jasy

import shutil, json

dist = "build"

# Configure permutations
session.setField("es5", True)
session.permutateField("debug")

# Optimizer configuration
optimization = Optimization("variables", "declarations", "blocks", "privates")



@task
def clean():
    logging.info("Clearing cache...")
    session.clearCache()


@task
def distclean():
    logging.info("Clearing cache...")
    session.clearCache()

    if os.path.exists(dist):
        logging.info("Deleting build folder...")
        shutil.rmtree(dist)


@task
def build(dist="build"):
    # Write API data
    writer = ApiWriter()
    writer.write("%s/data" % dist, compact=False, callback="apibrowser.callback")

    # Prepare assets
    resolver = Resolver()
    resolver.addClassName("api.Browser")
    assets = Asset(resolver.getIncludedClasses()).exportBuild()
    formatting = Formatting('semicolon', 'comma')

    # Write kernel script
    includedByKernel = storeKernel("%s/script/kernel.js" % dist, assets=assets, formatting=formatting, debug=False)

    # Copy files from source
    updateFile("source/index.html", "%s/index.html" % dist)

    # Rewrite template as jsonp
    for tmpl in ["main", "error", "entry", "type", "params", "info", "origin", "tags"]:
        jsonTemplate = json.dumps({ "template" : open("source/tmpl/%s.mustache" % tmpl).read() })
        writeFile("%s/tmpl/%s.js" % (dist, tmpl), "apibrowser.callback(%s, '%s.mustache')" % (jsonTemplate, tmpl))

    # Process every possible permutation
    for permutation in session.getPermutations():

        # Resolving dependencies
        resolver = Resolver(permutation)
        resolver.addClassName("api.Browser")
        resolver.excludeClasses(includedByKernel)

        # Compressing classes
        classes = Sorter(resolver, permutation).getSortedClasses()
        compressedCode = storeCompressed("%s/script/browser-%s.js" % (dist, permutation.getChecksum()), classes,
            permutation=permutation, optimization=optimization, formatting=formatting, bootCode="apibrowser=new api.Browser();")



@task
def source():
    dist = "source"

    # Write API data
    writer = ApiWriter()
    writer.write("%s/data" % dist, compact=False, callback="apibrowser.callback")

    # Prepare assets
    resolver = Resolver()
    resolver.addClassName("api.Browser")
    assets = Asset(resolver.getIncludedClasses()).exportSource()
    formatting = Formatting('semicolon', 'comma')

    # Write kernel script
    includedByKernel = storeKernel("%s/script/kernel.js" % dist, assets=assets, formatting=formatting, debug=True)

    # Rewrite template as jsonp
    for tmpl in ["main", "error", "entry", "type", "params", "info", "origin", "tags"]:
        jsonTemplate = json.dumps({ "template" : open("source/tmpl/%s.mustache" % tmpl).read() })
        writeFile("%s/tmpl/%s.js" % (dist, tmpl), "apibrowser.callback(%s, '%s.mustache')" % (jsonTemplate, tmpl))

    # Process every possible permutation
    for permutation in session.getPermutations():

        # Resolving dependencies
        resolver = Resolver(permutation)
        resolver.addClassName("api.Browser")
        resolver.excludeClasses(includedByKernel)

        # Compressing classes
        classes = Sorter(resolver, permutation).getSortedClasses()
        compressedCode = storeSourceLoader("%s/script/browser-%s.js" % (dist, permutation.getChecksum()), classes, bootCode="apibrowser=new api.Browser();")


